// NEED ELECTRO ERP — Automated Supabase Health-Check & Keep-Alive API
// Periodically invoked by external schedulers (GitHub Actions / Vercel Cron)
// to verify connectivity, monitor latency, and keep Supabase Free Plan database active.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabasePublic, STORAGE_BUCKET } from '@/lib/supabase';
import { sendNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

// In-memory monitoring state (persists across warm serverless invocations)
interface HealthState {
  lastSuccess: string | null;
  lastFailure: string | null;
  lastLatencyMs: number | null;
  lastErrorCategory: string | null;
  consecutiveFailures: number;
  lastAlertSentAt: number | null;
}

const healthState: HealthState = {
  lastSuccess: null,
  lastFailure: null,
  lastLatencyMs: null,
  lastErrorCategory: null,
  consecutiveFailures: 0,
  lastAlertSentAt: null,
};

// 1-hour cooldown between failure alert notifications
const ALERT_COOLDOWN_MS = 60 * 60 * 1000;
const DB_QUERY_TIMEOUT_MS = 12000;

/**
 * Execute a minimal, safe, read-only database query with timeout.
 * Queries SystemSettings or runs raw SELECT 1 to ensure PostgreSQL pooler is responsive.
 */
async function performDatabasePing(): Promise<{ ok: boolean; latencyMs: number; error?: string; category?: string }> {
  const start = Date.now();

  try {
    const pingPromise = (async () => {
      // Primary check: fast raw SQL ping through connection pooler
      await prisma.$queryRaw<Array<{ ping: number }>>`SELECT 1 as ping`;
      
      // Secondary verification: lightweight read from existing configuration table (zero customer data)
      await prisma.systemSettings.findFirst({
        select: { id: true, updatedAt: true },
      });
      return true;
    })();

    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('DATABASE_TIMEOUT')), DB_QUERY_TIMEOUT_MS);
    });

    await Promise.race([pingPromise, timeoutPromise]);
    const latencyMs = Date.now() - start;

    return { ok: true, latencyMs };
  } catch (err: any) {
    const latencyMs = Date.now() - start;
    const isTimeout = err?.message === 'DATABASE_TIMEOUT' || err?.code === 'P1008';
    const category = isTimeout ? 'TIMEOUT' : 'CONNECTION_ERROR';

    return {
      ok: false,
      latencyMs,
      error: isTimeout ? 'Database query timed out' : 'Database connection error',
      category,
    };
  }
}

/**
 * Optional secondary ping to Supabase Storage / PostgREST public gateway
 */
async function performSupabaseGatewayPing(): Promise<'reachable' | 'skipped' | 'degraded'> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return 'skipped';
    }
    // Ping public bucket metadata (read-only, least privilege anon key)
    const { error } = await supabasePublic.storage.from(STORAGE_BUCKET).list('', {
      limit: 1,
      offset: 0,
    });
    return error ? 'degraded' : 'reachable';
  } catch {
    return 'degraded';
  }
}

/**
 * Dispatch an alert to super admin if database is unreachable (with cooldown).
 */
async function triggerFailureAlert(errorCategory: string, latencyMs: number) {
  const now = Date.now();
  if (healthState.lastAlertSentAt && now - healthState.lastAlertSentAt < ALERT_COOLDOWN_MS) {
    return; // Cooldown active
  }

  const adminPhone = process.env.SUPER_ADMIN_PHONE || '01733983752';
  const alertMessage = `[ALERT] NEED ELECTRO ERP: Supabase Database ping failed (${errorCategory}, ${latencyMs}ms). Automated keep-alive check detected database unreachability. Please verify Supabase status.`;

  try {
    healthState.lastAlertSentAt = now;
    await sendNotification({
      recipientPhone: adminPhone,
      recipientName: 'Super Admin',
      channel: 'SMS',
      customMessage: alertMessage,
      metadata: {
        referenceType: 'SYSTEM' as any,
        referenceId: `keepalive-fail-${now}`,
      },
    });
  } catch (alertErr) {
    console.error('Failed to dispatch keep-alive failure alert:', alertErr);
  }
}

/**
 * GET /api/health
 * Public health check & automated keep-alive heartbeat endpoint.
 * Returns only non-sensitive status information.
 */
export async function GET(req: NextRequest) {
  const timestamp = new Date().toISOString();
  const dbResult = await performDatabasePing();

  // Check if caller provided authorization for extended diagnostic telemetry
  const authHeader = req.headers.get('authorization');
  const customSecret = req.headers.get('x-health-secret');
  const cronSecret = process.env.CRON_SECRET || process.env.HEALTH_CHECK_SECRET;
  const isPrivilegedCaller = Boolean(
    cronSecret && (authHeader === `Bearer ${cronSecret}` || customSecret === cronSecret)
  );

  if (dbResult.ok) {
    healthState.lastSuccess = timestamp;
    healthState.lastLatencyMs = dbResult.latencyMs;
    healthState.consecutiveFailures = 0;
    healthState.lastErrorCategory = null;

    // Optional Supabase storage gateway status for privileged caller
    let storageGateway: string | undefined;
    if (isPrivilegedCaller) {
      storageGateway = await performSupabaseGatewayPing();
    }

    const responseBody: Record<string, any> = {
      status: 'ok',
      database: 'reachable',
      timestamp,
      latencyMs: dbResult.latencyMs,
    };

    if (isPrivilegedCaller) {
      responseBody.diagnostics = {
        supabaseStorage: storageGateway,
        consecutiveFailures: healthState.consecutiveFailures,
        lastSuccess: healthState.lastSuccess,
        lastFailure: healthState.lastFailure,
      };
    }

    return NextResponse.json(responseBody, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  } else {
    // Failure handling
    healthState.lastFailure = timestamp;
    healthState.lastLatencyMs = dbResult.latencyMs;
    healthState.consecutiveFailures += 1;
    healthState.lastErrorCategory = dbResult.category || 'UNKNOWN';

    // Trigger alert if persistent or first major failure
    if (healthState.consecutiveFailures >= 1) {
      // Asynchronously dispatch alert without blocking the HTTP response
      triggerFailureAlert(healthState.lastErrorCategory, dbResult.latencyMs).catch(() => {});
    }

    const responseBody: Record<string, any> = {
      status: 'degraded',
      database: 'unreachable',
      timestamp,
      latencyMs: dbResult.latencyMs,
      errorCategory: dbResult.category,
    };

    if (isPrivilegedCaller) {
      responseBody.diagnostics = {
        consecutiveFailures: healthState.consecutiveFailures,
        lastSuccess: healthState.lastSuccess,
        lastFailure: healthState.lastFailure,
        rawError: dbResult.error,
      };
    }

    return NextResponse.json(responseBody, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }
}

/**
 * HEAD /api/health
 * Lightweight HTTP HEAD for fast uptime checks without body payload.
 */
export async function HEAD() {
  const dbResult = await performDatabasePing();
  return new NextResponse(null, {
    status: dbResult.ok ? 200 : 503,
    headers: {
      'Cache-Control': 'no-store, no-cache',
      'X-Database-Status': dbResult.ok ? 'reachable' : 'unreachable',
      'X-Response-Time-Ms': String(dbResult.latencyMs),
    },
  });
}

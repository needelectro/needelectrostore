// NEED ELECTRO ERP — Test Custom PostgreSQL Connection Endpoint
import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied. Super Admin clearance required.' }, { status: 403 });
  }

  try {
    const { databaseUrl } = await req.json();

    if (!databaseUrl || typeof databaseUrl !== 'string') {
      return NextResponse.json({ success: false, error: 'Database URL is required' }, { status: 400 });
    }

    const trimmed = databaseUrl.trim();
    if (!trimmed.startsWith('postgresql://') && !trimmed.startsWith('postgres://')) {
      return NextResponse.json({
        success: false,
        error: 'Invalid protocol. Connection string must start with postgresql:// or postgres://'
      }, { status: 400 });
    }

    // Attempt connection with isolated PrismaClient
    const tempPrisma = new PrismaClient({
      datasources: {
        db: {
          url: trimmed,
        },
      },
      log: ['error'],
    });

    const startTime = Date.now();
    try {
      const result = await tempPrisma.$queryRaw<Array<{ version?: string; now?: Date }>>`SELECT version(), NOW() as now`;
      const latencyMs = Date.now() - startTime;
      
      const serverVersion = result[0]?.version ? result[0].version.split(' on ')[0] : 'PostgreSQL Server';
      const serverTime = result[0]?.now ? new Date(result[0].now).toISOString() : new Date().toISOString();

      // Check table count if accessible
      let tablesCount = 0;
      try {
        const tableCheck = await tempPrisma.$queryRaw<Array<{ count: bigint }>>`
          SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'
        `;
        if (tableCheck && tableCheck[0]) {
          tablesCount = Number(tableCheck[0].count);
        }
      } catch {
        // Table count query may vary across permissions
      }

      await tempPrisma.$disconnect();

      return NextResponse.json({
        success: true,
        message: 'Successfully connected to target PostgreSQL database.',
        data: {
          latencyMs,
          serverVersion,
          serverTime,
          tablesFoundInPublicSchema: tablesCount,
          protocol: trimmed.startsWith('postgres://') ? 'postgres://' : 'postgresql://',
          isSupabase: trimmed.includes('supabase'),
          isPooler: trimmed.includes('6543') || trimmed.includes('pooler') || trimmed.includes('pgbouncer'),
        }
      });
    } catch (dbErr: any) {
      await tempPrisma.$disconnect();
      return NextResponse.json({
        success: false,
        error: dbErr.message || 'Connection failed: Unable to connect to specified database.',
        code: dbErr.code,
      }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'Internal server error while testing database connection.'
    }, { status: 500 });
  }
}

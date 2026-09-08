// NEED ELECTRO ERP — Production Enterprise Authentication & RBAC Engine
import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  username: string | null;
  role: string;
  roleId: string | null;
  branchId: string;
  primaryBranchId: string | null;
  allowedBranchIds: string[];
  status: string;
  phone: string | null;
  permissions: string[];
  token: string;
}

/**
 * Hash password using PBKDF2-HMAC-SHA256 with 100,000 iterations
 */
export function hashPassword(password: string, saltHex: string | null = null): string {
  const salt = saltHex ? Buffer.from(saltHex, 'hex') : crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
  return `pbkdf2:sha256:100000:${salt.toString('hex')}:${hash.toString('hex')}`;
}

/**
 * Verify password against stored hash using constant-time comparison
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || typeof storedHash !== 'string') return false;

  if (storedHash.startsWith('pbkdf2:sha256:')) {
    const parts = storedHash.split(':');
    if (parts.length !== 5) return false;
    const iterations = parseInt(parts[2], 10);
    const salt = Buffer.from(parts[3], 'hex');
    const expectedHash = Buffer.from(parts[4], 'hex');
    const actualHash = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256');
    return crypto.timingSafeEqual(expectedHash, actualHash);
  }

  return false;
}

/**
 * Generate cryptographically secure token
 */
export function generateSecureToken(): string {
  return 'nec_' + crypto.randomBytes(32).toString('hex');
}

/**
 * Extract token from Next.js request headers or cookies
 */
export function extractToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const xToken = req.headers.get('x-session-token');
  if (xToken) return xToken.trim();

  const cookieToken = req.cookies.get('nec_session')?.value;
  if (cookieToken) return cookieToken;

  return null;
}

/**
 * Authenticate incoming request using Prisma session engine
 */
export async function authenticateRequest(req: NextRequest): Promise<AuthenticatedUser | null> {
  const token = extractToken(req);
  if (!token) return null;

  try {
    const session = await prisma.session.findUnique({
      where: { token, isRevoked: false },
      include: {
        user: {
          include: {
            roleRel: true,
          },
        },
      },
    });

    if (!session || !session.user) return null;

    // Check expiration
    if (session.expiresAt.getTime() < Date.now()) {
      await prisma.session.update({
        where: { id: session.id },
        data: { isRevoked: true },
      });
      return null;
    }

    // Check user account status
    if (session.user.status !== 'ACTIVE' || !session.user.active) {
      return null;
    }

    // Update last active in background
    prisma.session
      .update({
        where: { id: session.id },
        data: { lastActiveAt: new Date() },
      })
      .catch(() => {});

    // Parse role permissions
    let permissions: string[] = [];
    if (session.user.roleRel?.permissions) {
      const raw = session.user.roleRel.permissions;
      permissions = Array.isArray(raw) ? (raw as string[]) : [];
    }

    // Parse allowed branches
    let allowedBranches: string[] = session.user.branchId ? [session.user.branchId] : [];
    if (session.user.allowedBranchIds) {
      const raw = session.user.allowedBranchIds;
      if (Array.isArray(raw)) {
        allowedBranches = raw as string[];
      }
    }

    return {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      username: session.user.username,
      role: session.user.role,
      roleId: session.user.roleId,
      branchId: session.user.branchId || '',
      primaryBranchId: session.user.primaryBranchId || session.user.branchId || '',
      allowedBranchIds: allowedBranches,
      status: session.user.status,
      phone: session.user.phone,
      permissions,
      token: session.token,
    };
  } catch (error) {
    console.error('Error authenticating request:', error);
    return null;
  }
}

/**
 * Enforce authentication
 */
export async function requireAuth(req: NextRequest): Promise<AuthenticatedUser | NextResponse> {
  const user = await authenticateRequest(req);
  if (!user) {
    return NextResponse.json(
      { success: false, error: 'Authentication required. Please sign in.' },
      { status: 401 }
    );
  }
  return user;
}

/**
 * Enforce Super Admin role
 */
export async function requireSuperAdmin(req: NextRequest): Promise<AuthenticatedUser | NextResponse> {
  const userOrResponse = await requireAuth(req);
  if (userOrResponse instanceof NextResponse) return userOrResponse;

  if (userOrResponse.role !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Access denied. Super Admin privileges required.' },
      { status: 403 }
    );
  }
  return userOrResponse;
}

/**
 * Check if user has permission or is Super Admin
 */
export function hasPermission(user: AuthenticatedUser, module: string, action?: string): boolean {
  if (user.role === 'SUPER_ADMIN') return true;
  if (!action) {
    return user.permissions.some((p) => p.startsWith(`${module}:`) || p === module);
  }
  return user.permissions.includes(`${module}:${action}`);
}

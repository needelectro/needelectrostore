// NEED ELECTRO — Customer Authentication & Session Engine
import crypto from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';
import { hashPassword, verifyPassword } from './auth';

export { hashPassword, verifyPassword };

export interface AuthenticatedCustomer {
  id: string;
  customerId: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  district: string | null;
  deliveryArea: string | null;
  addresses: any[] | null;
  status: string;
  token: string;
}

/**
 * Generate secure customer session token
 */
export function generateCustomerToken(): string {
  return 'necust_' + crypto.randomBytes(32).toString('hex');
}

/**
 * Extract customer token from request cookies, headers, or Authorization
 */
export function extractCustomerToken(req: NextRequest): string | null {
  const cookieToken = req.cookies.get('nec_customer_token')?.value;
  if (cookieToken) return cookieToken.trim();

  const xToken = req.headers.get('x-customer-token');
  if (xToken) return xToken.trim();

  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const val = authHeader.substring(7).trim();
    if (val.startsWith('necust_')) return val;
  }

  return null;
}

/**
 * Authenticate incoming customer request
 */
export async function authenticateCustomer(req: NextRequest): Promise<AuthenticatedCustomer | null> {
  const token = extractCustomerToken(req);
  if (!token) return null;

  try {
    const session = await prisma.customerSession.findUnique({
      where: { token, isRevoked: false },
      include: {
        customer: true,
      },
    });

    if (!session || !session.customer) return null;

    // Check expiration (30 days)
    if (session.expiresAt.getTime() < Date.now()) {
      await prisma.customerSession.update({
        where: { id: session.id },
        data: { isRevoked: true },
      });
      return null;
    }

    if (session.customer.status === 'SUSPENDED') {
      return null;
    }

    // Bump last active periodically (every 15 min)
    if (Date.now() - session.lastActiveAt.getTime() > 15 * 60 * 1000) {
      await prisma.customerSession.update({
        where: { id: session.id },
        data: { lastActiveAt: new Date() },
      }).catch(() => {});
    }

    const c = session.customer;
    return {
      id: c.id,
      customerId: c.customerId,
      name: c.name,
      phone: c.phone,
      email: c.email,
      address: c.address,
      district: c.district,
      deliveryArea: c.deliveryArea,
      addresses: Array.isArray(c.addresses) ? c.addresses : [],
      status: c.status,
      token,
    };
  } catch (err) {
    console.error('Customer auth validation error:', err);
    return null;
  }
}

/**
 * Create a new customer session and attach cookie to response
 */
export async function createCustomerSession(
  customerId: string,
  req: NextRequest,
  res?: NextResponse
): Promise<{ token: string; session: any }> {
  const token = generateCustomerToken();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const ipAddress = req.headers.get('x-forwarded-for') || req.ip || null;
  const userAgent = req.headers.get('user-agent') || null;

  const session = await prisma.customerSession.create({
    data: {
      id: 'csess_' + Date.now() + '_' + crypto.randomBytes(6).toString('hex'),
      token,
      customerId,
      expiresAt,
      ipAddress,
      userAgent,
      isRevoked: false,
    },
  });

  if (res) {
    res.cookies.set({
      name: 'nec_customer_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });
  }

  return { token, session };
}

/**
 * Revoke customer session and clear cookie
 */
export async function revokeCustomerSession(token: string, res?: NextResponse): Promise<void> {
  try {
    await prisma.customerSession.updateMany({
      where: { token },
      data: { isRevoked: true },
    });
  } catch (err) {
    console.error('Revoke customer session error:', err);
  }

  if (res) {
    res.cookies.set({
      name: 'nec_customer_token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(0),
    });
  }
}

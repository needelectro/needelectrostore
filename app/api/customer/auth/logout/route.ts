import { NextRequest, NextResponse } from 'next/server';
import { extractCustomerToken, revokeCustomerSession } from '@/lib/customerAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const token = extractCustomerToken(req);
    const response = NextResponse.json({
      success: true,
      message: 'Signed out successfully.',
    });

    if (token) {
      await revokeCustomerSession(token, response);
    } else {
      response.cookies.set({
        name: 'nec_customer_token',
        value: '',
        httpOnly: true,
        expires: new Date(0),
        path: '/',
      });
    }

    return response;
  } catch (err: any) {
    console.error('Customer logout error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Logout failed.' },
      { status: 500 }
    );
  }
}

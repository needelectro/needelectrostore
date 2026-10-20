import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createCustomerSession } from '@/lib/customerAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please enter your mobile number or email.' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Please enter your password.' },
        { status: 400 }
      );
    }

    const rawId = identifier.trim();
    const cleanDigits = rawId.replace(/\D/g, '');
    const isPhone = cleanDigits.length >= 10;

    let customer = null;

    if (isPhone) {
      const normalizedPhone = cleanDigits.startsWith('880')
        ? cleanDigits.slice(2)
        : cleanDigits.startsWith('88')
        ? cleanDigits.slice(2)
        : cleanDigits;

      customer = await prisma.customer.findFirst({
        where: { phone: normalizedPhone },
      });
    } else {
      customer = await prisma.customer.findFirst({
        where: { email: rawId.toLowerCase() },
      });
    }

    if (!customer || !customer.passwordHash) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid mobile number/email or password. If you do not have an account yet, please register.',
        },
        { status: 401 }
      );
    }

    if (customer.status === 'SUSPENDED') {
      return NextResponse.json(
        {
          success: false,
          error: 'Your customer account is currently suspended. Please contact NEED ELECTRO customer care.',
        },
        { status: 403 }
      );
    }

    const isValid = verifyPassword(password, customer.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid mobile number/email or password.' },
        { status: 401 }
      );
    }

    // Update lastLoginAt
    await prisma.customer.update({
      where: { id: customer.id },
      data: { lastLoginAt: new Date() },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Signed in successfully. Welcome back!',
      data: {
        id: customer.id,
        customerId: customer.customerId,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        district: customer.district,
        deliveryArea: customer.deliveryArea,
        addresses: Array.isArray(customer.addresses) ? customer.addresses : [],
      },
    });

    const { token } = await createCustomerSession(customer.id, req, response);
    (response as any).token = token;

    return response;
  } catch (err: any) {
    console.error('Customer login error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}

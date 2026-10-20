import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createCustomerSession } from '@/lib/customerAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { identifier, resetCode, newPassword } = await req.json();

    if (!identifier || !resetCode || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Mobile number/email, reset code, and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: 'New password must be at least 6 characters long.' },
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

    if (!customer || !customer.resetToken || !customer.resetExpires) {
      return NextResponse.json(
        { success: false, error: 'Invalid reset request or code has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    if (customer.resetToken.trim() !== resetCode.trim()) {
      return NextResponse.json(
        { success: false, error: 'Incorrect 6-digit verification code.' },
        { status: 400 }
      );
    }

    if (customer.resetExpires.getTime() < Date.now()) {
      return NextResponse.json(
        { success: false, error: 'Reset code has expired. Please request a new code.' },
        { status: 400 }
      );
    }

    // Hash and update
    const hashedPassword = hashPassword(newPassword);
    const updatedCustomer = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        passwordHash: hashedPassword,
        resetToken: null,
        resetExpires: null,
        lastLoginAt: new Date(),
      },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Password reset successfully! You are now signed in.',
      data: {
        id: updatedCustomer.id,
        customerId: updatedCustomer.customerId,
        name: updatedCustomer.name,
        phone: updatedCustomer.phone,
        email: updatedCustomer.email,
        address: updatedCustomer.address,
        district: updatedCustomer.district,
        deliveryArea: updatedCustomer.deliveryArea,
      },
    });

    const { token } = await createCustomerSession(updatedCustomer.id, req, response);
    (response as any).token = token;

    return response;
  } catch (err: any) {
    console.error('Customer reset password error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to reset password.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'node:crypto';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { identifier } = await req.json();

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please provide your registered mobile number or email.' },
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
      // Return ambiguous success for security, but with helpful hint
      return NextResponse.json({
        success: true,
        message: 'If an account exists with this credential, a password reset code has been sent.',
      });
    }

    // Generate a 6-digit verification code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        resetToken: resetCode,
        resetExpires,
      },
    });

    console.log(`[NEED ELECTRO PASSWORD RESET] Code for ${customer.phone}: ${resetCode}`);

    return NextResponse.json({
      success: true,
      message: 'A 6-digit password reset code has been generated. Valid for 15 minutes.',
      // For immediate user assistance in development or automated testing, provide code hint
      resetCodeHint: process.env.NODE_ENV !== 'production' ? resetCode : undefined,
    });
  } catch (err: any) {
    console.error('Customer forgot password error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to process password recovery.' },
      { status: 500 }
    );
  }
}

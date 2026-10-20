// NEED ELECTRO ERP — Public Checkout Coupon Validation API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, subtotal } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ success: false, error: 'Coupon code is required' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();
    const subtotalNum = Number(subtotal) || 0;

    const coupon = await prisma.coupon.findUnique({
      where: { code: cleanCode },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ success: false, error: 'Invalid or inactive promo code.' }, { status: 400 });
    }

    const now = new Date();
    if (coupon.startDate && now < coupon.startDate) {
      return NextResponse.json({ success: false, error: 'This coupon campaign has not started yet.' }, { status: 400 });
    }

    if (coupon.endDate && now > coupon.endDate) {
      return NextResponse.json({ success: false, error: 'This coupon code has expired.' }, { status: 400 });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ success: false, error: 'This coupon code has reached its maximum redemption limit.' }, { status: 400 });
    }

    const minOrder = Number(coupon.minOrderAmount) || 0;
    if (subtotalNum < minOrder) {
      return NextResponse.json({
        success: false,
        error: `Minimum order amount of ৳${minOrder.toLocaleString()} is required for coupon ${cleanCode}.`,
      }, { status: 400 });
    }

    // Calculate discount
    let discountAmount = 0;
    const val = Number(coupon.discountValue);
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((subtotalNum * val) / 100);
      if (coupon.maxDiscountAmount) {
        const maxDisc = Number(coupon.maxDiscountAmount);
        if (discountAmount > maxDisc) {
          discountAmount = maxDisc;
        }
      }
    } else {
      // FIXED
      discountAmount = Math.min(val, subtotalNum);
    }

    return NextResponse.json({
      success: true,
      message: `Coupon ${cleanCode} applied successfully!`,
      data: {
        code: cleanCode,
        discountType: coupon.discountType,
        discountValue: val,
        discountAmount,
        minOrderAmount: minOrder,
      },
    });
  } catch (error: any) {
    console.error('Validate coupon error:', error);
    return NextResponse.json({ success: false, error: 'Failed to validate coupon code' }, { status: 500 });
  }
}

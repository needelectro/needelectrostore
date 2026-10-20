// NEED ELECTRO ERP — Coupons Management API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: coupons });
  } catch (error: any) {
    console.error('Fetch coupons error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      code,
      description,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      usageLimit,
      startDate,
      endDate,
      isActive,
      applicableCategories,
    } = body;

    if (!code || !discountValue) {
      return NextResponse.json({ success: false, error: 'Coupon code and discount value are required' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');

    const coupon = await prisma.coupon.create({
      data: {
        code: cleanCode,
        description: description ? description.trim() : null,
        discountType: discountType || 'PERCENTAGE',
        discountValue: new Prisma.Decimal(discountValue),
        minOrderAmount: new Prisma.Decimal(minOrderAmount || 0),
        maxDiscountAmount: maxDiscountAmount ? new Prisma.Decimal(maxDiscountAmount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive ?? true,
        applicableCategories: applicableCategories || null,
      },
    });

    return NextResponse.json({ success: true, data: coupon });
  } catch (error: any) {
    console.error('Create coupon error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ success: false, error: 'A coupon with this code already exists' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

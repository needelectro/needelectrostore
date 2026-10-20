// NEED ELECTRO ERP — Single Coupon Management API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
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

    const updated = await prisma.coupon.update({
      where: { id: params.id },
      data: {
        ...(description !== undefined && { description: description ? description.trim() : null }),
        ...(discountType !== undefined && { discountType }),
        ...(discountValue !== undefined && { discountValue: new Prisma.Decimal(discountValue) }),
        ...(minOrderAmount !== undefined && { minOrderAmount: new Prisma.Decimal(minOrderAmount) }),
        ...(maxDiscountAmount !== undefined && { maxDiscountAmount: maxDiscountAmount ? new Prisma.Decimal(maxDiscountAmount) : null }),
        ...(usageLimit !== undefined && { usageLimit: usageLimit ? parseInt(usageLimit, 10) : null }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(isActive !== undefined && { isActive }),
        ...(applicableCategories !== undefined && { applicableCategories }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.coupon.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

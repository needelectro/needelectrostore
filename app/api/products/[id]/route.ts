// NEED ELECTRO ERP — Product Modification Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'products', 'edit') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const updates = await req.json();

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) {
    return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
  }

  await prisma.product.update({
    where: { id: params.id },
    data: {
      ...(updates.name && { name: updates.name }),
      ...(updates.category && { category: updates.category }),
      ...(updates.brand && { brand: updates.brand }),
      ...(updates.model !== undefined && { model: updates.model }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.imageUrl !== undefined && { imageUrl: updates.imageUrl }),
      ...(updates.minStock !== undefined && { minStock: Number(updates.minStock) }),
      ...(updates.warrantyPeriodMonths !== undefined && { warrantyPeriodMonths: Number(updates.warrantyPeriodMonths) }),
      ...(updates.status && { status: updates.status }),
      ...(updates.specs && { specs: updates.specs }),
      ...(updates.retailPrice !== undefined && { retailPrice: new Prisma.Decimal(updates.retailPrice) }),
      ...(updates.costPrice !== undefined && { costPrice: new Prisma.Decimal(updates.costPrice) }),
      ...(updates.wholesalePrice !== undefined && { wholesalePrice: new Prisma.Decimal(updates.wholesalePrice) }),
      ...(updates.emiPrice !== undefined && { emiPrice: new Prisma.Decimal(updates.emiPrice) }),
    },
  });

  return NextResponse.json({ success: true, message: 'Product updated successfully' });
}

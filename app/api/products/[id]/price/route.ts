// NEED ELECTRO ERP — Product Price Update & Price Audit Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'products', 'price_change') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied to price modification' }, { status: 403 });
  }

  const { retailPrice, wholesalePrice, emiPrice, costPrice, reason } = await req.json();

  const product = await prisma.product.findUnique({ where: { id: params.id } });
  if (!product) {
    return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
  }

  const priceUpdates: any = {};
  const auditsToCreate: any[] = [];

  if (retailPrice !== undefined && Number(retailPrice) !== Number(product.retailPrice)) {
    priceUpdates.retailPrice = new Prisma.Decimal(retailPrice);
    auditsToCreate.push({
      id: 'pa-' + Date.now() + '-ret',
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      priceType: 'RETAIL',
      oldPrice: product.retailPrice,
      newPrice: new Prisma.Decimal(retailPrice),
      changedBy: user.name,
      reason: reason || 'Price revision',
    });
  }

  if (costPrice !== undefined && Number(costPrice) !== Number(product.costPrice)) {
    priceUpdates.costPrice = new Prisma.Decimal(costPrice);
    auditsToCreate.push({
      id: 'pa-' + Date.now() + '-cost',
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      priceType: 'COST',
      oldPrice: product.costPrice,
      newPrice: new Prisma.Decimal(costPrice),
      changedBy: user.name,
      reason: reason || 'Cost adjustment',
    });
  }

  if (emiPrice !== undefined && Number(emiPrice) !== Number(product.emiPrice)) {
    priceUpdates.emiPrice = new Prisma.Decimal(emiPrice);
    auditsToCreate.push({
      id: 'pa-' + Date.now() + '-emi',
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      priceType: 'EMI',
      oldPrice: product.emiPrice,
      newPrice: new Prisma.Decimal(emiPrice),
      changedBy: user.name,
      reason: reason || 'EMI price adjustment',
    });
  }

  await prisma.$transaction(async (tx) => {
    if (Object.keys(priceUpdates).length > 0) {
      await tx.product.update({
        where: { id: params.id },
        data: priceUpdates,
      });
    }

    for (const audit of auditsToCreate) {
      await tx.priceAudit.create({ data: audit });
    }
  });

  return NextResponse.json({ success: true, message: 'Price updated and audited successfully.' });
}

// NEED ELECTRO ERP — Inventory Rules Configuration Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  const admin = await requireSuperAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const rules = await req.json();

  await prisma.inventoryRules.upsert({
    where: { id: 'main' },
    update: {
      ...(rules.lowStockThresholdDefault !== undefined && { lowStockThresholdDefault: Number(rules.lowStockThresholdDefault) }),
      ...(rules.enableOutOfStockWarnings !== undefined && { enableOutOfStockWarnings: Boolean(rules.enableOutOfStockWarnings) }),
      ...(rules.allowNegativeStock !== undefined && { allowNegativeStock: Boolean(rules.allowNegativeStock) }),
      ...(rules.requireSerialOnPurchase !== undefined && { requireSerialOnPurchase: Boolean(rules.requireSerialOnPurchase) }),
      ...(rules.requireSerialOnSale !== undefined && { requireSerialOnSale: Boolean(rules.requireSerialOnSale) }),
      ...(rules.autoGenerateSerials !== undefined && { autoGenerateSerials: Boolean(rules.autoGenerateSerials) }),
      ...(rules.defaultSerialPrefix !== undefined && { defaultSerialPrefix: rules.defaultSerialPrefix }),
    },
    create: {
      id: 'main',
      lowStockThresholdDefault: Number(rules.lowStockThresholdDefault || 3),
    },
  });

  return NextResponse.json({ success: true, message: 'Inventory rules updated successfully' });
}

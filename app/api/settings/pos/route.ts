// NEED ELECTRO ERP — POS Settings Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function PUT(req: NextRequest) {
  const admin = await requireSuperAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const pos = await req.json();

  await prisma.posSettings.upsert({
    where: { id: 'main' },
    update: {
      ...(pos.invoicePrefix !== undefined && { invoicePrefix: pos.invoicePrefix }),
      ...(pos.nextInvoiceNumber !== undefined && { nextInvoiceNumber: Number(pos.nextInvoiceNumber) }),
      ...(pos.returnWindowDays !== undefined && { returnWindowDays: Number(pos.returnWindowDays) }),
      ...(pos.enablePosDiscounts !== undefined && { enablePosDiscounts: Boolean(pos.enablePosDiscounts) }),
      ...(pos.maxDiscountPercent !== undefined && { maxDiscountPercent: new Prisma.Decimal(pos.maxDiscountPercent) }),
      ...(pos.enableCreditSales !== undefined && { enableCreditSales: Boolean(pos.enableCreditSales) }),
      ...(pos.requireCustomerPhone !== undefined && { requireCustomerPhone: Boolean(pos.requireCustomerPhone) }),
      ...(pos.defaultInvoiceNotes !== undefined && { defaultInvoiceNotes: pos.defaultInvoiceNotes }),
      ...(pos.receiptFooterText !== undefined && { receiptFooterText: pos.receiptFooterText }),
      ...(pos.taxPercent !== undefined && { taxPercent: new Prisma.Decimal(pos.taxPercent) }),
      ...(pos.printLogoOnReceipt !== undefined && { printLogoOnReceipt: Boolean(pos.printLogoOnReceipt) }),
      ...(pos.printWarrantyOnReceipt !== undefined && { printWarrantyOnReceipt: Boolean(pos.printWarrantyOnReceipt) }),
    },
    create: {
      id: 'main',
      invoicePrefix: pos.invoicePrefix || 'INV-2026-',
      nextInvoiceNumber: Number(pos.nextInvoiceNumber || 1001),
    },
  });

  return NextResponse.json({ success: true, message: 'POS settings updated successfully' });
}

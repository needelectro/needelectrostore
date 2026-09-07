// NEED ELECTRO ERP — Bulk Data Import Commit Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  const admin = await requireSuperAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { entityType, validRows } = await req.json();

  if (!validRows || !Array.isArray(validRows) || validRows.length === 0) {
    return NextResponse.json({ success: false, error: 'No valid rows provided' }, { status: 400 });
  }

  let importedCount = 0;

  await prisma.$transaction(async (tx) => {
    for (const row of validRows) {
      if (entityType === 'products') {
        await tx.product.upsert({
          where: { sku: row.sku },
          update: {
            name: row.name,
            retailPrice: new Prisma.Decimal(row.retailPrice || 0),
            costPrice: new Prisma.Decimal(row.costPrice || 0),
            currentStock: Number(row.currentStock || 0),
          },
          create: {
            id: 'prod-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
            name: row.name,
            sku: row.sku,
            category: row.category || 'General',
            brand: row.brand || 'Generic',
            retailPrice: new Prisma.Decimal(row.retailPrice || 0),
            costPrice: new Prisma.Decimal(row.costPrice || 0),
            currentStock: Number(row.currentStock || 0),
          },
        });
        importedCount++;
      } else if (entityType === 'customers') {
        const phone = row.phone ? String(row.phone).trim() : '';
        if (phone) {
          const existing = await tx.customer.findFirst({ where: { phone } });
          if (!existing) {
            await tx.customer.create({
              data: {
                id: 'cust-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
                customerId: 'CUST-' + Date.now().toString().slice(-6),
                name: row.name,
                phone,
                email: row.email || null,
                address: row.address || null,
              },
            });
            importedCount++;
          }
        }
      }
    }
  });

  return NextResponse.json({
    success: true,
    message: `Imported ${importedCount} records successfully`,
    importedCount,
  });
}

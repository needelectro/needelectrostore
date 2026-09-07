// NEED ELECTRO ERP — Stock Adjustment Transaction Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { stockAdjustSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'inventory', 'adjust') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied to inventory adjustment' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = stockAdjustSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { productId, branchId, quantityDiff, reason, serialNumbers } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error('Product not found');

      const openingStock = product.currentStock;
      const closingStock = openingStock + quantityDiff;

      if (closingStock < 0) {
        const invRules = await tx.inventoryRules.findUnique({ where: { id: 'main' } });
        if (!invRules?.allowNegativeStock) {
          throw new Error(`Insufficient stock. Current stock is ${openingStock}, cannot reduce by ${Math.abs(quantityDiff)}.`);
        }
      }

      // Update product stock
      await tx.product.update({
        where: { id: productId },
        data: { currentStock: closingStock },
      });

      // If serialized and adding stock, insert serial records
      if (product.isSerialized && quantityDiff > 0 && serialNumbers && serialNumbers.length > 0) {
        for (const sn of serialNumbers) {
          await tx.productSerial.upsert({
            where: { serialNumber: sn },
            update: { status: 'AVAILABLE', branchId },
            create: {
              id: 'sn-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
              serialNumber: sn,
              productId: product.id,
              branchId,
              status: 'AVAILABLE',
              purchaseCost: product.costPrice,
            },
          });
        }
      }

      // If serialized and reducing stock (e.g. damage), update serial status
      if (product.isSerialized && quantityDiff < 0 && serialNumbers && serialNumbers.length > 0) {
        for (const sn of serialNumbers) {
          await tx.productSerial.updateMany({
            where: { serialNumber: sn, productId },
            data: { status: 'DEFECTIVE' },
          });
        }
      }

      // Record Inventory Transaction
      await tx.inventoryTransaction.create({
        data: {
          id: 'itx-' + Date.now(),
          transactionNumber: 'ITX-ADJ-' + Date.now().toString().slice(-6),
          date: new Date(),
          type: quantityDiff > 0 ? 'ADJUSTMENT_IN' : 'DAMAGE_OUT',
          productId: product.id,
          productName: product.name,
          branchId,
          quantity: Math.abs(quantityDiff),
          unitCost: product.costPrice,
          totalValue: new Prisma.Decimal(Number(product.costPrice) * Math.abs(quantityDiff)),
          openingStock,
          closingStock,
          referenceType: 'STOCK_ADJUSTMENT',
          serialNumbers: serialNumbers || [],
          notes: reason,
          createdBy: user.name,
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'STOCK_ADJUSTED',
          module: 'INVENTORY',
          recordId: product.id,
          details: `Adjusted stock for ${product.name} by ${quantityDiff}. Reason: ${reason}`,
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Stock adjusted successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

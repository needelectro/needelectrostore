// NEED ELECTRO ERP — Stock Transfer Between Warehouses / Branches Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { stockTransferSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'inventory', 'transfer') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = stockTransferSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { productId, fromBranchId, toBranchId, quantity, serialNumbers } = parsed.data;

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error('Product not found');

      // Update serials location
      if (serialNumbers && serialNumbers.length > 0) {
        for (const sn of serialNumbers) {
          await tx.productSerial.updateMany({
            where: { serialNumber: sn, productId },
            data: { branchId: toBranchId },
          });
        }
      }

      // Record Transfer Transaction
      await tx.inventoryTransaction.create({
        data: {
          id: 'itx-' + Date.now(),
          transactionNumber: 'ITX-TRF-' + Date.now().toString().slice(-6),
          date: new Date(),
          type: 'TRANSFER',
          productId: product.id,
          productName: product.name,
          branchId: toBranchId,
          fromBranchId,
          toBranchId,
          quantity,
          unitCost: product.costPrice,
          totalValue: new Prisma.Decimal(Number(product.costPrice) * quantity),
          openingStock: product.currentStock,
          closingStock: product.currentStock,
          referenceType: 'BRANCH_TRANSFER',
          serialNumbers: serialNumbers || [],
          notes: `Transferred ${quantity} units from ${fromBranchId} to ${toBranchId}`,
          createdBy: user.name,
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'STOCK_TRANSFERRED',
          module: 'INVENTORY',
          recordId: product.id,
          details: `Transferred ${quantity} units of ${product.name} to ${toBranchId}`,
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Stock transferred successfully.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

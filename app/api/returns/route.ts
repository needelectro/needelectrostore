// NEED ELECTRO ERP — Returns & RMA Route Handler (ACID Transaction)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const returns = await prisma.productReturn.findMany({
    orderBy: { date: 'desc' },
    take: 100,
  });

  return NextResponse.json({ success: true, data: returns });
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'sales', 'return') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied to process returns' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const {
      saleInvoiceId,
      customerId,
      customerName,
      customerPhone,
      returnType,
      reason,
      items,
      totalRefundAmount,
      refundMethod,
      accountId,
      notes,
    } = body;

    const returnNumber = 'RET-' + Date.now().toString().slice(-6);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Return Record
      const productReturn = await tx.productReturn.create({
        data: {
          id: 'ret-' + Date.now(),
          returnNumber,
          date: new Date(),
          saleInvoiceId: saleInvoiceId || 'N/A',
          customerId,
          customerName,
          customerPhone,
          returnType: returnType || 'REFUND',
          reason: reason || 'Customer return',
          items: items || [],
          totalRefundAmount: new Prisma.Decimal(totalRefundAmount || 0),
          refundMethod: refundMethod || 'CASH',
          accountId,
          status: 'COMPLETED',
          handledBy: user.name,
          notes,
        },
      });

      // 2. Restock items and update serials
      if (Array.isArray(items)) {
        for (const item of items) {
          if (item.productId && item.quantity > 0) {
            const product = await tx.product.findUnique({ where: { id: item.productId } });
            if (product) {
              const openingStock = product.currentStock;
              const closingStock = openingStock + item.quantity;

              await tx.product.update({
                where: { id: item.productId },
                data: { currentStock: closingStock },
              });

              // If serialized, mark serial back to RETURNED / AVAILABLE
              if (product.isSerialized && item.serialNumbers && item.serialNumbers.length > 0) {
                for (const sn of item.serialNumbers) {
                  await tx.productSerial.updateMany({
                    where: { serialNumber: sn, productId: product.id },
                    data: { status: 'RETURNED' },
                  });
                }
              }

              // Record Inventory Transaction
              await tx.inventoryTransaction.create({
                data: {
                  id: 'itx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
                  transactionNumber: 'ITX-RET-' + Date.now().toString().slice(-6),
                  date: new Date(),
                  type: 'RETURN_IN',
                  productId: product.id,
                  productName: product.name,
                  branchId: user.branchId || 'branch-main-1',
                  quantity: item.quantity,
                  unitCost: product.costPrice,
                  totalValue: new Prisma.Decimal(Number(product.costPrice) * item.quantity),
                  openingStock,
                  closingStock,
                  referenceType: 'RETURN',
                  referenceId: productReturn.id,
                  serialNumbers: item.serialNumbers || [],
                  notes: `Customer return on invoice ${saleInvoiceId}`,
                  createdBy: user.name,
                },
              });
            }
          }
        }
      }

      // 3. Deduct financial account if cash refund issued
      if (Number(totalRefundAmount) > 0 && refundMethod !== 'CREDIT_NOTE') {
        const targetAccountId = accountId || 'acc-cash-1';
        await tx.financialAccount.updateMany({
          where: { id: targetAccountId },
          data: {
            balance: { decrement: new Prisma.Decimal(totalRefundAmount) },
          },
        });
      }

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'RETURN_PROCESSED',
          module: 'RETURNS',
          recordId: productReturn.id,
          details: `Processed return ${returnNumber} for ${customerName}. Refund: ৳${totalRefundAmount}`,
        },
      });

      return productReturn;
    });

    return NextResponse.json({
      success: true,
      message: 'Return processed successfully.',
      data: result,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

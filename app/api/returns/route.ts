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

      // 3. Financial Settlement: Deduct Financial Account on Cash/Bank refund OR Credit Customer Due Balance on Credit Note
      const refundAmt = Number(totalRefundAmount);
      if (refundAmt > 0) {
        if (refundMethod === 'CREDIT_NOTE' || returnType === 'CREDIT_NOTE') {
          // Adjust customer credit balance
          if (customerId) {
            const updatedCustomer = await tx.customer.update({
              where: { id: customerId },
              data: {
                currentBalance: { decrement: new Prisma.Decimal(refundAmt) },
              },
            });

            await tx.ledgerEntry.create({
              data: {
                id: 'led-' + Date.now() + '-ret-cust',
                date: new Date(),
                partyType: 'CUSTOMER',
                partyId: customerId,
                referenceType: 'RETURN',
                referenceNumber: returnNumber,
                description: `Credit note issued for return ${returnNumber} (Invoice: ${saleInvoiceId})`,
                debit: new Prisma.Decimal(0),
                credit: new Prisma.Decimal(refundAmt),
                runningBalance: updatedCustomer.currentBalance,
              },
            });
          }
        } else {
          // Cash / Bank / Mobile Banking refund disbursement
          const targetAccountId = accountId || 'acc-1';
          let account = await tx.financialAccount.findFirst({
            where: { id: targetAccountId },
          });

          if (!account) {
            account = await tx.financialAccount.findFirst({
              where: { type: 'CASH' },
            });
          }

          if (account) {
            await tx.financialAccount.update({
              where: { id: account.id },
              data: {
                balance: { decrement: new Prisma.Decimal(refundAmt) },
              },
            });

            await tx.ledgerEntry.create({
              data: {
                id: 'led-' + Date.now() + '-ret-acc',
                date: new Date(),
                partyType: 'ACCOUNT',
                partyId: account.id,
                referenceType: 'RETURN',
                referenceNumber: returnNumber,
                description: `Refund disbursed to ${customerName} for return ${returnNumber} (Invoice: ${saleInvoiceId})`,
                debit: new Prisma.Decimal(0),
                credit: new Prisma.Decimal(refundAmt),
                runningBalance: new Prisma.Decimal(Number(account.balance) - refundAmt),
              },
            });
          }
        }
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

// NEED ELECTRO ERP — Super Admin Sale Master Update & Delete Handler with ACID Ledger Synchronization
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import { reverseTransaction, recordAccountMovement } from '@/lib/accounting';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'sales', 'edit') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied. Requires Super Admin or Sales Edit permission.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const existing = await prisma.sale.findUnique({
      where: { id: params.id },
      include: { items: true },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Sale record not found' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const oldPaid = Number(existing.paidAmount);
      const newPaid = body.paidAmount !== undefined ? Number(body.paidAmount) : oldPaid;
      const oldDue = Number(existing.dueAmount);
      const newDue = body.dueAmount !== undefined ? Number(body.dueAmount) : oldDue;

      // 1. If financial paid amount or payments changed, reverse previous account movement and post corrected
      if (body.paidAmount !== undefined && newPaid !== oldPaid) {
        await reverseTransaction(tx, {
          referenceNumber: existing.invoiceNumber,
          reason: `Sale ${existing.invoiceNumber} payment modification from ৳${oldPaid} to ৳${newPaid}`,
          performedBy: user.name,
        });

        if (newPaid > 0) {
          const splitPayments = Array.isArray(body.payments) && body.payments.length > 0
            ? body.payments
            : [{ method: 'Cash', amount: newPaid }];

          for (const p of splitPayments) {
            const amt = Number(p.amount);
            if (amt > 0) {
              await recordAccountMovement(tx, {
                accountId: p.accountId,
                paymentMethod: p.method || 'Cash',
                referenceType: 'SALE',
                referenceNumber: existing.invoiceNumber,
                amount: amt,
                direction: 'INFLOW',
                description: `Payment received (${p.method || 'Cash'}) for modified sale ${existing.invoiceNumber} from ${body.customerName || existing.customerName}`,
                performedBy: user.name,
                relatedTransactionId: existing.id,
              });
            }
          }
        }
      }

      // 2. If Customer Due changed, adjust Customer balance
      if (body.dueAmount !== undefined && newDue !== oldDue) {
        const diff = newDue - oldDue;
        await tx.customer.update({
          where: { id: existing.customerId },
          data: {
            currentBalance: {
              [diff > 0 ? 'increment' : 'decrement']: new Prisma.Decimal(Math.abs(diff)),
            },
          },
        });

        await tx.ledgerEntry.create({
          data: {
            id: 'led-adj-' + Date.now(),
            date: new Date(),
            partyType: 'CUSTOMER',
            partyId: existing.customerId,
            referenceType: 'SALE_ADJUSTMENT',
            referenceNumber: existing.invoiceNumber,
            description: `Receivable adjustment for sale ${existing.invoiceNumber} (Old Due: ৳${oldDue}, New Due: ৳${newDue})`,
            debit: diff > 0 ? new Prisma.Decimal(diff) : new Prisma.Decimal(0),
            credit: diff < 0 ? new Prisma.Decimal(Math.abs(diff)) : new Prisma.Decimal(0),
            runningBalance: new Prisma.Decimal(newDue),
            status: 'COMPLETED',
            performedBy: user.name,
          },
        });
      }

      // 3. Update Sale Record
      const sale = await tx.sale.update({
        where: { id: params.id },
        data: {
          ...(body.invoiceNumber && { invoiceNumber: body.invoiceNumber }),
          ...(body.customerName && { customerName: body.customerName }),
          ...(body.customerPhone && { customerPhone: body.customerPhone }),
          ...(body.customerId && { customerId: body.customerId }),
          ...(body.branchId && { branchId: body.branchId }),
          ...(body.date && { date: new Date(body.date) }),
          ...(body.subtotal !== undefined && { subtotal: new Prisma.Decimal(body.subtotal) }),
          ...(body.overallDiscount !== undefined && { overallDiscount: new Prisma.Decimal(body.overallDiscount) }),
          ...(body.vatAmount !== undefined && { vatAmount: new Prisma.Decimal(body.vatAmount) }),
          ...(body.grandTotal !== undefined && { grandTotal: new Prisma.Decimal(body.grandTotal) }),
          ...(body.paidAmount !== undefined && { paidAmount: new Prisma.Decimal(body.paidAmount) }),
          ...(body.dueAmount !== undefined && { dueAmount: new Prisma.Decimal(body.dueAmount) }),
          ...(body.status && { status: body.status }),
          ...(body.saleType && { saleType: body.saleType }),
          ...(body.salespersonName !== undefined && { salespersonName: body.salespersonName }),
          ...(body.notes !== undefined && { notes: body.notes }),
          ...(body.payments !== undefined && { payments: body.payments }),
        },
        include: { items: true },
      });

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'SUPER_ADMIN_SALE_UPDATE',
          module: 'SALES',
          recordId: sale.id,
          details: `Super Admin ${user.name} modified Sale ${sale.invoiceNumber} (Total: ${sale.grandTotal}, Status: ${sale.status})`,
        },
      });

      return sale;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error('Sale update error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied. Only Super Admin or Admin can delete/cancel sales.' }, { status: 403 });
  }

  try {
    const sale = await prisma.sale.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!sale) {
      return NextResponse.json({ success: false, error: 'Sale record not found' }, { status: 404 });
    }

    if (sale.status === 'CANCELLED') {
      return NextResponse.json({ success: false, error: 'Sale has already been cancelled and reversed.' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Revert sold serial numbers back to AVAILABLE
      await tx.productSerial.updateMany({
        where: { saleInvoiceId: sale.invoiceNumber },
        data: {
          status: 'AVAILABLE',
          saleInvoiceId: null,
          saleDate: null,
          customerId: null,
        },
      });

      // 2. Restore product inventory currentStock
      for (const item of sale.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: { increment: item.quantity },
            },
          });

          // Log inventory reversal
          await tx.inventoryTransaction.create({
            data: {
              id: 'inv-tx-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
              transactionNumber: 'RESTORE-' + sale.invoiceNumber + '-' + item.id.slice(-4),
              date: new Date(),
              type: 'RETURN_IN',
              productId: item.productId,
              productName: item.productName,
              branchId: sale.branchId,
              quantity: item.quantity,
              unitCost: item.unitPrice,
              totalValue: new Prisma.Decimal(Number(item.unitPrice) * item.quantity),
              openingStock: 0,
              closingStock: item.quantity,
              referenceType: 'SALE_CANCELLATION',
              referenceId: sale.invoiceNumber,
              notes: `Stock restored upon cancellation of sale ${sale.invoiceNumber}`,
              createdBy: user.name,
            },
          });
        }
      }

      // 3. Reverse customer receivable balance if due amount was recorded
      const dueAmt = Number(sale.dueAmount);
      if (dueAmt > 0 && sale.customerId) {
        await tx.customer.update({
          where: { id: sale.customerId },
          data: {
            currentBalance: { decrement: new Prisma.Decimal(dueAmt) },
          },
        });
      }

      // 4. Reverse central financial ledger entries and deduct cash from account
      await reverseTransaction(tx, {
        referenceNumber: sale.invoiceNumber,
        reason: `Sale ${sale.invoiceNumber} cancelled/deleted by ${user.name}`,
        performedBy: user.name,
      });

      // 5. Soft cancel: keep sale in database with status 'CANCELLED' (Strict reversal logic, no hard deletion)
      await tx.sale.update({
        where: { id: sale.id },
        data: {
          status: 'CANCELLED',
          notes: `${sale.notes ? sale.notes + ' | ' : ''}CANCELLED & REVERSED by ${user.name} on ${new Date().toISOString()}`,
        },
      });

      // 6. Audit trail
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'SUPER_ADMIN_SALE_CANCEL_REVERSE',
          module: 'SALES',
          recordId: sale.id,
          details: `Super Admin ${user.name} cancelled Sale ${sale.invoiceNumber} (Total: ${sale.grandTotal}, Reversing Cash Inflow: ৳${sale.paidAmount}, Due: ৳${sale.dueAmount})`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Sale ${sale.invoiceNumber} successfully cancelled and all financial effects reversed.`,
    });
  } catch (err: any) {
    console.error('Sale cancellation error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

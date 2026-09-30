// NEED ELECTRO ERP — Super Admin Purchase Master Update & Delete Handler with ACID Ledger Synchronization
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

  if (!hasPermission(user, 'purchases', 'edit') && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const existing = await prisma.purchase.findUnique({
      where: { id: params.id },
      include: { items: true },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Purchase record not found' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const oldPaid = Number(existing.paidAmount);
      const newPaid = body.paidAmount !== undefined ? Number(body.paidAmount) : oldPaid;
      const oldDue = Number(existing.dueAmount);
      const newDue = body.dueAmount !== undefined ? Number(body.dueAmount) : oldDue;

      // 1. If paid amount changed, reverse previous payment and post new payment
      if (body.paidAmount !== undefined && newPaid !== oldPaid) {
        await reverseTransaction(tx, {
          referenceNumber: existing.invoiceNumber,
          reason: `Purchase ${existing.invoiceNumber} paid amount modified from ৳${oldPaid} to ৳${newPaid}`,
          performedBy: user.name,
        });

        if (newPaid > 0) {
          await recordAccountMovement(tx, {
            accountId: body.accountId || (existing as any).depositAccountId,
            paymentMethod: body.paymentMethod || existing.paymentMethod || 'Cash',
            referenceType: 'PURCHASE',
            referenceNumber: existing.invoiceNumber,
            amount: newPaid,
            direction: 'OUTFLOW',
            description: `Payment disbursed for modified purchase ${existing.invoiceNumber} (${existing.supplierName})`,
            performedBy: user.name,
            relatedTransactionId: existing.id,
          });
        }
      }

      // 2. If due amount changed, adjust supplier payable
      if (body.dueAmount !== undefined && newDue !== oldDue) {
        const diff = newDue - oldDue;
        await tx.supplier.update({
          where: { id: existing.supplierId },
          data: {
            currentPayable: {
              [diff > 0 ? 'increment' : 'decrement']: new Prisma.Decimal(Math.abs(diff)),
            },
          },
        });

        await tx.ledgerEntry.create({
          data: {
            id: 'led-pur-adj-' + Date.now(),
            date: new Date(),
            partyType: 'SUPPLIER',
            partyId: existing.supplierId,
            referenceType: 'PURCHASE_ADJUSTMENT',
            referenceNumber: existing.invoiceNumber,
            description: `Supplier payable adjustment for purchase ${existing.invoiceNumber} (Old Due: ৳${oldDue}, New Due: ৳${newDue})`,
            debit: diff < 0 ? new Prisma.Decimal(Math.abs(diff)) : new Prisma.Decimal(0),
            credit: diff > 0 ? new Prisma.Decimal(diff) : new Prisma.Decimal(0),
            runningBalance: new Prisma.Decimal(newDue),
            status: 'COMPLETED',
            performedBy: user.name,
          },
        });
      }

      // 3. Update Purchase record
      const p = await tx.purchase.update({
        where: { id: params.id },
        data: {
          ...(body.invoiceNumber && { invoiceNumber: body.invoiceNumber }),
          ...(body.supplierId && { supplierId: body.supplierId }),
          ...(body.supplierName && { supplierName: body.supplierName }),
          ...(body.date && { date: new Date(body.date) }),
          ...(body.subtotal !== undefined && { subtotal: new Prisma.Decimal(body.subtotal) }),
          ...(body.discount !== undefined && { discount: new Prisma.Decimal(body.discount) }),
          ...(body.tax !== undefined && { tax: new Prisma.Decimal(body.tax) }),
          ...(body.total !== undefined && { total: new Prisma.Decimal(body.total) }),
          ...(body.paidAmount !== undefined && { paidAmount: new Prisma.Decimal(body.paidAmount) }),
          ...(body.dueAmount !== undefined && { dueAmount: new Prisma.Decimal(body.dueAmount) }),
          ...(body.paymentMethod && { paymentMethod: body.paymentMethod }),
          ...(body.notes !== undefined && { notes: body.notes }),
          ...(body.status && { status: body.status }),
        },
        include: { items: true },
      });

      // 4. Audit Log
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'SUPER_ADMIN_PURCHASE_UPDATE',
          module: 'PURCHASES',
          recordId: p.id,
          details: `Super Admin ${user.name} modified Purchase ${p.invoiceNumber} (Supplier: ${p.supplierName}, Total: ${p.total})`,
        },
      });

      return p;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error('Purchase update error:', err);
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
    return NextResponse.json({ success: false, error: 'Access denied. Only Super Admin or Admin can delete purchases.' }, { status: 403 });
  }

  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!purchase) {
      return NextResponse.json({ success: false, error: 'Purchase record not found' }, { status: 404 });
    }

    if (purchase.status === 'CANCELLED') {
      return NextResponse.json({ success: false, error: 'Purchase has already been cancelled and reversed.' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Revert product stock & serials
      for (const item of purchase.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              currentStock: { decrement: item.quantity },
            },
          });

          await tx.inventoryTransaction.create({
            data: {
              id: 'inv-pur-rev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
              transactionNumber: 'REVERT-' + purchase.invoiceNumber + '-' + item.id.slice(-4),
              date: new Date(),
              type: 'DAMAGE_OUT',
              productId: item.productId,
              productName: item.productName,
              branchId: purchase.branchId,
              quantity: item.quantity,
              unitCost: item.costPrice,
              totalValue: new Prisma.Decimal(Number(item.costPrice) * item.quantity),
              openingStock: item.quantity,
              closingStock: 0,
              referenceType: 'PURCHASE_CANCELLATION',
              referenceId: purchase.invoiceNumber,
              notes: `Stock reduced upon cancellation of purchase ${purchase.invoiceNumber}`,
              createdBy: user.name,
            },
          });
        }

        // Delete serials created under this purchase if any
        await tx.productSerial.deleteMany({
          where: { purchaseId: purchase.id },
        });
      }

      // 2. Revert supplier payable balance
      const dueAmt = Number(purchase.dueAmount);
      if (dueAmt > 0 && purchase.supplierId) {
        await tx.supplier.update({
          where: { id: purchase.supplierId },
          data: {
            currentPayable: { decrement: new Prisma.Decimal(dueAmt) },
          },
        });
      }

      // 3. Reverse central financial account entries (refund upfront cash to account)
      await reverseTransaction(tx, {
        referenceNumber: purchase.invoiceNumber,
        reason: `Purchase ${purchase.invoiceNumber} cancelled/deleted by ${user.name}`,
        performedBy: user.name,
      });

      // 4. Also mark any legacy EXP-PUR- voucher as CANCELLED if it was created
      const legacyExpense = await tx.expense.findFirst({
        where: {
          description: { contains: purchase.invoiceNumber },
        },
      });
      if (legacyExpense) {
        await tx.expense.update({
          where: { id: legacyExpense.id },
          data: { status: 'CANCELLED' },
        });
      }

      // 5. Soft cancel: keep purchase in database with status 'CANCELLED' (Strict reversal logic, no hard deletion)
      await tx.purchase.update({
        where: { id: purchase.id },
        data: {
          status: 'CANCELLED',
          notes: `${purchase.notes ? purchase.notes + ' | ' : ''}CANCELLED & REVERSED by ${user.name} on ${new Date().toISOString()}`,
        },
      });

      // 6. Audit trail
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'SUPER_ADMIN_PURCHASE_CANCEL_REVERSE',
          module: 'PURCHASES',
          recordId: purchase.id,
          details: `Super Admin ${user.name} cancelled Purchase ${purchase.invoiceNumber} (Supplier: ${purchase.supplierName}, Total: ${purchase.total}, Reversing Cash Out: ৳${purchase.paidAmount}, Due: ৳${purchase.dueAmount})`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Purchase ${purchase.invoiceNumber} successfully cancelled and all financial effects reversed.`,
    });
  } catch (err: any) {
    console.error('Purchase cancellation error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

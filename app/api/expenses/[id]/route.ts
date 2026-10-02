// NEED ELECTRO ERP — Super Admin Expense Master Update & Delete Handler with ACID Ledger Synchronization
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

  if (!hasPermission(user, 'expenses', 'edit') && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const existing = await prisma.expense.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Expense record not found' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const oldAmount = Number(existing.amount);
      const newAmount = body.amount !== undefined ? Number(body.amount) : oldAmount;

      // 1. If amount or account changed, reverse previous financial effect and post new
      if (body.amount !== undefined && newAmount !== oldAmount) {
        await reverseTransaction(tx, {
          referenceNumber: existing.voucherNumber,
          reason: `Expense ${existing.voucherNumber} amount modified from ৳${oldAmount} to ৳${newAmount}`,
          performedBy: user.name,
        });

        if (newAmount > 0) {
          await recordAccountMovement(tx, {
            accountId: body.accountId,
            paymentMethod: body.paymentMethod || existing.paymentMethod,
            referenceType: 'EXPENSE',
            referenceNumber: existing.voucherNumber,
            amount: newAmount,
            direction: 'OUTFLOW',
            description: `Operating Expense: [${body.category || existing.category}] ${body.description || existing.description}`,
            performedBy: user.name,
            relatedTransactionId: existing.id,
            date: body.date ? new Date(body.date) : existing.date,
          });
        }
      }

      // 2. Update Expense
      const exp = await tx.expense.update({
        where: { id: params.id },
        data: {
          ...(body.category && { category: body.category }),
          ...(body.amount !== undefined && { amount: new Prisma.Decimal(body.amount) }),
          ...(body.paymentMethod && { paymentMethod: body.paymentMethod }),
          ...(body.date && { date: new Date(body.date) }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.branchId && { branchId: body.branchId }),
          ...(body.attachmentName !== undefined && { attachmentName: body.attachmentName }),
        },
      });

      // 3. Audit Log
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'SUPER_ADMIN_EXPENSE_UPDATE',
          module: 'EXPENSES',
          recordId: exp.id,
          details: `Super Admin ${user.name} modified Expense ${exp.voucherNumber} (Amount: ${exp.amount}, Category: ${exp.category})`,
        },
      });

      return exp;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error('Expense update error:', err);
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
    return NextResponse.json({ success: false, error: 'Access denied. Only Super Admin or Admin can delete expenses.' }, { status: 403 });
  }

  try {
    const expense = await prisma.expense.findUnique({ where: { id: params.id } });
    if (!expense) {
      return NextResponse.json({ success: false, error: 'Expense record not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Reverse financial effects: restore money to account and post EXPENSE_REVERSAL in ledger
      await reverseTransaction(tx, {
        referenceNumber: expense.voucherNumber,
        reason: `Expense ${expense.voucherNumber} cancelled/deleted by ${user.name}`,
        performedBy: user.name,
      });

      // 2. Permanently delete expense record from database
      await tx.expense.delete({
        where: { id: params.id },
      });

      // 3. Audit trail
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'SUPER_ADMIN_EXPENSE_CANCEL_REVERSE',
          module: 'EXPENSES',
          recordId: expense.id,
          details: `Super Admin ${user.name} cancelled Expense ${expense.voucherNumber} (Amount: ৳${expense.amount}, Category: ${expense.category}) and restored cash to account via ledger reversal.`,
        },
      });
    });

    return NextResponse.json({ success: true, message: `Expense ${expense.voucherNumber} cancelled and cash balance restored via ledger reversal.` });
  } catch (err: any) {
    console.error('Expense deletion error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

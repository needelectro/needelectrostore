// NEED ELECTRO ERP — Authorized Cash Adjustment Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (
    !hasPermission(user, 'cash_management', 'adjust') &&
    user.role !== 'SUPER_ADMIN' &&
    user.role !== 'ADMIN'
  ) {
    return NextResponse.json({ success: false, error: 'Access denied. Only Super Admin or authorized Admin can make cash adjustments.' }, { status: 403 });
  }

  try {
    const { amount, type, reason, accountId, paymentMethod, reference, notes, branchId } = await req.json();

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Valid positive adjustment amount is required.' }, { status: 400 });
    }

    if (!type || (type !== 'INFLOW' && type !== 'OUTFLOW')) {
      return NextResponse.json({ success: false, error: 'Adjustment type must be INFLOW or OUTFLOW.' }, { status: 400 });
    }

    if (!reason) {
      return NextResponse.json({ success: false, error: 'Adjustment reason is required.' }, { status: 400 });
    }

    const targetAccountId = accountId || 'acc-1';
    const account = await prisma.financialAccount.findUnique({ where: { id: targetAccountId } });
    if (!account) {
      return NextResponse.json({ success: false, error: 'Target financial account not found.' }, { status: 404 });
    }

    const adjustmentNumber = 'ADJ-' + Date.now().toString().slice(-6);

    const adjustment = await prisma.$transaction(async (tx) => {
      // 1. Create CashAdjustment record
      const db = tx as any;
      const adj = await db.cashAdjustment.create({
        data: {
          id: 'adj-' + Date.now(),
          adjustmentNumber,
          date: new Date(),
          type,
          reason,
          amount: new Prisma.Decimal(numericAmount),
          accountId: targetAccountId,
          paymentMethod: paymentMethod || (account.type === 'CASH' ? 'Cash' : 'Bank'),
          reference,
          notes,
          branchId: branchId || 'branch-main-1',
          performedBy: user.name,
        },
      });

      // 2. Adjust target financial account balance
      const balanceChange = type === 'INFLOW' ? numericAmount : -numericAmount;
      const updatedAccount = await tx.financialAccount.update({
        where: { id: targetAccountId },
        data: {
          balance: {
            [type === 'INFLOW' ? 'increment' : 'decrement']: new Prisma.Decimal(numericAmount),
          },
        },
      });

      // 3. Create Accounting Ledger Entry
      await tx.ledgerEntry.create({
        data: {
          id: 'led-' + Date.now(),
          date: new Date(),
          partyType: 'ACCOUNT',
          partyId: targetAccountId,
          referenceType: 'CASH_ADJUSTMENT',
          referenceNumber: adjustmentNumber,
          description: `Cash Adjustment [${type} - ${reason}]: ${notes || 'Authorized modification'}`,
          debit: type === 'INFLOW' ? new Prisma.Decimal(numericAmount) : new Prisma.Decimal(0),
          credit: type === 'OUTFLOW' ? new Prisma.Decimal(numericAmount) : new Prisma.Decimal(0),
          runningBalance: updatedAccount.balance,
        },
      });

      // 4. Log strict compliance Audit Trail
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'CASH_ADJUSTMENT',
          module: 'CASH_MANAGEMENT',
          recordId: adj.id,
          details: `Super Admin ${user.name} adjusted ${account.name} by ${type === 'INFLOW' ? '+' : '-'}৳${numericAmount.toLocaleString('en-IN')}. Reason: ${reason}. Prev Balance: ৳${Number(account.balance).toLocaleString('en-IN')}, New Balance: ৳${Number(updatedAccount.balance).toLocaleString('en-IN')}. Reference: ${reference || 'N/A'}. Notes: ${notes || 'None'}`,
        },
      });

      return adj;
    });

    return NextResponse.json({
      success: true,
      message: `Cash adjustment ${adjustmentNumber} executed successfully.`,
      data: adjustment,
    });
  } catch (err: any) {
    console.error('Cash Adjustment Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

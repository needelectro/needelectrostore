// NEED ELECTRO ERP — Owner Withdrawal Route Handler (Separated from Business Expenses)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import { recordAccountMovement, reverseTransaction } from '@/lib/accounting';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const withdrawals = await prisma.ownerWithdrawal.findMany({
    orderBy: { date: 'desc' },
    take: 200,
  });

  return NextResponse.json({ success: true, data: withdrawals });
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (
    !hasPermission(user, 'accounting', 'create') &&
    !hasPermission(user, 'cash_management', 'adjust') &&
    user.role !== 'SUPER_ADMIN' &&
    user.role !== 'ADMIN'
  ) {
    return NextResponse.json({ success: false, error: 'Access denied. Only Super Admin or authorized Admin can record owner withdrawals.' }, { status: 403 });
  }

  try {
    const { ownerName, amount, sourceAccountId, paymentMethod, reference, purpose, date } = await req.json();

    const numericAmount = Number(amount);
    if (!ownerName || isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Owner name and valid positive amount are required.' }, { status: 400 });
    }

    const withdrawalNumber = 'WTH-' + Date.now().toString().slice(-6);
    const targetAccountId = sourceAccountId || 'acc-1';

    const result = await prisma.$transaction(async (tx) => {
      // 1. Record in owner_withdrawals
      const withdrawal = await tx.ownerWithdrawal.create({
        data: {
          id: 'wth-' + Date.now(),
          withdrawalNumber,
          ownerName: ownerName.trim(),
          amount: new Prisma.Decimal(numericAmount),
          date: date ? new Date(date) : new Date(),
          sourceAccountId: targetAccountId,
          paymentMethod: paymentMethod || 'Cash',
          reference,
          purpose: purpose || 'Personal Drawing / Equity Withdrawal',
          status: 'COMPLETED',
          approvedBy: user.name,
        },
      });

      // 2. Record Central Ledger entry and decrease Account Balance
      await recordAccountMovement(tx, {
        accountId: targetAccountId,
        paymentMethod: paymentMethod || 'Cash',
        referenceType: 'OWNER_WITHDRAWAL',
        referenceNumber: withdrawalNumber,
        amount: numericAmount,
        direction: 'OUTFLOW',
        description: `Owner Drawing / Withdrawal by ${ownerName.trim()}${purpose ? `: ${purpose}` : ''}`,
        performedBy: user.name,
        relatedTransactionId: withdrawal.id,
        date: date ? new Date(date) : new Date(),
      });

      // 3. Audit trail
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'OWNER_WITHDRAWAL_RECORDED',
          module: 'ACCOUNTING',
          recordId: withdrawal.id,
          details: `Super Admin ${user.name} recorded owner withdrawal ${withdrawalNumber}: ৳${numericAmount.toLocaleString('en-IN')} by ${ownerName} (${purpose || 'Personal Drawing'})`,
        },
      });

      return withdrawal;
    });

    return NextResponse.json({ success: true, message: `Owner withdrawal ${withdrawalNumber} recorded successfully.`, data: result });
  } catch (err: any) {
    console.error('Owner withdrawal error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

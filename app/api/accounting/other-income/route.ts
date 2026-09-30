// NEED ELECTRO ERP — Other Income Route Handler (Separated from Sales Revenue)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import { recordAccountMovement, reverseTransaction } from '@/lib/accounting';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const otherIncomes = await prisma.otherIncome.findMany({
    orderBy: { date: 'desc' },
    take: 200,
  });

  return NextResponse.json({ success: true, data: otherIncomes });
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (
    !hasPermission(user, 'accounting', 'create') &&
    !hasPermission(user, 'cash_management', 'create') &&
    user.role !== 'SUPER_ADMIN' &&
    user.role !== 'ADMIN'
  ) {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  try {
    const { category, amount, accountId, paymentMethod, reference, description, receivedFrom, branchId, date } = await req.json();

    const numericAmount = Number(amount);
    if (!category || !description || isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json({ success: false, error: 'Income category, description, and valid positive amount are required.' }, { status: 400 });
    }

    const incomeNumber = 'INC-' + Date.now().toString().slice(-6);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Record in other_incomes
      const income = await tx.otherIncome.create({
        data: {
          id: 'inc-' + Date.now(),
          incomeNumber,
          category,
          amount: new Prisma.Decimal(numericAmount),
          date: date ? new Date(date) : new Date(),
          accountId: accountId || 'acc-1',
          paymentMethod: paymentMethod || 'Cash',
          reference,
          description,
          receivedFrom,
          branchId,
          status: 'COMPLETED',
          receivedBy: user.name,
        },
      });

      // 2. Record Central Ledger entry and increase Account Balance
      await recordAccountMovement(tx, {
        accountId: accountId || 'acc-1',
        paymentMethod: paymentMethod || 'Cash',
        referenceType: 'OTHER_INCOME',
        referenceNumber: incomeNumber,
        amount: numericAmount,
        direction: 'INFLOW',
        description: `Other Income [${category}]: ${description}${receivedFrom ? ` (From: ${receivedFrom})` : ''}`,
        performedBy: user.name,
        relatedTransactionId: income.id,
        date: date ? new Date(date) : new Date(),
      });

      // 3. Audit trail
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'OTHER_INCOME_RECORDED',
          module: 'ACCOUNTING',
          recordId: income.id,
          details: `Recorded other income ${incomeNumber}: ৳${numericAmount.toLocaleString('en-IN')} for ${category} (${description})`,
        },
      });

      return income;
    });

    return NextResponse.json({ success: true, message: `Other income ${incomeNumber} recorded successfully.`, data: result });
  } catch (err: any) {
    console.error('Other income error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

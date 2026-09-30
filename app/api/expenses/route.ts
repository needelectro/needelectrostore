// NEED ELECTRO ERP — Operating Expenses Route Handler (ACID Transaction)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { createExpenseSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';
import { recordAccountMovement } from '@/lib/accounting';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const expenses = await prisma.expense.findMany({
    orderBy: { date: 'desc' },
    take: 200,
  });

  return NextResponse.json({ success: true, data: expenses });
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'expenses', 'create') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createExpenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { category, amount, date, paymentMethod, branchId, description, attachmentName, accountId } = parsed.data;
  const voucherNumber = 'EXP-' + Date.now().toString().slice(-6);

  try {
    const expense = await prisma.$transaction(async (tx) => {
      const exp = await tx.expense.create({
        data: {
          id: 'exp-' + Date.now(),
          voucherNumber,
          category,
          amount: new Prisma.Decimal(amount),
          date: date ? new Date(date) : new Date(),
          paymentMethod,
          branchId,
          description,
          attachmentName,
          createdBy: user.name,
        },
      });

      // Deduct financial account and record central ledger entry
      await recordAccountMovement(tx, {
        accountId,
        paymentMethod,
        referenceType: 'EXPENSE',
        referenceNumber: voucherNumber,
        amount,
        direction: 'OUTFLOW',
        description: `Operating Expense: [${category}] ${description}`,
        performedBy: user.name,
        relatedTransactionId: exp.id,
        date: date ? new Date(date) : new Date(),
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'EXPENSE_RECORDED',
          module: 'EXPENSES',
          recordId: exp.id,
          details: `Recorded expense ${voucherNumber}: ৳${amount} for ${category}`,
        },
      });

      return exp;
    });

    return NextResponse.json({
      success: true,
      message: 'Expense recorded successfully.',
      data: expense,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// NEED ELECTRO ERP — Opening Balances Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'accounting', 'opening_balance') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const { date, type, targetId, targetName, amount, notes } = await req.json();

  if (!type || !targetId || amount === undefined) {
    return NextResponse.json({ success: false, error: 'Type, target ID, and amount required' }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.openingBalance.create({
        data: {
          id: 'ob-' + Date.now(),
          date: date ? new Date(date) : new Date(),
          type,
          targetId,
          targetName: targetName || 'Target',
          amount: new Prisma.Decimal(amount),
          notes,
          approvedBy: user.name,
        },
      });

      if (type === 'CASH' || type === 'BANK') {
        await tx.financialAccount.updateMany({
          where: { id: targetId },
          data: { balance: new Prisma.Decimal(amount) },
        });
      } else if (type === 'CUSTOMER') {
        await tx.customer.updateMany({
          where: { id: targetId },
          data: { currentBalance: new Prisma.Decimal(amount) },
        });
      } else if (type === 'SUPPLIER') {
        await tx.supplier.updateMany({
          where: { id: targetId },
          data: { currentPayable: new Prisma.Decimal(amount) },
        });
      }
    });

    return NextResponse.json({ success: true, message: 'Opening balance initialized successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

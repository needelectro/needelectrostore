// NEED ELECTRO ERP — Fund Transfer Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'accounting', 'transfer') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const { fromAccountId, toAccountId, amount, fee, reference, notes } = await req.json();

  if (!fromAccountId || !toAccountId || !amount || Number(amount) <= 0) {
    return NextResponse.json({ success: false, error: 'Valid source, destination, and amount required' }, { status: 400 });
  }

  const transferNumber = 'TRF-' + Date.now().toString().slice(-6);

  try {
    const transfer = await prisma.$transaction(async (tx) => {
      const fromAcc = await tx.financialAccount.findUnique({ where: { id: fromAccountId } });
      const toAcc = await tx.financialAccount.findUnique({ where: { id: toAccountId } });

      if (!fromAcc || !toAcc) {
        throw new Error('Source or destination financial account not found');
      }

      const totalDeduction = Number(amount) + Number(fee || 0);
      if (Number(fromAcc.balance) < totalDeduction) {
        throw new Error(`Insufficient funds in ${fromAcc.name}. Balance: ৳${fromAcc.balance}`);
      }

      // Deduct from source
      await tx.financialAccount.update({
        where: { id: fromAccountId },
        data: { balance: { decrement: new Prisma.Decimal(totalDeduction) } },
      });

      // Credit to destination
      await tx.financialAccount.update({
        where: { id: toAccountId },
        data: { balance: { increment: new Prisma.Decimal(amount) } },
      });

      // Record transfer
      const trf = await tx.fundTransfer.create({
        data: {
          id: 'trf-' + Date.now(),
          transferNumber,
          date: new Date(),
          fromAccountId,
          toAccountId,
          amount: new Prisma.Decimal(amount),
          fee: new Prisma.Decimal(fee || 0),
          reference,
          transferredBy: user.name,
          notes,
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'FUND_TRANSFER',
          module: 'ACCOUNTING',
          recordId: trf.id,
          details: `Transferred ৳${amount} from ${fromAcc.name} to ${toAcc.name}`,
        },
      });

      return trf;
    });

    return NextResponse.json({ success: true, message: 'Transfer completed successfully', data: transfer });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

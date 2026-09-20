// NEED ELECTRO ERP — Fund Transfer Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (
    !hasPermission(user, 'accounting', 'transfer') &&
    !hasPermission(user, 'cash_management', 'create') &&
    !hasPermission(user, 'cash_management', 'view') &&
    !['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT'].includes(user.role)
  ) {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const { fromAccountId, toAccountId, amount, fee, reference, notes } = await req.json();

  if (!fromAccountId || !toAccountId || !amount || Number(amount) <= 0) {
    return NextResponse.json({ success: false, error: 'Valid source, destination, and amount required' }, { status: 400 });
  }

  if (fromAccountId === toAccountId) {
    return NextResponse.json({ success: false, error: 'Source and destination accounts must be different' }, { status: 400 });
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
        throw new Error(`Insufficient funds in ${fromAcc.name}. Balance: ৳${Number(fromAcc.balance).toLocaleString()}`);
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

      // Double-entry Ledger entries
      await tx.ledgerEntry.create({
        data: {
          id: 'led-' + Date.now() + '-trf-out',
          date: new Date(),
          partyType: 'ACCOUNT',
          partyId: fromAccountId,
          referenceType: 'TRANSFER',
          referenceNumber: transferNumber,
          description: `Transfer to ${toAcc.name}${fee > 0 ? ` (Fee: ৳${fee})` : ''}`,
          debit: new Prisma.Decimal(0),
          credit: new Prisma.Decimal(totalDeduction),
          runningBalance: new Prisma.Decimal(Number(fromAcc.balance) - totalDeduction),
        },
      });

      await tx.ledgerEntry.create({
        data: {
          id: 'led-' + Date.now() + '-trf-in',
          date: new Date(),
          partyType: 'ACCOUNT',
          partyId: toAccountId,
          referenceType: 'TRANSFER',
          referenceNumber: transferNumber,
          description: `Transfer received from ${fromAcc.name}`,
          debit: new Prisma.Decimal(amount),
          credit: new Prisma.Decimal(0),
          runningBalance: new Prisma.Decimal(Number(toAcc.balance) + Number(amount)),
        },
      });

      // If there is a transfer fee, log it as an Expense
      if (fee && Number(fee) > 0) {
        await tx.expense.create({
          data: {
            id: 'exp-' + Date.now() + '-fee',
            voucherNumber: 'EXP-FEE-' + Date.now().toString().slice(-6),
            category: 'Service Expenses',
            amount: new Prisma.Decimal(fee),
            date: new Date(),
            paymentMethod: fromAcc.type === 'CASH' ? 'Cash' : fromAcc.type === 'BANK' ? 'Bank' : 'bKash',
            branchId: user.branchId || 'branch-main-1',
            description: `Transfer fee: ${fromAcc.name} -> ${toAcc.name} (${transferNumber})`,
            createdBy: user.name,
          },
        });
      }

      // Audit Log
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'FUND_TRANSFER',
          module: 'ACCOUNTING',
          recordId: trf.id,
          details: `Transferred ৳${amount} from ${fromAcc.name} to ${toAcc.name} (Ref: ${transferNumber})`,
        },
      });

      return trf;
    });

    return NextResponse.json({ success: true, message: 'Transfer completed successfully', data: transfer });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

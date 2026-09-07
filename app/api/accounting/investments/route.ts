// NEED ELECTRO ERP — Capital Investments Route Handler (Separated from Revenue)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'accounting', 'invest') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const { investorName, amount, investmentType, depositAccountId, paymentMethod, reference, notes } = await req.json();

  if (!investorName || !amount || Number(amount) <= 0 || !depositAccountId) {
    return NextResponse.json({ success: false, error: 'Investor name, amount, and deposit account required' }, { status: 400 });
  }

  const referenceNumber = 'INV-CAP-' + Date.now().toString().slice(-6);

  try {
    const investment = await prisma.$transaction(async (tx) => {
      // Create investment record
      const inv = await tx.investment.create({
        data: {
          id: 'inv-' + Date.now(),
          referenceNumber,
          investorName,
          amount: new Prisma.Decimal(amount),
          date: new Date(),
          investmentType: investmentType || 'CAPITAL_INJECTION',
          depositAccountId,
          paymentMethod: paymentMethod || 'BANK',
          reference,
          status: 'ACTIVE',
          notes,
          createdBy: user.name,
        },
      });

      // Increase deposit account balance
      await tx.financialAccount.update({
        where: { id: depositAccountId },
        data: { balance: { increment: new Prisma.Decimal(amount) } },
      });

      // Record Accounting Ledger Entry
      await tx.ledgerEntry.create({
        data: {
          id: 'led-' + Date.now(),
          date: new Date(),
          partyType: 'ACCOUNT',
          partyId: depositAccountId,
          referenceType: 'CAPITAL_INVESTMENT',
          referenceNumber,
          description: `Capital Investment from ${investorName} (${investmentType || 'CAPITAL_INJECTION'})`,
          debit: new Prisma.Decimal(amount),
          credit: new Prisma.Decimal(0),
          runningBalance: new Prisma.Decimal(amount),
        },
      });

      // Audit Log
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'INVESTMENT_RECORDED',
          module: 'ACCOUNTING',
          recordId: inv.id,
          details: `Capital injection of ৳${amount} by ${investorName}`,
        },
      });

      return inv;
    });

    return NextResponse.json({ success: true, message: 'Investment recorded successfully', data: investment });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

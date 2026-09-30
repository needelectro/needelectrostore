// NEED ELECTRO ERP — Capital Investments Route Handler (Separated from Revenue)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import { recordAccountMovement } from '@/lib/accounting';

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'accounting', 'invest') && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const {
    investorName,
    amount,
    investmentType,
    depositAccountId,
    paymentMethod,
    reference,
    notes,
    date,
    investorPhone,
    investorEmail,
    investorNid,
    investorAddress,
    sharePercentage
  } = await req.json();

  if (!investorName || !amount || Number(amount) <= 0 || !depositAccountId) {
    return NextResponse.json({ success: false, error: 'Investor name, amount, and deposit account required' }, { status: 400 });
  }

  const isSeed = investmentType === 'SEED_FUNDING';
  const referenceNumber = (isSeed ? 'SEED-' : 'INV-CAP-') + Date.now().toString().slice(-6);

  // Compile detailed investor metadata
  const infoParts: string[] = [];
  if (investorPhone) infoParts.push(`Phone: ${String(investorPhone).trim()}`);
  if (investorEmail) infoParts.push(`Email: ${String(investorEmail).trim()}`);
  if (investorNid) infoParts.push(`NID: ${String(investorNid).trim()}`);
  if (investorAddress) infoParts.push(`Address: ${String(investorAddress).trim()}`);
  if (sharePercentage) infoParts.push(`Equity: ${sharePercentage}%`);
  if (notes && String(notes).trim()) infoParts.push(String(notes).trim());
  const formattedNotes = infoParts.length > 0 ? infoParts.join(' | ') : undefined;

  const invDate = date ? new Date(date) : new Date();

  try {
    const investment = await prisma.$transaction(async (tx) => {
      // Create investment record
      const inv = await tx.investment.create({
        data: {
          id: 'inv-' + Date.now(),
          referenceNumber,
          investorName: investorName.trim(),
          amount: new Prisma.Decimal(amount),
          date: invDate,
          investmentType: investmentType || 'CAPITAL_INVESTMENT',
          depositAccountId,
          paymentMethod: paymentMethod || 'Cash',
          reference: reference?.trim() || referenceNumber,
          status: 'ACTIVE',
          notes: formattedNotes,
          createdBy: user.name,
        },
      });

      // Increase deposit account balance and record central ledger entry
      await recordAccountMovement(tx, {
        accountId: depositAccountId,
        paymentMethod: paymentMethod || 'Cash',
        referenceType: isSeed ? 'SEED_FUNDING' : 'INVESTMENT',
        referenceNumber,
        amount: Number(amount),
        direction: 'INFLOW',
        description: isSeed
          ? `Seed Funding received from ${investorName.trim()}`
          : `Capital Investment from ${investorName.trim()} (${investmentType || 'CAPITAL_INVESTMENT'})`,
        performedBy: user.name,
        relatedTransactionId: inv.id,
        date: invDate,
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
          details: `Capital injection of ৳${amount} by ${investorName.trim()}${sharePercentage ? ` (${sharePercentage}% equity)` : ''}`,
        },
      });

      return inv;
    });

    return NextResponse.json({ success: true, message: 'Investment recorded successfully', data: investment });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const investments = await prisma.investment.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json({ success: true, data: investments });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

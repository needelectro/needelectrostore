// NEED ELECTRO ERP — Capital Investments Route Handler (Separated from Revenue)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import { recordAccountMovement } from '@/lib/accounting';

function parseInvestmentMetadata(inv: any) {
  let meta: any = {};
  if (inv.notes) {
    try {
      meta = JSON.parse(inv.notes);
    } catch {
      // Legacy text format e.g. "Phone: 017... | Email: ... | Address: ..."
      const phoneMatch = inv.notes.match(/Phone:\s*([^|]+)/i);
      const emailMatch = inv.notes.match(/Email:\s*([^|]+)/i);
      const addressMatch = inv.notes.match(/Address:\s*([^|]+)/i);
      const nidMatch = inv.notes.match(/NID:\s*([^|]+)/i);
      const equityMatch = inv.notes.match(/Equity:\s*([0-9.]+)%/i);

      meta = {
        investorPhone: phoneMatch ? phoneMatch[1].trim() : undefined,
        investorEmail: emailMatch ? emailMatch[1].trim() : undefined,
        investorAddress: addressMatch ? addressMatch[1].trim() : undefined,
        investorNid: nidMatch ? nidMatch[1].trim() : undefined,
        sharePercentage: equityMatch ? Number(equityMatch[1]) : undefined,
        userNotes: inv.notes,
      };
    }
  }

  return {
    id: inv.id,
    referenceNumber: inv.referenceNumber,
    investorName: inv.investorName,
    amount: Number(inv.amount),
    date: inv.date instanceof Date ? inv.date.toISOString() : String(inv.date),
    investmentType: inv.investmentType,
    depositAccountId: inv.depositAccountId,
    paymentMethod: inv.paymentMethod,
    reference: inv.reference || inv.referenceNumber,
    status: inv.status,
    notes: meta.userNotes ?? (typeof inv.notes === 'string' && !inv.notes.startsWith('{') ? inv.notes : ''),
    createdBy: inv.createdBy,
    createdAt: inv.createdAt instanceof Date ? inv.createdAt.toISOString() : String(inv.createdAt),
    investorPhone: meta.investorPhone,
    investorEmail: meta.investorEmail,
    investorAddress: meta.investorAddress,
    investorNid: meta.investorNid,
    organization: meta.organization,
    purpose: meta.purpose,
    description: meta.description,
    sharePercentage: meta.sharePercentage,
  };
}

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
    organization,
    purpose,
    description,
    sharePercentage
  } = await req.json();

  if (!investorName || !amount || Number(amount) <= 0 || !depositAccountId) {
    return NextResponse.json({ success: false, error: 'Investor name, amount, and deposit account required' }, { status: 400 });
  }

  const invDate = date ? new Date(date) : new Date();
  const year = invDate.getFullYear();
  const defaultPrefix = `INV-${year}-`;

  // Compile detailed investor metadata as clean JSON
  const metadata: Record<string, any> = {
    investorPhone: investorPhone ? String(investorPhone).trim() : undefined,
    investorEmail: investorEmail ? String(investorEmail).trim() : undefined,
    investorNid: investorNid ? String(investorNid).trim() : undefined,
    investorAddress: investorAddress ? String(investorAddress).trim() : undefined,
    organization: organization ? String(organization).trim() : undefined,
    purpose: purpose ? String(purpose).trim() : undefined,
    description: description ? String(description).trim() : undefined,
    sharePercentage: sharePercentage ? Number(sharePercentage) : undefined,
    userNotes: notes && String(notes).trim() ? String(notes).trim() : undefined,
  };

  const formattedNotes = JSON.stringify(metadata);

  try {
    const investment = await prisma.$transaction(async (tx) => {
      // 1. Generate unique sequential reference number: INV-2026-000001
      let referenceNumber = '';
      
      const existingInvs = await tx.investment.findMany({
        where: { referenceNumber: { startsWith: defaultPrefix } },
        select: { referenceNumber: true },
        orderBy: { referenceNumber: 'desc' },
        take: 100,
      });

      let highestSeq = 0;
      for (const item of existingInvs) {
        const numPart = item.referenceNumber.replace(defaultPrefix, '');
        const parsed = parseInt(numPart, 10);
        if (!isNaN(parsed) && parsed > highestSeq) {
          highestSeq = parsed;
        }
      }

      if (highestSeq === 0) {
        const totalCount = await tx.investment.count();
        highestSeq = totalCount;
      }

      const nextNum = highestSeq + 1;
      referenceNumber = `${defaultPrefix}${String(nextNum).padStart(6, '0')}`;

      // Ensure unique collision safety
      while (await tx.investment.findUnique({ where: { referenceNumber } })) {
        highestSeq++;
        referenceNumber = `${defaultPrefix}${String(highestSeq + 1).padStart(6, '0')}`;
      }

      // 2. Link to registered Investor account if email matches
      let linkedInvestorId: string | null = null;
      if (investorEmail) {
        const existingInvestor = await tx.investor.findUnique({
          where: { email: String(investorEmail).trim().toLowerCase() }
        });
        if (existingInvestor) {
          linkedInvestorId = existingInvestor.id;
        }
      }

      // 3. Create investment record
      const inv = await tx.investment.create({
        data: {
          id: 'inv-' + Date.now(),
          referenceNumber,
          investorName: investorName.trim(),
          amount: new Prisma.Decimal(amount),
          date: invDate,
          investmentType: investmentType || 'EQUITY',
          depositAccountId,
          paymentMethod: paymentMethod || 'Cash',
          reference: reference?.trim() || referenceNumber,
          status: 'ACTIVE',
          notes: formattedNotes,
          createdBy: user.name,
          investorId: linkedInvestorId,
        },
      });

      // 4. Increase deposit account balance and record central ledger entry
      await recordAccountMovement(tx, {
        accountId: depositAccountId,
        paymentMethod: paymentMethod || 'Cash',
        referenceType: 'INVESTMENT',
        referenceNumber,
        amount: Number(amount),
        direction: 'INFLOW',
        description: purpose
          ? `Capital Investment: ${purpose} (${investorName.trim()})`
          : `Capital Investment from ${investorName.trim()} (${investmentType || 'EQUITY'})`,
        performedBy: user.name,
        relatedTransactionId: inv.id,
        date: invDate,
      });

      // 5. Audit Log: Investment Created
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'INVESTMENT_CREATED',
          module: 'ACCOUNTING',
          recordId: inv.id,
          details: `Capital investment [${referenceNumber}] of ৳${Number(amount).toLocaleString()} by ${investorName.trim()}${purpose ? ` for ${purpose}` : ''}`,
        },
      });

      return inv;
    });

    const parsedData = parseInvestmentMetadata(investment);
    return NextResponse.json({ success: true, message: 'Investment recorded successfully', data: parsedData });
  } catch (err: any) {
    console.error('Failed to record investment:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    const investments = await prisma.investment.findMany({
      where: statusFilter ? { status: statusFilter } : undefined,
      orderBy: { date: 'desc' },
    });

    const parsedInvestments = investments.map(parseInvestmentMetadata);
    return NextResponse.json({ success: true, data: parsedInvestments });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

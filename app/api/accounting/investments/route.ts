// NEED ELECTRO ERP — Capital Investments Route Handler (Separated from Revenue)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import { recordAccountMovement, parseInvestmentMetadata, syncStoredBalancesWithLedger } from '@/lib/accounting';

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

export async function PUT(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'accounting', 'invest') && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const {
    id,
    investorName,
    amount,
    investmentType,
    depositAccountId,
    paymentMethod,
    reference,
    referenceNumber,
    notes,
    date,
    investorPhone,
    investorEmail,
    investorNid,
    investorAddress,
    organization,
    purpose,
    description,
    sharePercentage,
    status,
  } = await req.json();

  if (!id) {
    return NextResponse.json({ success: false, error: 'Investment ID is required' }, { status: 400 });
  }

  if (!investorName || !amount || Number(amount) <= 0 || !depositAccountId) {
    return NextResponse.json({ success: false, error: 'Investor name, amount, and deposit account required' }, { status: 400 });
  }

  try {
    const updatedInvestment = await prisma.$transaction(async (tx) => {
      const existing = await tx.investment.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new Error(`Investment record not found: ${id}`);
      }

      const invDate = date ? new Date(date) : existing.date;
      const oldAmount = Number(existing.amount);
      const newAmount = Number(amount);
      const oldAccountId = existing.depositAccountId;
      const newAccountId = depositAccountId;
      const newStatus = status || existing.status;

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

      // 1. Synchronize financial account balances if status is ACTIVE
      if (existing.status === 'ACTIVE' && newStatus === 'ACTIVE') {
        if (oldAccountId === newAccountId) {
          const diff = newAmount - oldAmount;
          if (diff !== 0) {
            await tx.financialAccount.update({
              where: { id: oldAccountId },
              data: { balance: { increment: new Prisma.Decimal(diff) } },
            });
          }
        } else {
          // Changed deposit target account: deduct from old account, credit to new account
          await tx.financialAccount.update({
            where: { id: oldAccountId },
            data: { balance: { decrement: new Prisma.Decimal(oldAmount) } },
          });
          await tx.financialAccount.update({
            where: { id: newAccountId },
            data: { balance: { increment: new Prisma.Decimal(newAmount) } },
          });
        }
      } else if (existing.status === 'ACTIVE' && newStatus === 'REVERSED') {
        // Was active, now reversed: deduct from account
        await tx.financialAccount.update({
          where: { id: oldAccountId },
          data: { balance: { decrement: new Prisma.Decimal(oldAmount) } },
        });
      } else if (existing.status === 'REVERSED' && newStatus === 'ACTIVE') {
        // Was reversed, now reactivated: credit account
        await tx.financialAccount.update({
          where: { id: newAccountId },
          data: { balance: { increment: new Prisma.Decimal(newAmount) } },
        });
      }

      // 2. Synchronize Ledger Entry
      const existingEntries = await tx.ledgerEntry.findMany({
        where: {
          OR: [
            { relatedTransactionId: existing.id },
            { referenceNumber: existing.referenceNumber },
          ],
        },
      });

      const invDesc = purpose
        ? `Capital Investment: ${purpose} (${investorName.trim()})`
        : `Capital Investment from ${investorName.trim()} (${investmentType || 'EQUITY'})`;

      if (existingEntries.length > 0) {
        await tx.ledgerEntry.updateMany({
          where: {
            OR: [
              { relatedTransactionId: existing.id },
              { referenceNumber: existing.referenceNumber },
            ],
          },
          data: {
            partyId: newAccountId,
            debit: new Prisma.Decimal(newAmount),
            paymentMethod: paymentMethod || 'Cash',
            date: invDate,
            description: invDesc,
            status: newStatus === 'REVERSED' ? 'REVERSED' : 'COMPLETED',
          },
        });
      } else if (newStatus === 'ACTIVE') {
        const entryId = 'led-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
        await tx.ledgerEntry.create({
          data: {
            id: entryId,
            date: invDate,
            partyType: 'ACCOUNT',
            partyId: newAccountId,
            referenceType: 'INVESTMENT',
            referenceNumber: referenceNumber || existing.referenceNumber,
            description: invDesc,
            debit: new Prisma.Decimal(newAmount),
            credit: new Prisma.Decimal(0),
            status: 'COMPLETED',
            paymentMethod: paymentMethod || 'Cash',
            performedBy: user.name,
            relatedTransactionId: existing.id,
          },
        });
      }

      // 3. Update Investment record
      const updated = await tx.investment.update({
        where: { id },
        data: {
          investorName: investorName.trim(),
          amount: new Prisma.Decimal(newAmount),
          date: invDate,
          investmentType: investmentType || 'EQUITY',
          depositAccountId: newAccountId,
          paymentMethod: paymentMethod || 'Cash',
          reference: reference?.trim() || existing.reference || existing.referenceNumber,
          referenceNumber: referenceNumber?.trim() || existing.referenceNumber,
          status: newStatus,
          notes: formattedNotes,
        },
      });

      // 4. Update linked Investor profile if exists
      if (existing.investorId) {
        await tx.investor.update({
          where: { id: existing.investorId },
          data: {
            name: investorName.trim(),
            ...(investorPhone ? { phone: investorPhone.trim() } : {}),
            ...(investorAddress ? { address: investorAddress.trim() } : {}),
            ...(investorNid ? { nidPassport: investorNid.trim() } : {}),
          },
        }).catch(() => {});
      }

      // 5. Ensure stored balances match ledger
      await syncStoredBalancesWithLedger(tx);

      // 6. Audit Log
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'INVESTMENT_UPDATED',
          module: 'ACCOUNTING',
          recordId: existing.id,
          details: `Updated capital investment [${existing.referenceNumber}]: ৳${oldAmount.toLocaleString()} -> ৳${newAmount.toLocaleString()}, investor: ${investorName.trim()}, account: ${newAccountId}`,
        },
      });

      return updated;
    });

    const parsedData = parseInvestmentMetadata(updatedInvestment);
    return NextResponse.json({ success: true, message: 'Investment updated successfully', data: parsedData });
  } catch (err: any) {
    console.error('Failed to update investment:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Only Super Admin or Admin can delete investments' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'Investment ID required' }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.investment.findUnique({ where: { id } });
      if (!existing) throw new Error('Investment not found');

      // Deduct balance from deposit account if it was active
      if (existing.status === 'ACTIVE') {
        await tx.financialAccount.update({
          where: { id: existing.depositAccountId },
          data: { balance: { decrement: existing.amount } },
        });
      }

      // Mark or delete ledger entries
      await tx.ledgerEntry.deleteMany({
        where: {
          OR: [
            { relatedTransactionId: existing.id },
            { referenceNumber: existing.referenceNumber },
          ],
        },
      });

      // Delete investment
      await tx.investment.delete({ where: { id } });

      await syncStoredBalancesWithLedger(tx);

      // Audit log
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'INVESTMENT_DELETED',
          module: 'ACCOUNTING',
          recordId: id,
          details: `Deleted investment [${existing.referenceNumber}] (${existing.investorName}, ৳${Number(existing.amount).toLocaleString()})`,
        },
      });
    });

    return NextResponse.json({ success: true, message: 'Investment deleted successfully' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// NEED ELECTRO ERP — Physical Cash Counting & Register Reconciliation API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import { calculateAccountBalancesFromLedger } from '@/lib/accounting';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (
    !hasPermission(user, 'cash_management', 'view') &&
    !hasPermission(user, 'cash', 'view') &&
    !['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT'].includes(user.role)
  ) {
    return NextResponse.json({ success: false, error: 'Access denied to Physical Cash Reconciliation.' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId') || 'acc-1';
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const reconciliations = await (prisma as any).cashReconciliation.findMany({
      where: accountId !== 'ALL' ? { accountId } : undefined,
      orderBy: { date: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: reconciliations,
    });
  } catch (err: any) {
    console.error('Fetch cash reconciliations error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (
    !hasPermission(user, 'cash_management', 'count') &&
    !hasPermission(user, 'cash', 'count') &&
    !hasPermission(user, 'cash_management', 'adjust') &&
    !['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT'].includes(user.role)
  ) {
    return NextResponse.json({ success: false, error: 'Access denied to Physical Cash Count.' }, { status: 403 });
  }

  try {
    const {
      accountId,
      systemBalance,
      physicalBalance,
      difference,
      denominations,
      reason,
      notes,
      autoAdjust,
      branchId,
    } = await req.json();

    const targetAccountId = accountId || 'acc-1';
    const account = await prisma.financialAccount.findUnique({ where: { id: targetAccountId } });
    if (!account) {
      return NextResponse.json({ success: false, error: 'Target cash account not found.' }, { status: 404 });
    }

    // Single source of truth: compute expected balance dynamically from the central ledger if not passed
    let numSystemBalance = Number(systemBalance);
    if (isNaN(numSystemBalance)) {
      const stats = await calculateAccountBalancesFromLedger();
      const match = stats.find((s) => s.id === targetAccountId);
      numSystemBalance = match ? match.ledgerBalance : Number(account.balance);
    }

    const numPhysicalBalance = Number(physicalBalance || 0);
    const diff = numPhysicalBalance - numSystemBalance;

    // Strict compliance requirement: Reason is MANDATORY if adjusting variance
    if (autoAdjust && diff !== 0) {
      if (!reason || !String(reason).trim()) {
        return NextResponse.json(
          {
            success: false,
            error: 'A clear justification reason is strictly required to adjust cash discrepancies in the accounting ledger.',
          },
          { status: 400 }
        );
      }

      if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Only Super Admin or Admin can approve cash variance adjustments.' },
          { status: 403 }
        );
      }
    }

    const countNumber = 'CNT-' + Date.now().toString().slice(-6);
    let adjustmentRecord: any = null;
    let reconRecord: any = null;

    await prisma.$transaction(async (tx) => {
      const isExcess = diff > 0;
      const adjType = isExcess ? 'INFLOW' : 'OUTFLOW';
      const adjReason = String(reason || (isExcess ? 'CASH_EXCESS' : 'CASH_SHORTAGE')).trim();
      const absAmount = Math.abs(diff);
      const adjustmentNumber = 'ADJ-CNT-' + Date.now().toString().slice(-6);

      // 1. If autoAdjust is requested and there is a discrepancy
      if (autoAdjust && diff !== 0) {
        const txDb = tx as any;
        adjustmentRecord = await txDb.cashAdjustment.create({
          data: {
            id: 'adj-' + Date.now(),
            adjustmentNumber,
            date: new Date(),
            type: adjType,
            reason: adjReason,
            amount: new Prisma.Decimal(absAmount),
            accountId: targetAccountId,
            paymentMethod: 'Cash',
            reference: countNumber,
            notes: `Cash Count Discrepancy: Expected ৳${numSystemBalance.toLocaleString('en-IN')}, Physical ৳${numPhysicalBalance.toLocaleString('en-IN')}, Diff: ${diff > 0 ? '+' : ''}৳${diff.toLocaleString('en-IN')}. Reason: ${adjReason}. ${notes || ''}`,
            branchId: branchId || 'branch-1',
            performedBy: user.name,
          },
        });

        // 2. Adjust account balance
        await tx.financialAccount.update({
          where: { id: targetAccountId },
          data: {
            balance: {
              [adjType === 'INFLOW' ? 'increment' : 'decrement']: new Prisma.Decimal(absAmount),
            },
          },
        });

        // 3. Central Ledger Entry
        await tx.ledgerEntry.create({
          data: {
            id: 'led-' + Date.now() + '-cnt',
            date: new Date(),
            partyType: 'ACCOUNT',
            partyId: targetAccountId,
            referenceType: 'CASH_ADJUSTMENT',
            referenceNumber: adjustmentNumber,
            description: `Physical Cash Drawer Count Variance: [${adjReason}] (${diff > 0 ? '+' : ''}৳${diff.toLocaleString('en-IN')})`,
            debit: adjType === 'INFLOW' ? new Prisma.Decimal(absAmount) : new Prisma.Decimal(0),
            credit: adjType === 'OUTFLOW' ? new Prisma.Decimal(absAmount) : new Prisma.Decimal(0),
            runningBalance: new Prisma.Decimal(numPhysicalBalance),
            status: 'COMPLETED',
            performedBy: user.name,
            relatedTransactionId: adjustmentRecord.id,
          },
        });
      }

      // 4. Save reconciliation session with Difference Reporting
      const txDb = tx as any;
      reconRecord = await txDb.cashReconciliation.create({
        data: {
          id: 'recon-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          sessionNumber: countNumber,
          date: new Date(),
          accountId: targetAccountId,
          accountName: account.name,
          expectedBalance: new Prisma.Decimal(numSystemBalance),
          physicalBalance: new Prisma.Decimal(numPhysicalBalance),
          difference: new Prisma.Decimal(diff),
          status: diff === 0 ? 'BALANCED' : (autoAdjust ? 'ADJUSTED' : (diff > 0 ? 'EXCESS' : 'SHORTAGE')),
          reason: reason ? String(reason).trim() : (diff === 0 ? 'Normal Closing' : null),
          notes: notes || null,
          denominations: denominations || null,
          adjustmentId: adjustmentRecord?.id || null,
          branchId: branchId || 'branch-1',
          performedBy: user.name,
        },
      });

      // 5. Record compliance audit trail
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'PHYSICAL_CASH_COUNT',
          module: 'CASH_MANAGEMENT',
          recordId: countNumber,
          details: `Physical Cash Count performed by ${user.name} on ${account.name}. Expected: ৳${numSystemBalance.toLocaleString('en-IN')}, Physical Count: ৳${numPhysicalBalance.toLocaleString('en-IN')}, Difference: ${diff >= 0 ? '+' : ''}৳${diff.toLocaleString('en-IN')}. ${autoAdjust ? `Adjusted with reason: ${adjReason}.` : 'Audited without auto-adjustment.'} Notes: ${notes || 'None'}`,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: diff === 0
        ? 'Physical cash count verified and balanced perfectly.'
        : autoAdjust
        ? `Physical cash variance of ${diff > 0 ? '+' : ''}৳${diff.toLocaleString('en-IN')} reconciled and adjusted with reason: ${reason}.`
        : `Physical cash count session recorded. Variance: ${diff > 0 ? '+' : ''}৳${diff.toLocaleString('en-IN')}.`,
      countNumber,
      difference: diff,
      adjustmentApplied: Boolean(adjustmentRecord),
      reconciliation: reconRecord,
    });
  } catch (err: any) {
    console.error('Cash count error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

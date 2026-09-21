// NEED ELECTRO ERP — Physical Cash Counting & Register Reconciliation API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

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

    // Calculate difference server-side (physical - system)
    const numSystemBalance = Number(systemBalance || 0);
    const numPhysicalBalance = Number(physicalBalance || 0);
    const diff = numPhysicalBalance - numSystemBalance;

    const countNumber = 'CNT-' + Date.now().toString().slice(-6);
    let adjustmentRecord: any = null;

    // If autoAdjust is requested and there is a discrepancy
    if (autoAdjust && diff !== 0) {
      if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
        return NextResponse.json(
          { success: false, error: 'Only Super Admin or Admin can approve cash variance adjustments.' },
          { status: 403 }
        );
      }

      const isExcess = diff > 0;
      const adjType = isExcess ? 'INFLOW' : 'OUTFLOW';
      const adjReason = isExcess ? 'CASH_EXCESS' : 'CASH_SHORTAGE';
      const absAmount = Math.abs(diff);
      const adjustmentNumber = 'ADJ-CNT-' + Date.now().toString().slice(-6);

      const db = prisma as any;
      await prisma.$transaction(async (tx) => {
        // 1. Create CashAdjustment
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
            notes: `Cash Count Variance: System ৳${systemBalance}, Physical ৳${physicalBalance}, Diff: ${diff > 0 ? '+' : ''}৳${diff}. ${notes || ''}`,
            branchId: branchId || 'branch-main-1',
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

        // 3. Ledger Entry
        await tx.ledgerEntry.create({
          data: {
            id: 'led-' + Date.now() + '-cnt',
            date: new Date(),
            partyType: 'ACCOUNT',
            partyId: targetAccountId,
            referenceType: 'CASH_ADJUSTMENT',
            referenceNumber: adjustmentNumber,
            description: `Physical Cash Drawer Count Variance: ${adjReason} (${diff > 0 ? '+' : ''}৳${diff})`,
            debit: adjType === 'INFLOW' ? new Prisma.Decimal(absAmount) : new Prisma.Decimal(0),
            credit: adjType === 'OUTFLOW' ? new Prisma.Decimal(absAmount) : new Prisma.Decimal(0),
            runningBalance: new Prisma.Decimal(Number(account.balance) + diff),
          },
        });
      });
    }

    // Record audit trail
    await prisma.auditLog.create({
      data: {
        id: 'audit-' + Date.now(),
        userId: user.id,
        userName: user.name,
        action: 'PHYSICAL_CASH_COUNT',
        module: 'CASH_MANAGEMENT',
        recordId: countNumber,
        details: `Physical Cash Count performed by ${user.name} on ${account.name}. System Cash: ৳${numSystemBalance.toLocaleString('en-IN')}, Physical Count: ৳${numPhysicalBalance.toLocaleString('en-IN')}, Difference: ${diff >= 0 ? '+' : ''}৳${diff.toLocaleString('en-IN')}. ${autoAdjust ? 'Variance adjusted in ledger.' : 'Audit recorded without auto-adjustment.'} Notes: ${notes || 'None'}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Physical cash count session recorded successfully.',
      countNumber,
      difference: diff,
      adjustmentApplied: Boolean(adjustmentRecord),
    });
  } catch (err: any) {
    console.error('Cash count error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// NEED ELECTRO ERP — Central Account Ledger & Account Statement Engine
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { calculateAccountBalancesFromLedger, syncStoredBalancesWithLedger, reverseTransaction } from '@/lib/accounting';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (
    !hasPermission(user, 'accounting', 'view') &&
    !hasPermission(user, 'cash_management', 'view') &&
    !['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT'].includes(user.role)
  ) {
    return NextResponse.json({ success: false, error: 'Access denied to Account Ledger' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');
    const range = searchParams.get('range') || 'this_month';
    const customStart = searchParams.get('startDate');
    const customEnd = searchParams.get('endDate');
    const refType = searchParams.get('referenceType');
    const status = searchParams.get('status');
    const q = searchParams.get('q')?.toLowerCase()?.trim();
    const doSync = searchParams.get('sync') === 'true';

    if (doSync) {
      await syncStoredBalancesWithLedger();
    }

    // 1. Calculate Date Range Boundaries
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (range === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    } else if (range === 'yesterday') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
    } else if (range === 'this_week') {
      const day = now.getDay();
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day, 0, 0, 0, 0);
    } else if (range === 'prev_month') {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else if (range === 'custom' && customStart) {
      startDate = new Date(customStart + 'T00:00:00.000Z');
      if (customEnd) {
        endDate = new Date(customEnd + 'T23:59:59.999Z');
      }
    } else if (range === 'all_time') {
      startDate = new Date('2020-01-01T00:00:00.000Z');
    } else {
      // Default: this_month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    }

    // 2. Fetch Accounts
    const accounts = await prisma.financialAccount.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    const accountMap = new Map<string, typeof accounts[0]>();
    accounts.forEach((a) => accountMap.set(a.id, a));

    // 3. Build Account Balances from Ledger (Single Source of Truth)
    const accountsWithLedger = await calculateAccountBalancesFromLedger();

    // 4. Calculate Opening Balance for filtered account before startDate
    const accountFilter = accountId && accountId !== 'ALL' ? accountId : null;

    const priorAgg = await prisma.ledgerEntry.aggregate({
      where: {
        partyType: 'ACCOUNT',
        ...(accountFilter ? { partyId: accountFilter } : {}),
        status: { in: ['COMPLETED', 'REVERSED'] },
        date: { lt: startDate },
      },
      _sum: {
        debit: true,
        credit: true,
      },
    });

    const openingBalance = Number(priorAgg._sum.debit || 0) - Number(priorAgg._sum.credit || 0);

    // 5. Fetch Ledger Entries within date range
    const entries = await prisma.ledgerEntry.findMany({
      where: {
        partyType: 'ACCOUNT',
        ...(accountFilter ? { partyId: accountFilter } : {}),
        ...(refType && refType !== 'ALL' ? { referenceType: refType } : {}),
        ...(status && status !== 'ALL' ? { status } : {}),
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    // 6. Calculate running balance chronologically
    let running = openingBalance;
    let periodTotalIn = 0;
    let periodTotalOut = 0;

    const statementRows = entries.map((entry) => {
      const debit = Number(entry.debit);
      const credit = Number(entry.credit);
      const acc = accountMap.get(entry.partyId);

      if (entry.status !== 'CANCELLED') {
        periodTotalIn += debit;
        periodTotalOut += credit;
        running += (debit - credit);
      }

      return {
        id: entry.id,
        date: entry.date.toISOString(),
        time: entry.date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        partyId: entry.partyId,
        accountName: acc?.name || 'Main Cash',
        accountType: acc?.type || 'CASH',
        referenceType: entry.referenceType,
        referenceNumber: entry.referenceNumber,
        description: entry.description,
        debit,
        credit,
        runningBalance: running,
        status: entry.status,
        paymentMethod: entry.paymentMethod || (acc?.type === 'CASH' ? 'Cash' : acc?.type),
        performedBy: entry.performedBy || 'System',
        relatedTransactionId: entry.relatedTransactionId,
        reversalOfId: entry.reversalOfId,
        createdAt: entry.createdAt.toISOString(),
      };
    });

    // Apply search filter if query provided
    let filteredRows = statementRows;
    if (q) {
      filteredRows = statementRows.filter(
        (r) =>
          r.referenceNumber.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.accountName.toLowerCase().includes(q) ||
          r.referenceType.toLowerCase().includes(q) ||
          r.performedBy.toLowerCase().includes(q)
      );
    }

    // Newest first for display table
    const displayRows = [...filteredRows].reverse();
    const closingBalance = openingBalance + periodTotalIn - periodTotalOut;

    // Selected account detail if filtered
    const selectedAccountDetail = accountFilter ? accountMap.get(accountFilter) : null;

    return NextResponse.json({
      success: true,
      data: {
        period: {
          range,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        account: selectedAccountDetail
          ? {
              id: selectedAccountDetail.id,
              name: selectedAccountDetail.name,
              type: selectedAccountDetail.type,
              accountNumber: selectedAccountDetail.accountNumber,
              bankName: selectedAccountDetail.bankName,
              currency: selectedAccountDetail.currency,
            }
          : { id: 'ALL', name: 'All Consolidated Accounts', type: 'CONSOLIDATED' },
        summary: {
          openingBalance,
          totalMoneyIn: periodTotalIn,
          totalMoneyOut: periodTotalOut,
          netFlow: periodTotalIn - periodTotalOut,
          closingBalance,
        },
        accounts: accountsWithLedger,
        totalAvailableMoney: accountsWithLedger.reduce((sum, a) => sum + a.ledgerBalance, 0),
        statement: displayRows,
      },
    });
  } catch (err: any) {
    console.error('Ledger Engine Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST endpoint to handle manual transaction reversal by Super Admin
export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied. Only Super Admin can authorize transaction reversals.' }, { status: 403 });
  }

  try {
    const { referenceNumber, reason } = await req.json();
    if (!referenceNumber || !reason) {
      return NextResponse.json({ success: false, error: 'Reference number and reversal reason are required.' }, { status: 400 });
    }

    const reversals = await prisma.$transaction(async (tx) => {
      const revs = await reverseTransaction(tx, {
        referenceNumber,
        reason,
        performedBy: user.name,
      });

      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'TRANSACTION_REVERSED',
          module: 'ACCOUNTING',
          recordId: referenceNumber,
          details: `Super Admin ${user.name} reversed all financial entries for reference ${referenceNumber}. Reason: ${reason}`,
        },
      });

      return revs;
    });

    return NextResponse.json({
      success: true,
      message: `Transaction ${referenceNumber} successfully reversed. Account balances adjusted automatically.`,
      data: reversals,
    });
  } catch (err: any) {
    console.error('Ledger reversal error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// NEED ELECTRO ERP — Cash Flow Statement & Direct Cash Position Report
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';

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
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'this_month';
    const customStart = searchParams.get('startDate');
    const customEnd = searchParams.get('endDate');
    const accountId = searchParams.get('accountId');

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
    } else {
      // Default: this_month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    }

    const accountFilter = accountId && accountId !== 'ALL' ? accountId : null;

    // 2. Opening Balance before startDate from Central Account Ledger
    const openingAgg = await prisma.ledgerEntry.aggregate({
      where: {
        partyType: 'ACCOUNT',
        ...(accountFilter ? { partyId: accountFilter } : {}),
        status: 'COMPLETED',
        date: { lt: startDate },
      },
      _sum: {
        debit: true,
        credit: true,
      },
    });

    const openingBalance = Number(openingAgg._sum.debit || 0) - Number(openingAgg._sum.credit || 0);

    // 3. Entries within selected period
    const entries = await prisma.ledgerEntry.findMany({
      where: {
        partyType: 'ACCOUNT',
        ...(accountFilter ? { partyId: accountFilter } : {}),
        status: 'COMPLETED',
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });

    // Categorized breakdown
    const breakdown = {
      cashSales: 0,
      customerDuePayments: 0,
      emiCollections: 0,
      investments: 0,
      otherIncome: 0,
      transfersIn: 0,
      adjustmentsIn: 0,
      cashPurchases: 0,
      supplierPayments: 0,
      operatingExpenses: 0,
      ownerWithdrawals: 0,
      customerRefunds: 0,
      transfersOut: 0,
      adjustmentsOut: 0,
    };

    let totalMoneyIn = 0;
    let totalMoneyOut = 0;

    entries.forEach((e) => {
      const debit = Number(e.debit);
      const credit = Number(e.credit);
      const ref = e.referenceType.toUpperCase();

      if (debit > 0) {
        totalMoneyIn += debit;
        if (ref.includes('SALE') && !ref.includes('RETURN')) breakdown.cashSales += debit;
        else if (ref.includes('DUE') || ref.includes('CUSTOMER')) breakdown.customerDuePayments += debit;
        else if (ref.includes('EMI')) breakdown.emiCollections += debit;
        else if (ref.includes('INVESTMENT') || ref.includes('SEED')) breakdown.investments += debit;
        else if (ref.includes('OTHER_INCOME')) breakdown.otherIncome += debit;
        else if (ref.includes('TRANSFER')) breakdown.transfersIn += debit;
        else if (ref.includes('ADJUSTMENT')) breakdown.adjustmentsIn += debit;
        else breakdown.otherIncome += debit;
      }

      if (credit > 0) {
        totalMoneyOut += credit;
        if (ref.includes('PURCHASE') && !ref.includes('RETURN')) breakdown.cashPurchases += credit;
        else if (ref.includes('SUPPLIER')) breakdown.supplierPayments += credit;
        else if (ref.includes('EXPENSE')) breakdown.operatingExpenses += credit;
        else if (ref.includes('WITHDRAWAL')) breakdown.ownerWithdrawals += credit;
        else if (ref.includes('REFUND') || ref.includes('RETURN')) breakdown.customerRefunds += credit;
        else if (ref.includes('TRANSFER')) breakdown.transfersOut += credit;
        else if (ref.includes('ADJUSTMENT')) breakdown.adjustmentsOut += credit;
        else breakdown.operatingExpenses += credit;
      }
    });

    const netCashFlow = totalMoneyIn - totalMoneyOut;
    const closingBalance = openingBalance + netCashFlow;

    return NextResponse.json({
      success: true,
      data: {
        period: {
          range,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        summary: {
          openingBalance,
          totalCashIn: totalMoneyIn,
          totalCashOut: totalMoneyOut,
          transfersIn: breakdown.transfersIn,
          transfersOut: breakdown.transfersOut,
          netCashFlow,
          closingBalance,
        },
        breakdown,
      },
    });
  } catch (err: any) {
    console.error('Cash flow report error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// NEED ELECTRO ERP — Real Transaction-Based Cash Position & Management Engine
// Synchronized with Central Account Ledger as Single Source of Truth
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { calculateAccountBalancesFromLedger, syncStoredBalancesWithLedger } from '@/lib/accounting';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (
    !hasPermission(user, 'cash_management', 'view') &&
    !hasPermission(user, 'cash', 'view') &&
    !hasPermission(user, 'accounting', 'view') &&
    user.role !== 'SUPER_ADMIN' &&
    user.role !== 'ADMIN' &&
    user.role !== 'ACCOUNTANT' &&
    user.role !== 'MANAGER'
  ) {
    return NextResponse.json({ success: false, error: 'Access denied to Cash Management' }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || 'this_month';
    const customStart = searchParams.get('startDate');
    const customEnd = searchParams.get('endDate');
    const branchId = searchParams.get('branchId');
    const paymentMethodFilter = searchParams.get('paymentMethod');
    const accountTypeFilter = searchParams.get('accountType');
    const searchQuery = searchParams.get('q')?.toLowerCase()?.trim();

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

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // 2. Fetch Accounts and Branches
    const accounts = await prisma.financialAccount.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    const branches = await prisma.branch.findMany({
      select: { id: true, name: true, code: true },
    });

    const accountMap = new Map<string, typeof accounts[0]>();
    accounts.forEach((a) => accountMap.set(a.id, a));

    const branchMap = new Map<string, string>();
    branches.forEach((b) => branchMap.set(b.id, b.name));

    // 3. Central Ledger as Single Source of Truth for Account Balances
    const accountStats = await calculateAccountBalancesFromLedger();

    // Map account stats by id
    const accountStatMap = new Map<string, typeof accountStats[0]>();
    accountStats.forEach((as) => accountStatMap.set(as.id, as));

    // Identify Main Cash Account
    const mainCashAccount = accounts.find((a) => a.id === 'acc-1' || a.type === 'CASH') || accounts[0];
    const mainCashStat = mainCashAccount ? accountStatMap.get(mainCashAccount.id) : null;

    // Categorize Account Totals
    let totalCash = 0;
    let totalBank = 0;
    let totalBkash = 0;
    let totalNagad = 0;
    let totalAvailableMoney = 0;

    accountStats.forEach((acc) => {
      totalAvailableMoney += acc.ledgerBalance;
      const lowerName = acc.name.toLowerCase();
      const lowerId = acc.id.toLowerCase();

      if (acc.type === 'CASH' || lowerId === 'acc-1') {
        totalCash += acc.ledgerBalance;
      } else if (lowerName.includes('bkash') || lowerId.includes('bkash')) {
        totalBkash += acc.ledgerBalance;
      } else if (lowerName.includes('nagad') || lowerId.includes('nagad')) {
        totalNagad += acc.ledgerBalance;
      } else if (acc.type === 'BANK' || lowerName.includes('bank')) {
        totalBank += acc.ledgerBalance;
      } else {
        totalBank += acc.ledgerBalance;
      }
    });

    const physicalCash = totalCash;
    const digitalBankCash = totalAvailableMoney - physicalCash;

    // 4. Fetch All Central Ledger Entries (All Financial Movements)
    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where: {
        partyType: 'ACCOUNT',
        status: { notIn: ['CANCELLED', 'VOID'] },
      },
      orderBy: { date: 'asc' },
    });

    // 5. Build Chronological Movement Stream from Ledger Entries
    let cumulativeTotalBalance = 0;
    let cumulativePhysicalBalance = 0;

    const allMovements = ledgerEntries.map((le) => {
      const debit = Number(le.debit);
      const credit = Number(le.credit);
      const isDebit = debit > 0;
      const amount = isDebit ? debit : credit;
      const direction: 'INFLOW' | 'OUTFLOW' = isDebit ? 'INFLOW' : 'OUTFLOW';

      const acc = accountMap.get(le.partyId);
      const isPhysicalCash = acc ? acc.type === 'CASH' || acc.id === 'acc-1' : false;

      if (isDebit) {
        cumulativeTotalBalance += amount;
        if (isPhysicalCash) cumulativePhysicalBalance += amount;
      } else {
        cumulativeTotalBalance -= amount;
        if (isPhysicalCash) cumulativePhysicalBalance -= amount;
      }

      // Friendly Label
      let typeLabel = le.referenceType.replace(/_/g, ' ');
      if (le.referenceType === 'SALE') typeLabel = 'Cash Sale';
      else if (le.referenceType === 'DUE_PAYMENT') typeLabel = 'Customer Due Payment';
      else if (le.referenceType === 'PURCHASE') typeLabel = 'Cash Purchase';
      else if (le.referenceType === 'SUPPLIER_PAYMENT') typeLabel = 'Supplier Due Payment';
      else if (le.referenceType === 'EXPENSE') typeLabel = 'Business Expense';
      else if (le.referenceType === 'INVESTMENT') typeLabel = 'Capital Investment';
      else if (le.referenceType === 'OWNER_WITHDRAWAL') typeLabel = 'Owner Withdrawal';
      else if (le.referenceType === 'TRANSFER') typeLabel = isDebit ? 'Transfer In' : 'Transfer Out';
      else if (le.referenceType === 'OTHER_INCOME') typeLabel = 'Other Income';
      else if (le.referenceType === 'CASH_ADJUSTMENT') typeLabel = 'Cash Adjustment';

      return {
        id: le.id,
        date: le.date.toISOString(),
        dateTime: le.date,
        transactionId: le.referenceNumber,
        type: le.referenceType,
        typeLabel,
        direction,
        description: le.description,
        reference: le.referenceNumber,
        cashIn: isDebit ? amount : 0,
        cashOut: !isDebit ? amount : 0,
        runningBalance: cumulativeTotalBalance,
        runningPhysicalBalance: cumulativePhysicalBalance,
        paymentMethod: le.paymentMethod || (acc?.type === 'CASH' ? 'Cash' : acc?.type || 'Cash'),
        isPhysicalCash,
        accountName: acc?.name || 'Main Cash Drawer',
        accountType: acc?.type || 'CASH',
        accountId: le.partyId,
        user: le.performedBy || 'System',
        branchId: 'branch-1',
        branch: 'Main Showroom',
      };
    });

    // 6. Period Calculations (Opening, Inflow, Outflow, Closing)
    const priorMovements = allMovements.filter((m) => m.dateTime.getTime() < startDate.getTime());
    const openingCash = priorMovements.length > 0 ? priorMovements[priorMovements.length - 1].runningBalance : 0;
    const openingPhysicalCash = priorMovements.length > 0 ? priorMovements[priorMovements.length - 1].runningPhysicalBalance || 0 : 0;

    // Filter within selected period
    let periodMovements = allMovements.filter((m) => {
      const t = m.dateTime.getTime();
      return t >= startDate.getTime() && t <= endDate.getTime();
    });

    // Inflow & Outflow Breakdown
    let totalInflow = 0;
    let totalOutflow = 0;
    let totalPhysicalInflow = 0;
    let totalPhysicalOutflow = 0;

    const inflowBreakdown = {
      investments: 0,
      seedFunding: 0,
      salesCollections: 0,
      customerDueCollections: 0,
      emiCollections: 0,
      serviceIncome: 0,
      adjustmentsInflow: 0,
      transfersIn: 0,
      otherIncome: 0,
    };

    const outflowBreakdown = {
      purchasePayments: 0,
      supplierPayments: 0,
      operatingExpenses: 0,
      refunds: 0,
      transfersOut: 0,
      adjustmentsOutflow: 0,
      ownerWithdrawals: 0,
      otherOutflows: 0,
    };

    periodMovements.forEach((m) => {
      const ref = m.type.toUpperCase();
      if (m.direction === 'INFLOW') {
        totalInflow += m.cashIn;
        if (m.isPhysicalCash) totalPhysicalInflow += m.cashIn;

        if (ref.includes('SALE') && !ref.includes('RETURN')) inflowBreakdown.salesCollections += m.cashIn;
        else if (ref.includes('DUE') || ref.includes('CUSTOMER')) inflowBreakdown.customerDueCollections += m.cashIn;
        else if (ref.includes('EMI')) inflowBreakdown.emiCollections += m.cashIn;
        else if (ref.includes('INVESTMENT') || ref.includes('SEED')) inflowBreakdown.investments += m.cashIn;
        else if (ref.includes('SERVICE')) inflowBreakdown.serviceIncome += m.cashIn;
        else if (ref.includes('ADJUSTMENT')) inflowBreakdown.adjustmentsInflow += m.cashIn;
        else if (ref.includes('TRANSFER')) inflowBreakdown.transfersIn += m.cashIn;
        else if (ref.includes('OTHER_INCOME')) inflowBreakdown.otherIncome += m.cashIn;
        else inflowBreakdown.otherIncome += m.cashIn;
      } else {
        totalOutflow += m.cashOut;
        if (m.isPhysicalCash) totalPhysicalOutflow += m.cashOut;

        if (ref.includes('PURCHASE') && !ref.includes('RETURN')) outflowBreakdown.purchasePayments += m.cashOut;
        else if (ref.includes('SUPPLIER')) outflowBreakdown.supplierPayments += m.cashOut;
        else if (ref.includes('EXPENSE')) outflowBreakdown.operatingExpenses += m.cashOut;
        else if (ref.includes('WITHDRAWAL')) outflowBreakdown.ownerWithdrawals = (outflowBreakdown.ownerWithdrawals || 0) + m.cashOut;
        else if (ref.includes('REFUND') || ref.includes('RETURN')) outflowBreakdown.refunds += m.cashOut;
        else if (ref.includes('ADJUSTMENT')) outflowBreakdown.adjustmentsOutflow += m.cashOut;
        else if (ref.includes('TRANSFER')) outflowBreakdown.transfersOut += m.cashOut;
        else outflowBreakdown.otherOutflows += m.cashOut;
      }
    });

    const netCashFlow = totalInflow - totalOutflow;
    const closingCash = openingCash + netCashFlow;

    // Today's Totals
    let todayInflow = 0;
    let todayOutflow = 0;
    let todayPhysicalInflow = 0;
    let todayPhysicalOutflow = 0;

    allMovements.forEach((m) => {
      const t = m.dateTime.getTime();
      if (t >= todayStart.getTime() && t <= todayEnd.getTime()) {
        if (m.direction === 'INFLOW') {
          todayInflow += m.cashIn;
          if (m.isPhysicalCash) todayPhysicalInflow += m.cashIn;
        } else {
          todayOutflow += m.cashOut;
          if (m.isPhysicalCash) todayPhysicalOutflow += m.cashOut;
        }
      }
    });

    const todayNetMovement = todayInflow - todayOutflow;

    // This Month Totals
    let thisMonthInflow = 0;
    let thisMonthOutflow = 0;

    allMovements.forEach((m) => {
      const t = m.dateTime.getTime();
      if (t >= monthStart.getTime() && t <= monthEnd.getTime()) {
        if (m.direction === 'INFLOW') {
          thisMonthInflow += m.cashIn;
        } else {
          thisMonthOutflow += m.cashOut;
        }
      }
    });

    // 7. Payment Method Account Stats
    const paymentMethodStats: Record<string, { balance: number; inflow: number; outflow: number }> = {
      Cash: { balance: totalCash, inflow: 0, outflow: 0 },
      bKash: { balance: totalBkash, inflow: 0, outflow: 0 },
      Nagad: { balance: totalNagad, inflow: 0, outflow: 0 },
      Bank: { balance: totalBank, inflow: 0, outflow: 0 },
    };

    allMovements.forEach((m) => {
      let key = 'Cash';
      const pm = (m.paymentMethod || '').toLowerCase();
      if (pm.includes('bkash')) key = 'bKash';
      else if (pm.includes('nagad')) key = 'Nagad';
      else if (pm.includes('bank') || pm.includes('card') || pm.includes('ebl') || pm.includes('pubali')) key = 'Bank';

      if (!paymentMethodStats[key]) {
        paymentMethodStats[key] = { balance: 0, inflow: 0, outflow: 0 };
      }

      if (m.direction === 'INFLOW') {
        paymentMethodStats[key].inflow += m.cashIn;
      } else {
        paymentMethodStats[key].outflow += m.cashOut;
      }
    });

    // 8. Accounting Distinction: Cash vs Sales Revenue vs Profit
    const salesAggregate = await prisma.sale.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { grandTotal: true, paidAmount: true, dueAmount: true },
    });
    const totalRevenue = Number(salesAggregate._sum.grandTotal || 0);
    const uncollectedSalesDue = Number(salesAggregate._sum.dueAmount || 0);

    const saleItems = await prisma.saleItem.findMany({
      where: { sale: { status: 'COMPLETED' } },
      include: { product: true },
    });
    const totalCOGS = saleItems.reduce((sum, item) => {
      const cost = Number(item.product?.costPrice || 0);
      return sum + cost * item.quantity;
    }, 0);

    const expensesAggregate = await prisma.expense.aggregate({
      _sum: { amount: true },
    });
    const totalOperatingExpenses = Number(expensesAggregate._sum.amount || 0);
    const grossProfit = totalRevenue - totalCOGS;
    const netOperatingProfit = grossProfit - totalOperatingExpenses;

    const suppliersAggregate = await prisma.supplier.aggregate({
      _sum: { currentPayable: true },
    });
    const unpaidPurchasesPayable = Number(suppliersAggregate._sum.currentPayable || 0);

    const investments = await prisma.investment.findMany({ where: { status: 'ACTIVE' } });
    const capitalInvestmentsTotal = investments
      .filter((i) => i.investmentType !== 'SEED_FUNDING')
      .reduce((sum, i) => sum + Number(i.amount), 0);

    const seedFundingTotal = investments
      .filter((i) => i.investmentType === 'SEED_FUNDING')
      .reduce((sum, i) => sum + Number(i.amount), 0);

    // 9. Filter movements for display table (Newest first)
    let filteredMovements = [...periodMovements].reverse();

    if (paymentMethodFilter && paymentMethodFilter !== 'ALL') {
      filteredMovements = filteredMovements.filter((m) =>
        m.paymentMethod.toLowerCase().includes(paymentMethodFilter.toLowerCase())
      );
    }
    if (accountTypeFilter && accountTypeFilter !== 'ALL') {
      filteredMovements = filteredMovements.filter((m) => m.accountType === accountTypeFilter);
    }
    if (searchQuery) {
      filteredMovements = filteredMovements.filter(
        (m) =>
          m.transactionId.toLowerCase().includes(searchQuery) ||
          m.description.toLowerCase().includes(searchQuery) ||
          m.reference.toLowerCase().includes(searchQuery) ||
          m.user.toLowerCase().includes(searchQuery) ||
          m.accountName.toLowerCase().includes(searchQuery)
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        currentCash: totalAvailableMoney,
        physicalCash,
        digitalBankCash,
        totalCash,
        totalBank,
        totalBkash,
        totalNagad,
        totalAvailableMoney,
        expectedCashDrawerBalance: totalCash,
        openingCash,
        openingPhysicalCash,
        totalInflow,
        totalOutflow,
        totalPhysicalInflow,
        totalPhysicalOutflow,
        netCashFlow,
        closingCash,
        todayInflow,
        todayOutflow,
        todayPhysicalInflow,
        todayPhysicalOutflow,
        todayNetMovement,
        thisMonthInflow,
        thisMonthOutflow,
        inflowBreakdown,
        outflowBreakdown,
        paymentMethodStats,
        accountBalances: accountStats.map((a) => ({
          id: a.id,
          name: a.name,
          type: a.type,
          accountNumber: a.accountNumber,
          balance: a.ledgerBalance,
          currency: a.currency,
        })),
        cashVsProfit: {
          currentCashBalance: totalAvailableMoney,
          totalRevenue,
          totalCOGS,
          grossProfit,
          totalOperatingExpenses,
          netOperatingProfit,
          uncollectedSalesDue,
          unpaidPurchasesPayable,
          capitalInvestments: capitalInvestmentsTotal,
          seedFunding: seedFundingTotal,
        },
        movements: filteredMovements,
      },
    });
  } catch (err: any) {
    console.error('Cash Management Engine Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

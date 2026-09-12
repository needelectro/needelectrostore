// NEED ELECTRO ERP — Real Transaction-Based Cash Position & Management Engine
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (
    !hasPermission(user, 'cash_management', 'view') &&
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
      const day = now.getDay(); // 0 is Sunday
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

    // 2. Fetch All Accounts for Physical Cash vs Digital/Bank Wallets
    const accounts = await prisma.financialAccount.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    const accountMap = new Map<string, typeof accounts[0]>();
    accounts.forEach((a) => accountMap.set(a.id, a));

    let physicalCash = 0;
    let digitalBankCash = 0;

    accounts.forEach((a) => {
      const bal = Number(a.balance);
      if (a.type === 'CASH') {
        physicalCash += bal;
      } else {
        digitalBankCash += bal;
      }
    });

    const currentCash = physicalCash + digitalBankCash;

    // 3. Fetch All Transaction Sources Across ERP
    // A. Opening Balances
    const openingBalances = await prisma.openingBalance.findMany({
      where: {
        type: { in: ['CASH', 'BANK', 'MOBILE_BANKING'] },
      },
    });

    // B. Sales (where paidAmount > 0)
    const sales = await prisma.sale.findMany({
      where: {
        status: { in: ['COMPLETED', 'DELIVERED', 'PAID'] },
        paidAmount: { gt: 0 },
        ...(branchId ? { branchId } : {}),
      },
      select: {
        id: true,
        invoiceNumber: true,
        customerName: true,
        date: true,
        createdAt: true,
        grandTotal: true,
        paidAmount: true,
        dueAmount: true,
        payments: true,
        branchId: true,
        salespersonName: true,
      },
      orderBy: { date: 'asc' },
    });

    // C. EMI Payments (installment collections & down payments)
    const emiPayments = await prisma.eMIPayment.findMany({
      select: {
        id: true,
        receiptNumber: true,
        emiNumber: true,
        customerName: true,
        amount: true,
        penaltyPaid: true,
        paymentDate: true,
        paymentMethod: true,
        collectedBy: true,
        notes: true,
      },
      orderBy: { paymentDate: 'asc' },
    });

    // D. Customer Due Collections (CustomerPayment)
    const customerPayments = await prisma.customerPayment.findMany({
      select: {
        id: true,
        receiptNumber: true,
        customerId: true,
        customerName: true,
        amount: true,
        paymentDate: true,
        paymentMethod: true,
        accountId: true,
        reference: true,
        notes: true,
        collectedBy: true,
      },
      orderBy: { paymentDate: 'asc' },
    });

    // E. Investments & Seed Funding
    const investments = await prisma.investment.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        referenceNumber: true,
        investorName: true,
        amount: true,
        date: true,
        investmentType: true,
        depositAccountId: true,
        paymentMethod: true,
        notes: true,
        createdBy: true,
      },
      orderBy: { date: 'asc' },
    });

    // F. Paid Technical & Electrical Services
    const serviceJobs = await prisma.serviceJob.findMany({
      where: {
        paymentStatus: 'PAID',
        totalBill: { gt: 0 },
      },
      select: {
        id: true,
        jobCardNumber: true,
        customerName: true,
        totalBill: true,
        paymentMethod: true,
        completedDate: true,
        createdAt: true,
        assignedTechnicianName: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // G. Purchases with upfront Cash/Bank payment (paidAmount > 0)
    const purchases = await prisma.purchase.findMany({
      where: {
        paidAmount: { gt: 0 },
        ...(branchId ? { branchId } : {}),
      },
      select: {
        id: true,
        invoiceNumber: true,
        supplierName: true,
        date: true,
        total: true,
        paidAmount: true,
        paymentMethod: true,
        branchId: true,
      },
      orderBy: { date: 'asc' },
    });

    // H. Supplier Payments (subsequent payments against credit/payable)
    const supplierPayments = await prisma.supplierPayment.findMany({
      select: {
        id: true,
        voucherNumber: true,
        supplierName: true,
        amount: true,
        paymentDate: true,
        paymentMethod: true,
        accountId: true,
        reference: true,
        paidBy: true,
      },
      orderBy: { paymentDate: 'asc' },
    });

    // I. Operating Expenses
    const expenses = await prisma.expense.findMany({
      where: {
        ...(branchId ? { branchId } : {}),
      },
      select: {
        id: true,
        voucherNumber: true,
        category: true,
        amount: true,
        date: true,
        paymentMethod: true,
        branchId: true,
        description: true,
        createdBy: true,
      },
      orderBy: { date: 'asc' },
    });

    // J. Product Return Refunds (cash returned to customer)
    const returns = await prisma.productReturn.findMany({
      where: {
        totalRefundAmount: { gt: 0 },
      },
      select: {
        id: true,
        returnNumber: true,
        customerName: true,
        totalRefundAmount: true,
        refundMethod: true,
        date: true,
        handledBy: true,
        reason: true,
      },
      orderBy: { date: 'asc' },
    });

    // K. Cash Adjustments (Inflow or Outflow authorized by Super Admin)
    const adjustments = await prisma.cashAdjustment.findMany({
      where: {
        ...(branchId ? { branchId } : {}),
      },
      select: {
        id: true,
        adjustmentNumber: true,
        date: true,
        type: true,
        reason: true,
        amount: true,
        accountId: true,
        paymentMethod: true,
        reference: true,
        notes: true,
        branchId: true,
        performedBy: true,
      },
      orderBy: { date: 'asc' },
    });

    // 4. Build Unified Chronological Transaction Stream
    interface RawEvent {
      id: string;
      date: Date;
      transactionId: string;
      type: string;
      typeLabel: string;
      direction: 'INFLOW' | 'OUTFLOW';
      description: string;
      reference: string;
      amount: number;
      paymentMethod: string;
      accountId?: string;
      user: string;
      branch: string;
    }

    const allEvents: RawEvent[] = [];

    // Opening balances
    openingBalances.forEach((ob) => {
      allEvents.push({
        id: 'ob-' + ob.id,
        date: new Date(ob.date || ob.createdAt),
        transactionId: 'OB-' + ob.id.slice(-6),
        type: 'OPENING_BALANCE',
        typeLabel: 'Opening Balance',
        direction: 'INFLOW',
        description: `Initial ${ob.type} opening balance recorded for ${ob.targetName}`,
        reference: ob.notes || 'INITIAL_SETUP',
        amount: Number(ob.amount),
        paymentMethod: ob.type === 'CASH' ? 'Cash' : 'Bank',
        accountId: ob.targetId,
        user: ob.approvedBy || 'System',
        branch: 'Main Showroom',
      });
    });

    // Sales
    sales.forEach((s) => {
      const paid = Number(s.paidAmount);
      const saleDate = new Date(s.date || s.createdAt);
      let method = 'Cash';
      if (Array.isArray(s.payments) && s.payments.length > 0) {
        method = (s.payments[0] as any)?.method || 'Cash';
      }

      allEvents.push({
        id: 'sale-' + s.id,
        date: saleDate,
        transactionId: s.invoiceNumber,
        type: 'SALE',
        typeLabel: 'Product Sale',
        direction: 'INFLOW',
        description: `Sales collection from ${s.customerName} (Invoice Total: ৳${Number(s.grandTotal).toLocaleString('en-IN')})`,
        reference: s.invoiceNumber,
        amount: paid,
        paymentMethod: method,
        user: s.salespersonName || 'Sales Staff',
        branch: s.branchId || 'Main Showroom',
      });
    });

    // EMI collections
    emiPayments.forEach((ep) => {
      const amt = Number(ep.amount) + Number(ep.penaltyPaid || 0);
      allEvents.push({
        id: 'emi-' + ep.id,
        date: new Date(ep.paymentDate),
        transactionId: ep.receiptNumber,
        type: 'EMI_COLLECTION',
        typeLabel: 'EMI Collection',
        direction: 'INFLOW',
        description: `EMI installment collection from ${ep.customerName} for ${ep.emiNumber}`,
        reference: ep.receiptNumber,
        amount: amt,
        paymentMethod: ep.paymentMethod || 'Cash',
        user: ep.collectedBy || 'Accountant',
        branch: 'Main Showroom',
      });
    });

    // Customer Due collections
    customerPayments.forEach((cp) => {
      allEvents.push({
        id: 'cdue-' + cp.id,
        date: new Date(cp.paymentDate),
        transactionId: cp.receiptNumber,
        type: 'CUSTOMER_DUE',
        typeLabel: 'Due Collection',
        direction: 'INFLOW',
        description: `Credit due settlement from customer ${cp.customerName}`,
        reference: cp.reference || cp.receiptNumber,
        amount: Number(cp.amount),
        paymentMethod: cp.paymentMethod || 'Cash',
        accountId: cp.accountId || undefined,
        user: cp.collectedBy || 'Cashier',
        branch: 'Main Showroom',
      });
    });

    // Investments & Seed Funding
    investments.forEach((inv) => {
      const isSeed = inv.investmentType === 'SEED_FUNDING';
      allEvents.push({
        id: 'inv-' + inv.id,
        date: new Date(inv.date),
        transactionId: inv.referenceNumber,
        type: isSeed ? 'SEED_FUNDING' : 'INVESTMENT',
        typeLabel: isSeed ? 'Seed Funding' : 'Capital Investment',
        direction: 'INFLOW',
        description: isSeed
          ? `Seed Funding contribution received from ${inv.investorName}`
          : `Capital investment received from investor ${inv.investorName} (${inv.investmentType || 'EQUITY'})`,
        reference: inv.referenceNumber,
        amount: Number(inv.amount),
        paymentMethod: inv.paymentMethod || 'Bank',
        accountId: inv.depositAccountId,
        user: inv.createdBy || 'Admin',
        branch: 'Main Showroom',
      });
    });

    // Services
    serviceJobs.forEach((srv) => {
      const srvDate = new Date(srv.completedDate || srv.createdAt);
      allEvents.push({
        id: 'srv-' + srv.id,
        date: srvDate,
        transactionId: srv.jobCardNumber,
        type: 'SERVICE_INCOME',
        typeLabel: 'Service Income',
        direction: 'INFLOW',
        description: `Repair / Service payment for job card ${srv.jobCardNumber} (${srv.customerName})`,
        reference: srv.jobCardNumber,
        amount: Number(srv.totalBill),
        paymentMethod: srv.paymentMethod || 'Cash',
        user: srv.assignedTechnicianName || 'Technician',
        branch: 'Service Center',
      });
    });

    // Purchases paid upfront
    purchases.forEach((p) => {
      allEvents.push({
        id: 'pur-' + p.id,
        date: new Date(p.date),
        transactionId: p.invoiceNumber,
        type: 'PURCHASE',
        typeLabel: 'Purchase Payment',
        direction: 'OUTFLOW',
        description: `Product procurement payment to supplier ${p.supplierName}`,
        reference: p.invoiceNumber,
        amount: Number(p.paidAmount),
        paymentMethod: p.paymentMethod || 'Cash',
        user: 'Purchasing Team',
        branch: p.branchId || 'Main Showroom',
      });
    });

    // Supplier payments
    supplierPayments.forEach((sp) => {
      allEvents.push({
        id: 'spay-' + sp.id,
        date: new Date(sp.paymentDate),
        transactionId: sp.voucherNumber,
        type: 'SUPPLIER_PAYMENT',
        typeLabel: 'Supplier Due Payment',
        direction: 'OUTFLOW',
        description: `Due payment disbursed to supplier ${sp.supplierName}`,
        reference: sp.reference || sp.voucherNumber,
        amount: Number(sp.amount),
        paymentMethod: sp.paymentMethod || 'Cash',
        accountId: sp.accountId || undefined,
        user: sp.paidBy || 'Accountant',
        branch: 'Main Showroom',
      });
    });

    // Expenses
    expenses.forEach((e) => {
      allEvents.push({
        id: 'exp-' + e.id,
        date: new Date(e.date),
        transactionId: e.voucherNumber,
        type: 'EXPENSE',
        typeLabel: 'Business Expense',
        direction: 'OUTFLOW',
        description: `Operating expense: [${e.category}] ${e.description}`,
        reference: e.voucherNumber,
        amount: Number(e.amount),
        paymentMethod: e.paymentMethod || 'Cash',
        user: e.createdBy || 'Staff',
        branch: e.branchId || 'Main Showroom',
      });
    });

    // Return refunds
    returns.forEach((r) => {
      allEvents.push({
        id: 'ret-' + r.id,
        date: new Date(r.date),
        transactionId: r.returnNumber,
        type: 'REFUND',
        typeLabel: 'Customer Refund',
        direction: 'OUTFLOW',
        description: `Refund paid for returned goods to ${r.customerName} (${r.reason})`,
        reference: r.returnNumber,
        amount: Number(r.totalRefundAmount),
        paymentMethod: r.refundMethod || 'Cash',
        user: r.handledBy || 'Manager',
        branch: 'Main Showroom',
      });
    });

    // Adjustments
    adjustments.forEach((adj) => {
      allEvents.push({
        id: 'adj-' + adj.id,
        date: new Date(adj.date),
        transactionId: adj.adjustmentNumber,
        type: adj.type === 'INFLOW' ? 'ADJUSTMENT_IN' : 'ADJUSTMENT_OUT',
        typeLabel: `Adjustment (${adj.reason.replace(/_/g, ' ')})`,
        direction: adj.type as 'INFLOW' | 'OUTFLOW',
        description: `Authorized Cash Adjustment: ${adj.reason.replace(/_/g, ' ')}${adj.notes ? ` - ${adj.notes}` : ''}`,
        reference: adj.reference || adj.adjustmentNumber,
        amount: Number(adj.amount),
        paymentMethod: adj.paymentMethod || 'Cash',
        accountId: adj.accountId,
        user: adj.performedBy || 'Super Admin',
        branch: adj.branchId || 'Main Showroom',
      });
    });

    // Sort all events chronologically (oldest to newest)
    allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

    // 5. Calculate Running Balance Across All Historical Events
    let cumulativeBalance = 0;
    const historyWithBalance = allEvents.map((evt) => {
      if (evt.direction === 'INFLOW') {
        cumulativeBalance += evt.amount;
      } else {
        cumulativeBalance -= evt.amount;
      }

      const acc = evt.accountId ? accountMap.get(evt.accountId) : undefined;

      return {
        id: evt.id,
        date: evt.date.toISOString(),
        transactionId: evt.transactionId,
        type: evt.type,
        typeLabel: evt.typeLabel,
        direction: evt.direction,
        description: evt.description,
        reference: evt.reference,
        cashIn: evt.direction === 'INFLOW' ? evt.amount : 0,
        cashOut: evt.direction === 'OUTFLOW' ? evt.amount : 0,
        runningBalance: cumulativeBalance,
        paymentMethod: evt.paymentMethod,
        accountName: acc?.name,
        accountType: acc?.type,
        user: evt.user,
        branch: evt.branch,
      };
    });

    // 6. Calculate Period Inflows & Outflows & Opening Cash
    // Opening Cash for selected period is the cumulative balance of events before startDate
    const eventsBeforePeriod = historyWithBalance.filter((e) => new Date(e.date).getTime() < startDate.getTime());
    const openingCash = eventsBeforePeriod.length > 0 ? eventsBeforePeriod[eventsBeforePeriod.length - 1].runningBalance : 0;

    // Filter events within selected date range
    const periodEvents = historyWithBalance.filter((e) => {
      const t = new Date(e.date).getTime();
      return t >= startDate.getTime() && t <= endDate.getTime();
    });

    // Inflows breakdown within selected period
    let totalInflow = 0;
    let totalOutflow = 0;
    const inflowBreakdown = {
      investments: 0,
      seedFunding: 0,
      salesCollections: 0,
      customerDueCollections: 0,
      emiCollections: 0,
      serviceIncome: 0,
      adjustmentsInflow: 0,
      otherIncome: 0,
    };

    const outflowBreakdown = {
      purchasePayments: 0,
      supplierPayments: 0,
      operatingExpenses: 0,
      salaryPayments: 0,
      refunds: 0,
      adjustmentsOutflow: 0,
      otherOutflows: 0,
    };

    periodEvents.forEach((evt) => {
      if (evt.direction === 'INFLOW') {
        totalInflow += evt.cashIn;
        if (evt.type === 'INVESTMENT') inflowBreakdown.investments += evt.cashIn;
        else if (evt.type === 'SEED_FUNDING') inflowBreakdown.seedFunding += evt.cashIn;
        else if (evt.type === 'SALE') inflowBreakdown.salesCollections += evt.cashIn;
        else if (evt.type === 'CUSTOMER_DUE') inflowBreakdown.customerDueCollections += evt.cashIn;
        else if (evt.type === 'EMI_COLLECTION') inflowBreakdown.emiCollections += evt.cashIn;
        else if (evt.type === 'SERVICE_INCOME') inflowBreakdown.serviceIncome += evt.cashIn;
        else if (evt.type === 'ADJUSTMENT_IN') inflowBreakdown.adjustmentsInflow += evt.cashIn;
        else inflowBreakdown.otherIncome += evt.cashIn;
      } else {
        totalOutflow += evt.cashOut;
        if (evt.type === 'PURCHASE') outflowBreakdown.purchasePayments += evt.cashOut;
        else if (evt.type === 'SUPPLIER_PAYMENT') outflowBreakdown.supplierPayments += evt.cashOut;
        else if (evt.type === 'EXPENSE') outflowBreakdown.operatingExpenses += evt.cashOut;
        else if (evt.type === 'REFUND') outflowBreakdown.refunds += evt.cashOut;
        else if (evt.type === 'ADJUSTMENT_OUT') outflowBreakdown.adjustmentsOutflow += evt.cashOut;
        else outflowBreakdown.otherOutflows += evt.cashOut;
      }
    });

    // Today's and This Month's totals
    let todayInflow = 0;
    let todayOutflow = 0;
    let thisMonthInflow = 0;
    let thisMonthOutflow = 0;

    historyWithBalance.forEach((evt) => {
      const t = new Date(evt.date).getTime();
      if (t >= todayStart.getTime() && t <= todayEnd.getTime()) {
        if (evt.direction === 'INFLOW') todayInflow += evt.cashIn;
        else todayOutflow += evt.cashOut;
      }
      if (t >= monthStart.getTime() && t <= monthEnd.getTime()) {
        if (evt.direction === 'INFLOW') thisMonthInflow += evt.cashIn;
        else thisMonthOutflow += evt.cashOut;
      }
    });

    // 7. Cash vs Profit Analysis (Section 16 Requirement)
    // Calculate accounting metrics to clearly distinguish Cash Balance from Profit
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

    const capitalInvestmentsTotal = investments
      .filter((i) => i.investmentType !== 'SEED_FUNDING')
      .reduce((sum, i) => sum + Number(i.amount), 0);

    const seedFundingTotal = investments
      .filter((i) => i.investmentType === 'SEED_FUNDING')
      .reduce((sum, i) => sum + Number(i.amount), 0);

    // Filter displayed ledger by optional paymentMethod / accountType if provided
    let filteredMovements = [...periodEvents].reverse(); // display newest first in ledger table
    if (paymentMethodFilter && paymentMethodFilter !== 'ALL') {
      filteredMovements = filteredMovements.filter((m) =>
        m.paymentMethod.toLowerCase().includes(paymentMethodFilter.toLowerCase())
      );
    }
    if (accountTypeFilter && accountTypeFilter !== 'ALL') {
      filteredMovements = filteredMovements.filter((m) => m.accountType === accountTypeFilter);
    }

    return NextResponse.json({
      success: true,
      data: {
        currentCash,
        physicalCash,
        digitalBankCash,
        openingCash,
        totalInflow,
        totalOutflow,
        netCashFlow: totalInflow - totalOutflow,
        todayInflow,
        todayOutflow,
        thisMonthInflow,
        thisMonthOutflow,
        inflowBreakdown,
        outflowBreakdown,
        accountBalances: accounts.map((a) => ({
          id: a.id,
          name: a.name,
          type: a.type,
          accountNumber: a.accountNumber,
          balance: Number(a.balance),
          currency: a.currency,
        })),
        cashVsProfit: {
          currentCashBalance: currentCash,
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

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

    // 2. Fetch Accounts & Branches
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
        ...(branchId && branchId !== 'ALL' ? { branchId } : {}),
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
    const db = prisma as any;
    const customerPayments = await db.customerPayment.findMany({
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

    // E. Investments & Capital
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
        ...(branchId && branchId !== 'ALL' ? { branchId } : {}),
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
        ...(branchId && branchId !== 'ALL' ? { branchId } : {}),
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
    const adjustments = await db.cashAdjustment.findMany({
      where: {
        ...(branchId && branchId !== 'ALL' ? { branchId } : {}),
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

    // L. Fund / Cash Transfers
    const fundTransfers = await prisma.fundTransfer.findMany({
      select: {
        id: true,
        transferNumber: true,
        date: true,
        fromAccountId: true,
        toAccountId: true,
        amount: true,
        fee: true,
        reference: true,
        transferredBy: true,
        notes: true,
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
      branchId?: string;
      branch: string;
      isPhysicalCash: boolean;
    }

    const allEvents: RawEvent[] = [];

    // Helper to test if a payment method is physical cash
    const checkIsCash = (method?: string | null, accId?: string | null) => {
      const cleanMethod = (method || '').toLowerCase().trim();
      if (cleanMethod === 'cash' || cleanMethod === 'cash payment') return true;
      if (accId) {
        const acc = accountMap.get(accId);
        if (acc?.type === 'CASH') return true;
      }
      return false;
    };

    // A. Opening Balances
    openingBalances.forEach((ob) => {
      const isCash = ob.type === 'CASH';
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
        paymentMethod: isCash ? 'Cash' : 'Bank',
        accountId: ob.targetId,
        user: ob.approvedBy || 'System',
        branch: 'Main Showroom',
        isPhysicalCash: isCash,
      });
    });

    // B. Sales (with mixed payment split support)
    sales.forEach((s) => {
      const saleDate = new Date(s.date || s.createdAt);
      const branchName = branchMap.get(s.branchId) || 'Main Showroom';

      // Check if mixed payments exist
      const paymentsList = Array.isArray(s.payments) ? (s.payments as any[]) : [];
      if (paymentsList.length > 0) {
        paymentsList.forEach((p: any, idx: number) => {
          const splitAmount = Number(p.amount);
          if (splitAmount <= 0) return;
          const method = p.method || 'Cash';
          const isCash = checkIsCash(method, p.accountId);

          allEvents.push({
            id: `sale-${s.id}-${idx}`,
            date: saleDate,
            transactionId: `${s.invoiceNumber}${paymentsList.length > 1 ? `-${idx + 1}` : ''}`,
            type: 'SALE',
            typeLabel: paymentsList.length > 1 ? `Sale (${method})` : 'Product Sale',
            direction: 'INFLOW',
            description: `Sales collection via ${method} from ${s.customerName} (Invoice: ${s.invoiceNumber})`,
            reference: s.invoiceNumber,
            amount: splitAmount,
            paymentMethod: method,
            accountId: p.accountId,
            user: s.salespersonName || 'Sales Staff',
            branchId: s.branchId,
            branch: branchName,
            isPhysicalCash: isCash,
          });
        });
      } else {
        // Single payment fallback
        const paid = Number(s.paidAmount);
        if (paid > 0) {
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
            paymentMethod: 'Cash',
            user: s.salespersonName || 'Sales Staff',
            branchId: s.branchId,
            branch: branchName,
            isPhysicalCash: true,
          });
        }
      }
    });

    // C. EMI collections
    emiPayments.forEach((ep) => {
      const amt = Number(ep.amount) + Number(ep.penaltyPaid || 0);
      const method = ep.paymentMethod || 'Cash';
      const isCash = checkIsCash(method);

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
        paymentMethod: method,
        user: ep.collectedBy || 'Accountant',
        branch: 'Main Showroom',
        isPhysicalCash: isCash,
      });
    });

    // D. Customer Due collections
    customerPayments.forEach((cp) => {
      const method = cp.paymentMethod || 'Cash';
      const isCash = checkIsCash(method, cp.accountId);

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
        paymentMethod: method,
        accountId: cp.accountId || undefined,
        user: cp.collectedBy || 'Cashier',
        branch: 'Main Showroom',
        isPhysicalCash: isCash,
      });
    });

    // E. Investments & Capital
    investments.forEach((inv) => {
      const isSeed = inv.investmentType === 'SEED_FUNDING';
      const method = inv.paymentMethod || 'Cash';
      const isCash = checkIsCash(method, inv.depositAccountId);

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
        paymentMethod: method,
        accountId: inv.depositAccountId,
        user: inv.createdBy || 'Admin',
        branch: 'Main Showroom',
        isPhysicalCash: isCash,
      });
    });

    // F. Paid Technical & Electrical Services
    serviceJobs.forEach((srv) => {
      const srvDate = new Date(srv.completedDate || srv.createdAt);
      const method = srv.paymentMethod || 'Cash';
      const isCash = checkIsCash(method);

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
        paymentMethod: method,
        user: srv.assignedTechnicianName || 'Technician',
        branch: 'Service Center',
        isPhysicalCash: isCash,
      });
    });

    // G. Purchases paid upfront
    purchases.forEach((p) => {
      const method = p.paymentMethod || 'Cash';
      const isCash = checkIsCash(method);
      const branchName = branchMap.get(p.branchId) || 'Main Showroom';

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
        paymentMethod: method,
        user: 'Purchasing Team',
        branchId: p.branchId,
        branch: branchName,
        isPhysicalCash: isCash,
      });
    });

    // H. Supplier Payments (subsequent payments against credit/payable)
    supplierPayments.forEach((sp) => {
      const method = sp.paymentMethod || 'Cash';
      const isCash = checkIsCash(method, sp.accountId);

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
        paymentMethod: method,
        accountId: sp.accountId || undefined,
        user: sp.paidBy || 'Accountant',
        branch: 'Main Showroom',
        isPhysicalCash: isCash,
      });
    });

    // I. Expenses
    expenses.forEach((e) => {
      // Prevent double counting: purchases and supplier payments already provide their own event records
      if (e.voucherNumber.startsWith('EXP-PUR-') || e.voucherNumber.startsWith('EXP-SUP-')) {
        return;
      }
      const method = e.paymentMethod || 'Cash';
      const isCash = checkIsCash(method);
      const branchName = branchMap.get(e.branchId) || 'Main Showroom';

      allEvents.push({
        id: 'exp-' + e.id,
        date: new Date(e.date),
        transactionId: e.voucherNumber,
        type: 'EXPENSE',
        typeLabel: e.category === 'Purchase Expenses' ? 'Purchase Expense' : 'Business Expense',
        direction: 'OUTFLOW',
        description: `Operating expense: [${e.category}] ${e.description}`,
        reference: e.voucherNumber,
        amount: Number(e.amount),
        paymentMethod: method,
        user: e.createdBy || 'Staff',
        branchId: e.branchId,
        branch: branchName,
        isPhysicalCash: isCash,
      });
    });

    // J. Product Return Refunds
    returns.forEach((r) => {
      const method = r.refundMethod || 'Cash';
      const isCash = checkIsCash(method);

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
        paymentMethod: method,
        user: r.handledBy || 'Manager',
        branch: 'Main Showroom',
        isPhysicalCash: isCash,
      });
    });

    // K. Cash Adjustments
    adjustments.forEach((adj) => {
      const method = adj.paymentMethod || 'Cash';
      const isCash = checkIsCash(method, adj.accountId);
      const branchName = branchMap.get(adj.branchId) || 'Main Showroom';

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
        paymentMethod: method,
        accountId: adj.accountId,
        user: adj.performedBy || 'Super Admin',
        branchId: adj.branchId,
        branch: branchName,
        isPhysicalCash: isCash,
      });
    });

    // L. Fund / Cash Transfers (linked two-sided transactions)
    fundTransfers.forEach((trf) => {
      const fromAcc = accountMap.get(trf.fromAccountId);
      const toAcc = accountMap.get(trf.toAccountId);
      const trfDate = new Date(trf.date);
      const amount = Number(trf.amount);
      const fee = Number(trf.fee || 0);

      // Outflow from source account
      allEvents.push({
        id: `trf-out-${trf.id}`,
        date: trfDate,
        transactionId: `${trf.transferNumber}-OUT`,
        type: 'TRANSFER_OUT',
        typeLabel: 'Fund Transfer Out',
        direction: 'OUTFLOW',
        description: `Transfer to ${toAcc?.name || 'Destination Account'}${fee > 0 ? ` (Fee: ৳${fee})` : ''}`,
        reference: trf.transferNumber,
        amount: amount + fee,
        paymentMethod: fromAcc?.type === 'CASH' ? 'Cash' : (fromAcc?.type || 'Bank'),
        accountId: trf.fromAccountId,
        user: trf.transferredBy || 'Accountant',
        branch: 'Main Showroom',
        isPhysicalCash: fromAcc?.type === 'CASH',
      });

      // Inflow to destination account
      allEvents.push({
        id: `trf-in-${trf.id}`,
        date: trfDate,
        transactionId: `${trf.transferNumber}-IN`,
        type: 'TRANSFER_IN',
        typeLabel: 'Fund Transfer In',
        direction: 'INFLOW',
        description: `Transfer received from ${fromAcc?.name || 'Source Account'}`,
        reference: trf.transferNumber,
        amount,
        paymentMethod: toAcc?.type === 'CASH' ? 'Cash' : (toAcc?.type || 'Bank'),
        accountId: trf.toAccountId,
        user: trf.transferredBy || 'Accountant',
        branch: 'Main Showroom',
        isPhysicalCash: toAcc?.type === 'CASH',
      });
    });

    // Sort all events chronologically (oldest to newest)
    allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

    // 5. Calculate Running Balance Across All Historical Events
    let cumulativeTotalBalance = 0;
    let cumulativePhysicalBalance = 0;

    const historyWithBalance = allEvents.map((evt) => {
      if (evt.direction === 'INFLOW') {
        cumulativeTotalBalance += evt.amount;
        if (evt.isPhysicalCash) cumulativePhysicalBalance += evt.amount;
      } else {
        cumulativeTotalBalance -= evt.amount;
        if (evt.isPhysicalCash) cumulativePhysicalBalance -= evt.amount;
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
        runningBalance: cumulativeTotalBalance,
        runningPhysicalBalance: cumulativePhysicalBalance,
        paymentMethod: evt.paymentMethod,
        isPhysicalCash: evt.isPhysicalCash,
        accountName: acc?.name,
        accountType: acc?.type,
        user: evt.user,
        branchId: evt.branchId,
        branch: evt.branch,
      };
    });

    // Current balances calculated strictly from transactions
    const currentCash = cumulativeTotalBalance;
    const physicalCash = cumulativePhysicalBalance;
    const digitalBankCash = currentCash - physicalCash;

    // 6. Calculate Period Inflows, Outflows, Opening Cash, and Closing Cash
    const eventsBeforePeriod = historyWithBalance.filter((e) => new Date(e.date).getTime() < startDate.getTime());
    const openingCash = eventsBeforePeriod.length > 0 ? eventsBeforePeriod[eventsBeforePeriod.length - 1].runningBalance : 0;
    const openingPhysicalCash = eventsBeforePeriod.length > 0 ? eventsBeforePeriod[eventsBeforePeriod.length - 1].runningPhysicalBalance : 0;

    // Filter events within selected date range
    let periodEvents = historyWithBalance.filter((e) => {
      const t = new Date(e.date).getTime();
      return t >= startDate.getTime() && t <= endDate.getTime();
    });

    // Optional Branch Filter
    if (branchId && branchId !== 'ALL') {
      periodEvents = periodEvents.filter((e) => e.branchId === branchId);
    }

    // Inflows breakdown within selected period
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
      otherOutflows: 0,
    };

    periodEvents.forEach((evt) => {
      if (evt.direction === 'INFLOW') {
        totalInflow += evt.cashIn;
        if (evt.isPhysicalCash) totalPhysicalInflow += evt.cashIn;

        if (evt.type === 'INVESTMENT') inflowBreakdown.investments += evt.cashIn;
        else if (evt.type === 'SEED_FUNDING') inflowBreakdown.seedFunding += evt.cashIn;
        else if (evt.type === 'SALE') inflowBreakdown.salesCollections += evt.cashIn;
        else if (evt.type === 'CUSTOMER_DUE') inflowBreakdown.customerDueCollections += evt.cashIn;
        else if (evt.type === 'EMI_COLLECTION') inflowBreakdown.emiCollections += evt.cashIn;
        else if (evt.type === 'SERVICE_INCOME') inflowBreakdown.serviceIncome += evt.cashIn;
        else if (evt.type === 'ADJUSTMENT_IN') inflowBreakdown.adjustmentsInflow += evt.cashIn;
        else if (evt.type === 'TRANSFER_IN') inflowBreakdown.transfersIn += evt.cashIn;
        else inflowBreakdown.otherIncome += evt.cashIn;
      } else {
        totalOutflow += evt.cashOut;
        if (evt.isPhysicalCash) totalPhysicalOutflow += evt.cashOut;

        if (evt.type === 'PURCHASE') outflowBreakdown.purchasePayments += evt.cashOut;
        else if (evt.type === 'SUPPLIER_PAYMENT') outflowBreakdown.supplierPayments += evt.cashOut;
        else if (evt.type === 'EXPENSE') outflowBreakdown.operatingExpenses += evt.cashOut;
        else if (evt.type === 'REFUND') outflowBreakdown.refunds += evt.cashOut;
        else if (evt.type === 'ADJUSTMENT_OUT') outflowBreakdown.adjustmentsOutflow += evt.cashOut;
        else if (evt.type === 'TRANSFER_OUT') outflowBreakdown.transfersOut += evt.cashOut;
        else outflowBreakdown.otherOutflows += evt.cashOut;
      }
    });

    const netCashFlow = totalInflow - totalOutflow;
    const closingCash = openingCash + netCashFlow;

    // Today's totals
    let todayInflow = 0;
    let todayOutflow = 0;
    let todayPhysicalInflow = 0;
    let todayPhysicalOutflow = 0;

    historyWithBalance.forEach((evt) => {
      const t = new Date(evt.date).getTime();
      if (t >= todayStart.getTime() && t <= todayEnd.getTime()) {
        if (evt.direction === 'INFLOW') {
          todayInflow += evt.cashIn;
          if (evt.isPhysicalCash) todayPhysicalInflow += evt.cashIn;
        } else {
          todayOutflow += evt.cashOut;
          if (evt.isPhysicalCash) todayPhysicalOutflow += evt.cashOut;
        }
      }
    });

    const todayNetMovement = todayInflow - todayOutflow;

    // 7. Payment Method Account Balances (Cash, bKash, Nagad, Rocket, Bank, Card)
    const paymentMethodStats: Record<string, { balance: number; inflow: number; outflow: number }> = {
      Cash: { balance: 0, inflow: 0, outflow: 0 },
      bKash: { balance: 0, inflow: 0, outflow: 0 },
      Nagad: { balance: 0, inflow: 0, outflow: 0 },
      Rocket: { balance: 0, inflow: 0, outflow: 0 },
      Bank: { balance: 0, inflow: 0, outflow: 0 },
      Card: { balance: 0, inflow: 0, outflow: 0 },
    };

    historyWithBalance.forEach((evt) => {
      let key = 'Cash';
      const m = (evt.paymentMethod || '').toLowerCase();
      if (m.includes('bkash')) key = 'bKash';
      else if (m.includes('nagad')) key = 'Nagad';
      else if (m.includes('rocket')) key = 'Rocket';
      else if (m.includes('bank') || m.includes('cheque')) key = 'Bank';
      else if (m.includes('card') || m.includes('visa') || m.includes('master')) key = 'Card';
      else if (m.includes('cash')) key = 'Cash';

      if (!paymentMethodStats[key]) {
        paymentMethodStats[key] = { balance: 0, inflow: 0, outflow: 0 };
      }

      if (evt.direction === 'INFLOW') {
        paymentMethodStats[key].balance += evt.cashIn;
        paymentMethodStats[key].inflow += evt.cashIn;
      } else {
        paymentMethodStats[key].balance -= evt.cashOut;
        paymentMethodStats[key].outflow += evt.cashOut;
      }
    });

    // 8. Branch Cash Distribution
    const branchStats: Record<string, { name: string; balance: number; inflow: number; outflow: number }> = {};
    branches.forEach((b) => {
      branchStats[b.id] = { name: b.name, balance: 0, inflow: 0, outflow: 0 };
    });
    if (!branchStats['default']) {
      branchStats['default'] = { name: 'Main Showroom', balance: 0, inflow: 0, outflow: 0 };
    }

    historyWithBalance.forEach((evt) => {
      const bId = evt.branchId || 'default';
      if (!branchStats[bId]) {
        branchStats[bId] = { name: evt.branch || 'Branch', balance: 0, inflow: 0, outflow: 0 };
      }
      if (evt.direction === 'INFLOW') {
        branchStats[bId].balance += evt.cashIn;
        branchStats[bId].inflow += evt.cashIn;
      } else {
        branchStats[bId].balance -= evt.cashOut;
        branchStats[bId].outflow += evt.cashOut;
      }
    });

    // 9. Accounting Distinction: Cash vs Sales Revenue vs Profit
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

    // 10. Ledger Filtering & Search
    let filteredMovements = [...periodEvents].reverse(); // newest first in ledger table

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
          m.branch.toLowerCase().includes(searchQuery)
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        currentCash,
        physicalCash,
        digitalBankCash,
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
        inflowBreakdown,
        outflowBreakdown,
        paymentMethodStats,
        branchStats: Object.values(branchStats),
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

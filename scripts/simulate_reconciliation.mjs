import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('--- SIMULATING FULL HISTORICAL RECONCILIATION ---');

  const accounts = await prisma.financialAccount.findMany();
  const accountMap = new Map();
  accounts.forEach(a => accountMap.set(a.id, a));

  // 1. Investments
  const investments = await prisma.investment.findMany({ where: { status: 'ACTIVE' } });
  let totalInvestments = 0;
  for (const inv of investments) {
    totalInvestments += Number(inv.amount);
  }
  console.log(`Total Investments: ৳${totalInvestments} (${investments.length} records)`);

  // 2. Sales
  const sales = await prisma.sale.findMany({ where: { status: { not: 'CANCELLED' } } });
  let totalSalesPaid = 0;
  let totalSalesPaidCash = 0;
  let totalSalesDue = 0;
  for (const s of sales) {
    const paid = Number(s.paidAmount);
    totalSalesPaid += paid;
    totalSalesDue += Number(s.dueAmount);
    if (Array.isArray(s.payments) && s.payments.length > 0) {
      for (const p of s.payments) {
        if (!p.method || p.method.toLowerCase().includes('cash')) {
          totalSalesPaidCash += Number(p.amount);
        }
      }
    } else {
      totalSalesPaidCash += paid;
    }
  }
  console.log(`Total Sales Paid: ৳${totalSalesPaid} (Cash: ৳${totalSalesPaidCash}), Total Dues: ৳${totalSalesDue}`);

  // 3. Customer Payments
  const customerPayments = await prisma.customerPayment.findMany();
  let totalCustPayments = 0;
  for (const cp of customerPayments) {
    totalCustPayments += Number(cp.amount);
  }
  console.log(`Total Customer Payments Collected: ৳${totalCustPayments}`);

  // 4. Expenses
  const expenses = await prisma.expense.findMany({ where: { status: { not: 'CANCELLED' } } });
  let totalExpenses = 0;
  let totalExpensesCash = 0;
  for (const e of expenses) {
    const amt = Number(e.amount);
    totalExpenses += amt;
    if (e.paymentMethod?.toLowerCase().includes('cash')) {
      totalExpensesCash += amt;
    }
  }
  console.log(`Total Expenses: ৳${totalExpenses} (Cash: ৳${totalExpensesCash})`);

  // 5. Purchases
  const purchases = await prisma.purchase.findMany({ where: { status: { not: 'CANCELLED' } } });
  let totalPurchasesPaid = 0;
  for (const p of purchases) {
    totalPurchasesPaid += Number(p.paidAmount);
  }
  console.log(`Total Purchases Paid: ৳${totalPurchasesPaid}`);

  // 6. Transfers
  const transfers = await prisma.fundTransfer.findMany();
  console.log(`Fund Transfers count: ${transfers.length}`);

  // 7. Returns
  const returns = await prisma.productReturn.findMany();
  let totalRefunds = 0;
  for (const r of returns) {
    totalRefunds += Number(r.totalRefundAmount);
  }
  console.log(`Total Returns Refund: ৳${totalRefunds}`);

  // 8. Adjustments
  const adjustments = await prisma.cashAdjustment.findMany();
  console.log(`Adjustments count: ${adjustments.length}`);

  // Now let's calculate what each account balance would be if every historical transaction is posted:
  // For acc-1 (Main Cash Drawer):
  // Let's trace all movements for acc-1
  let acc1Balance = 0;
  console.log('\n--- Trace for acc-1 (Main Cash) ---');
  // Investments into acc-1:
  for (const inv of investments) {
    if (inv.depositAccountId === 'acc-1' || !inv.depositAccountId) {
      acc1Balance += Number(inv.amount);
    }
  }
  console.log(`After Investments: ৳${acc1Balance}`);

  // Cash Sales:
  for (const s of sales) {
    if (Array.isArray(s.payments) && s.payments.length > 0) {
      for (const p of s.payments) {
        const m = (p.method || '').toLowerCase();
        const aId = p.accountId;
        if (aId === 'acc-1' || (!aId && m.includes('cash'))) {
          acc1Balance += Number(p.amount);
        }
      }
    } else {
      acc1Balance += Number(s.paidAmount);
    }
  }
  console.log(`After Cash Sales: ৳${acc1Balance}`);

  // Customer Due Collections in Cash to acc-1:
  for (const cp of customerPayments) {
    if (cp.accountId === 'acc-1' || (!cp.accountId && cp.paymentMethod?.toLowerCase().includes('cash'))) {
      acc1Balance += Number(cp.amount);
    }
  }
  console.log(`After Customer Payments: ৳${acc1Balance}`);

  // Transfers involving acc-1:
  for (const t of transfers) {
    if (t.fromAccountId === 'acc-1') {
      acc1Balance -= (Number(t.amount) + Number(t.fee || 0));
    }
    if (t.toAccountId === 'acc-1') {
      acc1Balance += Number(t.amount);
    }
  }
  console.log(`After Transfers: ৳${acc1Balance}`);

  // Adjustments on acc-1:
  for (const adj of adjustments) {
    if (adj.accountId === 'acc-1') {
      if (adj.type === 'INFLOW') acc1Balance += Number(adj.amount);
      else acc1Balance -= Number(adj.amount);
    }
  }
  console.log(`After Cash Adjustments: ৳${acc1Balance}`);

  // Cash Expenses:
  let acc1Expenses = 0;
  for (const e of expenses) {
    if (e.paymentMethod?.toLowerCase().includes('cash')) {
      acc1Expenses += Number(e.amount);
    }
  }
  console.log(`Cash Expenses to deduct: ৳${acc1Expenses}`);
  console.log(`Net acc-1 if all cash expenses subtracted: ৳${acc1Balance - acc1Expenses}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());

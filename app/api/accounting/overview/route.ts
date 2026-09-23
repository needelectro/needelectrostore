// NEED ELECTRO ERP — Real Transaction-Based Accounting Overview Engine
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'accounting', 'view') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied to financial reports' }, { status: 403 });
  }

  try {
    // 1. Total Revenue from completed sales
    const salesAggregate = await prisma.sale.aggregate({
      where: { status: 'COMPLETED' },
      _sum: {
        grandTotal: true,
        paidAmount: true,
        dueAmount: true,
      },
    });
    const totalRevenue = Number(salesAggregate._sum.grandTotal || 0);
    const totalCollected = Number(salesAggregate._sum.paidAmount || 0);
    const accountsReceivable = Number(salesAggregate._sum.dueAmount || 0);

    // 2. COGS from sold inventory items
    const saleItems = await prisma.saleItem.findMany({
      where: { sale: { status: 'COMPLETED' } },
      include: { product: true },
    });
    const totalCOGS = saleItems.reduce((sum, item) => {
      const cost = Number(item.product?.costPrice || 0);
      return sum + cost * item.quantity;
    }, 0);

    // 3. Operating Expenses (Excluding capital inventory procurements to prevent double-counting with COGS)
    const expensesAggregate = await prisma.expense.aggregate({
      where: {
        category: {
          notIn: ['Inventory', 'Purchase Expenses', 'Assets'],
        },
      },
      _sum: { amount: true },
    });
    const totalExpenses = Number(expensesAggregate._sum.amount || 0);

    // 4. Gross Profit & Net Profit
    // Standard GAAP / IFRS Reconciliation Formula: Revenue - COGS - Operating Expenses = Net Profit
    const grossProfit = totalRevenue - totalCOGS;
    const netProfit = grossProfit - totalExpenses;

    // 5. Total Inventory Valuation
    const products = await prisma.product.findMany({
      select: { currentStock: true, costPrice: true, retailPrice: true },
    });
    const inventoryValuationCost = products.reduce((sum, p) => sum + p.currentStock * Number(p.costPrice), 0);
    const inventoryValuationRetail = products.reduce((sum, p) => sum + p.currentStock * Number(p.retailPrice), 0);

    // 6. Accounts Payable from Suppliers
    const suppliersAggregate = await prisma.supplier.aggregate({
      _sum: { currentPayable: true },
    });
    const accountsPayable = Number(suppliersAggregate._sum.currentPayable || 0);

    // 7. Active EMI Receivables
    const emiAggregate = await prisma.eMIAccount.aggregate({
      where: { status: 'ACTIVE' },
      _sum: { remainingBalance: true, totalPaid: true },
    });
    const emiReceivable = Number(emiAggregate._sum.remainingBalance || 0);

    // 8. Financial Account Balances (Cash, Bank, Mobile Banking)
    const accounts = await prisma.financialAccount.findMany({
      where: { isActive: true },
    });
    const totalLiquidAssets = accounts.reduce((sum, a) => sum + Number(a.balance), 0);

    // 9. Total Capital Investments & Seed Funding (Kept separate from operating revenue)
    const capitalAggregate = await prisma.investment.aggregate({
      where: { status: 'ACTIVE', investmentType: { not: 'SEED_FUNDING' } },
      _sum: { amount: true },
    });
    const paidInCapital = Number(capitalAggregate._sum.amount || 0);

    const seedAggregate = await prisma.investment.aggregate({
      where: { status: 'ACTIVE', investmentType: 'SEED_FUNDING' },
      _sum: { amount: true },
    });
    const seedFunding = Number(seedAggregate._sum.amount || 0);
    const totalInvestments = paidInCapital + seedFunding;

    return NextResponse.json({
      success: true,
      data: {
        financialSummary: {
          totalRevenue,
          totalCollected,
          totalCOGS,
          grossProfit,
          totalExpenses,
          netProfit,
          grossMarginPercent: totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0',
          netMarginPercent: totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : '0',
        },
        balanceSheet: {
          assets: {
            liquidCashAndBank: totalLiquidAssets,
            accountsReceivable,
            emiReceivable,
            inventoryValuation: inventoryValuationCost,
            totalAssets: totalLiquidAssets + accountsReceivable + emiReceivable + inventoryValuationCost,
          },
          liabilities: {
            accountsPayable,
            totalLiabilities: accountsPayable,
          },
          equity: {
            paidInCapital,
            seedFunding,
            totalInvestedCapital: totalInvestments,
            retainedEarnings: netProfit,
            totalEquity: totalInvestments + netProfit,
          },
        },
        accounts,
        inventoryValuationRetail,
      },
    });
  } catch (err: any) {
    console.error('Accounting overview error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// NEED ELECTRO ERP — Secure Investor Portal Read-Only API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  // 1. Strict Server-Side Authentication
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  // 2. Strict Role Verification — Only INVESTOR can access this portal
  if (user.role !== 'INVESTOR') {
    return NextResponse.json(
      { success: false, error: 'Access restricted: Investor clearance required.' },
      { status: 403 }
    );
  }

  try {
    // 3. Strict Ownership Check — Identify Investor by authenticated userId
    const investor = await prisma.investor.findUnique({
      where: { userId: user.id },
      include: {
        investments: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (!investor) {
      return NextResponse.json(
        { success: false, error: 'Investor profile not found.' },
        { status: 404 }
      );
    }

    // 4. Calculate Investor's Personal Active Capital
    const myInvestment = investor.investments.reduce(
      (sum, inv) => sum + Number(inv.amount),
      0
    );

    // 5. Calculate Total Active Investor Investment in ERP (Internal use only)
    const allActiveInvestments = await prisma.investment.aggregate({
      where: { status: 'ACTIVE' },
      _sum: { amount: true },
    });
    const totalActiveInvestment = Number(allActiveInvestments._sum.amount || 0);

    // 6. Investor Investment Share Percentage
    const mySharePercentage =
      totalActiveInvestment > 0 ? (myInvestment / totalActiveInvestment) * 100 : 0;

    // 7. Fetch Finalized Monthly Settlements with this Investor's profit share
    const settlements = await prisma.monthlySettlement.findMany({
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        investorProfits: {
          where: { investorId: investor.id },
        },
      },
    });

    const finalizedMap = new Map<string, any>();
    for (const s of settlements) {
      const key = `${s.year}-${String(s.month).padStart(2, '0')}`;
      const myProfitRecord = s.investorProfits[0];
      finalizedMap.set(key, {
        id: s.id,
        year: s.year,
        month: s.month,
        periodLabel: s.periodLabel,
        revenue: Number(s.revenue),
        expenses: Number(s.expenses),
        netProfit: Number(s.netProfit),
        myProfit: myProfitRecord ? Number(myProfitRecord.profitShare) : 0,
        myInvestment: myProfitRecord ? Number(myProfitRecord.investmentAmount) : myInvestment,
        mySharePercentage: myProfitRecord
          ? Number(myProfitRecord.sharePercentage)
          : Number(mySharePercentage.toFixed(2)),
        isFinalized: true,
        finalizedAt: s.finalizedAt,
      });
    }

    // 8. Compute Live Monthly Aggregates from Real ERP Data for Months Not Yet Finalized
    // Pull completed sales and operating expenses
    const [sales, saleItems, expenses] = await Promise.all([
      prisma.sale.findMany({
        where: { status: 'COMPLETED' },
        select: { id: true, date: true, grandTotal: true },
      }),
      prisma.saleItem.findMany({
        where: { sale: { status: 'COMPLETED' } },
        select: { saleId: true, quantity: true, product: { select: { costPrice: true } } },
      }),
      prisma.expense.findMany({
        select: { date: true, amount: true },
      }),
    ]);

    // Build COGS map per sale
    const saleCogsMap = new Map<string, number>();
    for (const item of saleItems) {
      const cost = Number(item.product?.costPrice || 0) * item.quantity;
      saleCogsMap.set(item.saleId, (saleCogsMap.get(item.saleId) || 0) + cost);
    }

    // Aggregate by YYYY-MM
    const liveMonthsMap = new Map<
      string,
      { year: number; month: number; periodLabel: string; revenue: number; cogs: number; expenses: number }
    >();

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];

    for (const s of sales) {
      const d = new Date(s.date);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const key = `${y}-${String(m).padStart(2, '0')}`;
      if (!liveMonthsMap.has(key)) {
        liveMonthsMap.set(key, {
          year: y,
          month: m,
          periodLabel: `${monthNames[m - 1]} ${y}`,
          revenue: 0,
          cogs: 0,
          expenses: 0,
        });
      }
      const entry = liveMonthsMap.get(key)!;
      entry.revenue += Number(s.grandTotal);
      entry.cogs += saleCogsMap.get(s.id) || 0;
    }

    for (const e of expenses) {
      const d = new Date(e.date);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const key = `${y}-${String(m).padStart(2, '0')}`;
      if (!liveMonthsMap.has(key)) {
        liveMonthsMap.set(key, {
          year: y,
          month: m,
          periodLabel: `${monthNames[m - 1]} ${y}`,
          revenue: 0,
          cogs: 0,
          expenses: 0,
        });
      }
      const entry = liveMonthsMap.get(key)!;
      entry.expenses += Number(e.amount);
    }

    // Merge finalized and live data into complete history list
    const allKeys = new Set([...finalizedMap.keys(), ...liveMonthsMap.keys()]);
    const sortedKeys = Array.from(allKeys).sort((a, b) => b.localeCompare(a));

    const history: any[] = [];

    for (const key of sortedKeys) {
      if (finalizedMap.has(key)) {
        history.push(finalizedMap.get(key));
      } else {
        const live = liveMonthsMap.get(key)!;
        const netProfit = live.revenue - (live.cogs + live.expenses);
        // Formula: Net Profit * 25% * (Investor Investment / Total Active Investment)
        // If net profit <= 0: profit = 0
        const profitPool = netProfit > 0 ? netProfit * 0.25 : 0;
        const myProfit =
          totalActiveInvestment > 0
            ? profitPool * (myInvestment / totalActiveInvestment)
            : 0;

        history.push({
          id: `live-${key}`,
          year: live.year,
          month: live.month,
          periodLabel: live.periodLabel,
          revenue: Math.round(live.revenue),
          expenses: Math.round(live.expenses),
          netProfit: Math.round(netProfit),
          myProfit: Math.round(myProfit),
          myInvestment,
          mySharePercentage: Number(mySharePercentage.toFixed(2)),
          isFinalized: false,
        });
      }
    }

    // Determine current month record
    const now = new Date();
    const currentKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    let currentMonth = history.find(h => `${h.year}-${String(h.month).padStart(2, '0')}` === currentKey);

    if (!currentMonth && history.length > 0) {
      currentMonth = history[0];
    } else if (!currentMonth) {
      currentMonth = {
        id: `live-${currentKey}`,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        periodLabel: `${monthNames[now.getMonth()]} ${now.getFullYear()}`,
        revenue: 0,
        expenses: 0,
        netProfit: 0,
        myProfit: 0,
        myInvestment,
        mySharePercentage: Number(mySharePercentage.toFixed(2)),
        isFinalized: false,
      };
    }

    // 9. Return strictly curated, non-sensitive financial summary
    return NextResponse.json({
      success: true,
      data: {
        investor: {
          investorId: investor.investorId,
          name: investor.name,
          email: investor.email,
          phone: investor.phone,
          status: investor.status,
        },
        myInvestment,
        mySharePercentage: Number(mySharePercentage.toFixed(2)),
        profitPoolRate: 25, // 25% of net profit
        currentMonth,
        history,
      },
    });
  } catch (err: any) {
    console.error('Investor portal error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// NEED ELECTRO ERP — Super Admin Investor & Profit Management API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin, hashPassword } from '@/lib/auth';
import { recordAccountMovement, reverseTransaction } from '@/lib/accounting';

export async function GET(req: NextRequest) {
  const user = await requireSuperAdmin(req);
  if (user instanceof NextResponse) return user;

  try {
    const { searchParams } = new URL(req.url);
    const targetYear = parseInt(searchParams.get('year') || String(new Date().getFullYear()), 10);
    const targetMonth = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1), 10);

    // 1. Fetch all investors with active investments and linked user
    const investors = await prisma.investor.findMany({
      include: {
        investments: {
          orderBy: { date: 'desc' },
        },
        user: {
          select: { id: true, email: true, username: true, status: true, lastLoginAt: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // 2. Compute total active investment pool
    let totalActiveInvestment = 0;
    const investorList = investors.map(inv => {
      const activeInvestments = inv.investments.filter(i => i.status === 'ACTIVE');
      const totalAmount = activeInvestments.reduce((s, i) => s + Number(i.amount), 0);
      totalActiveInvestment += totalAmount;
      return {
        id: inv.id,
        investorId: inv.investorId,
        name: inv.name,
        email: inv.email,
        phone: inv.phone,
        status: inv.status,
        notes: inv.notes,
        totalInvestment: totalAmount,
        investments: inv.investments.map(i => ({
          id: i.id,
          referenceNumber: i.referenceNumber,
          amount: Number(i.amount),
          date: i.date,
          status: i.status,
          investmentType: i.investmentType,
          paymentMethod: i.paymentMethod,
          reference: i.reference,
          notes: i.notes,
        })),
        user: inv.user,
      };
    });

    // Compute share percentages
    const investorsWithShare = investorList.map(inv => ({
      ...inv,
      sharePercentage:
        totalActiveInvestment > 0
          ? Number(((inv.totalInvestment / totalActiveInvestment) * 100).toFixed(2))
          : 0,
    }));

    // 3. Compute Preview / Financial Calculation for Target Month
    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    const [monthSales, monthSaleItems, monthExpenses] = await Promise.all([
      prisma.sale.findMany({
        where: {
          status: 'COMPLETED',
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        select: { id: true, grandTotal: true },
      }),
      prisma.saleItem.findMany({
        where: {
          sale: {
            status: 'COMPLETED',
            date: { gte: startOfMonth, lte: endOfMonth },
          },
        },
        select: { quantity: true, unitPrice: true, product: { select: { costPrice: true } } },
      }),
      prisma.expense.findMany({
        where: {
          date: { gte: startOfMonth, lte: endOfMonth },
        },
        select: { amount: true },
      }),
    ]);

    const revenue = monthSales.reduce((sum, s) => sum + Number(s.grandTotal), 0);
    const cogs = monthSaleItems.reduce((sum, item) => {
      const costPrice = Number(item.product?.costPrice || 0);
      const unitPrice = Number(item.unitPrice || 0);
      const itemUnitCost = (costPrice > 0 && costPrice <= unitPrice) ? costPrice : (unitPrice * 0.78);
      return sum + itemUnitCost * item.quantity;
    }, 0);
    const expensesTotal = monthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const netProfit = revenue - (cogs + expensesTotal);
    const investorPoolRate = 25.0; // 25% of net profit
    const investorProfitPool = netProfit > 0 ? netProfit * (investorPoolRate / 100) : 0;

    // Check if period is already finalized
    const existingSettlement = await prisma.monthlySettlement.findUnique({
      where: {
        year_month: {
          year: targetYear,
          month: targetMonth,
        },
      },
      include: {
        investorProfits: true,
      },
    });

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const periodLabel = `${monthNames[targetMonth - 1]} ${targetYear}`;

    // Calculate investor-wise profit distribution for preview
    const distributionPreview = investorsWithShare.map(inv => {
      const share = inv.sharePercentage;
      const profitShare =
        existingSettlement && existingSettlement.status === 'FINALIZED'
          ? Number(existingSettlement.investorProfits.find(p => p.investorId === inv.id)?.profitShare || 0)
          : Math.round(investorProfitPool * (inv.totalInvestment / (totalActiveInvestment || 1)));

      return {
        investorId: inv.investorId,
        id: inv.id,
        name: inv.name,
        investmentAmount: inv.totalInvestment,
        sharePercentage: share,
        profitShare: Math.max(0, profitShare),
      };
    });

    // 4. Fetch all finalized settlements history
    const allSettlements = await prisma.monthlySettlement.findMany({
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
      include: {
        investorProfits: {
          include: {
            investor: {
              select: { investorId: true, name: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalActiveInvestment,
        investorPoolRate,
        investors: investorsWithShare,
        currentPreview: {
          year: targetYear,
          month: targetMonth,
          periodLabel,
          revenue: Math.round(revenue),
          cogs: Math.round(cogs),
          expenses: Math.round(expensesTotal),
          netProfit: Math.round(netProfit),
          investorProfitPool: Math.round(investorProfitPool),
          isFinalized: existingSettlement?.status === 'FINALIZED',
          finalizedAt: existingSettlement?.finalizedAt,
          finalizedBy: existingSettlement?.finalizedBy,
          distribution: distributionPreview,
        },
        settlements: allSettlements.map(s => ({
          id: s.id,
          year: s.year,
          month: s.month,
          periodLabel: s.periodLabel,
          revenue: Number(s.revenue),
          cogs: Number(s.cogs),
          expenses: Number(s.expenses),
          netProfit: Number(s.netProfit),
          investorPoolRate: Number(s.investorPoolRate),
          investorProfitPool: Number(s.investorProfitPool),
          totalActiveInvestment: Number(s.totalActiveInvestment),
          status: s.status,
          finalizedAt: s.finalizedAt,
          finalizedBy: s.finalizedBy,
          investorProfits: s.investorProfits.map(p => ({
            investorId: p.investor.investorId,
            name: p.investor.name,
            investmentAmount: Number(p.investmentAmount),
            sharePercentage: Number(p.sharePercentage),
            profitShare: Number(p.profitShare),
          })),
        })),
      },
    });
  } catch (err: any) {
    console.error('Admin investors GET error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireSuperAdmin(req);
  if (user instanceof NextResponse) return user;

  try {
    const body = await req.json();
    const { action } = body;

    // -----------------------------------------------------------------
    // ACTION 1: CREATE NEW INVESTOR ACCOUNT
    // -----------------------------------------------------------------
    if (action === 'create-investor') {
      const { name, email, phone, password, initialAmount, depositAccountId, notes, date, initialDate } = body;

      if (!name || !email || !password) {
        return NextResponse.json(
          { success: false, error: 'Name, email, and password are required.' },
          { status: 400 }
        );
      }

      // Check existing email
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'A user with this email address already exists.' },
          { status: 400 }
        );
      }

      // Generate Investor ID
      const count = await prisma.investor.count();
      const investorCode = `INV-${1001 + count}`;

      const branch = await prisma.branch.findFirst();
      const branchId = branch?.id || 'branch-main-1';

      // 1. Create User
      const newUser = await prisma.user.create({
        data: {
          id: `usr-${investorCode.toLowerCase()}-${Date.now().toString().slice(-4)}`,
          name,
          email: email.toLowerCase(),
          username: investorCode.toLowerCase(),
          role: 'INVESTOR',
          roleId: 'role-investor',
          branchId,
          primaryBranchId: branchId,
          allowedBranchIds: [branchId],
          phone: phone || null,
          passwordHash: hashPassword(password),
          status: 'ACTIVE',
        },
      });

      // 2. Create Investor Record
      const newInvestor = await prisma.investor.create({
        data: {
          id: `investor-${investorCode.toLowerCase()}`,
          investorId: investorCode,
          name,
          email: email.toLowerCase(),
          phone: phone || null,
          userId: newUser.id,
          notes: notes || null,
          status: 'ACTIVE',
        },
      });

      // 3. Create Initial Investment if provided
      const amount = Number(initialAmount || 0);
      if (amount > 0) {
        const invDate = date || initialDate ? new Date(date || initialDate) : new Date();
        let targetAccId = depositAccountId || 'acc-1';
        let account = await prisma.financialAccount.findFirst({
          where: { id: targetAccId },
        });

        if (!account) {
          account = await prisma.financialAccount.findFirst({
            where: { type: 'CASH' }
          });
        }
        
        targetAccId = account?.id || targetAccId;
        const targetAcc = await prisma.financialAccount.findUnique({ where: { id: targetAccId } });
        const investmentNumber = `INV-REF-${Date.now().toString().slice(-6)}`;
        const pMethod = targetAcc?.type === 'CASH' ? 'Cash' : 'Bank Transfer';

        await prisma.$transaction(async (tx) => {
          const inv = await tx.investment.create({
            data: {
              id: `inv-${Date.now()}`,
              referenceNumber: investmentNumber,
              investorName: name,
              amount,
              date: invDate,
              investmentType: 'EQUITY',
              depositAccountId: targetAccId,
              paymentMethod: pMethod,
              reference: `Initial Capital Injection (${investorCode})`,
              notes: notes || `Initial investment recorded for ${name}`,
              status: 'ACTIVE',
              createdBy: user.name,
              investorId: newInvestor.id,
            },
          });

          await recordAccountMovement(tx, {
            accountId: targetAccId,
            paymentMethod: pMethod,
            referenceType: 'INVESTMENT',
            referenceNumber: investmentNumber,
            amount,
            direction: 'INFLOW',
            description: `Capital investment received from ${name} (${investorCode})`,
            performedBy: user.name,
            relatedTransactionId: inv.id,
            date: invDate,
          });
        });
      }

      // Audit Log
      await prisma.auditLog.create({
        data: {
          id: `audit-${Date.now()}`,
          userId: user.id,
          userName: user.name,
          action: 'INVESTOR_CREATED',
          module: 'INVESTORS',
          recordId: newInvestor.id,
          details: `Created investor account ${investorCode} (${name}) with initial capital ৳${amount}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Investor ${name} (${investorCode}) created successfully.`,
        data: newInvestor,
      });
    }

    // -----------------------------------------------------------------
    // ACTION 2: ADD ADDITIONAL INVESTMENT TO EXISTING INVESTOR
    // -----------------------------------------------------------------
    if (action === 'add-investment') {
      const { investorId, amount, depositAccountId, paymentMethod, reference, notes, date } = body;

      const numAmount = Number(amount);
      if (!investorId || !numAmount || numAmount <= 0) {
        return NextResponse.json(
          { success: false, error: 'Valid investor and positive investment amount required.' },
          { status: 400 }
        );
      }

      const investor = await prisma.investor.findUnique({
        where: { id: investorId },
      });

      if (!investor) {
        return NextResponse.json({ success: false, error: 'Investor not found.' }, { status: 404 });
      }

      const invDate = date ? new Date(date) : new Date();

      let targetAccId = depositAccountId || 'acc-1';
      let account = await prisma.financialAccount.findFirst({
        where: { id: targetAccId },
      });

      if (!account) {
        account = await prisma.financialAccount.findFirst({
          where: { type: 'CASH' }
        });
      }
      
      targetAccId = account?.id || targetAccId;
      const targetAcc = await prisma.financialAccount.findUnique({ where: { id: targetAccId } });
      const investmentNumber = `INV-ADD-${Date.now().toString().slice(-6)}`;
      const pMethod = paymentMethod || (targetAcc?.type === 'CASH' ? 'Cash' : 'Bank Transfer');

      const investment = await prisma.$transaction(async (tx) => {
        const inv = await tx.investment.create({
          data: {
            id: `inv-${Date.now()}`,
            referenceNumber: investmentNumber,
            investorName: investor.name,
            amount: numAmount,
            date: invDate,
            investmentType: 'EQUITY',
            depositAccountId: targetAccId,
            paymentMethod: pMethod,
            reference: reference || `Additional Capital (${investor.investorId})`,
            notes: notes || `Additional capital injected by ${investor.name}`,
            status: 'ACTIVE',
            createdBy: user.name,
            investorId: investor.id,
          },
        });

        await recordAccountMovement(tx, {
          accountId: targetAccId,
          paymentMethod: pMethod,
          referenceType: 'INVESTMENT',
          referenceNumber: investmentNumber,
          amount: numAmount,
          direction: 'INFLOW',
          description: `Additional capital received from ${investor.name} (${investor.investorId})`,
          performedBy: user.name,
          relatedTransactionId: inv.id,
          date: invDate,
        });

        await tx.auditLog.create({
          data: {
            id: `audit-${Date.now()}`,
            userId: user.id,
            userName: user.name,
            action: 'INVESTMENT_ADDED',
            module: 'INVESTORS',
            recordId: inv.id,
            details: `Added capital ৳${numAmount} to investor ${investor.name} (${investor.investorId}) on ${invDate.toLocaleDateString()}`,
          },
        });

        return inv;
      });

      return NextResponse.json({
        success: true,
        message: `Successfully added ৳${numAmount.toLocaleString()} capital for ${investor.name}.`,
        data: investment,
      });
    }

    // -----------------------------------------------------------------
    // ACTION 2B: DELETE / REMOVE INVESTMENT
    // -----------------------------------------------------------------
    if (action === 'delete-investment') {
      const { investmentId, reason } = body;
      if (!investmentId) {
        return NextResponse.json({ success: false, error: 'Investment ID required.' }, { status: 400 });
      }

      const inv = await prisma.investment.findUnique({
        where: { id: investmentId },
      });

      if (!inv) {
        return NextResponse.json({ success: false, error: 'Investment record not found.' }, { status: 404 });
      }

      await prisma.$transaction(async (tx) => {
        const ledgerEntries = await tx.ledgerEntry.findMany({
          where: { referenceNumber: inv.referenceNumber, status: 'COMPLETED' },
        });

        if (ledgerEntries.length > 0) {
          await reverseTransaction(tx, {
            referenceNumber: inv.referenceNumber,
            reason: reason || 'Investment removed by administrator',
            performedBy: user.name || user.email || 'Admin',
          });
        }

        await tx.investment.delete({
          where: { id: investmentId },
        });

        await tx.auditLog.create({
          data: {
            id: `audit-${Date.now()}`,
            userId: user.id,
            userName: user.name,
            action: 'INVESTMENT_REMOVED',
            module: 'INVESTORS',
            recordId: investmentId,
            details: `Removed investment ${inv.referenceNumber} (৳${Number(inv.amount)}) for ${inv.investorName}: ${reason || 'Manual correction'}`,
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: `Investment ${inv.referenceNumber} removed successfully.`,
      });
    }

    // -----------------------------------------------------------------
    // ACTION 3: UPDATE INVESTOR STATUS OR PROFILE
    // -----------------------------------------------------------------
    if (action === 'update-investor') {
      const { investorId, name, phone, status, notes } = body;

      const investor = await prisma.investor.findUnique({
        where: { id: investorId },
        include: { user: true },
      });

      if (!investor) {
        return NextResponse.json({ success: false, error: 'Investor not found.' }, { status: 404 });
      }

      const updated = await prisma.investor.update({
        where: { id: investorId },
        data: {
          name: name || investor.name,
          phone: phone !== undefined ? phone : investor.phone,
          status: status || investor.status,
          notes: notes !== undefined ? notes : investor.notes,
        },
      });

      // Sync linked user status & name
      await prisma.user.update({
        where: { id: investor.userId },
        data: {
          name: name || investor.name,
          status: status || investor.status,
          active: status ? status === 'ACTIVE' : investor.user.active,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Investor ${updated.name} updated.`,
        data: updated,
      });
    }

    // -----------------------------------------------------------------
    // ACTION 4: FINALIZE MONTHLY PERIOD
    // -----------------------------------------------------------------
    if (action === 'finalize-month') {
      const { year, month } = body;
      const numYear = parseInt(year, 10);
      const numMonth = parseInt(month, 10);

      if (!numYear || !numMonth || numMonth < 1 || numMonth > 12) {
        return NextResponse.json({ success: false, error: 'Invalid year or month.' }, { status: 400 });
      }

      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      const periodLabel = `${monthNames[numMonth - 1]} ${numYear}`;

      const startOfMonth = new Date(numYear, numMonth - 1, 1);
      const endOfMonth = new Date(numYear, numMonth, 0, 23, 59, 59, 999);

      // 1. Calculate Real Financial Figures from ERP Data
      const [sales, saleItems, expenses] = await Promise.all([
        prisma.sale.findMany({
          where: {
            status: 'COMPLETED',
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          select: { grandTotal: true },
        }),
        prisma.saleItem.findMany({
          where: {
            sale: {
              status: 'COMPLETED',
              date: { gte: startOfMonth, lte: endOfMonth },
            },
          },
          select: { quantity: true, unitPrice: true, product: { select: { costPrice: true } } },
        }),
        prisma.expense.findMany({
          where: {
            date: { gte: startOfMonth, lte: endOfMonth },
          },
          select: { amount: true },
        }),
      ]);

      const revenue = sales.reduce((sum, s) => sum + Number(s.grandTotal), 0);
      const cogs = saleItems.reduce((sum, item) => {
        const costPrice = Number(item.product?.costPrice || 0);
        const unitPrice = Number(item.unitPrice || 0);
        const itemUnitCost = (costPrice > 0 && costPrice <= unitPrice) ? costPrice : (unitPrice * 0.78);
        return sum + itemUnitCost * item.quantity;
      }, 0);
      const expensesTotal = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

      const netProfit = revenue - (cogs + expensesTotal);
      const investorPoolRate = 25.0; // 25% of net profit
      const investorProfitPool = netProfit > 0 ? netProfit * (investorPoolRate / 100) : 0;

      // 2. Fetch Active Investors and Their Active Investments
      const activeInvestors = await prisma.investor.findMany({
        where: { status: 'ACTIVE' },
        include: {
          investments: {
            where: { status: 'ACTIVE' },
          },
        },
      });

      let totalActiveInvestment = 0;
      const investorAmounts = activeInvestors.map(inv => {
        const amt = inv.investments.reduce((sum, i) => sum + Number(i.amount), 0);
        totalActiveInvestment += amt;
        return {
          id: inv.id,
          investorId: inv.investorId,
          name: inv.name,
          amount: amt,
        };
      });

      const settlementId = `settle-${numYear}-${String(numMonth).padStart(2, '0')}`;

      // 3. Upsert Monthly Settlement
      const settlement = await prisma.monthlySettlement.upsert({
        where: {
          year_month: {
            year: numYear,
            month: numMonth,
          },
        },
        update: {
          periodLabel,
          revenue,
          cogs,
          expenses: expensesTotal,
          netProfit,
          investorPoolRate,
          investorProfitPool,
          totalActiveInvestment,
          status: 'FINALIZED',
          finalizedAt: new Date(),
          finalizedBy: user.email,
        },
        create: {
          id: settlementId,
          year: numYear,
          month: numMonth,
          periodLabel,
          revenue,
          cogs,
          expenses: expensesTotal,
          netProfit,
          investorPoolRate,
          investorProfitPool,
          totalActiveInvestment,
          status: 'FINALIZED',
          finalizedAt: new Date(),
          finalizedBy: user.email,
        },
      });

      // 4. Delete previous investor profit records for this settlement if updating
      await prisma.investorMonthlyProfit.deleteMany({
        where: { settlementId: settlement.id },
      });

      // 5. Create each active investor's profit record
      for (const inv of investorAmounts) {
        const sharePct = totalActiveInvestment > 0 ? (inv.amount / totalActiveInvestment) * 100 : 0;
        const profit =
          totalActiveInvestment > 0
            ? Math.round(investorProfitPool * (inv.amount / totalActiveInvestment))
            : 0;

        await prisma.investorMonthlyProfit.create({
          data: {
            id: `imp-${settlement.id}-${inv.id}`,
            settlementId: settlement.id,
            investorId: inv.id,
            investmentAmount: inv.amount,
            sharePercentage: sharePct,
            profitShare: Math.max(0, profit),
          },
        });
      }

      await prisma.auditLog.create({
        data: {
          id: `audit-${Date.now()}`,
          userId: user.id,
          userName: user.name,
          action: 'MONTHLY_PROFIT_FINALIZED',
          module: 'INVESTORS',
          recordId: settlement.id,
          details: `Finalized ${periodLabel}: Revenue ৳${revenue.toLocaleString()}, Expenses ৳${expensesTotal.toLocaleString()}, Net Profit ৳${netProfit.toLocaleString()}, 25% Pool ৳${investorProfitPool.toLocaleString()}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Financial period ${periodLabel} has been successfully finalized!`,
        data: settlement,
      });
    }

    // -----------------------------------------------------------------
    // ACTION 5: REOPEN PERIOD
    // -----------------------------------------------------------------
    if (action === 'reopen-month') {
      const { year, month } = body;
      const numYear = parseInt(year, 10);
      const numMonth = parseInt(month, 10);

      const settlement = await prisma.monthlySettlement.findUnique({
        where: { year_month: { year: numYear, month: numMonth } },
      });

      if (!settlement) {
        return NextResponse.json({ success: false, error: 'Settlement record not found.' }, { status: 404 });
      }

      await prisma.investorMonthlyProfit.deleteMany({
        where: { settlementId: settlement.id },
      });
      await prisma.monthlySettlement.delete({
        where: { id: settlement.id },
      });

      return NextResponse.json({
        success: true,
        message: `Settlement for ${settlement.periodLabel} has been reopened.`,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action.' }, { status: 400 });
  } catch (err: any) {
    console.error('Admin investors POST error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

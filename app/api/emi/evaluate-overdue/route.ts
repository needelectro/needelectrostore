// NEED ELECTRO ERP — Automated Overdue EMI Penalty Evaluation Engine
// Supports Vercel Cron Daily Execution (0 0 * * *) & Manual Admin Trigger
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

async function processOverdueEvaluation() {
  const now = new Date();
  
  // 1. Fetch all active EMI accounts with plans and installments
  const activeAccounts = await prisma.eMIAccount.findMany({
    where: { status: 'ACTIVE' },
    include: {
      installments: {
        where: {
          status: { in: ['UPCOMING', 'DUE_TODAY', 'OVERDUE'] },
        },
      },
    },
  });

  // Fetch active plans to map grace period and late fees
  const plans = await prisma.eMIPlan.findMany();
  const plansMap = new Map(plans.map((p) => [p.id, p]));

  let processedInstallments = 0;
  let newlyOverdueCount = 0;
  let totalPenaltyAccrued = 0;
  const flaggedAccountIds: string[] = [];

  // Execute in Prisma transaction
  await prisma.$transaction(async (tx) => {
    for (const account of activeAccounts) {
      // Find matching plan if available, or default
      const plan = account.durationMonths
        ? plans.find((p) => p.durationMonths === account.durationMonths)
        : null;

      const gracePeriodDays = plan?.gracePeriodDays ?? 5;
      const lateFeePerDay = Number(plan?.lateFeePerDay ?? 50);

      let accountHasOverdue = false;

      for (const inst of account.installments) {
        processedInstallments++;
        const dueDate = new Date(inst.dueDate);

        // Check if due date has arrived/passed
        const diffTime = now.getTime() - dueDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > gracePeriodDays) {
          // Beyond grace period -> OVERDUE
          const overdueDays = diffDays - gracePeriodDays;
          const calculatedPenalty = overdueDays * lateFeePerDay;

          if (inst.status !== 'OVERDUE' || Number(inst.penaltyAmount) !== calculatedPenalty) {
            await tx.eMIInstallment.update({
              where: { id: inst.id },
              data: {
                status: 'OVERDUE',
                penaltyAmount: new Prisma.Decimal(calculatedPenalty),
              },
            });

            if (inst.status !== 'OVERDUE') {
              newlyOverdueCount++;
            }
            totalPenaltyAccrued += (calculatedPenalty - Number(inst.penaltyAmount));
          }
          accountHasOverdue = true;
        } else if (diffDays >= 0 && diffDays <= gracePeriodDays) {
          // Due today or within grace period
          if (inst.status === 'UPCOMING') {
            await tx.eMIInstallment.update({
              where: { id: inst.id },
              data: { status: 'DUE_TODAY' },
            });
          }
        }
      }

      if (accountHasOverdue) {
        flaggedAccountIds.push(account.id);
      }
    }

    // Record system audit log
    await tx.auditLog.create({
      data: {
        id: 'audit-cron-' + Date.now(),
        timestamp: now,
        userId: 'system-worker',
        userName: 'EMI Automated Penalty Worker',
        action: 'EMI_OVERDUE_EVALUATION',
        module: 'EMI',
        recordId: 'cron-daily',
        details: `Automated audit: evaluated ${processedInstallments} installments across ${activeAccounts.length} accounts. Newly overdue: ${newlyOverdueCount}. Additional penalty accrued: ৳${totalPenaltyAccrued}.`,
      },
    });
  });

  return {
    success: true,
    message: 'Overdue EMI penalty evaluation completed successfully.',
    data: {
      timestamp: now.toISOString(),
      activeAccountsEvaluated: activeAccounts.length,
      processedInstallments,
      newlyOverdueCount,
      totalPenaltyAccrued,
      flaggedAccountsCount: flaggedAccountIds.length,
    },
  };
}

// Vercel Cron Trigger (GET)
export async function GET(req: NextRequest) {
  try {
    // Check optional Vercel CRON authorization header
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // Also allow authenticated session user
      const user = await authenticateRequest(req);
      if (!user) {
        return NextResponse.json({ success: false, error: 'Unauthorized cron access' }, { status: 401 });
      }
    }

    const result = await processOverdueEvaluation();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('EMI Overdue Cron Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Evaluation process failed' },
      { status: 500 }
    );
  }
}

// Manual Admin Trigger from ERP Dashboard (POST)
export async function POST(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const result = await processOverdueEvaluation();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('EMI Overdue Manual Trigger Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Evaluation process failed' },
      { status: 500 }
    );
  }
}

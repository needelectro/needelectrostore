// NEED ELECTRO ERP — EMI Plans Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const plans = await prisma.eMIPlan.findMany({
    orderBy: { durationMonths: 'asc' },
  });

  return NextResponse.json({ success: true, data: plans });
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'emi', 'edit') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const plan = await req.json();

  if (plan.id) {
    // Update existing plan (version incremented; existing customer contracts remain unaffected)
    await prisma.eMIPlan.update({
      where: { id: plan.id },
      data: {
        name: plan.name,
        durationMonths: Number(plan.durationMonths),
        minDownPaymentPercent: new Prisma.Decimal(plan.minDownPaymentPercent || 20),
        interestRatePercent: new Prisma.Decimal(plan.interestRatePercent || 0),
        processingFee: new Prisma.Decimal(plan.processingFee || 0),
        lateFeePerDay: new Prisma.Decimal(plan.lateFeePerDay || 50),
        gracePeriodDays: Number(plan.gracePeriodDays || 5),
        isActive: plan.isActive !== undefined ? plan.isActive : true,
        version: { increment: 1 },
        description: plan.description,
        eligibilityRules: plan.eligibilityRules,
        termsText: plan.termsText,
      },
    });

    return NextResponse.json({ success: true, message: 'EMI Plan updated successfully' });
  }

  // Create new plan
  const newPlan = await prisma.eMIPlan.create({
    data: {
      id: 'plan-' + Date.now(),
      name: plan.name,
      durationMonths: Number(plan.durationMonths),
      minDownPaymentPercent: new Prisma.Decimal(plan.minDownPaymentPercent || 20),
      interestRatePercent: new Prisma.Decimal(plan.interestRatePercent || 0),
      processingFee: new Prisma.Decimal(plan.processingFee || 0),
      lateFeePerDay: new Prisma.Decimal(plan.lateFeePerDay || 50),
      gracePeriodDays: Number(plan.gracePeriodDays || 5),
      isActive: true,
      version: 1,
      description: plan.description,
      eligibilityRules: plan.eligibilityRules,
      termsText: plan.termsText,
    },
  });

  return NextResponse.json({ success: true, message: 'EMI Plan created', plan: newPlan });
}

// NEED ELECTRO ERP — EMI Plans Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';

const DEFAULT_EMI_PLANS = [
  {
    id: 'emi-plan-3m',
    name: '3 Months Quick Tech Plan',
    durationMonths: 3,
    minDownPaymentPercent: new Prisma.Decimal(30),
    interestRatePercent: new Prisma.Decimal(0),
    processingFee: new Prisma.Decimal(300),
    lateFeePerDay: new Prisma.Decimal(50),
    gracePeriodDays: 5,
    isActive: true,
    version: 1,
    description: 'Short 3-month plan with 30% down payment and 0% interest.',
    eligibilityRules: 'Requires National ID & verified local guarantor.',
    termsText: 'Default beyond 15 days results in hardware warranty suspension.'
  },
  {
    id: 'emi-plan-6m',
    name: '6 Months Popular Laptop Plan',
    durationMonths: 6,
    minDownPaymentPercent: new Prisma.Decimal(25),
    interestRatePercent: new Prisma.Decimal(0),
    processingFee: new Prisma.Decimal(500),
    lateFeePerDay: new Prisma.Decimal(50),
    gracePeriodDays: 5,
    isActive: true,
    version: 1,
    description: 'Standard 6-month laptop financing with 0% interest.',
    eligibilityRules: 'Original NID copy, utility bill, and one verified guarantor.',
    termsText: 'Monthly installment due within 10th of every calendar month.'
  },
  {
    id: 'emi-plan-9m',
    name: '9 Months Easy Installment',
    durationMonths: 9,
    minDownPaymentPercent: new Prisma.Decimal(20),
    interestRatePercent: new Prisma.Decimal(2),
    processingFee: new Prisma.Decimal(800),
    lateFeePerDay: new Prisma.Decimal(50),
    gracePeriodDays: 7,
    isActive: true,
    version: 1,
    description: 'Extended 9-month plan with flexible low monthly payments.',
    eligibilityRules: 'Valid trade license or employee salary slip required.',
    termsText: 'Hardware warranty remains valid subject to regular installment payments.'
  },
  {
    id: 'emi-plan-12m',
    name: '12 Months Enterprise Student/Pro Plan',
    durationMonths: 12,
    minDownPaymentPercent: new Prisma.Decimal(20),
    interestRatePercent: new Prisma.Decimal(4),
    processingFee: new Prisma.Decimal(1000),
    lateFeePerDay: new Prisma.Decimal(50),
    gracePeriodDays: 7,
    isActive: true,
    version: 1,
    description: 'Annual 12-month installment plan for students and professionals.',
    eligibilityRules: 'Strict background verification with two local guarantors.',
    termsText: 'Ownership transfer completed upon payment of final installment receipt.'
  }
];

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(req.url);
  const shouldReset = searchParams.get('reset') === 'true';

  let plans = await prisma.eMIPlan.findMany({
    orderBy: { durationMonths: 'asc' },
  });

  // If table is empty or admin specifically requested reset, seed default plans
  if (plans.length === 0 || shouldReset) {
    for (const dp of DEFAULT_EMI_PLANS) {
      await prisma.eMIPlan.upsert({
        where: { id: dp.id },
        update: dp,
        create: dp,
      });
    }

    plans = await prisma.eMIPlan.findMany({
      orderBy: { durationMonths: 'asc' },
    });
  }

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
    const existing = await prisma.eMIPlan.findUnique({ where: { id: plan.id } });
    if (existing) {
      // Update existing plan (version incremented; existing customer contracts remain unaffected)
      const updated = await prisma.eMIPlan.update({
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
          description: plan.description || '',
          eligibilityRules: plan.eligibilityRules || '',
          termsText: plan.termsText || '',
        },
      });

      return NextResponse.json({ success: true, message: 'EMI Plan updated successfully', plan: updated });
    }
  }

  // Create new plan
  const planId = plan.id || ('emi-plan-' + Date.now().toString().slice(-6));
  const newPlan = await prisma.eMIPlan.create({
    data: {
      id: planId,
      name: plan.name,
      durationMonths: Number(plan.durationMonths),
      minDownPaymentPercent: new Prisma.Decimal(plan.minDownPaymentPercent || 20),
      interestRatePercent: new Prisma.Decimal(plan.interestRatePercent || 0),
      processingFee: new Prisma.Decimal(plan.processingFee || 0),
      lateFeePerDay: new Prisma.Decimal(plan.lateFeePerDay || 50),
      gracePeriodDays: Number(plan.gracePeriodDays || 5),
      isActive: plan.isActive !== undefined ? Boolean(plan.isActive) : true,
      version: 1,
      description: plan.description || '',
      eligibilityRules: plan.eligibilityRules || '',
      termsText: plan.termsText || '',
    },
  });

  return NextResponse.json({ success: true, message: 'EMI Plan created', plan: newPlan });
}

export async function DELETE(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'emi', 'edit') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ success: false, error: 'Plan ID is required' }, { status: 400 });
  }

  // Soft-delete: mark inactive so existing contracts referencing it remain consistent
  await prisma.eMIPlan.update({
    where: { id },
    data: { isActive: false },
  });

  return NextResponse.json({ success: true, message: 'EMI Plan deactivated successfully' });
}

// NEED ELECTRO ERP — Customers CRM Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { customerSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');

  const where: any = {};
  if (query) {
    where.OR = [
      { name: { contains: query, mode: 'insensitive' } },
      { phone: { contains: query } },
      { customerId: { contains: query, mode: 'insensitive' } },
      { nid: { contains: query } },
    ];
  }

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return NextResponse.json({ success: true, data: customers });
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'customers', 'create') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = customerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
  }

  const data = parsed.data;

  // Check phone uniqueness
  const existing = await prisma.customer.findFirst({ where: { phone: data.phone } });
  if (existing) {
    return NextResponse.json({ success: false, error: `Customer with phone ${data.phone} already exists (${existing.name}).` }, { status: 400 });
  }

  const customerId = data.customerId || ('CUST-' + Date.now().toString().slice(-6));

  const customer = await prisma.customer.create({
    data: {
      id: 'cust-' + Date.now(),
      customerId,
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      address: data.address || null,
      nid: data.nid || null,
      guarantor: data.guarantor || {},
      creditLimit: new Prisma.Decimal(data.creditLimit || 0),
      currentBalance: new Prisma.Decimal(0),
      notes: data.notes || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      id: 'audit-' + Date.now(),
      userId: user.id,
      userName: user.name,
      action: 'CUSTOMER_CREATED',
      module: 'CUSTOMERS',
      recordId: customer.id,
      details: `Created customer ${customer.name} (${customer.phone})`,
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Customer created successfully.',
    customer,
  });
}

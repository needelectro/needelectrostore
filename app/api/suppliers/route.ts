// NEED ELECTRO ERP — Suppliers Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const suppliers = await prisma.supplier.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: suppliers });
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'suppliers', 'create') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const { name, company, phone, email, address, category, openingBalance, code, representative, contactBy } = await req.json();

  if (!name || !company) {
    return NextResponse.json({ success: false, error: 'Name and Company are required' }, { status: 400 });
  }

  const supplier = await prisma.supplier.create({
    data: {
      id: 'sup-' + Date.now(),
      name,
      company,
      code,
      representative,
      contactBy,
      phone,
      email,
      address,
      category,
      openingBalance: new Prisma.Decimal(openingBalance || 0),
      currentPayable: new Prisma.Decimal(openingBalance || 0),
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Supplier created successfully',
    supplierId: supplier.id,
  });
}

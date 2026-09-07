// NEED ELECTRO ERP — Branch Creation Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const admin = await requireSuperAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { name, code, address, phone, email, isWarehouse } = await req.json();

  if (!name || !code) {
    return NextResponse.json({ success: false, error: 'Branch name and code are required' }, { status: 400 });
  }

  const normalizedCode = code.toUpperCase().trim();
  const existing = await prisma.branch.findUnique({ where: { code: normalizedCode } });
  if (existing) {
    return NextResponse.json({ success: false, error: 'Branch code already exists' }, { status: 400 });
  }

  const branch = await prisma.branch.create({
    data: {
      id: 'branch-' + Date.now(),
      name,
      code: normalizedCode,
      address,
      phone,
      email,
      isWarehouse: Boolean(isWarehouse),
      active: true,
    },
  });

  return NextResponse.json({ success: true, message: 'Branch created successfully', branchId: branch.id });
}

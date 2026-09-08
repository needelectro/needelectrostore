// NEED ELECTRO ERP — Branch Creation & Retrieval Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ success: true, branches });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Admin privileges required' }, { status: 403 });
  }

  const { name, code, address, phone, email, isWarehouse } = await req.json();

  if (!name?.trim() || !code?.trim()) {
    return NextResponse.json({ success: false, error: 'Branch name and code are required' }, { status: 400 });
  }

  const normalizedCode = code.toUpperCase().trim();
  const existing = await prisma.branch.findUnique({ where: { code: normalizedCode } });
  if (existing) {
    return NextResponse.json({ success: false, error: `Branch code '${normalizedCode}' already exists.` }, { status: 400 });
  }

  const branch = await prisma.branch.create({
    data: {
      id: 'branch-' + Date.now(),
      name: name.trim(),
      code: normalizedCode,
      address: address?.trim() || '',
      phone: phone?.trim() || '',
      email: email?.trim() || '',
      isWarehouse: Boolean(isWarehouse),
      active: true,
    },
  });

  return NextResponse.json({ 
    success: true, 
    message: 'Branch created successfully', 
    branchId: branch.id,
    branch 
  });
}

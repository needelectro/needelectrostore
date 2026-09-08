// NEED ELECTRO ERP — Branch Update & Delete Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Admin privileges required' }, { status: 403 });
  }

  const { id } = params;
  const { name, code, address, phone, email, isWarehouse, active } = await req.json();

  if (!name?.trim() || !code?.trim()) {
    return NextResponse.json({ success: false, error: 'Branch name and code are required' }, { status: 400 });
  }

  const normalizedCode = code.toUpperCase().trim();

  // Check code uniqueness across other branches
  const conflicting = await prisma.branch.findFirst({
    where: {
      code: normalizedCode,
      NOT: { id }
    }
  });

  if (conflicting) {
    return NextResponse.json({ success: false, error: `Branch code '${normalizedCode}' is already taken.` }, { status: 400 });
  }

  const updatedBranch = await prisma.branch.update({
    where: { id },
    data: {
      name: name.trim(),
      code: normalizedCode,
      address: address?.trim() || '',
      phone: phone?.trim() || '',
      email: email?.trim() || '',
      isWarehouse: Boolean(isWarehouse),
      active: active !== undefined ? Boolean(active) : true,
    }
  });

  return NextResponse.json({
    success: true,
    message: 'Branch updated successfully',
    branch: updatedBranch
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Admin privileges required' }, { status: 403 });
  }

  const { id } = params;

  const branch = await prisma.branch.findUnique({ where: { id } });
  if (!branch) {
    return NextResponse.json({ success: false, error: 'Branch not found' }, { status: 404 });
  }

  // Safety check: verify if any transactions or serials belong to this branch
  const salesCount = await prisma.sale.count({ where: { branchId: id } });
  const purchasesCount = await prisma.purchase.count({ where: { branchId: id } });
  const serialsCount = await prisma.productSerial.count({ where: { branchId: id } });

  if (salesCount > 0 || purchasesCount > 0 || serialsCount > 0) {
    return NextResponse.json({
      success: false,
      error: `Cannot delete branch '${branch.name}'. It contains active records (${salesCount} sales, ${purchasesCount} purchases, ${serialsCount} serials). Deactivate it instead.`
    }, { status: 400 });
  }

  // Unassign users who were linked to this branch
  await prisma.user.updateMany({
    where: { branchId: id },
    data: { branchId: null }
  });

  // Delete the branch
  await prisma.branch.delete({ where: { id } });

  return NextResponse.json({
    success: true,
    message: `Branch '${branch.name}' (${branch.code}) deleted successfully.`
  });
}

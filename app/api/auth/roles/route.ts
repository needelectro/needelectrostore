// NEED ELECTRO ERP — Roles Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const roles = await prisma.role.findMany({
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ success: true, data: roles });
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'roles', 'create') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const { name, code, description, permissions } = await req.json();
  if (!name || !code) {
    return NextResponse.json({ success: false, error: 'Name and Code are required' }, { status: 400 });
  }

  const normalizedCode = code.toUpperCase().replace(/[^A-Z0-9_]/g, '_');
  const existing = await prisma.role.findUnique({ where: { code: normalizedCode } });
  if (existing) {
    return NextResponse.json({ success: false, error: 'Role code already exists' }, { status: 400 });
  }

  const role = await prisma.role.create({
    data: {
      id: 'role-' + Date.now(),
      name,
      code: normalizedCode,
      description,
      permissions: permissions || [],
      isSystem: false,
      isActive: true,
    },
  });

  return NextResponse.json({ success: true, message: 'Role created', roleId: role.id });
}

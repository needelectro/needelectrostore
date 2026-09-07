// NEED ELECTRO ERP — User Status Management Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'users', 'edit') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const { status } = await req.json();
  if (!['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING'].includes(status)) {
    return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  if (target.role === 'SUPER_ADMIN' && status !== 'ACTIVE') {
    return NextResponse.json({ success: false, error: 'Cannot deactivate Super Admin' }, { status: 403 });
  }

  await prisma.user.update({
    where: { id: params.id },
    data: {
      status,
      active: status === 'ACTIVE',
    },
  });

  // If suspended or inactive, revoke active sessions
  if (status !== 'ACTIVE') {
    await prisma.session.updateMany({
      where: { userId: params.id },
      data: { isRevoked: true },
    });
  }

  await prisma.auditLog.create({
    data: {
      id: 'audit-' + Date.now(),
      userId: user.id,
      userName: user.name,
      action: 'USER_STATUS_CHANGE',
      module: 'USERS',
      recordId: target.id,
      details: `Changed status of ${target.name} to ${status}`,
    },
  });

  return NextResponse.json({ success: true, message: `User status changed to ${status}` });
}

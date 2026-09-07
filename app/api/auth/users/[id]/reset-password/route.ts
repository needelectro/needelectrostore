// NEED ELECTRO ERP — User Password Reset Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission, hashPassword } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'users', 'edit') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const { newPassword } = await req.json();
  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ success: false, error: 'Password must be at least 6 characters' }, { status: 400 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) {
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: params.id },
    data: {
      passwordHash: hashPassword(newPassword),
      mustChangePassword: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  // Revoke previous sessions
  await prisma.session.updateMany({
    where: { userId: params.id },
    data: { isRevoked: true },
  });

  await prisma.auditLog.create({
    data: {
      id: 'audit-' + Date.now(),
      userId: user.id,
      userName: user.name,
      action: 'PASSWORD_RESET',
      module: 'USERS',
      recordId: target.id,
      details: `Administrative password reset performed for ${target.name}`,
    },
  });

  return NextResponse.json({ success: true, message: 'Password reset successfully' });
}

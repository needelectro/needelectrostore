// NEED ELECTRO ERP — Audit Logs Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'audit', 'view') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const moduleName = searchParams.get('module');

  const where: any = {};
  if (moduleName && moduleName !== 'ALL') where.module = moduleName;

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: 300,
  });

  return NextResponse.json({ success: true, data: logs });
}

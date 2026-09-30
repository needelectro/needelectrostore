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
  const action = searchParams.get('action');
  const userId = searchParams.get('userId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const search = searchParams.get('search');
  const limitParam = searchParams.get('limit');

  const where: any = {};
  if (moduleName && moduleName !== 'ALL') where.module = moduleName;
  if (action && action !== 'ALL') where.action = action;
  if (userId) where.userId = userId;

  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) {
      where.timestamp.gte = new Date(startDate);
    }
    if (endDate) {
      where.timestamp.lte = new Date(endDate);
    }
  }

  if (search) {
    where.OR = [
      { userName: { contains: search, mode: 'insensitive' } },
      { details: { contains: search, mode: 'insensitive' } },
      { recordId: { contains: search, mode: 'insensitive' } },
    ];
  }

  const take = limitParam ? Math.min(Number(limitParam) || 300, 1000) : 300;

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take,
  });

  return NextResponse.json({ success: true, data: logs });
}

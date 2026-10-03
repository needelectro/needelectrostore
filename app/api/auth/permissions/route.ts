// NEED ELECTRO ERP — System Permissions Listing Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { SYSTEM_PERMISSIONS } from '@/app/api/admin/database/seed-permissions/route';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  let permissions = await prisma.permission.findMany({
    orderBy: [{ module: 'asc' }, { action: 'asc' }],
  });

  if (permissions.length === 0) {
    for (const p of SYSTEM_PERMISSIONS) {
      await prisma.permission.upsert({
        where: { id: p.id },
        update: p,
        create: p,
      });
    }
    permissions = await prisma.permission.findMany({
      orderBy: [{ module: 'asc' }, { action: 'asc' }],
    });
  }

  return NextResponse.json({ success: true, data: permissions });
}


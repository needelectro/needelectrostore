// NEED ELECTRO ERP — Seed & Sync System Permissions Route
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

import { SYSTEM_PERMISSIONS } from '@/lib/permissions';

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Super Admin clearance required.' }, { status: 403 });
  }

  try {
    for (const p of SYSTEM_PERMISSIONS) {
      await prisma.permission.upsert({
        where: { id: p.id },
        update: {
          module: p.module,
          action: p.action,
          label: p.label,
          description: p.description,
          isSensitive: p.isSensitive,
        },
        create: {
          id: p.id,
          module: p.module,
          action: p.action,
          label: p.label,
          description: p.description,
          isSensitive: p.isSensitive,
        },
      });
    }

    const count = await prisma.permission.count();

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${count} system permissions in PostgreSQL database.`,
      count,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'Failed to seed permissions.',
    }, { status: 500 });
  }
}

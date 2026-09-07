// NEED ELECTRO ERP — Database Backup List Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const admin = await requireSuperAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const backups = await prisma.databaseBackup.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    success: true,
    data: backups.map((b) => ({
      id: b.id,
      filename: b.filename,
      sizeBytes: Number(b.sizeBytes),
      createdAt: b.createdAt.toISOString(),
      createdBy: b.createdBy,
      description: b.description,
    })),
  });
}

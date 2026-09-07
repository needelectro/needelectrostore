// NEED ELECTRO ERP — Category Delete Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await requireSuperAdmin(req);
  if (admin instanceof NextResponse) return admin;

  await prisma.categoryConfig.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true, message: 'Category deleted successfully' });
}

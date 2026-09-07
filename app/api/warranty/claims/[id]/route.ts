// NEED ELECTRO ERP — Warranty Claim Resolution Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'warranty', 'edit') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const { status, resolutionNotes } = await req.json();

  await prisma.warrantyClaim.update({
    where: { id: params.id },
    data: {
      status,
      resolutionNotes,
      resolvedDate: status === 'RESOLVED' ? new Date() : null,
    },
  });

  return NextResponse.json({ success: true, message: 'Claim updated successfully' });
}

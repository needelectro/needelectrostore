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

  if (!hasPermission(user, 'warranty', 'edit') && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied. Only Super Admin or Admin can delete warranty claims.' }, { status: 403 });
  }

  try {
    const claim = await prisma.warrantyClaim.findUnique({ where: { id: params.id } });
    if (!claim) {
      return NextResponse.json({ success: false, error: 'Claim not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.warrantyClaim.delete({ where: { id: params.id } });

      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'SUPER_ADMIN_WARRANTY_DELETE',
          module: 'WARRANTY',
          recordId: claim.id,
          details: `Super Admin ${user.name} deleted Warranty Claim ${claim.claimNumber} (Customer: ${claim.customerName})`,
        },
      });
    });

    return NextResponse.json({ success: true, message: `Claim ${claim.claimNumber} deleted successfully.` });
  } catch (err: any) {
    console.error('Claim deletion error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

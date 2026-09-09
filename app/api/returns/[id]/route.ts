// NEED ELECTRO ERP — Super Admin Return Master Update & Delete Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'sales', 'return') && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const ret = await prisma.productReturn.findUnique({ where: { id: params.id } });
    if (!ret) {
      return NextResponse.json({ success: false, error: 'Return record not found' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const r = await tx.productReturn.update({
        where: { id: params.id },
        data: {
          ...(body.returnType && { returnType: body.returnType }),
          ...(body.reason !== undefined && { reason: body.reason }),
          ...(body.totalRefundAmount !== undefined && { totalRefundAmount: new Prisma.Decimal(body.totalRefundAmount) }),
          ...(body.refundMethod && { refundMethod: body.refundMethod }),
          ...(body.notes !== undefined && { notes: body.notes }),
          ...(body.customerName && { customerName: body.customerName }),
          ...(body.customerPhone && { customerPhone: body.customerPhone }),
        },
      });

      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'SUPER_ADMIN_RETURN_UPDATE',
          module: 'RETURNS',
          recordId: r.id,
          details: `Super Admin ${user.name} modified Return ${r.returnNumber} (Refund: ${r.totalRefundAmount})`,
        },
      });

      return r;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error('Return update error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied. Only Super Admin or Admin can delete return records.' }, { status: 403 });
  }

  try {
    const ret = await prisma.productReturn.findUnique({ where: { id: params.id } });
    if (!ret) {
      return NextResponse.json({ success: false, error: 'Return record not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.productReturn.delete({ where: { id: params.id } });

      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'SUPER_ADMIN_RETURN_DELETE',
          module: 'RETURNS',
          recordId: ret.id,
          details: `Super Admin ${user.name} deleted Return ${ret.returnNumber} (Refund: ${ret.totalRefundAmount}, Customer: ${ret.customerName})`,
        },
      });
    });

    return NextResponse.json({ success: true, message: `Return ${ret.returnNumber} deleted successfully.` });
  } catch (err: any) {
    console.error('Return deletion error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

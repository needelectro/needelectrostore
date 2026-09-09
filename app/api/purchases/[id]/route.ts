// NEED ELECTRO ERP — Super Admin Purchase Master Update & Delete Handler
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

  if (!hasPermission(user, 'purchases', 'edit') && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const purchase = await prisma.purchase.findUnique({ where: { id: params.id } });
    if (!purchase) {
      return NextResponse.json({ success: false, error: 'Purchase record not found' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.purchase.update({
        where: { id: params.id },
        data: {
          ...(body.invoiceNumber && { invoiceNumber: body.invoiceNumber }),
          ...(body.supplierId && { supplierId: body.supplierId }),
          ...(body.supplierName && { supplierName: body.supplierName }),
          ...(body.date && { date: new Date(body.date) }),
          ...(body.subtotal !== undefined && { subtotal: new Prisma.Decimal(body.subtotal) }),
          ...(body.discount !== undefined && { discount: new Prisma.Decimal(body.discount) }),
          ...(body.tax !== undefined && { tax: new Prisma.Decimal(body.tax) }),
          ...(body.total !== undefined && { total: new Prisma.Decimal(body.total) }),
          ...(body.paidAmount !== undefined && { paidAmount: new Prisma.Decimal(body.paidAmount) }),
          ...(body.dueAmount !== undefined && { dueAmount: new Prisma.Decimal(body.dueAmount) }),
          ...(body.paymentMethod && { paymentMethod: body.paymentMethod }),
          ...(body.notes !== undefined && { notes: body.notes }),
        },
        include: { items: true },
      });

      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'SUPER_ADMIN_PURCHASE_UPDATE',
          module: 'PURCHASES',
          recordId: p.id,
          details: `Super Admin ${user.name} modified Purchase ${p.invoiceNumber} (Supplier: ${p.supplierName}, Total: ${p.total})`,
        },
      });

      return p;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error('Purchase update error:', err);
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
    return NextResponse.json({ success: false, error: 'Access denied. Only Super Admin or Admin can delete purchases.' }, { status: 403 });
  }

  try {
    const purchase = await prisma.purchase.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!purchase) {
      return NextResponse.json({ success: false, error: 'Purchase record not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete purchase items
      await tx.purchaseItem.deleteMany({
        where: { purchaseId: purchase.id },
      });

      // 2. Delete purchase
      await tx.purchase.delete({
        where: { id: purchase.id },
      });

      // 3. Audit trail
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'SUPER_ADMIN_PURCHASE_DELETE',
          module: 'PURCHASES',
          recordId: purchase.id,
          details: `Super Admin ${user.name} deleted Purchase ${purchase.invoiceNumber} (Supplier: ${purchase.supplierName}, Total: ${purchase.total})`,
        },
      });
    });

    return NextResponse.json({ success: true, message: `Purchase ${purchase.invoiceNumber} deleted successfully.` });
  } catch (err: any) {
    console.error('Purchase deletion error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

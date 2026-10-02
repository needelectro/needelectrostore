// NEED ELECTRO ERP — Super Admin Supplier Master Update & Delete Handler
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

  if (!hasPermission(user, 'suppliers', 'edit') && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const supplier = await prisma.supplier.findUnique({ where: { id: params.id } });
    if (!supplier) {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const s = await tx.supplier.update({
        where: { id: params.id },
        data: {
          ...(body.name && { name: body.name }),
          ...(body.company && { company: body.company }),
          ...(body.code !== undefined && { code: body.code }),
          ...(body.representative !== undefined && { representative: body.representative }),
          ...(body.contactBy !== undefined && { contactBy: body.contactBy }),
          ...(body.phone !== undefined && { phone: body.phone }),
          ...(body.email !== undefined && { email: body.email }),
          ...(body.address !== undefined && { address: body.address }),
          ...(body.category !== undefined && { category: body.category }),
          ...(body.openingBalance !== undefined && { openingBalance: new Prisma.Decimal(body.openingBalance) }),
          ...(body.currentPayable !== undefined && { currentPayable: new Prisma.Decimal(body.currentPayable) }),
        },
      });

      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'SUPER_ADMIN_SUPPLIER_UPDATE',
          module: 'SUPPLIERS',
          recordId: s.id,
          details: `Super Admin ${user.name} modified Supplier ${s.name} (${s.company})`,
        },
      });

      return s;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error('Supplier update error:', err);
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
    return NextResponse.json({ success: false, error: 'Access denied. Only Super Admin or Admin can delete suppliers.' }, { status: 403 });
  }

  try {
    const supplier = await prisma.supplier.findUnique({ where: { id: params.id } });
    if (!supplier) {
      return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.supplierPayment.deleteMany({ where: { supplierId: supplier.id } });
      await tx.supplier.delete({ where: { id: params.id } });

      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'SUPER_ADMIN_SUPPLIER_DELETE',
          module: 'SUPPLIERS',
          recordId: supplier.id,
          details: `Super Admin ${user.name} deleted Supplier ${supplier.name} (${supplier.company})`,
        },
      });
    });

    return NextResponse.json({ success: true, message: `Supplier ${supplier.name} deleted successfully.` });
  } catch (err: any) {
    console.error('Supplier deletion error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

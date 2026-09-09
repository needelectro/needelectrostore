// NEED ELECTRO ERP — Customer Individual Route Handler
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

  if (!hasPermission(user, 'customers', 'edit') && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const updates = await req.json();

  const customer = await prisma.customer.findUnique({ where: { id: params.id } });
  if (!customer) {
    return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
  }

  await prisma.customer.update({
    where: { id: params.id },
    data: {
      ...(updates.name && { name: updates.name }),
      ...(updates.phone && { phone: updates.phone }),
      ...(updates.email !== undefined && { email: updates.email }),
      ...(updates.address !== undefined && { address: updates.address }),
      ...(updates.nid !== undefined && { nid: updates.nid }),
      ...(updates.guarantor && { guarantor: updates.guarantor }),
      ...(updates.notes !== undefined && { notes: updates.notes }),
      ...(updates.creditLimit !== undefined && { creditLimit: new Prisma.Decimal(updates.creditLimit) }),
    },
  });

  return NextResponse.json({ success: true, message: 'Customer updated successfully' });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied. Only Super Admin or Admin can delete customers.' }, { status: 403 });
  }

  try {
    const customer = await prisma.customer.findUnique({ where: { id: params.id } });
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.customer.delete({ where: { id: params.id } });

      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'SUPER_ADMIN_CUSTOMER_DELETE',
          module: 'CUSTOMERS',
          recordId: customer.id,
          details: `Super Admin ${user.name} deleted Customer ${customer.name} (${customer.phone})`,
        },
      });
    });

    return NextResponse.json({ success: true, message: `Customer ${customer.name} deleted successfully.` });
  } catch (err: any) {
    console.error('Customer deletion error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// NEED ELECTRO ERP — Super Admin Sale Master Update & Delete Handler
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

  if (!hasPermission(user, 'sales', 'edit') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied. Requires Super Admin or Sales Edit permission.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const existing = await prisma.sale.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Sale record not found' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const sale = await tx.sale.update({
        where: { id: params.id },
        data: {
          ...(body.invoiceNumber && { invoiceNumber: body.invoiceNumber }),
          ...(body.customerName && { customerName: body.customerName }),
          ...(body.customerPhone && { customerPhone: body.customerPhone }),
          ...(body.customerId && { customerId: body.customerId }),
          ...(body.branchId && { branchId: body.branchId }),
          ...(body.date && { date: new Date(body.date) }),
          ...(body.subtotal !== undefined && { subtotal: new Prisma.Decimal(body.subtotal) }),
          ...(body.overallDiscount !== undefined && { overallDiscount: new Prisma.Decimal(body.overallDiscount) }),
          ...(body.vatAmount !== undefined && { vatAmount: new Prisma.Decimal(body.vatAmount) }),
          ...(body.grandTotal !== undefined && { grandTotal: new Prisma.Decimal(body.grandTotal) }),
          ...(body.paidAmount !== undefined && { paidAmount: new Prisma.Decimal(body.paidAmount) }),
          ...(body.dueAmount !== undefined && { dueAmount: new Prisma.Decimal(body.dueAmount) }),
          ...(body.status && { status: body.status }),
          ...(body.saleType && { saleType: body.saleType }),
          ...(body.salespersonName !== undefined && { salespersonName: body.salespersonName }),
          ...(body.notes !== undefined && { notes: body.notes }),
          ...(body.payments !== undefined && { payments: body.payments }),
        },
        include: { items: true },
      });

      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'SUPER_ADMIN_SALE_UPDATE',
          module: 'SALES',
          recordId: sale.id,
          details: `Super Admin ${user.name} modified Sale ${sale.invoiceNumber} (Total: ${sale.grandTotal}, Status: ${sale.status})`,
        },
      });

      return sale;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error('Sale update error:', err);
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
    return NextResponse.json({ success: false, error: 'Access denied. Only Super Admin or Admin can delete sales.' }, { status: 403 });
  }

  try {
    const sale = await prisma.sale.findUnique({
      where: { id: params.id },
      include: { items: true },
    });

    if (!sale) {
      return NextResponse.json({ success: false, error: 'Sale record not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Revert sold serial numbers back to AVAILABLE
      await tx.productSerial.updateMany({
        where: { saleInvoiceId: sale.invoiceNumber },
        data: {
          status: 'AVAILABLE',
          saleInvoiceId: null,
          saleDate: null,
          customerId: null,
        },
      });

      // 2. Delete line items
      await tx.saleItem.deleteMany({
        where: { saleId: sale.id },
      });

      // 3. Delete sale
      await tx.sale.delete({
        where: { id: sale.id },
      });

      // 4. Audit trail
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'SUPER_ADMIN_SALE_DELETE',
          module: 'SALES',
          recordId: sale.id,
          details: `Super Admin ${user.name} permanently deleted Sale ${sale.invoiceNumber} (Total: ${sale.grandTotal}, Customer: ${sale.customerName})`,
        },
      });
    });

    return NextResponse.json({ success: true, message: `Sale ${sale.invoiceNumber} deleted successfully.` });
  } catch (err: any) {
    console.error('Sale deletion error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

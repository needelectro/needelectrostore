// NEED ELECTRO ERP — Super Admin Return Master Update & Delete Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { Prisma } from '@prisma/client';
import { reverseTransaction } from '@/lib/accounting';

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
      // 1. Reverse financial effects via central ledger (restores cash to account or customer due balance)
      await reverseTransaction(tx, {
        referenceNumber: ret.returnNumber,
        reason: `Return ${ret.returnNumber} cancelled/deleted by ${user.name}`,
        performedBy: user.name,
      });

      // 2. Re-decrement stock that was restocked upon return
      const returnItems = Array.isArray(ret.items) ? (ret.items as any[]) : [];
      for (const item of returnItems) {
        if (item.productId && item.quantity > 0) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: Number(item.quantity) } },
          });

          await tx.inventoryTransaction.create({
            data: {
              id: 'itx-rev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
              transactionNumber: 'ITX-REV-RET-' + Date.now().toString().slice(-6),
              date: new Date(),
              type: 'RETURN_OUT',
              productId: item.productId,
              productName: item.productName || 'Returned Item',
              branchId: user.branchId || 'branch-1',
              quantity: Number(item.quantity),
              unitCost: new Prisma.Decimal(item.unitCost || item.unitPrice || 0),
              totalValue: new Prisma.Decimal((item.unitCost || item.unitPrice || 0) * Number(item.quantity)),
              openingStock: 0,
              closingStock: 0,
              referenceType: 'RETURN_CANCELLATION',
              referenceId: ret.returnNumber,
              notes: `Stock adjustment upon cancellation of return ${ret.returnNumber}`,
              createdBy: user.name,
            },
          });
        }
      }

      // 3. Soft cancel return record (Strict reversal logic, no hard deletion)
      await tx.productReturn.update({
        where: { id: params.id },
        data: { status: 'CANCELLED' },
      });

      // 4. Audit trail
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'SUPER_ADMIN_RETURN_CANCEL_REVERSE',
          module: 'RETURNS',
          recordId: ret.id,
          details: `Super Admin ${user.name} cancelled Return ${ret.returnNumber} (Refund: ${ret.totalRefundAmount}, Customer: ${ret.customerName}) and restored financial and stock balances.`,
        },
      });
    });

    return NextResponse.json({ success: true, message: `Return ${ret.returnNumber} cancelled and all financial and inventory effects reversed.` });
  } catch (err: any) {
    console.error('Return deletion error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

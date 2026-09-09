// NEED ELECTRO ERP — Super Admin Expense Master Update & Delete Handler
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

  if (!hasPermission(user, 'expenses', 'edit') && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const expense = await prisma.expense.findUnique({ where: { id: params.id } });
    if (!expense) {
      return NextResponse.json({ success: false, error: 'Expense record not found' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const exp = await tx.expense.update({
        where: { id: params.id },
        data: {
          ...(body.category && { category: body.category }),
          ...(body.amount !== undefined && { amount: new Prisma.Decimal(body.amount) }),
          ...(body.paymentMethod && { paymentMethod: body.paymentMethod }),
          ...(body.date && { date: new Date(body.date) }),
          ...(body.description !== undefined && { description: body.description }),
          ...(body.branchId && { branchId: body.branchId }),
          ...(body.attachmentName !== undefined && { attachmentName: body.attachmentName }),
        },
      });

      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'SUPER_ADMIN_EXPENSE_UPDATE',
          module: 'EXPENSES',
          recordId: exp.id,
          details: `Super Admin ${user.name} modified Expense ${exp.voucherNumber} (Amount: ${exp.amount}, Category: ${exp.category})`,
        },
      });

      return exp;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error('Expense update error:', err);
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
    return NextResponse.json({ success: false, error: 'Access denied. Only Super Admin or Admin can delete expenses.' }, { status: 403 });
  }

  try {
    const expense = await prisma.expense.findUnique({ where: { id: params.id } });
    if (!expense) {
      return NextResponse.json({ success: false, error: 'Expense record not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.expense.delete({ where: { id: params.id } });

      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'SUPER_ADMIN_EXPENSE_DELETE',
          module: 'EXPENSES',
          recordId: expense.id,
          details: `Super Admin ${user.name} deleted Expense ${expense.voucherNumber} (Amount: ${expense.amount}, Category: ${expense.category})`,
        },
      });
    });

    return NextResponse.json({ success: true, message: `Expense ${expense.voucherNumber} deleted successfully.` });
  } catch (err: any) {
    console.error('Expense deletion error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

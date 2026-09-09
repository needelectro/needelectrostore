// NEED ELECTRO ERP — Super Admin EMI Account Master Update & Delete Handler
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

  if (!hasPermission(user, 'emi', 'edit') && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied.' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const existing = await prisma.eMIAccount.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'EMI account not found' }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const emi = await tx.eMIAccount.update({
        where: { id: params.id },
        data: {
          ...(body.accountNumber && { accountNumber: body.accountNumber }),
          ...(body.customerName && { customerName: body.customerName }),
          ...(body.customerPhone && { customerPhone: body.customerPhone }),
          ...(body.status && { status: body.status }),
          ...(body.principal !== undefined && { principal: new Prisma.Decimal(body.principal) }),
          ...(body.downPayment !== undefined && { downPayment: new Prisma.Decimal(body.downPayment) }),
          ...(body.totalReceivable !== undefined && { totalReceivable: new Prisma.Decimal(body.totalReceivable) }),
          ...(body.totalPaid !== undefined && { totalPaid: new Prisma.Decimal(body.totalPaid) }),
          ...(body.remainingBalance !== undefined && { remainingBalance: new Prisma.Decimal(body.remainingBalance) }),
          ...(body.nextDueDate && { nextDueDate: new Date(body.nextDueDate) }),
          ...(body.notes !== undefined && { notes: body.notes }),
          ...(body.guarantorName !== undefined && { guarantorName: body.guarantorName }),
          ...(body.guarantorPhone !== undefined && { guarantorPhone: body.guarantorPhone }),
          ...(body.guarantorNid !== undefined && { guarantorNid: body.guarantorNid }),
          ...(body.guarantorAddress !== undefined && { guarantorAddress: body.guarantorAddress }),
        },
      });

      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'SUPER_ADMIN_EMI_UPDATE',
          module: 'EMI',
          recordId: emi.id,
          details: `Super Admin ${user.name} modified EMI Account ${emi.emiNumber} (Customer: ${emi.customerName}, Status: ${emi.status}, Remaining: ${emi.remainingBalance})`,
        },
      });

      return emi;
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error('EMI account update error:', err);
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
    return NextResponse.json({ success: false, error: 'Access denied. Only Super Admin or Admin can delete EMI accounts.' }, { status: 403 });
  }

  try {
    const emi = await prisma.eMIAccount.findUnique({ where: { id: params.id } });
    if (!emi) {
      return NextResponse.json({ success: false, error: 'EMI account not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete associated installment payments
      await tx.eMIPayment.deleteMany({ where: { emiAccountId: emi.id } });

      // 2. Delete installments
      await tx.eMIInstallment.deleteMany({ where: { emiAccountId: emi.id } });

      // 3. Delete EMI account
      await tx.eMIAccount.delete({ where: { id: emi.id } });

      // 4. Audit trail
      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'SUPER_ADMIN_EMI_DELETE',
          module: 'EMI',
          recordId: emi.id,
          details: `Super Admin ${user.name} deleted EMI Account ${emi.emiNumber} (Customer: ${emi.customerName})`,
        },
      });
    });

    return NextResponse.json({ success: true, message: `EMI Account ${emi.emiNumber} deleted successfully.` });
  } catch (err: any) {
    console.error('EMI account deletion error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

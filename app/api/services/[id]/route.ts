// NEED ELECTRO ERP — Service Job Update Route Handler
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

  if (!hasPermission(user, 'service', 'edit') && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const updates = await req.json();

  const job = await prisma.serviceJob.findUnique({ where: { id: params.id } });
  if (!job) {
    return NextResponse.json({ success: false, error: 'Service job not found' }, { status: 404 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.serviceJob.update({
      where: { id: params.id },
      data: {
        ...(updates.status && { status: updates.status }),
        ...(updates.assignedTechnicianId !== undefined && { assignedTechnicianId: updates.assignedTechnicianId }),
        ...(updates.assignedTechnicianName !== undefined && { assignedTechnicianName: updates.assignedTechnicianName }),
        ...(updates.partsUsed && { partsUsed: updates.partsUsed }),
        ...(updates.laborCost !== undefined && { laborCost: new Prisma.Decimal(updates.laborCost) }),
        ...(updates.totalBill !== undefined && { totalBill: new Prisma.Decimal(updates.totalBill) }),
        ...(updates.paymentStatus && { paymentStatus: updates.paymentStatus }),
        ...(updates.paymentMethod && { paymentMethod: updates.paymentMethod }),
        ...(updates.completedDate && { completedDate: new Date(updates.completedDate) }),
        ...(updates.notes !== undefined && { notes: updates.notes }),
      },
    });

    // If paymentStatus transitioned to PAID, connect payment to Financial Accounts and Accounting Ledgers
    if (updates.paymentStatus === 'PAID' && job.paymentStatus !== 'PAID') {
      const billAmount = updates.totalBill !== undefined ? Number(updates.totalBill) : Number(job.totalBill);
      if (billAmount > 0) {
        const method = updates.paymentMethod || job.paymentMethod || 'Cash';
        const methodLower = method.toLowerCase().trim();

        const activeAccounts = await tx.financialAccount.findMany({ where: { isActive: true } });
        let targetAccount = null;

        if (updates.accountId) {
          targetAccount = activeAccounts.find((a) => a.id === updates.accountId) || null;
        }

        if (!targetAccount) {
          if (methodLower.includes('bkash')) {
            targetAccount = activeAccounts.find((a) => a.name.toLowerCase().includes('bkash') || a.type === 'MOBILE_BANKING') || null;
          } else if (methodLower.includes('nagad') || methodLower.includes('rocket')) {
            targetAccount = activeAccounts.find((a) => a.name.toLowerCase().includes('nagad') || a.type === 'MOBILE_BANKING') || null;
          } else if (methodLower.includes('bank') || methodLower.includes('card')) {
            targetAccount = activeAccounts.find((a) => a.type === 'BANK') || null;
          } else {
            targetAccount = activeAccounts.find((a) => a.type === 'CASH') || null;
          }
        }

        if (!targetAccount) {
          targetAccount = activeAccounts[0] || null;
        }

        if (targetAccount) {
          await tx.financialAccount.update({
            where: { id: targetAccount.id },
            data: { balance: { increment: new Prisma.Decimal(billAmount) } },
          });

          await tx.ledgerEntry.create({
            data: {
              id: 'led-' + Date.now() + '-srv-acc',
              date: new Date(),
              partyType: 'ACCOUNT',
              partyId: targetAccount.id,
              referenceType: 'SERVICE',
              referenceNumber: job.jobCardNumber,
              description: `Service revenue collected from ${job.customerName} for ${job.deviceOrSite} (${job.jobCardNumber})`,
              debit: new Prisma.Decimal(billAmount),
              credit: new Prisma.Decimal(0),
              runningBalance: new Prisma.Decimal(Number(targetAccount.balance) + billAmount),
            },
          });
        }

        await tx.auditLog.create({
          data: {
            id: 'audit-' + Date.now(),
            userId: user.id,
            userName: user.name,
            action: 'SERVICE_PAYMENT_COLLECTED',
            module: 'SERVICES',
            recordId: job.id,
            details: `Collected ৳${billAmount} service charge for Job ${job.jobCardNumber} (${job.deviceOrSite}) via ${method}`,
          },
        });
      }
    }
  });

  return NextResponse.json({ success: true, message: 'Service job updated successfully.' });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied. Only Super Admin or Admin can delete service jobs.' }, { status: 403 });
  }

  try {
    const job = await prisma.serviceJob.findUnique({ where: { id: params.id } });
    if (!job) {
      return NextResponse.json({ success: false, error: 'Service job not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.serviceJob.delete({ where: { id: params.id } });

      await tx.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: user.id,
          userName: user.name,
          action: 'SUPER_ADMIN_SERVICE_DELETE',
          module: 'SERVICES',
          recordId: job.id,
          details: `Super Admin ${user.name} deleted Service Job ${job.jobCardNumber} (Customer: ${job.customerName}, Device: ${job.deviceOrSite})`,
        },
      });
    });

    return NextResponse.json({ success: true, message: `Service Job ${job.jobCardNumber} deleted successfully.` });
  } catch (err: any) {
    console.error('Service job deletion error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

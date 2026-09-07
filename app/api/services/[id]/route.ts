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

  if (!hasPermission(user, 'service', 'edit') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const updates = await req.json();

  const job = await prisma.serviceJob.findUnique({ where: { id: params.id } });
  if (!job) {
    return NextResponse.json({ success: false, error: 'Service job not found' }, { status: 404 });
  }

  await prisma.serviceJob.update({
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

  return NextResponse.json({ success: true, message: 'Service job updated successfully.' });
}

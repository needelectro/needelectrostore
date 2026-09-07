// NEED ELECTRO ERP — Technical & Electrical Services Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { serviceJobSchema } from '@/lib/validations';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const services = await prisma.serviceJob.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return NextResponse.json({ success: true, data: services });
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'service', 'create') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied to create service jobs' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = serviceJobSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0].message }, { status: 400 });
  }

  const data = parsed.data;
  const jobCardNumber = 'JOB-' + Date.now().toString().slice(-6);

  const job = await prisma.serviceJob.create({
    data: {
      id: 'job-' + Date.now(),
      jobCardNumber,
      customerId: data.customerId,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerAddress: data.customerAddress,
      serviceType: data.serviceType,
      deviceOrSite: data.deviceOrSite,
      serialNumber: data.serialNumber,
      reportedIssue: data.reportedIssue,
      assignedTechnicianId: data.assignedTechnicianId,
      assignedTechnicianName: data.assignedTechnicianName,
      status: 'Pending',
      laborCost: new Prisma.Decimal(data.laborCost || 0),
      totalBill: new Prisma.Decimal(data.totalBill || 0),
      notes: data.notes,
    },
  });

  await prisma.auditLog.create({
    data: {
      id: 'audit-' + Date.now(),
      userId: user.id,
      userName: user.name,
      action: 'SERVICE_JOB_CREATED',
      module: 'SERVICE',
      recordId: job.id,
      details: `Created service job card ${jobCardNumber} for ${data.customerName}`,
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Service job created successfully.',
    jobId: job.id,
    jobCardNumber,
  });
}

// NEED ELECTRO ERP — Warranty Claims Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const claims = await prisma.warrantyClaim.findMany({
    orderBy: { claimDate: 'desc' },
  });

  return NextResponse.json({ success: true, data: claims });
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'warranty', 'create') && user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  const { serialNumber, productName, customerId, customerName, customerPhone, invoiceNumber, issueDescription } = await req.json();

  if (!serialNumber || !issueDescription) {
    return NextResponse.json({ success: false, error: 'Serial number and issue description are required' }, { status: 400 });
  }

  const claimNumber = 'CLM-' + Date.now().toString().slice(-6);

  const claim = await prisma.warrantyClaim.create({
    data: {
      id: 'clm-' + Date.now(),
      claimNumber,
      serialNumber,
      productName: productName || 'Hardware Item',
      customerId: customerId || 'general',
      customerName: customerName || 'Customer',
      customerPhone: customerPhone || 'N/A',
      invoiceNumber: invoiceNumber || 'N/A',
      issueDescription,
      claimDate: new Date(),
      status: 'PENDING',
    },
  });

  return NextResponse.json({
    success: true,
    message: 'Warranty claim logged successfully',
    claimNumber,
  });
}

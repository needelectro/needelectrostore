// NEED ELECTRO ERP — Public Service & Electrician Booking API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, serviceType, address, details, propertyType } = body;

    // Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Full name is required.' }, { status: 400 });
    }
    if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
      return NextResponse.json({ success: false, error: 'A valid contact phone number is required.' }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanAddress = (address || 'Moulvibazar').trim();
    const cleanServiceType = (serviceType || 'General Electrical Service').trim();
    const cleanDetails = (details || `Property Type: ${propertyType || 'Residential'}`).trim();

    // 1. Find or create Customer in CRM
    let customer = await prisma.customer.findFirst({
      where: { phone: cleanPhone },
    });

    if (!customer) {
      const newCustId = 'CUST-' + Date.now().toString().slice(-6);
      customer = await prisma.customer.create({
        data: {
          id: 'cust-' + Date.now(),
          customerId: newCustId,
          name: cleanName,
          phone: cleanPhone,
          address: cleanAddress,
          notes: 'Customer registered via website service booking request',
        },
      });
    }

    // 2. Generate unique jobCardNumber: JOB-YYYYMM-XXXX
    const now = new Date();
    const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const jobCardNumber = `JOB-${yearMonth}-${randomSuffix}`;

    // 3. Create ServiceJob in ERP
    const serviceJob = await prisma.serviceJob.create({
      data: {
        id: 'job-' + Date.now(),
        jobCardNumber,
        customerId: customer.id,
        customerName: cleanName,
        customerPhone: cleanPhone,
        customerAddress: cleanAddress,
        serviceType: cleanServiceType,
        deviceOrSite: propertyType || 'Residential / Commercial Site',
        reportedIssue: cleanDetails,
        status: 'Pending',
        laborCost: new Prisma.Decimal(0),
        totalBill: new Prisma.Decimal(0),
        paymentStatus: 'UNPAID',
        notes: `Online booking submitted on ${now.toLocaleString('en-BD')}. Contact customer to confirm appointment.`,
      },
    });

    // 4. Log in audit logs
    try {
      await prisma.auditLog.create({
        data: {
          id: 'audit-' + Date.now(),
          userId: 'public-website',
          userName: cleanName,
          action: 'ONLINE_SERVICE_BOOKED',
          module: 'SERVICE',
          recordId: serviceJob.id,
          details: `Online booking ${jobCardNumber} submitted for ${cleanServiceType} by ${cleanName} (${cleanPhone})`,
        },
      });
    } catch (auditErr) {
      console.warn('Audit log write warning:', auditErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Booking submitted successfully.',
      jobCardNumber,
      customerName: cleanName,
      serviceType: cleanServiceType,
    });
  } catch (error: any) {
    console.error('Service booking error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit service booking. Please call our hotline directly.' },
      { status: 500 }
    );
  }
}

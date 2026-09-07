// NEED ELECTRO ERP — Configurable Payment Methods Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireSuperAdmin } from '@/lib/auth';
import { Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  const admin = await requireSuperAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const pm = await req.json();

  if (pm.id) {
    await prisma.configurablePaymentMethod.update({
      where: { id: pm.id },
      data: {
        name: pm.name,
        type: pm.type,
        linkedAccountId: pm.linkedAccountId,
        accountNumber: pm.accountNumber,
        chargePercent: new Prisma.Decimal(pm.chargePercent || 0),
        instructions: pm.instructions,
        isActive: pm.isActive !== undefined ? pm.isActive : true,
      },
    });
    return NextResponse.json({ success: true, message: 'Payment method updated successfully' });
  }

  const newPm = await prisma.configurablePaymentMethod.create({
    data: {
      id: 'pm-' + Date.now(),
      name: pm.name,
      code: pm.code.toUpperCase().replace(/\s+/g, '_'),
      type: pm.type || 'CASH',
      linkedAccountId: pm.linkedAccountId || 'acc-cash-1',
      accountNumber: pm.accountNumber,
      chargePercent: new Prisma.Decimal(pm.chargePercent || 0),
      instructions: pm.instructions,
      isActive: true,
      sortOrder: 0,
    },
  });

  return NextResponse.json({ success: true, message: 'Payment method created', data: newPm });
}

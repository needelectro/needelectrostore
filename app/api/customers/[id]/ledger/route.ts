// NEED ELECTRO ERP — Customer Statement & Ledger Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
  });

  if (!customer) {
    return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
  }

  const ledger = await prisma.ledgerEntry.findMany({
    where: {
      partyType: 'CUSTOMER',
      partyId: customer.id,
    },
    orderBy: { date: 'asc' },
  });

  return NextResponse.json({
    success: true,
    customer,
    ledger,
  });
}

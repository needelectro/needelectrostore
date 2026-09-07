// NEED ELECTRO ERP — Supplier Statement Ledger Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const supplier = await prisma.supplier.findUnique({
    where: { id: params.id },
  });

  if (!supplier) {
    return NextResponse.json({ success: false, error: 'Supplier not found' }, { status: 404 });
  }

  const ledger = await prisma.ledgerEntry.findMany({
    where: {
      partyType: 'SUPPLIER',
      partyId: supplier.id,
    },
    orderBy: { date: 'asc' },
  });

  return NextResponse.json({
    success: true,
    supplier,
    ledger,
  });
}

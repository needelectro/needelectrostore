// NEED ELECTRO ERP — EMI Accounts Listing & Filtering Route Handler
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const query = searchParams.get('query');

  const where: any = {};
  if (status && status !== 'ALL') where.status = status;
  if (query) {
    where.OR = [
      { emiNumber: { contains: query, mode: 'insensitive' } },
      { customerName: { contains: query, mode: 'insensitive' } },
      { customerPhone: { contains: query } },
      { serialNumber: { contains: query, mode: 'insensitive' } },
    ];
  }

  const accounts = await prisma.eMIAccount.findMany({
    where,
    include: {
      installments: {
        orderBy: { installmentNumber: 'asc' },
      },
      payments: {
        orderBy: { paymentDate: 'desc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ success: true, data: accounts });
}

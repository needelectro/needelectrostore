import { NextRequest, NextResponse } from 'next/server';
import { authenticateCustomer } from '@/lib/customerAuth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const where: any = {
      OR: [
        { customerId: customer.id },
        { customerPhone: customer.phone },
      ],
    };

    if (status && status !== 'ALL') {
      where.orderStatus = status;
    }

    const orders = await prisma.websiteOrder.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (err: any) {
    console.error('Customer orders fetch error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

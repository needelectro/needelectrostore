import { NextRequest, NextResponse } from 'next/server';
import { authenticateCustomer } from '@/lib/customerAuth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const orderId = params.id;

    // Search by either ID or orderNumber
    const order = await prisma.websiteOrder.findFirst({
      where: {
        OR: [
          { id: orderId },
          { orderNumber: orderId },
        ],
      },
    });

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Authorization: customer can only view their own order
    const ownsOrder =
      order.customerId === customer.id ||
      order.customerPhone.replace(/\D/g, '') === customer.phone.replace(/\D/g, '');

    if (!ownsOrder) {
      return NextResponse.json(
        { success: false, error: 'Access denied. You do not have permission to view this order.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: order,
    });
  } catch (err: any) {
    console.error('Customer order detail error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { authenticateCustomer } from '@/lib/customerAuth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated', customer: null },
        { status: 401 }
      );
    }

    // Fetch order counts and recent activity for the customer
    const [orderCount, pendingCount, deliveredCount, recentOrders] = await Promise.all([
      prisma.websiteOrder.count({
        where: {
          OR: [
            { customerId: customer.id },
            { customerPhone: customer.phone },
          ],
        },
      }),
      prisma.websiteOrder.count({
        where: {
          OR: [
            { customerId: customer.id },
            { customerPhone: customer.phone },
          ],
          orderStatus: { in: ['PENDING', 'CONFIRMED', 'PROCESSING'] },
        },
      }),
      prisma.websiteOrder.count({
        where: {
          OR: [
            { customerId: customer.id },
            { customerPhone: customer.phone },
          ],
          orderStatus: 'DELIVERED',
        },
      }),
      prisma.websiteOrder.findMany({
        where: {
          OR: [
            { customerId: customer.id },
            { customerPhone: customer.phone },
          ],
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        customer: {
          id: customer.id,
          customerId: customer.customerId,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
          district: customer.district,
          deliveryArea: customer.deliveryArea,
          addresses: customer.addresses || [],
        },
        stats: {
          totalOrders: orderCount,
          pendingOrders: pendingCount,
          deliveredOrders: deliveredCount,
        },
        recentOrders,
      },
    });
  } catch (err: any) {
    console.error('Customer me error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch customer profile' },
      { status: 500 }
    );
  }
}

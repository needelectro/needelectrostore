import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Order number or phone number is required.' },
        { status: 400 }
      );
    }

    const cleanQuery = query.replace(/\D/g, '');
    const isPhoneNumber = cleanQuery.length >= 10;

    // Search by orderNumber or customerPhone
    const orders = await prisma.websiteOrder.findMany({
      where: isPhoneNumber
        ? {
            customerPhone: {
              contains: cleanQuery.startsWith('88') ? cleanQuery.slice(2) : cleanQuery,
            },
          }
        : {
            orderNumber: {
              equals: query,
              mode: 'insensitive',
            },
          },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    });

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No order found matching "${query}". Please check your order ID or mobile number.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: orders.map((order) => {
        let itemsList: any[] = [];
        if (Array.isArray(order.items)) {
          itemsList = order.items;
        } else if (typeof order.items === 'string') {
          try {
            itemsList = JSON.parse(order.items);
          } catch (e) {
            itemsList = [];
          }
        }

        return {
          id: order.id,
          orderNumber: order.orderNumber,
          createdAt: order.createdAt,
          status: order.orderStatus,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          deliveryAddress: order.deliveryAddress,
          district: order.district,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          subtotal: Number(order.subtotal),
          deliveryCharge: Number(order.deliveryCharge),
          totalAmount: Number(order.total),
          items: itemsList.map((i: any, idx: number) => ({
            id: i.productId || String(idx),
            productName: i.name || 'Product',
            sku: i.sku || 'SKU',
            quantity: Number(i.quantity) || 1,
            unitPrice: Number(i.price) || 0,
            totalPrice: Number(i.total) || 0,
          })),
        };
      }),
    });
  } catch (error: any) {
    console.error('Error tracking order:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while tracking order.' },
      { status: 500 }
    );
  }
}

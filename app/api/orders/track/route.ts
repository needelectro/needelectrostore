import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 6) return '***';
  return `${digits.slice(0, 3)}****${digits.slice(-3)}`;
}

function maskName(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => (part.length <= 2 ? `${part[0] || ''}*` : `${part.slice(0, 2)}${'*'.repeat(Math.min(4, part.length - 2))}`))
    .join(' ');
}

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
    const normalizedLocalPhone = cleanQuery.startsWith('880')
      ? `0${cleanQuery.slice(3)}`
      : cleanQuery.startsWith('88')
      ? cleanQuery.slice(2)
      : cleanQuery.startsWith('0')
      ? cleanQuery
      : `0${cleanQuery}`;
    const phoneVariants = isPhoneNumber
      ? Array.from(
          new Set([
            query,
            cleanQuery,
            normalizedLocalPhone,
            `+88${normalizedLocalPhone}`,
            `88${normalizedLocalPhone}`,
          ])
        )
      : [];

    // Match exact order number OR exact normalized phone variants (no loose substring matching)
    const orders = await prisma.websiteOrder.findMany({
      where: isPhoneNumber
        ? {
            customerPhone: { in: phoneVariants },
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
          customerName: maskName(order.customerName),
          customerPhone: maskPhone(order.customerPhone),
          deliveryAddress: `${order.district} (Verified Address)`,
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

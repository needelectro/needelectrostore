// NEED ELECTRO — Customer Dashboard Reviews API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateCustomer } from '@/lib/customerAuth';
import { slugify } from '@/lib/seoConfig';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 1. Fetch customer's submitted reviews
    const reviews = await prisma.productReview.findMany({
      where: {
        customerId: customer.id,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            category: true,
            brand: true,
            imageUrl: true,
            retailPrice: true,
          },
        },
        images: {
          select: { id: true, imageUrl: true },
        },
        responses: {
          select: { id: true, authorName: true, response: true, createdAt: true },
        },
      },
    });

    const reviewedProductIds = new Set(reviews.map((r) => r.productId));

    // 2. Fetch delivered orders to find products awaiting review
    const deliveredOrders = await prisma.websiteOrder.findMany({
      where: {
        OR: [
          { customerId: customer.id },
          { customerPhone: customer.phone },
        ],
        orderStatus: 'DELIVERED',
      },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const pendingReviewProducts: any[] = [];
    const addedProductKeys = new Set<string>();

    for (const order of deliveredOrders) {
      if (Array.isArray(order.items)) {
        for (const item of order.items as any[]) {
          const itemKey = item.productId || item.sku;
          if (
            itemKey &&
            !reviewedProductIds.has(item.productId) &&
            !addedProductKeys.has(itemKey)
          ) {
            addedProductKeys.add(itemKey);
            pendingReviewProducts.push({
              productId: item.productId || item.sku,
              name: item.name,
              sku: item.sku,
              imageUrl: item.imageUrl || null,
              price: item.price,
              orderNumber: order.orderNumber,
              deliveredAt: order.createdAt,
              slug: `${slugify(item.name)}-${(item.sku || '').toLowerCase()}`,
            });
          }
        }
      }
    }

    const formattedReviews = reviews.map((r) => ({
      id: r.id,
      productId: r.productId,
      productName: r.product.name,
      productSku: r.product.sku,
      productCategory: r.product.category,
      productBrand: r.product.brand,
      productImageUrl: r.product.imageUrl,
      productSlug: `${slugify(r.product.name)}-${r.product.sku.toLowerCase()}`,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      status: r.status, // 'PUBLISHED' | 'PENDING' | 'REJECTED' | 'HIDDEN'
      isVerifiedPurchase: r.isVerifiedPurchase,
      orderId: r.orderId,
      helpfulCount: r.helpfulCount,
      reportCount: r.reportCount,
      moderationNotes: r.moderationNotes,
      images: r.images.map((img) => img.imageUrl),
      officialResponses: r.responses,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: {
        reviews: formattedReviews,
        pendingReviewProducts: pendingReviewProducts.slice(0, 6),
        stats: {
          totalReviews: formattedReviews.length,
          published: formattedReviews.filter((r) => r.status === 'PUBLISHED').length,
          pending: formattedReviews.filter((r) => r.status === 'PENDING').length,
          rejected: formattedReviews.filter((r) => r.status === 'REJECTED').length,
          hidden: formattedReviews.filter((r) => r.status === 'HIDDEN').length,
        },
      },
    });
  } catch (err: any) {
    console.error('Customer reviews fetch error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch customer reviews' },
      { status: 500 }
    );
  }
}

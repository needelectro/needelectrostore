// NEED ELECTRO ERP — Admin Product Reviews Management API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search')?.trim() || '';
    const status = searchParams.get('status') || 'ALL'; // 'ALL' | 'PENDING' | 'PUBLISHED' | 'REJECTED' | 'HIDDEN'
    const ratingParam = searchParams.get('rating');
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
    const reportedOnly = searchParams.get('reportedOnly') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (status !== 'ALL') {
      where.status = status;
    }

    if (ratingParam && ['1', '2', '3', '4', '5'].includes(ratingParam)) {
      where.rating = parseInt(ratingParam, 10);
    }

    if (verifiedOnly) {
      where.isVerifiedPurchase = true;
    }

    if (reportedOnly) {
      where.reportCount = { gt: 0 };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { comment: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
        { product: { sku: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [totalCount, reviews, statsAgg, pendingCount, reportedCount, publishedCount] = await Promise.all([
      prisma.productReview.count({ where }),
      prisma.productReview.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
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
          customer: {
            select: {
              id: true,
              customerId: true,
              name: true,
              phone: true,
              email: true,
            },
          },
          images: {
            select: { id: true, imageUrl: true },
          },
          reports: {
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              reason: true,
              details: true,
              createdAt: true,
              status: true,
            },
          },
          responses: {
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              authorName: true,
              response: true,
              createdAt: true,
            },
          },
        },
      }),
      prisma.productReview.aggregate({
        _avg: { rating: true },
        _count: { id: true },
      }),
      prisma.productReview.count({ where: { status: 'PENDING' } }),
      prisma.productReview.count({ where: { reportCount: { gt: 0 } } }),
      prisma.productReview.count({ where: { status: 'PUBLISHED' } }),
    ]);

    const formattedReviews = reviews.map((r) => ({
      id: r.id,
      productId: r.productId,
      product: r.product,
      customer: r.customer,
      customerName: r.customerName,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      status: r.status,
      isVerifiedPurchase: r.isVerifiedPurchase,
      orderId: r.orderId,
      helpfulCount: r.helpfulCount,
      reportCount: r.reportCount,
      moderationNotes: r.moderationNotes,
      moderatedById: r.moderatedById,
      moderatedAt: r.moderatedAt,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      images: r.images.map((img) => img.imageUrl),
      reports: r.reports,
      responses: r.responses,
    }));

    return NextResponse.json({
      success: true,
      data: {
        reviews: formattedReviews,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit) || 1,
        },
        kpis: {
          totalReviews: statsAgg._count.id,
          averageRating: statsAgg._avg.rating ? Number(statsAgg._avg.rating.toFixed(2)) : 0,
          pendingModeration: pendingCount,
          published: publishedCount,
          flaggedReports: reportedCount,
        },
      },
    });
  } catch (err: any) {
    console.error('Admin reviews list error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

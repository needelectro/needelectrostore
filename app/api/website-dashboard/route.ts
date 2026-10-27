// NEED ELECTRO ERP — Website Management Dashboard Statistics API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    // Allow authorized staff
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const [
      totalProducts,
      publishedProducts,
      featuredProducts,
      lowStockProducts,
      outOfStockProducts,
      activeCategories,
      activeBanners,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      recentOrders,
      totalBookings,
      pendingBookings,
      recentBookings,
      totalGuides,
      publishedGuides,
      totalPages,
      activeCoupons,
      recentAuditLogs,
      totalShares
    ] = await Promise.all([
      prisma.product.count(),
      prisma.product.count({ where: { isPublished: true, status: 'ACTIVE' } }),
      prisma.product.count({ where: { isFeatured: true, isPublished: true } }),
      prisma.product.count({ where: { currentStock: { lte: 3, gt: 0 } } }),
      prisma.product.count({ where: { currentStock: { lte: 0 } } }),
      prisma.categoryConfig.count({ where: { isActive: true } }),
      prisma.banner.count({ where: { isActive: true } }),
      prisma.websiteOrder.count(),
      prisma.websiteOrder.count({ where: { orderStatus: 'PENDING' } }),
      prisma.websiteOrder.count({ where: { orderStatus: 'DELIVERED' } }),
      prisma.websiteOrder.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerPhone: true,
          total: true,
          orderStatus: true,
          paymentStatus: true,
          createdAt: true,
        },
      }),
      prisma.serviceJob.count(),
      prisma.serviceJob.count({ where: { status: 'Pending' } }),
      prisma.serviceJob.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          jobCardNumber: true,
          customerName: true,
          customerPhone: true,
          serviceType: true,
          status: true,
          totalBill: true,
          createdAt: true,
        },
      }),
      prisma.guideArticle.count(),
      prisma.guideArticle.count({ where: { isPublished: true } }),
      prisma.websitePage.count(),
      prisma.coupon.count({ where: { isActive: true } }),
      prisma.auditLog.findMany({
        where: { module: { in: ['CATALOG', 'INVENTORY', 'SERVICE', 'ORDERS', 'SETTINGS', 'WEBSITE'] } },
        orderBy: { timestamp: 'desc' },
        take: 6,
      }),
      prisma.productShare.count().catch(() => 0),
    ]);

    // Check system configuration warnings
    const warnings: string[] = [];
    if (activeBanners === 0) {
      warnings.push('No active promotional banners found. The homepage hero carousel may display default fallbacks.');
    }
    if (outOfStockProducts > 0) {
      warnings.push(`${outOfStockProducts} product(s) are currently completely out of stock.`);
    }
    if (pendingOrders > 0) {
      warnings.push(`${pendingOrders} online order(s) are awaiting processing and confirmation.`);
    }
    if (pendingBookings > 0) {
      warnings.push(`${pendingBookings} customer service booking(s) are pending technician assignment.`);
    }

    return NextResponse.json({
      success: true,
      data: {
        products: {
          total: totalProducts,
          published: publishedProducts,
          unpublished: totalProducts - publishedProducts,
          featured: featuredProducts,
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts,
        },
        categories: {
          active: activeCategories,
        },
        banners: {
          active: activeBanners,
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          delivered: deliveredOrders,
          recent: recentOrders,
        },
        bookings: {
          total: totalBookings,
          pending: pendingBookings,
          recent: recentBookings,
        },
        guides: {
          total: totalGuides,
          published: publishedGuides,
        },
        pages: {
          total: totalPages,
        },
        coupons: {
          active: activeCoupons,
        },
        shares: {
          total: totalShares,
        },
        recentActivity: recentAuditLogs,
        warnings,
        systemStatus: 'ONLINE_SYNCHRONIZED',
      },
    });
  } catch (error: any) {
    console.error('Website dashboard stats error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

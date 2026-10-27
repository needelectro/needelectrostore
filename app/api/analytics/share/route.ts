// NEED ELECTRO Store — Product Share Analytics & Tracking API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ALLOWED_METHODS = new Set([
  'copy_link',
  'whatsapp',
  'facebook',
  'messenger',
  'telegram',
  'email',
  'native',
]);

/**
 * Anonymize IP address for privacy compliance
 */
function anonymizeIp(ip: string | null): string {
  if (!ip) return 'unknown';
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
  }
  return ip.slice(0, 16);
}

/**
 * POST /api/analytics/share
 * Records a product share event with deduplication & privacy protection.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || !body.productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const { productId, productSku, method, referrer } = body;
    const cleanMethod = typeof method === 'string' && ALLOWED_METHODS.has(method.toLowerCase())
      ? method.toLowerCase()
      : 'other';

    // Verify product exists in database
    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { id: String(productId) },
          { sku: { equals: String(productSku || productId), mode: 'insensitive' } },
        ],
      },
      select: { id: true, sku: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Client metadata
    const userAgent = req.headers.get('user-agent')?.slice(0, 255) || null;
    const rawIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';
    const ipAddress = anonymizeIp(rawIp);
    const cleanReferrer = typeof referrer === 'string' ? referrer.slice(0, 50).trim() : null;

    // Deduplication: prevent duplicate record if same product + method + IP within 5 seconds
    const fiveSecondsAgo = new Date(Date.now() - 5000);
    const recentDuplicate = await prisma.productShare.findFirst({
      where: {
        productId: product.id,
        method: cleanMethod,
        ipAddress,
        createdAt: { gte: fiveSecondsAgo },
      },
    });

    if (recentDuplicate) {
      return NextResponse.json({
        success: true,
        deduplicated: true,
        shareId: recentDuplicate.id,
      });
    }

    // Create share record
    const share = await prisma.productShare.create({
      data: {
        productId: product.id,
        productSku: product.sku,
        method: cleanMethod,
        referrer: cleanReferrer,
        userAgent,
        ipAddress,
      },
    });

    return NextResponse.json({
      success: true,
      shareId: share.id,
      productId: product.id,
      method: cleanMethod,
    });
  } catch (error) {
    console.error('Failed to record product share:', error);
    // Non-blocking fallback: never fail the user experience
    return NextResponse.json(
      { success: false, error: 'Internal logging error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/share
 * Returns aggregated share metrics for ERP & Admin dashboard.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await authenticateRequest(req);
    // Staff authentication
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    const whereClause: any = {};
    if (productId) {
      whereClause.productId = productId;
    }

    // 1. Total share count
    const totalShares = await prisma.productShare.count({ where: whereClause });

    // 2. Shares grouped by method
    const sharesByMethodRaw = await prisma.productShare.groupBy({
      by: ['method'],
      _count: { id: true },
      where: whereClause,
    });

    const byMethod: Record<string, number> = {
      whatsapp: 0,
      facebook: 0,
      messenger: 0,
      telegram: 0,
      email: 0,
      copy_link: 0,
      native: 0,
    };

    sharesByMethodRaw.forEach((row) => {
      byMethod[row.method] = row._count.id;
    });

    // 3. Top 10 most shared products
    const topProductsRaw = await prisma.productShare.groupBy({
      by: ['productId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const productIds = topProductsRaw.map((p) => p.productId);
    const productDetails = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        brand: true,
        retailPrice: true,
        imageUrl: true,
      },
    });

    const topSharedProducts = topProductsRaw.map((item) => {
      const details = productDetails.find((d) => d.id === item.productId);
      return {
        productId: item.productId,
        shareCount: item._count.id,
        name: details?.name || 'Unknown Product',
        sku: details?.sku || '',
        category: details?.category || '',
        brand: details?.brand || '',
        retailPrice: details ? Number(details.retailPrice) : 0,
        imageUrl: details?.imageUrl || null,
      };
    });

    // 4. Recent share feed (last 20)
    const recentShares = await prisma.productShare.findMany({
      where: whereClause,
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        productId: true,
        productSku: true,
        method: true,
        referrer: true,
        createdAt: true,
        product: {
          select: {
            name: true,
            sku: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalShares,
        byMethod,
        topSharedProducts,
        recentShares,
      },
    });
  } catch (error) {
    console.error('Failed to fetch share analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch share analytics' },
      { status: 500 }
    );
  }
}

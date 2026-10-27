import { prisma } from './prisma';

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  percentages: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  verifiedCount: number;
  photosCount: number;
}

/**
 * Sanitize plain text and remove HTML/script injections
 */
export function sanitizeReviewText(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/onload=/gi, '')
    .replace(/onerror=/gi, '')
    .trim();
}

/**
 * Format customer name for public display to protect privacy (e.g., "Amdadur R.")
 */
export function formatPublicAuthorName(fullName: string | null | undefined): string {
  if (!fullName) return 'Verified Customer';
  const trimmed = fullName.trim();
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${first} ${lastInitial}.`;
}

/**
 * Check if a customer has genuinely purchased a product in a completed/delivered order
 * Checks both WebsiteOrder (online delivered) and Sale (POS completed sale)
 */
export async function checkCustomerPurchaseEligibility(
  customerId: string,
  customerPhone: string,
  productId: string,
  productSku?: string
): Promise<{ isVerified: boolean; orderId: string | null }> {
  try {
    // 1. Check online website orders (status: DELIVERED)
    const onlineOrders = await prisma.websiteOrder.findMany({
      where: {
        OR: [
          { customerId },
          { customerPhone },
        ],
        orderStatus: 'DELIVERED',
      },
      select: {
        id: true,
        orderNumber: true,
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    for (const order of onlineOrders) {
      if (Array.isArray(order.items)) {
        for (const item of order.items as any[]) {
          if (
            (item.productId && item.productId === productId) ||
            (productSku && item.sku && item.sku.toLowerCase() === productSku.toLowerCase())
          ) {
            return { isVerified: true, orderId: order.orderNumber };
          }
        }
      }
    }

    // 2. Check POS physical sales (status: COMPLETED)
    const posSale = await prisma.sale.findFirst({
      where: {
        OR: [
          { customerId },
          { customerPhone },
        ],
        status: 'COMPLETED',
        items: {
          some: {
            OR: [
              { productId },
              ...(productSku ? [{ sku: productSku }] : []),
            ],
          },
        },
      },
      select: {
        id: true,
        invoiceNumber: true,
      },
      orderBy: { date: 'desc' },
    });

    if (posSale) {
      return { isVerified: true, orderId: posSale.invoiceNumber };
    }

    return { isVerified: false, orderId: null };
  } catch (err) {
    console.error('Error checking purchase eligibility:', err);
    return { isVerified: false, orderId: null };
  }
}

/**
 * Compute aggregate ratings, distribution, and summary based strictly on PUBLISHED reviews
 */
export async function getProductReviewsSummary(productId: string): Promise<ReviewSummary> {
  const reviews = await prisma.productReview.findMany({
    where: {
      productId,
      status: 'PUBLISHED',
    },
    select: {
      rating: true,
      isVerifiedPurchase: true,
      images: {
        select: { id: true },
      },
    },
  });

  const totalReviews = reviews.length;
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let verifiedCount = 0;
  let photosCount = 0;
  let totalRatingSum = 0;

  for (const r of reviews) {
    const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[star] = (distribution[star] || 0) + 1;
    totalRatingSum += r.rating;
    if (r.isVerifiedPurchase) verifiedCount++;
    if (r.images && r.images.length > 0) photosCount++;
  }

  const averageRating = totalReviews > 0 ? Number((totalRatingSum / totalReviews).toFixed(1)) : 0;

  const percentages = {
    5: totalReviews > 0 ? Math.round((distribution[5] / totalReviews) * 100) : 0,
    4: totalReviews > 0 ? Math.round((distribution[4] / totalReviews) * 100) : 0,
    3: totalReviews > 0 ? Math.round((distribution[3] / totalReviews) * 100) : 0,
    2: totalReviews > 0 ? Math.round((distribution[2] / totalReviews) * 100) : 0,
    1: totalReviews > 0 ? Math.round((distribution[1] / totalReviews) * 100) : 0,
  };

  return {
    averageRating,
    totalReviews,
    distribution,
    percentages,
    verifiedCount,
    photosCount,
  };
}

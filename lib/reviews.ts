import { prisma } from '@/lib/prisma';

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


const GUEST_URL_SPAM_REGEX =
  /https?:\/\/|www\.|\b(?:bit\.ly|tinyurl\.com|t\.me|wa\.me|goo\.gl)\b|\b[a-z0-9-]{2,}\.(?:com|net|org|xyz|info|tk|ml|ga|cf|gq|click|shop|store|top|club)\/\S+/i;

/**
 * Normalize a Bangladeshi mobile number into 11-digit 01XXXXXXXXX form if possible
 */
export function normalizeBdPhone(rawPhone: string | null | undefined): string | null {
  if (!rawPhone || typeof rawPhone !== 'string') return null;
  let digits = rawPhone.trim().replace(/[\s\-()+]/g, '');
  if (digits.startsWith('8801') && digits.length === 13) {
    digits = digits.slice(2);
  } else if (digits.length === 10 && digits.startsWith('1')) {
    digits = '0' + digits;
  }
  if (/^01[3-9]\d{8}$/.test(digits)) {
    return digits;
  }
  return null;
}

/**
 * Return possible formatted phone variants stored across WebsiteOrder / Sale records
 */
export function getBdPhoneVariants(rawPhone: string | null | undefined): string[] {
  if (!rawPhone || typeof rawPhone !== 'string') return [];
  const trimmed = rawPhone.trim();
  if (!trimmed) return [];

  const variants = new Set<string>([trimmed]);
  const normalized = normalizeBdPhone(trimmed);
  if (normalized) {
    variants.add(normalized);
    variants.add('88' + normalized);
    variants.add('+88' + normalized);
  }
  return Array.from(variants);
}

/**
 * Detect disallowed external URLs/spam links inside guest reviews
 */
export function containsReviewSpamLinks(text: string | null | undefined): boolean {
  if (!text || typeof text !== 'string') return false;
  return GUEST_URL_SPAM_REGEX.test(text);
}

/**
 * Extract normalized client IP address from NextRequest headers
 */
export function extractClientIp(req: {
  headers: { get(name: string): string | null };
  ip?: string;
}): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const realIp = req.headers.get('x-real-ip') || req.headers.get('cf-connecting-ip') || req.ip;
  return realIp ? String(realIp).trim().slice(0, 64) : 'unknown';
}

/**
 * Verify if a guest reviewer has an authentic delivered website order or completed POS sale
 * containing the reviewed product (checked privately server-side, never exposes order/phone publicly)
 */
export async function verifyGuestPurchaseEligibility({
  productId,
  productSku,
  phone,
  orderNumber,
}: {
  productId: string;
  productSku?: string | null;
  phone?: string | null;
  orderNumber?: string | null;
}): Promise<{ isVerified: boolean; orderId: string | null }> {
  const cleanOrderNum = orderNumber ? orderNumber.trim() : '';
  const phoneVariants = getBdPhoneVariants(phone);

  if (!cleanOrderNum && phoneVariants.length === 0) {
    return { isVerified: false, orderId: null };
  }

  try {
    const webOrderWhere: Record<string, any> = {
      orderStatus: 'DELIVERED',
    };
    if (cleanOrderNum) {
      webOrderWhere.orderNumber = { equals: cleanOrderNum, mode: 'insensitive' };
    }
    if (phoneVariants.length > 0) {
      webOrderWhere.customerPhone = { in: phoneVariants };
    }

    const webOrders = await prisma.websiteOrder.findMany({
      where: webOrderWhere,
      select: { id: true, items: true },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });

    for (const order of webOrders) {
      if (Array.isArray(order.items)) {
        const matched = order.items.some(
          (item: any) =>
            item &&
            (item.productId === productId ||
              (productSku && typeof item.sku === 'string' && item.sku.toLowerCase() === productSku.toLowerCase()))
        );
        if (matched) {
          return { isVerified: true, orderId: order.id };
        }
      }
    }

    const saleWhere: Record<string, any> = {
      status: 'COMPLETED',
    };
    if (cleanOrderNum) {
      saleWhere.invoiceNumber = { equals: cleanOrderNum, mode: 'insensitive' };
    }
    if (phoneVariants.length > 0) {
      saleWhere.customerPhone = { in: phoneVariants };
    }

    const sales = await prisma.sale.findMany({
      where: saleWhere,
      include: {
        items: {
          where: {
            OR: [
              { productId },
              ...(productSku ? [{ sku: { equals: productSku, mode: 'insensitive' as const } }] : []),
            ],
          },
          take: 1,
          select: { id: true },
        },
      },
      orderBy: { date: 'desc' },
      take: 25,
    });

    for (const sale of sales) {
      if (sale.items && sale.items.length > 0) {
        return { isVerified: true, orderId: sale.id };
      }
    }
  } catch (err) {
    console.error('Guest purchase verification error:', err);
  }

  return { isVerified: false, orderId: null };
}


/**
 * Inspect actual binary magic bytes to verify uploaded image format
 */
export function detectImageMimeFromMagicBytes(
  buffer: Buffer
): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (!buffer || buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }
  if (
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return 'image/webp';
  }
  return null;
}

export interface ParsedReviewInput {
  productId: string;
  rating: number;
  title: string | null;
  comment: string;
  images: string[];
}

/**
 * Shared validation and XSS sanitization for both signed-in and guest product reviews
 */
export function validateCommonReviewPayload(
  body: Record<string, any>
): { ok: true; data: ParsedReviewInput } | { ok: false; error: string; status: number } {
  const { productId, rating, title, comment, images } = body || {};

  if (!productId || typeof productId !== 'string' || !productId.trim()) {
    return { ok: false, error: 'Valid Product ID is required', status: 400 };
  }

  const numRating = parseInt(String(rating), 10);
  if (isNaN(numRating) || numRating < 1 || numRating > 5) {
    return { ok: false, error: 'Rating must be an integer between 1 and 5 stars', status: 400 };
  }

  const cleanComment = sanitizeReviewText(typeof comment === 'string' ? comment : '');
  if (cleanComment.length < 10) {
    return { ok: false, error: 'Review comment must be at least 10 characters long', status: 400 };
  }
  if (cleanComment.length > 2000) {
    return { ok: false, error: 'Review comment cannot exceed 2000 characters', status: 400 };
  }

  const cleanTitle =
    title && typeof title === 'string'
      ? sanitizeReviewText(title).slice(0, 100) || null
      : null;

  const validImageUrls: string[] = [];
  if (Array.isArray(images)) {
    for (const img of images.slice(0, 5)) {
      if (typeof img === 'string') {
        const trimmed = img.trim();
        if (trimmed.startsWith('/') || trimmed.startsWith('https://')) {
          validImageUrls.push(trimmed);
        }
      }
    }
  }

  return {
    ok: true,
    data: {
      productId: productId.trim(),
      rating: numRating,
      title: cleanTitle,
      comment: cleanComment,
      images: validImageUrls,
    },
  };
}

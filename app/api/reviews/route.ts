// NEED ELECTRO — Production Product Review API Route
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateCustomer } from '@/lib/customerAuth';
import {
  getProductReviewsSummary,
  checkCustomerPurchaseEligibility,
  verifyGuestPurchaseEligibility,
  sanitizeReviewText,
  formatPublicAuthorName,
  validateCommonReviewPayload,
  normalizeBdPhone,
  getBdPhoneVariants,
  containsReviewSpamLinks,
  extractClientIp,
} from '@/lib/reviews';

export const dynamic = 'force-dynamic';

/**
 * GET /api/reviews
 * Fetch public reviews and aggregate summary for a product
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const slug = searchParams.get('slug');

    let resolvedProductId = productId;
    if (!resolvedProductId && slug) {
      // Find product by slug/sku
      const product = await prisma.product.findFirst({
        where: {
          OR: [
            { sku: { equals: slug, mode: 'insensitive' } },
            { id: slug },
          ],
        },
        select: { id: true },
      });
      if (product) resolvedProductId = product.id;
    }

    if (!resolvedProductId) {
      return NextResponse.json(
        { success: false, error: 'Product ID or valid slug is required' },
        { status: 400 }
      );
    }

    // Optional customer authentication to check helpful votes
    const customer = await authenticateCustomer(req);

    // Filters
    const ratingParam = searchParams.get('rating'); // '1'|'2'|'3'|'4'|'5'|'all'
    const verifiedOnly = searchParams.get('verifiedOnly') === 'true';
    const withPhotos = searchParams.get('withPhotos') === 'true';
    const sort = searchParams.get('sort') || 'newest'; // 'newest' | 'highest' | 'lowest' | 'helpful'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;

    // Build Prisma query condition
    const where: any = {
      productId: resolvedProductId,
      status: 'PUBLISHED',
    };

    if (ratingParam && ['1', '2', '3', '4', '5'].includes(ratingParam)) {
      where.rating = parseInt(ratingParam, 10);
    }

    if (verifiedOnly) {
      where.isVerifiedPurchase = true;
    }

    if (withPhotos) {
      where.images = {
        some: {},
      };
    }

    // Sort order
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'highest') {
      orderBy = [{ rating: 'desc' }, { createdAt: 'desc' }];
    } else if (sort === 'lowest') {
      orderBy = [{ rating: 'asc' }, { createdAt: 'desc' }];
    } else if (sort === 'helpful') {
      orderBy = [{ helpfulCount: 'desc' }, { createdAt: 'desc' }];
    }

    // Fetch summary and paginated reviews in parallel
    const [summary, totalCount, reviews] = await Promise.all([
      getProductReviewsSummary(resolvedProductId),
      prisma.productReview.count({ where }),
      prisma.productReview.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images: {
            orderBy: { sortOrder: 'asc' },
            select: { id: true, imageUrl: true },
          },
          responses: {
            where: { isOfficial: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              authorName: true,
              response: true,
              createdAt: true,
            },
          },
          votes: customer
            ? {
                where: { customerId: customer.id },
                select: { id: true },
              }
            : false,
        },
      }),
    ]);

    // Format reviews for public view, sanitizing names and stripping private data
    const formattedReviews = reviews.map((r) => {
      const userHasVoted = customer ? (r.votes && r.votes.length > 0) : false;
      const isOwner = customer ? customer.id === r.customerId : false;

      return {
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        isVerifiedPurchase: r.isVerifiedPurchase,
        authorName: formatPublicAuthorName(r.customerName),
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        helpfulCount: r.helpfulCount,
        userHasVoted,
        isOwner,
        images: r.images.map((img) => img.imageUrl),
        officialResponse: r.responses[0] || null,
      };
    });

    return NextResponse.json({
      success: true,
      summary,
      reviews: formattedReviews,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    });
  } catch (err: any) {
    console.error('Fetch reviews error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/reviews
 * Submit or update a customer product review
 */
export async function POST(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    const body = await req.json();

    // Hidden anti-bot honeypot field (should remain empty for human reviewers)
    if (typeof body?.website === 'string' && body.website.trim().length > 0) {
      return NextResponse.json(
        { success: false, error: 'Spam verification failed. Please try again.' },
        { status: 400 }
      );
    }

    const parsed = validateCommonReviewPayload(body);
    if ('error' in parsed) {
      return NextResponse.json(
        { success: false, error: parsed.error },
        { status: parsed.status }
      );
    }
    const { productId, rating: numRating, title: cleanTitle, comment: cleanComment, images: validImageUrls } = parsed.data;

    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, sku: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found in store catalog' },
        { status: 404 }
      );
    }

    // ──────────────────────────────────────────────────────────────────
    // GUEST REVIEW SUBMISSION (No sign-in required)
    // ──────────────────────────────────────────────────────────────────
    if (!customer) {
      const guestName = sanitizeReviewText(
        typeof body.guestName === 'string' ? body.guestName : ''
      )
        .replace(/\s+/g, ' ')
        .slice(0, 80);

      if (guestName.length < 2) {
        return NextResponse.json(
          { success: false, error: 'Please enter your name (at least 2 characters) to submit a review.' },
          { status: 400 }
        );
      }

      if (
        containsReviewSpamLinks(guestName) ||
        containsReviewSpamLinks(cleanTitle) ||
        containsReviewSpamLinks(cleanComment)
      ) {
        return NextResponse.json(
          { success: false, error: 'Website links and promotional URLs are not allowed in product reviews.' },
          { status: 400 }
        );
      }

      const rawPhone = typeof body.guestPhone === 'string' ? body.guestPhone.trim().slice(0, 32) : '';
      const rawOrderNumber =
        typeof body.orderNumber === 'string' ? body.orderNumber.trim().slice(0, 64) : '';
      const rawEmail =
        typeof body.guestEmail === 'string' ? body.guestEmail.trim().slice(0, 120) : '';

      if (rawPhone && rawPhone.replace(/\D/g, '').length < 6) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid mobile number or leave the optional field blank.' },
          { status: 400 }
        );
      }
      if (rawEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid email address or leave it blank.' },
          { status: 400 }
        );
      }

      const normalizedPhone = normalizeBdPhone(rawPhone);
      const storedGuestPhone = normalizedPhone || (rawPhone || null);
      const clientIp = extractClientIp(req);

      // Anti-spam IP burst limit (max 3 guest reviews per 15 minutes from one IP)
      if (clientIp !== 'unknown') {
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        const recentIpCount = await prisma.productReview.count({
          where: {
            isGuest: true,
            ipAddress: clientIp,
            createdAt: { gte: fifteenMinutesAgo },
          },
        });
        if (recentIpCount >= 3) {
          return NextResponse.json(
            {
              success: false,
              error: 'Too many review submissions from your network. Please wait a few minutes or sign in.',
            },
            { status: 429 }
          );
        }
      }

      // Duplicate guest review guard per product (matching phone, or matching IP + name in 24h)
      const duplicateOrConditions: any[] = [];
      if (storedGuestPhone) {
        duplicateOrConditions.push({
          guestPhone: { in: getBdPhoneVariants(storedGuestPhone) },
        });
      }
      if (clientIp !== 'unknown') {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        duplicateOrConditions.push({
          AND: [
            { ipAddress: clientIp },
            { customerName: { equals: guestName, mode: 'insensitive' } },
            { createdAt: { gte: twentyFourHoursAgo } },
          ],
        });
      }

      if (duplicateOrConditions.length > 0) {
        const existingGuestReview = await prisma.productReview.findFirst({
          where: {
            productId: product.id,
            isGuest: true,
            OR: duplicateOrConditions,
          },
          select: { id: true },
        });
        if (existingGuestReview) {
          return NextResponse.json(
            {
              success: false,
              error: 'You have already submitted a review for this product. Sign in to manage reviews anytime.',
            },
            { status: 409 }
          );
        }
      }

      const guestEligibility = await verifyGuestPurchaseEligibility({
        productId: product.id,
        productSku: product.sku,
        phone: storedGuestPhone,
        orderNumber: rawOrderNumber || null,
      });

      const guestReview = await prisma.productReview.create({
        data: {
          productId: product.id,
          customerId: null,
          customerName: guestName,
          isGuest: true,
          guestPhone: storedGuestPhone,
          guestEmail: rawEmail || null,
          ipAddress: clientIp === 'unknown' ? null : clientIp,
          rating: numRating,
          title: cleanTitle,
          comment: cleanComment,
          isVerifiedPurchase: guestEligibility.isVerified,
          orderId: guestEligibility.orderId,
          status: 'PUBLISHED',
          images: {
            create: validImageUrls.map((url, idx) => ({
              imageUrl: url,
              sortOrder: idx,
            })),
          },
        },
        include: { images: true },
      });

      return NextResponse.json({
        success: true,
        isGuest: true,
        message: guestEligibility.isVerified
          ? 'Verified buyer badge confirmed! Thank you — your review is live.'
          : 'Thank you! Your review has been published.',
        review: {
          id: guestReview.id,
          rating: guestReview.rating,
          title: guestReview.title,
          comment: guestReview.comment,
          isVerifiedPurchase: guestReview.isVerifiedPurchase,
          createdAt: guestReview.createdAt,
        },
      });
    }

    // ──────────────────────────────────────────────────────────────────
    // SIGNED-IN CUSTOMER REVIEW SUBMISSION (Upsert + Purchase Check)
    // ──────────────────────────────────────────────────────────────────
    // Rate limiting: Maximum 5 reviews created in past 10 minutes by same customer
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const recentSubmissionsCount = await prisma.productReview.count({
      where: {
        customerId: customer.id,
        createdAt: { gte: tenMinutesAgo },
      },
    });

    if (recentSubmissionsCount >= 5) {
      return NextResponse.json(
        { success: false, error: 'Submission rate limit reached. Please wait a few minutes before submitting another review.' },
        { status: 429 }
      );
    }

    // Check purchase verification on server against DELIVERED orders or COMPLETED sales
    const eligibility = await checkCustomerPurchaseEligibility(
      customer.id,
      customer.phone,
      product.id,
      product.sku
    );

    // Check if customer already has a review for this product (Upsert pattern)
    const existingReview = await prisma.productReview.findUnique({
      where: {
        productId_customerId: {
          productId,
          customerId: customer.id,
        },
      },
      include: {
        images: true,
      },
    });

    let reviewRecord;
    if (existingReview) {
      // Update existing review
      // Remove old image records if new images provided
      if (validImageUrls.length > 0) {
        await prisma.reviewImage.deleteMany({
          where: { reviewId: existingReview.id },
        });
      }

      reviewRecord = await prisma.productReview.update({
        where: { id: existingReview.id },
        data: {
          rating: numRating,
          title: cleanTitle,
          comment: cleanComment,
          customerName: customer.name,
          isGuest: false,
          isVerifiedPurchase: eligibility.isVerified || existingReview.isVerifiedPurchase,
          orderId: eligibility.orderId || existingReview.orderId,
          status: 'PUBLISHED', // Auto-publish on edit if active customer
          updatedAt: new Date(),
          images: validImageUrls.length > 0 ? {
            create: validImageUrls.map((url, idx) => ({
              imageUrl: url,
              sortOrder: idx,
            })),
          } : undefined,
        },
        include: {
          images: true,
        },
      });
    } else {
      // Create new review
      reviewRecord = await prisma.productReview.create({
        data: {
          productId,
          customerId: customer.id,
          customerName: customer.name,
          isGuest: false,
          rating: numRating,
          title: cleanTitle,
          comment: cleanComment,
          isVerifiedPurchase: eligibility.isVerified,
          orderId: eligibility.orderId,
          status: 'PUBLISHED',
          images: {
            create: validImageUrls.map((url, idx) => ({
              imageUrl: url,
              sortOrder: idx,
            })),
          },
        },
        include: {
          images: true,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: existingReview ? 'Review updated successfully!' : 'Thank you! Your review has been published.',
      review: {
        id: reviewRecord.id,
        rating: reviewRecord.rating,
        title: reviewRecord.title,
        comment: reviewRecord.comment,
        isVerifiedPurchase: reviewRecord.isVerifiedPurchase,
        createdAt: reviewRecord.createdAt,
      },
    });
  } catch (err: any) {
    console.error('Submit review error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to submit review' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/reviews
 * Delete customer's own review
 */
export async function DELETE(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const review = await prisma.productReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    if (review.customerId !== customer.id) {
      return NextResponse.json(
        { success: false, error: 'You are not authorized to delete this review' },
        { status: 403 }
      );
    }

    // Delete review (cascade will remove images, votes, reports)
    await prisma.productReview.delete({
      where: { id: reviewId },
    });

    return NextResponse.json({
      success: true,
      message: 'Your review was deleted successfully',
    });
  } catch (err: any) {
    console.error('Delete review error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete review' },
      { status: 500 }
    );
  }
}

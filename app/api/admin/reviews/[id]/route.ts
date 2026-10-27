// NEED ELECTRO ERP — Review Moderation, Official Response & Action Route
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { sanitizeReviewText } from '@/lib/reviews';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/admin/reviews/[id]
 * Moderate review status: PUBLISHED | REJECTED | HIDDEN
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const { id } = params;
    const body = await req.json();
    const { status, moderationNotes } = body;

    const validStatuses = ['PUBLISHED', 'PENDING', 'REJECTED', 'HIDDEN'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Allowed values: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const existingReview = await prisma.productReview.findUnique({
      where: { id },
      include: { product: { select: { name: true, sku: true } } },
    });

    if (!existingReview) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    const updatedReview = await prisma.productReview.update({
      where: { id },
      data: {
        status,
        moderationNotes: moderationNotes ? sanitizeReviewText(moderationNotes) : existingReview.moderationNotes,
        moderatedById: user.id,
        moderatedAt: new Date(),
      },
    });

    // Write audit log entry
    await prisma.auditLog.create({
      data: {
        id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        userId: user.id,
        userName: user.name,
        module: 'REVIEWS',
        action: `REVIEW_STATUS_${status}`,
        recordId: id,
        details: `Updated review status for product "${existingReview.product.name}" (${existingReview.product.sku}) to "${status}". Author: ${existingReview.customerName}. Reason/Notes: ${moderationNotes || 'N/A'}`,
        ipAddress: req.headers.get('x-forwarded-for') || req.ip || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Review status changed to ${status}`,
      review: updatedReview,
    });
  } catch (err: any) {
    console.error('Review moderation error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update review status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/reviews/[id]
 * Add or update official reply as NEED ELECTRO
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const { id } = params;
    const body = await req.json();
    const { response, authorName } = body;

    const cleanResponse = sanitizeReviewText(response);
    if (!cleanResponse || cleanResponse.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Official response must be at least 5 characters' },
        { status: 400 }
      );
    }

    const review = await prisma.productReview.findUnique({
      where: { id },
      include: { responses: true, product: { select: { name: true, sku: true } } },
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    const officialName = (authorName && authorName.trim()) || 'NEED ELECTRO Official Support';

    let responseRecord;
    if (review.responses && review.responses.length > 0) {
      // Update existing response
      responseRecord = await prisma.reviewResponse.update({
        where: { id: review.responses[0].id },
        data: {
          response: cleanResponse,
          authorName: officialName,
          userId: user.id,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new response
      responseRecord = await prisma.reviewResponse.create({
        data: {
          reviewId: id,
          userId: user.id,
          authorName: officialName,
          response: cleanResponse,
          isOfficial: true,
        },
      });
    }

    // Write audit log
    await prisma.auditLog.create({
      data: {
        id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        userId: user.id,
        userName: user.name,
        module: 'REVIEWS',
        action: 'REVIEW_OFFICIAL_RESPONSE',
        recordId: id,
        details: `Published official business reply to review by ${review.customerName} on ${review.product.name}`,
        ipAddress: req.headers.get('x-forwarded-for') || req.ip || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Official response posted successfully',
      response: responseRecord,
    });
  } catch (err: any) {
    console.error('Review response error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to post response' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/reviews/[id]
 * Delete review permanently by authorized admin
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  try {
    const { id } = params;

    const review = await prisma.productReview.findUnique({
      where: { id },
      include: { product: { select: { name: true, sku: true } } },
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    await prisma.productReview.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        userId: user.id,
        userName: user.name,
        module: 'REVIEWS',
        action: 'REVIEW_DELETED',
        recordId: id,
        details: `Permanently deleted review for ${review.product.name} (SKU: ${review.product.sku}) originally submitted by ${review.customerName}`,
        ipAddress: req.headers.get('x-forwarded-for') || req.ip || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Review permanently removed',
    });
  } catch (err: any) {
    console.error('Delete review error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete review' },
      { status: 500 }
    );
  }
}

// NEED ELECTRO — Review Abuse/Spam Reporting API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateCustomer } from '@/lib/customerAuth';
import { sanitizeReviewText } from '@/lib/reviews';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    const body = await req.json();
    const { reviewId, reason, details } = body;

    if (!reviewId || typeof reviewId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    const validReasons = ['INAPPROPRIATE', 'SPAM', 'FAKE', 'OFFENSIVE', 'OTHER'];
    const cleanReason = validReasons.includes(reason) ? reason : 'OTHER';
    const cleanDetails = details ? sanitizeReviewText(details).slice(0, 500) : null;
    const ipAddress = req.headers.get('x-forwarded-for') || req.ip || null;

    // Verify review exists
    const review = await prisma.productReview.findUnique({
      where: { id: reviewId },
      select: { id: true, reportCount: true },
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Rate-limit: Check if same IP or customer reported this review recently
    if (customer) {
      const existingReport = await prisma.reviewReport.findFirst({
        where: {
          reviewId,
          customerId: customer.id,
        },
      });
      if (existingReport) {
        return NextResponse.json(
          { success: false, error: 'You have already reported this review' },
          { status: 400 }
        );
      }
    }

    // Save report & increment review report count
    await prisma.$transaction([
      prisma.reviewReport.create({
        data: {
          reviewId,
          customerId: customer ? customer.id : null,
          reason: cleanReason,
          details: cleanDetails,
          ipAddress,
          status: 'PENDING',
        },
      }),
      prisma.productReview.update({
        where: { id: reviewId },
        data: {
          reportCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Thank you for your report. Our moderation team will investigate this review.',
    });
  } catch (err: any) {
    console.error('Report error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to submit report' },
      { status: 500 }
    );
  }
}

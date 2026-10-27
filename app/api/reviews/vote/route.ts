// NEED ELECTRO — Review Helpful Vote Toggle API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateCustomer } from '@/lib/customerAuth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    if (!customer) {
      return NextResponse.json(
        { success: false, error: 'Sign in to vote on reviews' },
        { status: 401 }
      );
    }

    const { reviewId } = await req.json();
    if (!reviewId || typeof reviewId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Verify review exists
    const review = await prisma.productReview.findUnique({
      where: { id: reviewId },
      select: { id: true, customerId: true, helpfulCount: true },
    });

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      );
    }

    // Optional: customers cannot vote on their own review
    if (review.customerId === customer.id) {
      return NextResponse.json(
        { success: false, error: 'You cannot vote on your own review' },
        { status: 400 }
      );
    }

    // Check if customer already voted
    const existingVote = await prisma.reviewVote.findUnique({
      where: {
        reviewId_customerId: {
          reviewId,
          customerId: customer.id,
        },
      },
    });

    if (existingVote) {
      // Toggle off / remove vote
      await prisma.$transaction([
        prisma.reviewVote.delete({
          where: { id: existingVote.id },
        }),
        prisma.productReview.update({
          where: { id: reviewId },
          data: {
            helpfulCount: {
              decrement: 1,
            },
          },
        }),
      ]);

      const updated = await prisma.productReview.findUnique({
        where: { id: reviewId },
        select: { helpfulCount: true },
      });

      return NextResponse.json({
        success: true,
        hasVoted: false,
        helpfulCount: Math.max(0, updated?.helpfulCount || 0),
        message: 'Helpful vote removed',
      });
    } else {
      // Add vote
      await prisma.$transaction([
        prisma.reviewVote.create({
          data: {
            reviewId,
            customerId: customer.id,
            isHelpful: true,
          },
        }),
        prisma.productReview.update({
          where: { id: reviewId },
          data: {
            helpfulCount: {
              increment: 1,
            },
          },
        }),
      ]);

      const updated = await prisma.productReview.findUnique({
        where: { id: reviewId },
        select: { helpfulCount: true },
      });

      return NextResponse.json({
        success: true,
        hasVoted: true,
        helpfulCount: updated?.helpfulCount || 1,
        message: 'Marked review as helpful',
      });
    }
  } catch (err: any) {
    console.error('Vote error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to submit vote' },
      { status: 500 }
    );
  }
}

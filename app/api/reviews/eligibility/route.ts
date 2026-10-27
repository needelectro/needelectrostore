// NEED ELECTRO — Customer Review Eligibility Checker
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateCustomer } from '@/lib/customerAuth';
import { checkCustomerPurchaseEligibility } from '@/lib/reviews';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const customer = await authenticateCustomer(req);
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (!customer) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        canReview: false,
        message: 'Sign in to review this product',
      });
    }

    // Fetch product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true, sku: true },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check purchase eligibility against DELIVERED orders / COMPLETED sales
    const eligibility = await checkCustomerPurchaseEligibility(
      customer.id,
      customer.phone,
      product.id,
      product.sku
    );

    // Check existing review
    const existingReview = await prisma.productReview.findUnique({
      where: {
        productId_customerId: {
          productId: product.id,
          customerId: customer.id,
        },
      },
      include: {
        images: {
          select: { imageUrl: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      authenticated: true,
      canReview: true,
      isVerifiedPurchase: eligibility.isVerified,
      orderId: eligibility.orderId,
      existingReview: existingReview
        ? {
            id: existingReview.id,
            rating: existingReview.rating,
            title: existingReview.title,
            comment: existingReview.comment,
            status: existingReview.status,
            isVerifiedPurchase: existingReview.isVerifiedPurchase,
            images: existingReview.images.map((img) => img.imageUrl),
            createdAt: existingReview.createdAt,
            updatedAt: existingReview.updatedAt,
          }
        : null,
    });
  } catch (err: any) {
    console.error('Eligibility check error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to check eligibility' },
      { status: 500 }
    );
  }
}

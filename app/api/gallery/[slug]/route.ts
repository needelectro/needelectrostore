// NEED ELECTRO ERP & Storefront — Single Gallery Post & Update API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const rawSlug = params.slug;
    if (!rawSlug) {
      return NextResponse.json({ success: false, error: 'Slug parameter is required' }, { status: 400 });
    }

    const slug = decodeURIComponent(rawSlug).trim();

    // Query post by slug or ID
    const post = await prisma.galleryPost.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
        isPublished: true,
      },
      include: {
        category: {
          select: { id: true, name: true, nameBn: true, slug: true },
        },
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            category: true,
            brand: true,
            retailPrice: true,
            currentStock: true,
            imageUrl: true,
            status: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json({ success: false, error: 'Gallery post not found' }, { status: 404 });
    }

    // Increment views asynchronously
    prisma.galleryPost
      .update({
        where: { id: post.id },
        data: { views: { increment: 1 } },
      })
      .catch((err) => console.error('Failed to increment gallery views:', err));

    return NextResponse.json({
      success: true,
      data: {
        ...post,
        retailPrice: post.product?.retailPrice ? Number(post.product.retailPrice) : null,
      },
    });
  } catch (error: any) {
    console.error('Gallery Post API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve gallery post: ' + error.message },
      { status: 500 }
    );
  }
}

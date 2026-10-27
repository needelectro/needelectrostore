// NEED ELECTRO ERP & Storefront — Public Photo Gallery & Updates API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // 60s cache

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const skip = (page - 1) * limit;

    // Build filter conditions
    const whereCondition: any = {
      isPublished: true,
    };

    if (categorySlug && categorySlug !== 'all') {
      whereCondition.category = {
        slug: categorySlug,
      };
    }

    if (search && search.trim().length > 0) {
      const term = search.trim();
      whereCondition.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { titleBn: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { descriptionBn: { contains: term, mode: 'insensitive' } },
        { categoryName: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [posts, totalCount, categories] = await Promise.all([
      prisma.galleryPost.findMany({
        where: whereCondition,
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
        orderBy: [
          { isPinned: 'desc' },
          { publishedAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.galleryPost.count({ where: whereCondition }),
      prisma.galleryCategory.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: {
            select: { posts: { where: { isPublished: true } } },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        posts: posts.map((post) => ({
          ...post,
          retailPrice: post.product?.retailPrice ? Number(post.product.retailPrice) : null,
        })),
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasMore: skip + posts.length < totalCount,
        },
        categories: categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          nameBn: cat.nameBn,
          slug: cat.slug,
          description: cat.description,
          count: cat._count.posts,
        })),
      },
    });
  } catch (error: any) {
    console.error('Public Gallery API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve gallery updates: ' + error.message },
      { status: 500 }
    );
  }
}

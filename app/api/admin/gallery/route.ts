// NEED ELECTRO ERP — Admin Gallery & Business Updates Management API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { slugify } from '@/lib/seoConfig';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status'); // 'all' | 'published' | 'draft'
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '30', 10)));
    const skip = (page - 1) * limit;

    const whereCondition: any = {};

    if (categoryId && categoryId !== 'all') {
      whereCondition.categoryId = categoryId;
    }

    if (status === 'published') {
      whereCondition.isPublished = true;
    } else if (status === 'draft') {
      whereCondition.isPublished = false;
    }

    if (search && search.trim().length > 0) {
      const term = search.trim();
      whereCondition.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { titleBn: { contains: term, mode: 'insensitive' } },
        { slug: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
        { categoryName: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [posts, totalCount, totalPublished, totalDrafts, categories, products] = await Promise.all([
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
              retailPrice: true,
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
      prisma.galleryPost.count({ where: { isPublished: true } }),
      prisma.galleryPost.count({ where: { isPublished: false } }),
      prisma.galleryCategory.findMany({
        orderBy: { sortOrder: 'asc' },
      }),
      prisma.product.findMany({
        where: { isPublished: true },
        select: { id: true, name: true, sku: true, category: true, retailPrice: true, imageUrl: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        posts: posts.map((post) => ({
          ...post,
          retailPrice: post.product?.retailPrice ? Number(post.product.retailPrice) : null,
        })),
        stats: {
          total: totalPublished + totalDrafts,
          published: totalPublished,
          drafts: totalDrafts,
        },
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
        categories,
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category,
          retailPrice: Number(p.retailPrice),
          imageUrl: p.imageUrl,
        })),
      },
    });
  } catch (error: any) {
    console.error('Admin Gallery GET API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve admin gallery posts: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const {
      title,
      titleBn,
      slug: customSlug,
      description,
      descriptionBn,
      categoryId,
      coverImage,
      images,
      tags,
      productId,
      destinationUrl,
      isPinned,
      isPublished,
      publishedAt,
    } = body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Post title is required.' }, { status: 400 });
    }

    if (!coverImage || coverImage.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Cover image is required.' }, { status: 400 });
    }

    // Generate clean unique slug
    let baseSlug = customSlug ? slugify(customSlug) : slugify(title);
    if (!baseSlug) baseSlug = `post-${Date.now()}`;

    let uniqueSlug = baseSlug;
    let collisionCount = 1;
    while (await prisma.galleryPost.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${collisionCount++}`;
    }

    // Resolve category name if categoryId supplied
    let categoryName = 'General';
    if (categoryId) {
      const cat = await prisma.galleryCategory.findUnique({ where: { id: categoryId } });
      if (cat) categoryName = cat.name;
    }

    const post = await prisma.galleryPost.create({
      data: {
        title: title.trim(),
        titleBn: titleBn ? titleBn.trim() : null,
        slug: uniqueSlug,
        description: description ? description.trim() : null,
        descriptionBn: descriptionBn ? descriptionBn.trim() : null,
        categoryId: categoryId || null,
        categoryName,
        coverImage: coverImage.trim(),
        images: Array.isArray(images) && images.length > 0 ? images : [{ url: coverImage.trim(), order: 1 }],
        tags: Array.isArray(tags) ? tags : [],
        productId: productId || null,
        destinationUrl: destinationUrl ? destinationUrl.trim() : null,
        isPinned: Boolean(isPinned),
        isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      },
      include: {
        category: true,
        product: {
          select: { id: true, name: true, sku: true, retailPrice: true, imageUrl: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Gallery update post created successfully.',
      data: post,
    });
  } catch (error: any) {
    console.error('Admin Gallery POST API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create gallery post: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const {
      id,
      title,
      titleBn,
      slug: customSlug,
      description,
      descriptionBn,
      categoryId,
      coverImage,
      images,
      tags,
      productId,
      destinationUrl,
      isPinned,
      isPublished,
      publishedAt,
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Post ID is required for update.' }, { status: 400 });
    }

    const existing = await prisma.galleryPost.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Post not found.' }, { status: 404 });
    }

    // Slug check if changed
    let updatedSlug = existing.slug;
    if (customSlug && slugify(customSlug) !== existing.slug) {
      const candidate = slugify(customSlug);
      const collision = await prisma.galleryPost.findFirst({
        where: { slug: candidate, id: { not: id } },
      });
      if (collision) {
        return NextResponse.json({ success: false, error: `Slug "${candidate}" is already in use.` }, { status: 400 });
      }
      updatedSlug = candidate;
    }

    let categoryName = existing.categoryName;
    if (categoryId && categoryId !== existing.categoryId) {
      const cat = await prisma.galleryCategory.findUnique({ where: { id: categoryId } });
      if (cat) categoryName = cat.name;
    } else if (categoryId === null) {
      categoryName = 'General';
    }

    const updated = await prisma.galleryPost.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title: title.trim() } : {}),
        ...(titleBn !== undefined ? { titleBn: titleBn ? titleBn.trim() : null } : {}),
        slug: updatedSlug,
        ...(description !== undefined ? { description: description ? description.trim() : null } : {}),
        ...(descriptionBn !== undefined ? { descriptionBn: descriptionBn ? descriptionBn.trim() : null } : {}),
        ...(categoryId !== undefined ? { categoryId: categoryId || null, categoryName } : {}),
        ...(coverImage !== undefined ? { coverImage: coverImage.trim() } : {}),
        ...(images !== undefined ? { images } : {}),
        ...(tags !== undefined ? { tags } : {}),
        ...(productId !== undefined ? { productId: productId || null } : {}),
        ...(destinationUrl !== undefined ? { destinationUrl: destinationUrl ? destinationUrl.trim() : null } : {}),
        ...(isPinned !== undefined ? { isPinned: Boolean(isPinned) } : {}),
        ...(isPublished !== undefined ? { isPublished: Boolean(isPublished) } : {}),
        ...(publishedAt !== undefined ? { publishedAt: new Date(publishedAt) } : {}),
      },
      include: {
        category: true,
        product: {
          select: { id: true, name: true, sku: true, retailPrice: true, imageUrl: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Gallery update post updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    console.error('Admin Gallery PUT API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update gallery post: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Post ID is required for deletion.' }, { status: 400 });
    }

    await prisma.galleryPost.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Gallery post deleted successfully.',
    });
  } catch (error: any) {
    console.error('Admin Gallery DELETE API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete gallery post: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json({ success: false, error: 'Post ID and action are required.' }, { status: 400 });
    }

    const post = await prisma.galleryPost.findUnique({ where: { id } });
    if (!post) {
      return NextResponse.json({ success: false, error: 'Post not found.' }, { status: 404 });
    }

    let updatedData: any = {};
    if (action === 'toggle_publish') {
      updatedData.isPublished = !post.isPublished;
    } else if (action === 'toggle_pin') {
      updatedData.isPinned = !post.isPinned;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
    }

    const updated = await prisma.galleryPost.update({
      where: { id },
      data: updatedData,
    });

    return NextResponse.json({
      success: true,
      message: `Post ${action} updated successfully.`,
      data: updated,
    });
  } catch (error: any) {
    console.error('Admin Gallery PATCH API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to patch gallery post: ' + error.message },
      { status: 500 }
    );
  }
}

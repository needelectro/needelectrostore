// NEED ELECTRO ERP — Admin Gallery Categories API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { slugify } from '@/lib/seoConfig';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const categories = await prisma.galleryCategory.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        nameBn: cat.nameBn,
        slug: cat.slug,
        description: cat.description,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
        postCount: cat._count.posts,
      })),
    });
  } catch (error: any) {
    console.error('Gallery Categories GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { name, nameBn, slug: customSlug, description, sortOrder, isActive } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ success: false, error: 'Category name is required.' }, { status: 400 });
    }

    let baseSlug = customSlug ? slugify(customSlug) : slugify(name);
    if (!baseSlug) baseSlug = `cat-${Date.now()}`;

    let uniqueSlug = baseSlug;
    let collisionCount = 1;
    while (await prisma.galleryCategory.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${collisionCount++}`;
    }

    const category = await prisma.galleryCategory.create({
      data: {
        name: name.trim(),
        nameBn: nameBn ? nameBn.trim() : null,
        slug: uniqueSlug,
        description: description ? description.trim() : null,
        sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Category created successfully.',
      data: category,
    });
  } catch (error: any) {
    console.error('Gallery Categories POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create category: ' + error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await req.json();
    const { id, name, nameBn, slug: customSlug, description, sortOrder, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Category ID is required.' }, { status: 400 });
    }

    const existing = await prisma.galleryCategory.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Category not found.' }, { status: 404 });
    }

    let updatedSlug = existing.slug;
    if (customSlug && slugify(customSlug) !== existing.slug) {
      const candidate = slugify(customSlug);
      const collision = await prisma.galleryCategory.findFirst({
        where: { slug: candidate, id: { not: id } },
      });
      if (collision) {
        return NextResponse.json({ success: false, error: `Slug "${candidate}" already exists.` }, { status: 400 });
      }
      updatedSlug = candidate;
    }

    const updated = await prisma.galleryCategory.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: name.trim() } : {}),
        ...(nameBn !== undefined ? { nameBn: nameBn ? nameBn.trim() : null } : {}),
        slug: updatedSlug,
        ...(description !== undefined ? { description: description ? description.trim() : null } : {}),
        ...(sortOrder !== undefined ? { sortOrder: Number(sortOrder) } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });

    // Also update cached categoryName in posts if name changed
    if (name && name.trim() !== existing.name) {
      await prisma.galleryPost.updateMany({
        where: { categoryId: id },
        data: { categoryName: name.trim() },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully.',
      data: updated,
    });
  } catch (error: any) {
    console.error('Gallery Categories PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update category: ' + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Category ID is required.' }, { status: 400 });
    }

    // Unlink posts before deletion
    await prisma.galleryPost.updateMany({
      where: { categoryId: id },
      data: { categoryId: null, categoryName: 'General' },
    });

    await prisma.galleryCategory.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully.',
    });
  } catch (error: any) {
    console.error('Gallery Categories DELETE error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete category: ' + error.message },
      { status: 500 }
    );
  }
}

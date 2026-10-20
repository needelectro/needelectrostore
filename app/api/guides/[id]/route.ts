// NEED ELECTRO ERP — Guide Article Item API (PUT / DELETE / GET)
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { slugify } from '@/lib/seoConfig';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const article = await prisma.guideArticle.findFirst({
      where: {
        OR: [
          { id: params.id },
          { slug: params.id },
        ],
      },
    });

    if (!article) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: article });
  } catch (err: any) {
    console.error('Fetch guide error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'settings', 'edit') && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const existing = await prisma.guideArticle.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Article not found' }, { status: 404 });
    }

    let finalSlug = existing.slug;
    if (body.slug && body.slug !== existing.slug) {
      finalSlug = slugify(body.slug);
      const duplicate = await prisma.guideArticle.findFirst({
        where: { slug: finalSlug, id: { not: params.id } },
      });
      if (duplicate) {
        finalSlug = `${finalSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const updated = await prisma.guideArticle.update({
      where: { id: params.id },
      data: {
        slug: finalSlug,
        category: body.category !== undefined ? body.category : existing.category,
        title: body.title !== undefined ? body.title : existing.title,
        titleBn: body.titleBn !== undefined ? body.titleBn : existing.titleBn,
        seoTitle: body.seoTitle !== undefined ? body.seoTitle : existing.seoTitle,
        metaDescription: body.metaDescription !== undefined ? body.metaDescription : existing.metaDescription,
        metaDescriptionBn: body.metaDescriptionBn !== undefined ? body.metaDescriptionBn : existing.metaDescriptionBn,
        summary: body.summary !== undefined ? body.summary : existing.summary,
        summaryBn: body.summaryBn !== undefined ? body.summaryBn : existing.summaryBn,
        content: body.content !== undefined ? body.content : existing.content,
        contentBn: body.contentBn !== undefined ? body.contentBn : existing.contentBn,
        featuredImage: body.featuredImage !== undefined ? body.featuredImage : existing.featuredImage,
        readingTime: body.readingTime !== undefined ? body.readingTime : existing.readingTime,
        author: body.author !== undefined ? body.author : existing.author,
        authorRole: body.authorRole !== undefined ? body.authorRole : existing.authorRole,
        tableOfContents: body.tableOfContents !== undefined ? body.tableOfContents : (existing.tableOfContents as any),
        priceTable: body.priceTable !== undefined ? body.priceTable : (existing.priceTable as any),
        comparisonTable: body.comparisonTable !== undefined ? body.comparisonTable : (existing.comparisonTable as any),
        faqs: body.faqs !== undefined ? body.faqs : (existing.faqs as any),
        relatedSkus: body.relatedSkus !== undefined ? body.relatedSkus : (existing.relatedSkus as any),
        relatedServices: body.relatedServices !== undefined ? body.relatedServices : (existing.relatedServices as any),
        relatedGuideSlugs: body.relatedGuideSlugs !== undefined ? body.relatedGuideSlugs : (existing.relatedGuideSlugs as any),
        isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : existing.isFeatured,
        isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : existing.isPublished,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Guide article updated successfully.',
      data: updated,
    });
  } catch (err: any) {
    console.error('Update guide error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  try {
    await prisma.guideArticle.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Article deleted successfully.',
    });
  } catch (err: any) {
    console.error('Delete guide error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

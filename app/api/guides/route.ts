// NEED ELECTRO ERP — Guide Articles CRUD API
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, hasPermission } from '@/lib/auth';
import { slugify } from '@/lib/seoConfig';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const publishedOnly = searchParams.get('publishedOnly') === 'true';

    const where: any = {};
    if (category && category !== 'ALL') where.category = category;
    if (publishedOnly) where.isPublished = true;

    const articles = await prisma.guideArticle.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
    });

    return NextResponse.json({
      success: true,
      count: articles.length,
      data: articles,
    });
  } catch (err: any) {
    console.error('Fetch guide articles error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch guide articles' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth(req);
  if (user instanceof NextResponse) return user;

  if (!hasPermission(user, 'settings', 'edit') && user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 });
  }

  try {
    const body = await req.json();
    if (!body.title || !body.category || !body.content) {
      return NextResponse.json(
        { success: false, error: 'Title, category, and content are required.' },
        { status: 400 }
      );
    }

    const rawSlug = body.slug ? slugify(body.slug) : slugify(body.title);
    let finalSlug = rawSlug;
    let counter = 1;
    while (await prisma.guideArticle.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${rawSlug}-${counter++}`;
    }

    const article = await prisma.guideArticle.create({
      data: {
        id: 'guide-' + Date.now(),
        slug: finalSlug,
        category: body.category,
        title: body.title,
        titleBn: body.titleBn || null,
        seoTitle: body.seoTitle || null,
        metaDescription: body.metaDescription || body.summary || body.title,
        metaDescriptionBn: body.metaDescriptionBn || null,
        summary: body.summary || body.title,
        summaryBn: body.summaryBn || null,
        content: body.content,
        contentBn: body.contentBn || null,
        featuredImage: body.featuredImage || null,
        readingTime: body.readingTime || '5 min read',
        author: body.author || user.name || 'Amdadur Rahman',
        authorRole: body.authorRole || 'Founder & Managing Director',
        tableOfContents: body.tableOfContents || [],
        priceTable: body.priceTable || undefined,
        comparisonTable: body.comparisonTable || undefined,
        faqs: body.faqs || [],
        relatedSkus: body.relatedSkus || [],
        relatedServices: body.relatedServices || [],
        relatedGuideSlugs: body.relatedGuideSlugs || [],
        isFeatured: Boolean(body.isFeatured),
        isPublished: body.isPublished !== undefined ? Boolean(body.isPublished) : true,
        publishedAt: body.publishedAt ? new Date(body.publishedAt) : new Date(),
      },
    });

    // Record audit log
    await prisma.auditLog.create({
      data: {
        id: 'audit-' + Date.now(),
        userId: user.id,
        userName: user.name,
        action: 'GUIDE_CREATED',
        module: 'CONTENT',
        recordId: article.id,
        details: `Created guide article: ${article.title} (slug: ${article.slug})`,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Guide article published successfully.',
      data: article,
    });
  } catch (err: any) {
    console.error('Create guide article error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create guide article' },
      { status: 500 }
    );
  }
}

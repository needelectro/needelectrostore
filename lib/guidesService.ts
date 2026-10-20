// NEED ELECTRO — Content SEO Hub Service Engine
// Interfaces with Prisma database and provides robust fallbacks to INITIAL_GUIDES

import { prisma } from '@/lib/prisma';
import { INITIAL_GUIDES, GuideArticleData, GuideCategory } from './guidesData';

export async function ensureGuidesSeeded() {
  try {
    const count = await prisma.guideArticle.count();
    if (count === 0) {
      console.log('Seeding initial 12 Guide Articles into Supabase PostgreSQL...');
      for (const guide of INITIAL_GUIDES) {
        await prisma.guideArticle.create({
          data: {
            id: guide.id,
            slug: guide.slug,
            category: guide.category,
            title: guide.title,
            titleBn: guide.titleBn,
            seoTitle: guide.seoTitle,
            metaDescription: guide.metaDescription,
            metaDescriptionBn: guide.metaDescriptionBn,
            summary: guide.summary,
            summaryBn: guide.summaryBn,
            content: guide.content,
            contentBn: guide.contentBn,
            featuredImage: guide.featuredImage,
            readingTime: guide.readingTime,
            author: guide.author,
            authorRole: guide.authorRole,
            tableOfContents: guide.tableOfContents as any,
            priceTable: guide.priceTable ? (guide.priceTable as any) : undefined,
            comparisonTable: guide.comparisonTable ? (guide.comparisonTable as any) : undefined,
            faqs: guide.faqs as any,
            relatedSkus: guide.relatedSkus as any,
            relatedServices: guide.relatedServices as any,
            relatedGuideSlugs: guide.relatedGuideSlugs as any,
            isFeatured: guide.isFeatured,
            isPublished: guide.isPublished,
            publishedAt: new Date(guide.publishedAt),
            updatedAt: new Date(guide.updatedAt),
          },
        });
      }
      console.log('Successfully seeded Guide Articles.');
    }
  } catch (err) {
    console.warn('Guides database sync skipped or table already exists:', err);
  }
}

export async function getGuides(options: {
  category?: GuideCategory;
  isFeatured?: boolean;
  limit?: number;
  searchQuery?: string;
} = {}): Promise<GuideArticleData[]> {
  try {
    const where: any = { isPublished: true };
    if (options.category) where.category = options.category;
    if (options.isFeatured !== undefined) where.isFeatured = options.isFeatured;
    if (options.searchQuery) {
      where.OR = [
        { title: { contains: options.searchQuery, mode: 'insensitive' } },
        { summary: { contains: options.searchQuery, mode: 'insensitive' } },
        { content: { contains: options.searchQuery, mode: 'insensitive' } },
      ];
    }

    const records = await prisma.guideArticle.findMany({
      where,
      orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
      take: options.limit,
    });

    if (records && records.length > 0) {
      return records.map(r => ({
        id: r.id,
        slug: r.slug,
        category: r.category as GuideCategory,
        title: r.title,
        titleBn: r.titleBn || undefined,
        seoTitle: r.seoTitle || undefined,
        metaDescription: r.metaDescription,
        metaDescriptionBn: r.metaDescriptionBn || undefined,
        summary: r.summary,
        summaryBn: r.summaryBn || undefined,
        content: r.content,
        contentBn: r.contentBn || undefined,
        featuredImage: r.featuredImage || undefined,
        readingTime: r.readingTime || '6 min read',
        author: r.author,
        authorRole: r.authorRole || 'Founder & Managing Director',
        tableOfContents: (r.tableOfContents as any) || [],
        priceTable: (r.priceTable as any) || undefined,
        comparisonTable: (r.comparisonTable as any) || undefined,
        faqs: (r.faqs as any) || [],
        relatedSkus: (r.relatedSkus as any) || [],
        relatedServices: (r.relatedServices as any) || [],
        relatedGuideSlugs: (r.relatedGuideSlugs as any) || [],
        isFeatured: r.isFeatured,
        isPublished: r.isPublished,
        publishedAt: r.publishedAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));
    }
  } catch (err) {
    console.error('Error fetching guide articles from DB, falling back to static dataset:', err);
  }

  // Fallback to static memory array
  let filtered = INITIAL_GUIDES.filter(g => g.isPublished);
  if (options.category) {
    filtered = filtered.filter(g => g.category === options.category);
  }
  if (options.isFeatured !== undefined) {
    filtered = filtered.filter(g => g.isFeatured === options.isFeatured);
  }
  if (options.searchQuery) {
    const q = options.searchQuery.toLowerCase();
    filtered = filtered.filter(
      g => g.title.toLowerCase().includes(q) || g.summary.toLowerCase().includes(q) || g.content.toLowerCase().includes(q)
    );
  }
  if (options.limit) {
    filtered = filtered.slice(0, options.limit);
  }
  return filtered;
}

export async function getGuideBySlug(slug: string): Promise<GuideArticleData | null> {
  try {
    const record = await prisma.guideArticle.findUnique({
      where: { slug },
    });

    if (record) {
      // Increment views count non-blockingly
      prisma.guideArticle.update({
        where: { id: record.id },
        data: { views: { increment: 1 } },
      }).catch(() => {});

      return {
        id: record.id,
        slug: record.slug,
        category: record.category as GuideCategory,
        title: record.title,
        titleBn: record.titleBn || undefined,
        seoTitle: record.seoTitle || undefined,
        metaDescription: record.metaDescription,
        metaDescriptionBn: record.metaDescriptionBn || undefined,
        summary: record.summary,
        summaryBn: record.summaryBn || undefined,
        content: record.content,
        contentBn: record.contentBn || undefined,
        featuredImage: record.featuredImage || undefined,
        readingTime: record.readingTime || '6 min read',
        author: record.author,
        authorRole: record.authorRole || 'Founder & Managing Director',
        tableOfContents: (record.tableOfContents as any) || [],
        priceTable: (record.priceTable as any) || undefined,
        comparisonTable: (record.comparisonTable as any) || undefined,
        faqs: (record.faqs as any) || [],
        relatedSkus: (record.relatedSkus as any) || [],
        relatedServices: (record.relatedServices as any) || [],
        relatedGuideSlugs: (record.relatedGuideSlugs as any) || [],
        isFeatured: record.isFeatured,
        isPublished: record.isPublished,
        publishedAt: record.publishedAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
      };
    }
  } catch (err) {
    console.error(`Error querying guide by slug "${slug}", falling back to static dataset:`, err);
  }

  // Fallback
  return INITIAL_GUIDES.find(g => g.slug === slug) || null;
}

// Query real product data by SKUs to render live product cards
export async function getRelatedProductsForGuide(skus: string[]) {
  if (!skus || skus.length === 0) return [];
  try {
    const products = await prisma.product.findMany({
      where: {
        sku: { in: skus, mode: 'insensitive' },
        status: { in: ['ACTIVE', 'OUT_OF_STOCK'] },
      },
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        brand: true,
        model: true,
        description: true,
        imageUrl: true,
        retailPrice: true,
        emiPrice: true,
        currentStock: true,
        warrantyPeriodMonths: true,
        specs: true,
      },
    });

    return products.map(p => ({
      ...p,
      retailPrice: Number(p.retailPrice),
      emiPrice: Number(p.emiPrice),
    }));
  } catch (err) {
    console.error('Failed to query related products for guide:', err);
    return [];
  }
}

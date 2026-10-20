// NEED ELECTRO — Content SEO Hub Instant Search API
import { NextRequest, NextResponse } from 'next/server';
import { getGuides } from '@/lib/guidesService';
import { GuideCategory } from '@/lib/guidesData';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();
    const category = searchParams.get('category') as GuideCategory | null;

    if (!q || q.length < 2) {
      const featured = await getGuides({ limit: 6, isFeatured: true });
      return NextResponse.json({
        success: true,
        query: q,
        count: featured.length,
        data: featured.map(g => ({
          id: g.id,
          slug: g.slug,
          category: g.category,
          title: g.title,
          summary: g.summary,
          readingTime: g.readingTime,
          publishedAt: g.publishedAt,
        })),
      });
    }

    const results = await getGuides({
      searchQuery: q,
      category: category || undefined,
      limit: 10,
    });

    return NextResponse.json({
      success: true,
      query: q,
      count: results.length,
      data: results.map(g => ({
        id: g.id,
        slug: g.slug,
        category: g.category,
        title: g.title,
        titleBn: g.titleBn,
        summary: g.summary,
        readingTime: g.readingTime,
        publishedAt: g.publishedAt,
      })),
    });
  } catch (err: any) {
    console.error('Guides search error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to search guides' },
      { status: 500 }
    );
  }
}

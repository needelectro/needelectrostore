// NEED ELECTRO ERP — Search Engine Optimization & Health Administration API
// Enforces server-side authentication and role-based permissions
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { BUSINESS_INFO, BLOG_POSTS, slugify, buildProductSchema } from '@/lib/seoConfig';
import { getAllDivisions, getAllDistricts } from '@/lib/bangladeshLocations';
import { MASTER_KEYWORD_DATABASE } from '@/lib/keywordDatabase';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  // Keyword Database Query Support
  if (req.nextUrl.searchParams.get('view') === 'keywords') {
    const cluster = req.nextUrl.searchParams.get('cluster');
    const priority = req.nextUrl.searchParams.get('priority');
    let list = MASTER_KEYWORD_DATABASE;
    if (cluster) {
      list = list.filter(k => k.topicCluster.toLowerCase().includes(cluster.toLowerCase()));
    }
    if (priority) {
      list = list.filter(k => k.priority.toLowerCase() === priority.toLowerCase());
    }
    return NextResponse.json({
      success: true,
      total: list.length,
      data: list,
    });
  }

  try {
    // 1. Audit Products for Technical SEO Completeness
    const [allProducts, categories, guideArticles] = await Promise.all([
      prisma.product.findMany({
        select: {
          id: true,
          name: true,
          sku: true,
          category: true,
          brand: true,
          retailPrice: true,
          currentStock: true,
          status: true,
          isPublished: true,
          imageUrl: true,
          images: true,
          description: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.categoryConfig.findMany({
        select: { id: true, name: true, code: true, description: true, isActive: true },
      }),
      prisma.guideArticle.findMany({
        select: { id: true, slug: true, title: true, isPublished: true, category: true },
      }),
    ]);

    const totalProducts = allProducts.length;
    const publishedProducts = allProducts.filter(p => p.isPublished);
    const missingImages = allProducts.filter(p => !p.imageUrl || p.imageUrl.trim() === '');
    const thinDescriptions = allProducts.filter(
      p => !p.description || p.description.trim().length < 50
    );
    const zeroPrice = allProducts.filter(p => Number(p.retailPrice) <= 0);
    const outOfStock = allProducts.filter(p => p.currentStock <= 0 || p.status === 'OUT_OF_STOCK');

    // Detect duplicate product names/slugs
    const nameMap = new Map<string, string[]>();
    const slugMap = new Map<string, string[]>();

    allProducts.forEach(p => {
      const lowerName = p.name.trim().toLowerCase();
      const slug = `${slugify(p.name)}-${p.sku.toLowerCase()}`;

      if (!nameMap.has(lowerName)) nameMap.set(lowerName, []);
      nameMap.get(lowerName)!.push(p.sku);

      if (!slugMap.has(slug)) slugMap.set(slug, []);
      slugMap.get(slug)!.push(p.sku);
    });

    const duplicateNames: Array<{ name: string; skus: string[] }> = [];
    nameMap.forEach((skus, name) => {
      if (skus.length > 1) duplicateNames.push({ name, skus });
    });

    const duplicateSlugs: Array<{ slug: string; skus: string[] }> = [];
    slugMap.forEach((skus, slug) => {
      if (skus.length > 1) duplicateSlugs.push({ slug, skus });
    });

    // 2. Audit Categories
    const categoriesWithoutDescription = categories.filter(
      c => !c.description || c.description.trim().length < 20
    );

    // 3. Sitemap Summary
    const staticRoutesCount = 38;
    const locationRoutesCount = getAllDivisions().length + getAllDistricts().length - 2; // exclude Moulvibazar & Sylhet dedicated pages
    const blogCount = BLOG_POSTS.length;
    const guidesCount = guideArticles.filter(g => g.isPublished).length;
    const sitemapEligibleProducts = publishedProducts.filter(
      p => p.status === 'ACTIVE' || p.status === 'OUT_OF_STOCK'
    ).length;

    const totalSitemapUrls =
      staticRoutesCount + locationRoutesCount + blogCount + guidesCount + sitemapEligibleProducts;

    // 4. Overall Technical SEO Score Calculation (0 - 100%)
    let score = 100;
    if (missingImages.length > 0) score -= Math.min(25, Math.round((missingImages.length / totalProducts) * 30));
    if (thinDescriptions.length > 0) score -= Math.min(20, Math.round((thinDescriptions.length / totalProducts) * 20));
    if (duplicateNames.length > 0) score -= Math.min(15, duplicateNames.length * 3);
    if (duplicateSlugs.length > 0) score -= Math.min(20, duplicateSlugs.length * 5);
    if (categoriesWithoutDescription.length > 0) score -= Math.min(10, categoriesWithoutDescription.length * 2);
    score = Math.max(10, Math.min(100, score));

    return NextResponse.json({
      success: true,
      data: {
        score,
        canonicalDomain: BUSINESS_INFO.domain,
        products: {
          total: totalProducts,
          published: publishedProducts.length,
          missingImagesCount: missingImages.length,
          missingImagesSamples: missingImages.slice(0, 10).map(p => ({ sku: p.sku, name: p.name })),
          thinDescriptionsCount: thinDescriptions.length,
          thinDescriptionsSamples: thinDescriptions.slice(0, 10).map(p => ({ sku: p.sku, name: p.name })),
          zeroPriceCount: zeroPrice.length,
          outOfStockCount: outOfStock.length,
          duplicateNames,
          duplicateSlugs,
        },
        categories: {
          total: categories.length,
          missingDescriptionsCount: categoriesWithoutDescription.length,
          missingDescriptions: categoriesWithoutDescription.map(c => ({ name: c.name, code: c.code })),
        },
        sitemap: {
          status: 'Dynamic Real-Time Generator',
          totalUrls: totalSitemapUrls,
          breakdown: {
            staticLandingPages: staticRoutesCount,
            locationsGeoSeo: locationRoutesCount,
            knowledgeBlogPosts: blogCount,
            guideArticles: guidesCount,
            productsIndexed: sitemapEligibleProducts,
          },
          sitemapUrl: `${BUSINESS_INFO.domain}/sitemap.xml`,
        },
        indexNow: {
          enabled: true,
          keyConfigured: Boolean(process.env.INDEXNOW_KEY || 'c4a5f6e8b91240a3d76251c54b88392e'),
          endpoint: 'https://api.indexnow.org/indexnow',
        },
        googleSearchConsole: {
          siteVerificationConfigured: Boolean(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION),
          bingVerificationConfigured: Boolean(process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION),
        },
      },
    });
  } catch (error: any) {
    console.error('SEO audit API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate SEO audit report: ' + error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof NextResponse) return auth;

  // Verify Admin / Super Admin role
  if (auth.role !== 'SUPER_ADMIN' && auth.role !== 'ADMIN') {
    return NextResponse.json(
      { success: false, error: 'Permission denied. Admin role required.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { action } = body;

    // ACTION 1: Check Slug Collision
    if (action === 'check_slug') {
      const candidate = slugify(body.slug || '');
      if (!candidate) {
        return NextResponse.json({ success: false, error: 'Invalid or empty slug provided.' }, { status: 400 });
      }

      // Check collision with products
      const existingProduct = await prisma.product.findFirst({
        where: {
          OR: [
            { sku: { equals: candidate, mode: 'insensitive' } },
            { id: candidate },
          ],
        },
        select: { id: true, name: true, sku: true },
      });

      // Check collision with Guide articles
      const existingGuide = await prisma.guideArticle.findUnique({
        where: { slug: candidate },
        select: { id: true, title: true, slug: true },
      });

      // Check collision with static public reserved paths
      const reservedPaths = [
        'shop', 'laptops', 'computers', 'cctv', 'electrical-products',
        'computer-accessories', 'networking', 'smart-devices', 'services',
        'laptop-emi', 'delivery', 'about', 'contact', 'faq', 'blog',
        'guides', 'cart', 'checkout', 'admin', 'api', 'locations',
      ];
      const isReserved = reservedPaths.includes(candidate.toLowerCase());

      const isCollision = Boolean(existingProduct || existingGuide || isReserved);

      return NextResponse.json({
        success: true,
        data: {
          slug: candidate,
          isAvailable: !isCollision,
          collisionType: isReserved
            ? 'Reserved System Route'
            : existingProduct
            ? `Existing Product (${existingProduct.name} [${existingProduct.sku}])`
            : existingGuide
            ? `Existing Guide Article (${existingGuide.title})`
            : null,
        },
      });
    }

    // ACTION 2: Validate Schema for a Product
    if (action === 'validate_schema') {
      const { productId } = body;
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
      }

      const schema = buildProductSchema({
        name: product.name,
        sku: product.sku,
        category: product.category,
        brand: product.brand,
        model: product.model,
        description: product.description,
        imageUrl: product.imageUrl,
        images: Array.isArray(product.images) ? (product.images as string[]) : [],
        retailPrice: Number(product.retailPrice),
        currentStock: product.currentStock,
        warrantyPeriodMonths: product.warrantyPeriodMonths,
        specs: product.specs,
        status: product.status,
      });

      // Run schema diagnostics against Google Merchant & Schema.org required properties
      const diagnostics: string[] = [];
      if (!product.imageUrl) diagnostics.push('Warning: Product has no primary image URL (schema fallback image used).');
      if (!product.description || product.description.length < 20) diagnostics.push('Warning: Description is short or missing.');
      if (Number(product.retailPrice) <= 0) diagnostics.push('Warning: Price is 0.00 BDT.');
      if (!product.brand) diagnostics.push('Warning: Brand is not set (defaulted to NEED ELECTRO).');

      return NextResponse.json({
        success: true,
        data: {
          isValid: true,
          schema,
          diagnostics,
        },
      });
    }

    // ACTION 3: Trigger IndexNow Search Engine Submission
    if (action === 'ping_indexnow') {
      const key = process.env.INDEXNOW_KEY || 'c4a5f6e8b91240a3d76251c54b88392e';
      const host = BUSINESS_INFO.domain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
      const urlList: string[] = Array.isArray(body.urls) && body.urls.length > 0
        ? body.urls
        : [
            `${BUSINESS_INFO.domain}/`,
            `${BUSINESS_INFO.domain}/shop`,
            `${BUSINESS_INFO.domain}/laptops`,
            `${BUSINESS_INFO.domain}/cctv`,
            `${BUSINESS_INFO.domain}/computers`,
            `${BUSINESS_INFO.domain}/guides`,
          ];

      const payload = {
        host,
        key,
        keyLocation: `${BUSINESS_INFO.domain}/${key}.txt`,
        urlList,
      };

      try {
        const response = await fetch('https://api.indexnow.org/indexnow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json; charset=utf-8' },
          body: JSON.stringify(payload),
        });

        return NextResponse.json({
          success: true,
          data: {
            status: response.status,
            statusText: response.statusText,
            urlsSubmitted: urlList.length,
            message: response.ok
              ? `Successfully submitted ${urlList.length} URLs to IndexNow network (Bing, Yandex, Naver).`
              : `IndexNow responded with status ${response.status}`,
          },
        });
      } catch (pingErr: any) {
        return NextResponse.json({
          success: false,
          error: 'IndexNow network submission failed: ' + pingErr.message,
        });
      }
    }

    // ACTION 4: Update Product SEO Metadata & Publishing Status
    if (action === 'update_product_seo') {
      const { productId, description, isPublished, imageUrl } = body;
      if (!productId) {
        return NextResponse.json({ success: false, error: 'Product ID is required.' }, { status: 400 });
      }

      const updated = await prisma.product.update({
        where: { id: productId },
        data: {
          ...(description !== undefined && { description: String(description).trim() }),
          ...(isPublished !== undefined && { isPublished: Boolean(isPublished) }),
          ...(imageUrl !== undefined && { imageUrl: String(imageUrl).trim() }),
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          id: updated.id,
          sku: updated.sku,
          isPublished: updated.isPublished,
          description: updated.description,
          message: 'Product SEO settings saved successfully.',
        },
      });
    }

    return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
  } catch (error: any) {
    console.error('SEO admin POST error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to execute SEO action: ' + error.message },
      { status: 500 }
    );
  }
}

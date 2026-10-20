import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BUSINESS_INFO, slugify } from '@/lib/seoConfig';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // 1 hour cache

function sanitizeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  try {
    const domain = BUSINESS_INFO.domain.replace(/\/+$/, '');
    const products = await prisma.product.findMany({
      where: {
        status: { in: ['ACTIVE', 'OUT_OF_STOCK'] },
        isPublished: true,
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
        currentStock: true,
        warrantyPeriodMonths: true,
        updatedAt: true,
      },
      take: 2000,
    });

    const itemsXml = products.map((p) => {
      const slug = `${slugify(p.name)}-${p.sku.toLowerCase()}`;
      const productUrl = `${domain}/product/${slug}`;
      const img = p.imageUrl
        ? p.imageUrl.startsWith('http')
          ? p.imageUrl
          : `${domain}${p.imageUrl}`
        : `${domain}/logo-dark-transparent.png`;

      const isRefurbished =
        p.name.toLowerCase().includes('refurbished') ||
        p.name.toLowerCase().includes('used') ||
        (p.description &&
          (p.description.toLowerCase().includes('used') ||
            p.description.toLowerCase().includes('refurbished')));

      const condition = isRefurbished ? 'refurbished' : 'new';
      const availability = p.currentStock > 0 ? 'in_stock' : 'out_of_stock';
      const price = `${Number(p.retailPrice).toFixed(2)} BDT`;
      const brand = p.brand || 'NEED ELECTRO';
      const description = sanitizeXml(
        p.description ||
          `${p.name} at NEED ELECTRO Moulvibazar, Bangladesh. Authentic hardware with official warranty and nationwide cash on delivery.`
      );

      return `    <item>
      <g:id>${sanitizeXml(p.sku || p.id)}</g:id>
      <g:title>${sanitizeXml(p.name)}</g:title>
      <g:description>${description}</g:description>
      <g:link>${sanitizeXml(productUrl)}</g:link>
      <g:image_link>${sanitizeXml(img)}</g:image_link>
      <g:condition>${condition}</g:condition>
      <g:availability>${availability}</g:availability>
      <g:price>${price}</g:price>
      <g:brand>${sanitizeXml(brand)}</g:brand>
      ${p.model ? `<g:mpn>${sanitizeXml(p.model)}</g:mpn>` : `<g:mpn>${sanitizeXml(p.sku)}</g:mpn>`}
      <g:product_type>${sanitizeXml(p.category)}</g:product_type>
      <g:shipping>
        <g:country>BD</g:country>
        <g:service>Standard Nationwide Delivery</g:service>
        <g:price>60.00 BDT</g:price>
      </g:shipping>
    </item>`;
    });

    const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${sanitizeXml(BUSINESS_INFO.name)} - Google Merchant Center Product Feed</title>
    <link>${domain}</link>
    <description>${sanitizeXml(BUSINESS_INFO.tagline)}</description>
${itemsXml.join('\n')}
  </channel>
</rss>`;

    return new NextResponse(feedXml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error: any) {
    console.error('Error generating Google Merchant feed:', error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Error</title><description>${sanitizeXml(
        error.message
      )}</description></channel></rss>`,
      {
        status: 500,
        headers: { 'Content-Type': 'application/xml; charset=utf-8' },
      }
    );
  }
}

// NEED ELECTRO ERP & Customer Website — Dynamic XML Sitemap Generator
import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { BUSINESS_INFO, BLOG_POSTS, slugify } from '@/lib/seoConfig';

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const domain = BUSINESS_INFO.domain.replace(/\/+$/, '');
  const now = new Date();

  // 1. Core Static Landing Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${domain}`, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${domain}/shop`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${domain}/laptops`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${domain}/moulvibazar`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${domain}/sylhet`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${domain}/services`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${domain}/services/electrician`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${domain}/services/cctv-installation`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${domain}/services/laptop-computer-repair`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${domain}/services/networking`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${domain}/laptop-emi`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${domain}/cctv`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${domain}/electrical-services`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${domain}/computers`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${domain}/electrical-products`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${domain}/computer-accessories`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${domain}/networking`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${domain}/smart-devices`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${domain}/laptops/hp`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${domain}/laptops/dell`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${domain}/laptops/lenovo`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${domain}/sreemangal`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${domain}/kulaura`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${domain}/rajnagar`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${domain}/delivery`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${domain}/shipping-policy`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${domain}/return-refund-policy`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${domain}/warranty-policy`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${domain}/track-order`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    { url: `${domain}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${domain}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${domain}/faq`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${domain}/privacy-policy`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${domain}/terms-conditions`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${domain}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
    // Content SEO Hub Master Categories
    { url: `${domain}/guides`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${domain}/guides/prices`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${domain}/guides/comparisons`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${domain}/guides/buying-guides`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${domain}/guides/faqs`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
  ];

  // 2. Knowledge Center Blog Articles
  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map(post => ({
    url: `${domain}/blog/${post.slug}`,
    lastModified: new Date(post.publishedDate),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // 2.1 Content SEO Hub Guide Articles
  let guideRoutes: MetadataRoute.Sitemap = [];
  try {
    const guides = await prisma.guideArticle.findMany({
      where: { isPublished: true },
      select: { slug: true, category: true, updatedAt: true },
    });
    guideRoutes = guides.map(g => ({
      url: `${domain}/guides/${g.category}/${g.slug}`,
      lastModified: g.updatedAt || now,
      changeFrequency: 'weekly',
      priority: 0.85,
    }));
  } catch (err) {
    console.error('Sitemap guide articles query error:', err);
  }

  // 3. Dynamic Products from Database
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: {
        status: { in: ['ACTIVE', 'OUT_OF_STOCK'] },
        isPublished: true,
      },
      select: {
        name: true,
        sku: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    productRoutes = products.map(p => {
      const slug = `${slugify(p.name)}-${p.sku.toLowerCase()}`;
      return {
        url: `${domain}/product/${slug}`,
        lastModified: p.updatedAt || now,
        changeFrequency: 'daily',
        priority: 0.85,
      };
    });
  } catch (error) {
    console.error('Sitemap dynamic product fetch warning:', error);
  }

  return [...staticRoutes, ...blogRoutes, ...guideRoutes, ...productRoutes];
}

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
    { url: `${domain}/laptops`, lastModified: now, changeFrequency: 'daily', priority: 0.95 },
    { url: `${domain}/moulvibazar`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${domain}/laptop-emi`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${domain}/cctv`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${domain}/electrical-services`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${domain}/services/electrician`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${domain}/services/cctv-installation`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
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
    { url: `${domain}/cart`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${domain}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${domain}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${domain}/faq`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${domain}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.85 },
  ];

  // 2. Knowledge Center Blog Articles
  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map(post => ({
    url: `${domain}/blog/${post.slug}`,
    lastModified: new Date(post.publishedDate),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

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
      take: 500,
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

  return [...staticRoutes, ...blogRoutes, ...productRoutes];
}

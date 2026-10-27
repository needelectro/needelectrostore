// NEED ELECTRO STORE — Public Photo Gallery & Business Updates Page
import React from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { BUSINESS_INFO, generateSeoMetadata, buildBreadcrumbSchema } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { GalleryViewClient } from '@/src/components/customer/GalleryViewClient';
import { Camera, Sparkles, ShieldCheck, MapPin, Layers } from 'lucide-react';

export const revalidate = 60; // 60s ISR revalidation

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'NEED ELECTRO Gallery — Products, Sales & Updates',
    description:
      'Explore real photos of laptops, computers, CCTV security setups, electrical equipment, customer deliveries, and business updates from NEED ELECTRO in Moulvibazar, Bangladesh.',
    path: '/gallery',
    keywords: [
      'NEED ELECTRO gallery',
      'Laptop shop photo gallery Moulvibazar',
      'CCTV camera installation photos Bangladesh',
      'Customer deliveries Moulvibazar',
      'Electrical project photos Sylhet',
      'NEED ELECTRO business updates',
      'নিড ইলেক্ট্রো ফটো গ্যালারি',
      'মৌলভীবাজার ল্যাপটপ ডেলিভারি',
    ],
    ogImage: '/banners/need-electro-laptops-flagship.jpg',
  });
}

export default async function GalleryPage() {
  let posts: any[] = [];
  let categories: any[] = [];

  try {
    const [fetchedPosts, fetchedCategories] = await Promise.all([
      prisma.galleryPost.findMany({
        where: { isPublished: true },
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
              brand: true,
              retailPrice: true,
              currentStock: true,
              imageUrl: true,
              status: true,
            },
          },
        },
        orderBy: [
          { isPinned: 'desc' },
          { publishedAt: 'desc' },
        ],
      }),
      prisma.galleryCategory.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: {
            select: { posts: { where: { isPublished: true } } },
          },
        },
      }),
    ]);

    posts = fetchedPosts.map((p) => ({
      ...p,
      retailPrice: p.product?.retailPrice ? Number(p.product.retailPrice) : null,
      images: Array.isArray(p.images) ? p.images : [{ url: p.coverImage, order: 1 }],
      tags: Array.isArray(p.tags) ? p.tags : [],
    }));

    categories = fetchedCategories.map((c) => ({
      id: c.id,
      name: c.name,
      nameBn: c.nameBn,
      slug: c.slug,
      description: c.description,
      count: c._count.posts,
    }));
  } catch (err) {
    console.error('Failed to load gallery page data:', err);
  }

  const breadcrumbs = [
    { name: 'Photo Gallery & Updates', path: '/gallery' },
  ];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);

  const gallerySchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'NEED ELECTRO Gallery — Products, Sales & Updates',
    description:
      'Verified photo gallery showcasing laptops, CCTV installations, customer deliveries, and business updates from NEED ELECTRO Moulvibazar.',
    url: `${BUSINESS_INFO.domain}/gallery`,
    publisher: {
      '@type': 'Organization',
      name: BUSINESS_INFO.name,
      url: BUSINESS_INFO.domain,
      logo: `${BUSINESS_INFO.domain}/logo-icon.png`,
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: posts.length,
      itemListElement: posts.slice(0, 15).map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: post.title,
        url: `${BUSINESS_INFO.domain}/gallery?post=${post.slug}`,
        image: post.coverImage.startsWith('http')
          ? post.coverImage
          : `${BUSINESS_INFO.domain}${post.coverImage}`,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#002B5B] flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(gallerySchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      {/* Page Hero Header */}
      <section className="py-6 sm:py-10 px-3 sm:px-4 md:px-6 bg-gradient-to-br from-white via-[#F4F6F8] to-[#EAF4FF] border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto space-y-2.5 sm:space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-[#EAF4FF] border border-[#008CFF]/20 text-[#008CFF]">
            <Camera size={13} />
            <span>Official Photo Feed &amp; Business Updates</span>
          </div>
          <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-[#002B5B] tracking-tight leading-tight">
            NEED ELECTRO Gallery — Products, Sales &amp; Updates
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
            Real photos and updates from our Moulvibazar showroom: fresh laptop arrivals, customer deliveries, completed CCTV installations, solar IPS power setups, and official announcements.
          </p>
        </div>
      </section>

      {/* Main Gallery Container */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-6 sm:py-10 flex-1 w-full">
        <GalleryViewClient initialPosts={posts} categories={categories} />
      </main>

      <CustomerFooter />
    </div>
  );
}

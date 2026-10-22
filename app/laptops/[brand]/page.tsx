import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BUSINESS_INFO, generateSeoMetadata, buildBreadcrumbSchema, buildItemListSchema } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { ProductCard } from '@/src/components/customer/ProductCard';
import { Laptop, ShieldCheck, CreditCard, CheckCircle2, Phone, ArrowLeft } from 'lucide-react';

interface BrandInfo {
  name: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  intro: string;
  series: string[];
}

const BRAND_DATA: Record<string, BrandInfo> = {
  hp: {
    name: 'HP',
    slug: 'hp',
    metaTitle: 'HP Laptops in Bangladesh | NEED ELECTRO',
    metaDescription:
      'Buy authentic HP EliteBook and ProBook laptops in Bangladesh from NEED ELECTRO. Verified condition, official warranty, and EMI options.',
    h1: 'HP Laptops in Bangladesh — EliteBook & ProBook Series',
    intro:
      'HP EliteBook and ProBook laptops are renowned for aerospace-grade aluminum chassis, anti-glare displays, and exceptional battery life. Tested high-grade HP laptops available at NEED ELECTRO.',
    series: ['HP EliteBook 840 Series', 'HP ProBook 440/450 Series', 'HP Pavilion', 'HP Envy'],
  },
  dell: {
    name: 'Dell',
    slug: 'dell',
    metaTitle: 'Dell Laptops in Bangladesh | NEED ELECTRO',
    metaDescription:
      'Explore genuine Dell Latitude and Inspiron laptops in Bangladesh. Tested hardware, original chargers, warranty coverage, and laptop EMI.',
    h1: 'Dell Laptops in Bangladesh — Latitude & Inspiron Series',
    intro:
      'Dell Latitude business laptops deliver class-leading durability, robust cooling architecture, and long-term reliability. Order tested Dell models with warranty from NEED ELECTRO.',
    series: ['Dell Latitude 7400 / 7490 Series', 'Dell Latitude 5400 Series', 'Dell Inspiron Series', 'Dell XPS'],
  },
  lenovo: {
    name: 'Lenovo',
    slug: 'lenovo',
    metaTitle: 'Lenovo Laptops in Bangladesh | NEED ELECTRO',
    metaDescription:
      'Find authentic Lenovo ThinkPad and IdeaPad laptops in Bangladesh with warranty, tested keyboards, long battery life, and laptop EMI at NEED ELECTRO.',
    h1: 'Lenovo Laptops in Bangladesh — ThinkPad & IdeaPad Series',
    intro:
      'Lenovo ThinkPad laptops are the global standard for typing keyboards and military-grade durability. Every Lenovo machine at NEED ELECTRO is thoroughly inspected and tested.',
    series: ['Lenovo ThinkPad T-Series (T480, T490, T14)', 'Lenovo ThinkPad X-Series (X1 Carbon, X280)', 'Lenovo IdeaPad'],
  },
};

export async function generateStaticParams() {
  return [
    { brand: 'hp' },
    { brand: 'dell' },
    { brand: 'lenovo' },
  ];
}

export async function generateMetadata({ params }: { params: { brand: string } }): Promise<Metadata> {
  const brandSlug = params.brand.toLowerCase();
  const brand = BRAND_DATA[brandSlug];

  if (!brand) {
    return generateSeoMetadata({
      title: `${params.brand.toUpperCase()} Laptops in Moulvibazar`,
      description: `Explore authentic ${params.brand.toUpperCase()} laptops at NEED ELECTRO Moulvibazar. Tested hardware with local warranty and EMI installment options.`,
      path: `/laptops/${brandSlug}`,
    });
  }

  return generateSeoMetadata({
    title: brand.metaTitle,
    description: brand.metaDescription,
    path: `/laptops/${brand.slug}`,
    keywords: [
      `${brand.name} laptop Moulvibazar`,
      `${brand.name} laptop price Moulvibazar`,
      `Buy ${brand.name} laptop in Moulvibazar`,
      `Used ${brand.name} laptop Moulvibazar`,
      `${brand.name} laptop EMI Moulvibazar`,
    ],
  });
}

export default async function BrandLaptopsPage({ params }: { params: { brand: string } }) {
  const brandSlug = params.brand.toLowerCase();
  const brandInfo = BRAND_DATA[brandSlug] || {
    name: params.brand.toUpperCase(),
    slug: brandSlug,
    metaTitle: `${params.brand.toUpperCase()} Laptops in Moulvibazar`,
    metaDescription: `Buy genuine ${params.brand.toUpperCase()} laptops at NEED ELECTRO Moulvibazar.`,
    h1: `${params.brand.toUpperCase()} Laptops in Moulvibazar`,
    intro: `Explore our collection of authentic ${params.brand.toUpperCase()} laptops available in Moulvibazar stock with replacement warranty and flexible EMI.`,
    series: [],
  };

  // Fetch products matching this brand from Prisma
  let products: any[] = [];
  try {
    products = await prisma.product.findMany({
      where: {
        AND: [
          {
            OR: [
              { brand: { equals: brandInfo.name, mode: 'insensitive' } },
              { name: { contains: brandInfo.name, mode: 'insensitive' } },
            ],
          },
          {
            OR: [
              { category: { contains: 'laptop', mode: 'insensitive' } },
              { category: { contains: 'notebook', mode: 'insensitive' } },
              { category: { contains: 'macbook', mode: 'insensitive' } },
              { category: { contains: 'chromebook', mode: 'insensitive' } },
              { name: { contains: 'laptop', mode: 'insensitive' } },
              { name: { contains: 'elitebook', mode: 'insensitive' } },
              { name: { contains: 'thinkpad', mode: 'insensitive' } },
              { name: { contains: 'latitude', mode: 'insensitive' } },
              { name: { contains: 'chromebook', mode: 'insensitive' } },
              { name: { contains: 'macbook', mode: 'insensitive' } },
              { name: { contains: 'probook', mode: 'insensitive' } },
            ],
          },
          {
            NOT: [
              { category: { contains: 'accessori', mode: 'insensitive' } },
              { category: { contains: 'accessory', mode: 'insensitive' } },
              { category: { contains: 'computer accessories', mode: 'insensitive' } },
              { category: { contains: 'charger', mode: 'insensitive' } },
              { category: { contains: 'cable', mode: 'insensitive' } },
              { category: { contains: 'mouse', mode: 'insensitive' } },
              { category: { contains: 'keyboard', mode: 'insensitive' } },
              { category: { contains: 'cctv', mode: 'insensitive' } },
              { category: { contains: 'networking', mode: 'insensitive' } },
              { category: { contains: 'router', mode: 'insensitive' } },
              { category: { contains: 'electrical', mode: 'insensitive' } },
              { category: { contains: 'desktop', mode: 'insensitive' } },
              { category: { contains: 'computer', mode: 'insensitive' } },
              { name: { contains: 'mouse', mode: 'insensitive' } },
              { name: { contains: 'keyboard', mode: 'insensitive' } },
              { name: { contains: 'headset', mode: 'insensitive' } },
              { name: { contains: 'headphone', mode: 'insensitive' } },
              { name: { contains: 'charger', mode: 'insensitive' } },
              { name: { contains: 'adapter', mode: 'insensitive' } },
              { name: { contains: 'power bank', mode: 'insensitive' } },
              { name: { contains: 'pc setup', mode: 'insensitive' } },
              { sku: { startsWith: 'SKU-ACC-' } },
            ],
          },
        ],
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
      orderBy: [
        { currentStock: 'desc' },
        { retailPrice: 'asc' },
      ],
    });
  } catch (err) {
    console.error('Brand products query error:', err);
  }

  const breadcrumbs = [
    { name: 'Laptops', path: '/laptops' },
    { name: `${brandInfo.name} Laptops`, path: `/laptops/${brandInfo.slug}` },
  ];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);

  const brandItemListSchema = buildItemListSchema({
    name: `${brandInfo.name} Laptops in Moulvibazar — NEED ELECTRO Store`,
    description: `Buy authentic ${brandInfo.name} laptops at NEED ELECTRO Moulvibazar with warranty and installment EMI.`,
    url: `/laptops/${brandInfo.slug}`,
    items: products.map((item) => ({
      name: item.name,
      url: `/product/${item.name ? item.name.toLowerCase().replace(/[\s\W-]+/g, '-') : 'laptop'}-${item.sku.toLowerCase()}`,
      image: item.imageUrl,
      price: Number(item.retailPrice),
      brand: item.brand,
      category: item.category,
    })),
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandItemListSchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      {/* Hero */}
      <section className="py-8 sm:py-10 px-3 sm:px-6 lg:px-8 3xl:px-12 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/70 via-transparent to-transparent dark:from-blue-950/20">
        <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4xl:max-w-[2400px] mx-auto space-y-4">
          <Link
            href="/laptops"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors mb-2"
          >
            <ArrowLeft size={13} />
            <span>Back to All Laptops</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {brandInfo.h1}
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-xs sm:text-sm leading-relaxed">
            {brandInfo.intro}
          </p>

          {brandInfo.series.length > 0 && (
            <div className="pt-2 flex flex-wrap gap-2">
              {brandInfo.series.map(s => (
                <span
                  key={s}
                  className="bg-white border border-slate-200 text-blue-700 shadow-xs dark:bg-slate-900 dark:border-slate-700/80 dark:text-cyan-300 px-3 py-1 rounded-lg text-xs font-semibold"
                >
                  ✓ {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-8 sm:py-12 px-3 sm:px-6 lg:px-8 3xl:px-12 max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4xl:max-w-[2400px] mx-auto w-full flex-1">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              {brandInfo.name} Laptops Currently in Stock
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tested machines ready for immediate delivery or showroom pickup in Moulvibazar
            </p>
          </div>
          <span className="text-xs font-mono bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-xs">
            {products.length} Products Found
          </span>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 4xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-6">
            {products.map(item => (
              <ProductCard
                key={item.id}
                product={{
                  id: item.id,
                  name: item.name,
                  sku: item.sku,
                  category: item.category,
                  brand: item.brand,
                  model: item.model,
                  description: item.description,
                  imageUrl: item.imageUrl,
                  retailPrice: Number(item.retailPrice),
                  emiPrice: Number(item.emiPrice),
                  currentStock: item.currentStock,
                  warrantyPeriodMonths: item.warrantyPeriodMonths,
                  specs: item.specs,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4 shadow-xs">
            <Laptop size={44} className="mx-auto text-slate-400 dark:text-slate-600" />
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              New {brandInfo.name} Stock Arriving Soon
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Our inventory changes rapidly. Call {BUSINESS_INFO.phone} or visit our Kusumbag showroom to reserve or request a custom {brandInfo.name} model configuration.
            </p>
          </div>
        )}
      </section>

      <CustomerFooter />
    </div>
  );
}

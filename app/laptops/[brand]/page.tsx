import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { BUSINESS_INFO, generateSeoMetadata } from '@/lib/seoConfig';
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
    metaTitle: 'HP Laptops in Moulvibazar | EliteBook & ProBook Prices & EMI',
    metaDescription: 'Buy authentic HP EliteBook and ProBook business laptops in Moulvibazar at NEED ELECTRO. 100% tested hardware, fresh condition, 7-day replacement warranty, and flexible EMI installments.',
    h1: 'HP Laptops in Moulvibazar — EliteBook & ProBook Series',
    intro: 'HP EliteBook and ProBook laptops are renowned for their aerospace-grade aluminum chassis, high-definition IPS anti-glare displays, and exceptional battery life. At NEED ELECTRO Moulvibazar, we carry tested, high-grade HP laptops ideal for programming, freelancing, office administration, and university studies.',
    series: ['HP EliteBook 840 Series', 'HP ProBook 440/450 Series', 'HP Pavilion', 'HP Envy'],
  },
  dell: {
    name: 'Dell',
    slug: 'dell',
    metaTitle: 'Dell Laptops in Moulvibazar | Latitude & Inspiron Prices & EMI',
    metaDescription: 'Explore genuine Dell Latitude business laptops and Inspiron models in Moulvibazar. Rigorous 24-point hardware testing, authentic Dell chargers, 7-day replacement guarantee, and laptop EMI.',
    h1: 'Dell Laptops in Moulvibazar — Latitude & Inspiron Series',
    intro: 'Dell Latitude business laptops deliver class-leading durability, robust cooling architecture, and seamless Linux/Windows compatibility. Visit our Kusumbag showroom in Moulvibazar to inspect clean, tested Dell Latitude models with warranty coverage.',
    series: ['Dell Latitude 7400 / 7490 Series', 'Dell Latitude 5400 Series', 'Dell Inspiron Series', 'Dell XPS'],
  },
  lenovo: {
    name: 'Lenovo',
    slug: 'lenovo',
    metaTitle: 'Lenovo Laptops in Moulvibazar | ThinkPad & IdeaPad Prices & EMI',
    metaDescription: 'Find authentic Lenovo ThinkPad and IdeaPad laptops in Moulvibazar. Legendary military-grade keyboards, high durability, long battery life, and affordable installment options at NEED ELECTRO.',
    h1: 'Lenovo Laptops in Moulvibazar — ThinkPad & IdeaPad Series',
    intro: 'Lenovo ThinkPad laptops are the global standard for software engineers, content writers, and professionals who demand the world’s best typing keyboards and military-grade durability. Every Lenovo machine at NEED ELECTRO is thoroughly inspected and tested.',
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
              { name: { contains: 'laptop', mode: 'insensitive' } },
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      {/* Hero */}
      <section className="py-10 px-4 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/70 via-transparent to-transparent dark:from-blue-950/20">
        <div className="max-w-7xl mx-auto space-y-4">
          <Link
            href="/laptops"
            className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-cyan-400 transition-colors mb-2"
          >
            <ArrowLeft size={13} />
            <span>Back to All Laptops</span>
          </Link>

          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {brandInfo.h1}
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm leading-relaxed">
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
      <section className="py-12 px-4 max-w-7xl mx-auto w-full flex-1">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
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
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
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

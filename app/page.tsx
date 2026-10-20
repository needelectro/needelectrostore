import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BUSINESS_INFO,
  generateSeoMetadata,
  buildLocalBusinessSchema,
  buildOrganizationSchema,
} from '@/lib/seoConfig';
import { prisma } from '@/lib/prisma';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { HeroCarousel } from '@/src/components/customer/HeroCarousel';
import { ProductCard, ProductCardData } from '@/src/components/customer/ProductCard';
import {
  Laptop, Monitor, Camera, Zap, Wifi, Smartphone,
  Truck, ShieldCheck, CreditCard, Clock, CheckCircle2,
  Phone, MapPin, ArrowRight, Sparkles, Award
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 60; // 1-minute ISR caching for lightning fast TTFB

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'NEED ELECTRO | Leading Electronics, Laptops, CCTV & Electrical Store Bangladesh',
    description:
      'Shop authentic laptops (HP, Dell, Lenovo), desktop computers, CCTV security cameras, electrical equipment, and certified electrician services. Doorstep Cash on Delivery across all 64 districts in Bangladesh.',
    path: '/',
    keywords: [
      'Laptop shop Bangladesh',
      'Laptop price in Bangladesh',
      'HP laptop Bangladesh',
      'Dell laptop Bangladesh',
      'Lenovo laptop Bangladesh',
      'CCTV camera Bangladesh',
      'CCTV price in Bangladesh',
      'Hikvision CCTV Bangladesh',
      'Electrical products Bangladesh',
      'Laptop shop Moulvibazar',
      'Computer shop Moulvibazar',
      'Laptop EMI Bangladesh',
      'Cash on delivery laptop Bangladesh',
    ],
  });
}

const CATEGORY_TILES = [
  { name: 'Laptops', slug: '/laptops', icon: Laptop, count: 'HP, Dell, Lenovo', color: 'from-blue-600 to-sky-500' },
  { name: 'Desktops & PCs', slug: '/computers', icon: Monitor, count: 'Custom & Branded', color: 'from-indigo-600 to-blue-500' },
  { name: 'CCTV & Security', slug: '/cctv', icon: Camera, count: 'Hikvision, Dahua', color: 'from-cyan-600 to-teal-500' },
  { name: 'Electrical Products', slug: '/electrical-products', icon: Zap, count: 'Switches, Breakers', color: 'from-amber-500 to-orange-500' },
  { name: 'Networking', slug: '/networking', icon: Wifi, count: 'Routers, Switches', color: 'from-violet-600 to-purple-500' },
  { name: 'Accessories', slug: '/computer-accessories', icon: Smartphone, count: 'Storage, Adapters', color: 'from-emerald-600 to-teal-500' },
];

const BRANDS = [
  { name: 'HP', desc: 'Pavilion & EliteBook' },
  { name: 'Dell', desc: 'Latitude & Inspiron' },
  { name: 'Lenovo', desc: 'ThinkPad & IdeaPad' },
  { name: 'Hikvision', desc: 'HD CCTV & NVR' },
  { name: 'Dahua', desc: 'Smart Surveillance' },
  { name: 'Schneider', desc: 'Circuit Breakers' },
  { name: 'Super Star', desc: 'Electrical Fixtures' },
  { name: 'TP-Link', desc: 'Wi-Fi 6 Routers' },
];

export default async function HomePage() {
  // Query banners and products safely from Prisma
  let banners: any[] = [];
  let products: any[] = [];

  try {
    const [fetchedBanners, fetchedProducts] = await Promise.all([
      prisma.banner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }).catch(() => []),
      prisma.product.findMany({
        where: {
          isPublished: true,
          status: 'ACTIVE',
        },
        orderBy: [
          { isFeatured: 'desc' },
          { updatedAt: 'desc' },
        ],
        take: 32,
      }).catch(() => []),
    ]);

    banners = fetchedBanners;
    products = fetchedProducts;
  } catch (err) {
    console.error('Failed to query homepage data from database:', err);
  }

  // Map products to frontend card format
  const mappedProducts: ProductCardData[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    brand: p.brand,
    model: p.model,
    description: p.description,
    imageUrl: p.imageUrl,
    retailPrice: Number(p.retailPrice),
    emiPrice: p.emiPrice ? Number(p.emiPrice) : undefined,
    currentStock: p.currentStock,
    warrantyPeriodMonths: p.warrantyPeriodMonths || undefined,
    specs: p.specs,
  }));

  const featuredProducts = mappedProducts.filter((p) => p.currentStock > 0).slice(0, 8);
  const laptopProducts = mappedProducts.filter((p) =>
    p.category.toLowerCase().includes('laptop') || p.name.toLowerCase().includes('laptop')
  ).slice(0, 8);
  const cctvProducts = mappedProducts.filter((p) =>
    p.category.toLowerCase().includes('cctv') || p.category.toLowerCase().includes('camera') || p.name.toLowerCase().includes('cctv')
  ).slice(0, 8);
  const electricalProducts = mappedProducts.filter((p) =>
    p.category.toLowerCase().includes('electric') || p.category.toLowerCase().includes('breaker')
  ).slice(0, 8);

  const localBusinessSchema = buildLocalBusinessSchema();
  const organizationSchema = buildOrganizationSchema();
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: BUSINESS_INFO.name,
    url: BUSINESS_INFO.domain,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BUSINESS_INFO.domain}/api/catalog/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <CustomerHeader />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-12 flex-1">
        {/* Semantic H1 for national SEO */}
        <h1 className="sr-only">
          NEED ELECTRO — Authentic Laptops, CCTV, Computers &amp; Electrical Store in Bangladesh
        </h1>

        {/* 1. Hero Banner Carousel */}
        <section aria-label="Featured Promotions">
          <HeroCarousel banners={banners} />
        </section>

        {/* 2. Trust Value Strip */}
        <section aria-label="Customer Benefits" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-2xs">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
              <Truck size={22} />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Nationwide Delivery</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Cash on delivery across all 64 districts</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-2xs">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">100% Genuine Products</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Showroom warranty &amp; 7-day return</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-2xs">
            <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <CreditCard size={22} />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Flexible Laptop EMI</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">3 to 12 months installment plans</p>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 shadow-2xs">
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">Open-Box Inspection</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Check your item before final payment</p>
            </div>
          </div>
        </section>

        {/* 3. Category Quick Grid */}
        <section aria-label="Product Categories">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Shop By Category
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Explore our comprehensive catalog of technology &amp; electrical equipment</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {CATEGORY_TILES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={cat.slug}
                  className="group bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-cyan-400 rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-center space-y-2.5 transition-all hover:shadow-lg transform hover:-translate-y-1"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium">{cat.count}</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 4. Featured / Best Selling Products */}
        <section aria-label="Featured Products">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-6 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider mb-1">
                <Sparkles size={14} />
                <span>Handpicked Hardware</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Featured &amp; Trending Products
              </h2>
            </div>
            <Link
              href="/laptops"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 dark:text-cyan-400 hover:underline"
            >
              <span>View All Products</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Laptop size={36} className="mx-auto text-slate-400 mb-3" />
              <p className="font-bold text-slate-700 dark:text-slate-300">Catalog is being synchronized with ERP.</p>
              <p className="text-xs text-slate-500 mt-1">Please call +880 1733-983752 for instant product availability.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>

        {/* 5. Laptops & Computing Showcase */}
        {laptopProducts.length > 0 && (
          <section aria-label="Laptops & Notebooks">
            <div className="flex items-end justify-between gap-4 mb-6 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-blue-600 dark:text-cyan-400 uppercase tracking-wider">
                  Top Performance
                </span>
                <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Laptops &amp; Computers
                </h2>
              </div>
              <Link
                href="/laptops"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 dark:text-cyan-400 hover:underline"
              >
                <span>Browse All Laptops</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {laptopProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* 6. CCTV & Security Showcase */}
        {cctvProducts.length > 0 && (
          <section aria-label="CCTV & Surveillance">
            <div className="flex items-end justify-between gap-4 mb-6 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                  24/7 Protection
                </span>
                <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  CCTV Camera &amp; Security Systems
                </h2>
              </div>
              <Link
                href="/cctv"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 dark:text-cyan-400 hover:underline"
              >
                <span>Explore CCTV Packages</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {cctvProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* 7. Electrical & Technical Services Banner */}
        <section aria-label="Electrical Solutions & Services">
          <div className="bg-gradient-to-br from-slate-900 via-[#0a1528] to-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Zap size={14} className="text-amber-400" />
                  <span>Certified Electrician &amp; Engineering Services</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                  Need Professional Electrical Installation or Repair?
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Our certified technicians provide professional electrical wiring, circuit breaker maintenance, solar inverter installation, and laptop servicing with official warranty.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="/services/electrician"
                    className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20"
                  >
                    Book Electrician Service
                  </Link>
                  <a
                    href={`tel:${BUSINESS_INFO.phoneClean}`}
                    className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2"
                  >
                    <Phone size={15} />
                    <span>Call Hotline: {BUSINESS_INFO.phone}</span>
                  </a>
                </div>
              </div>

              <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xs space-y-3">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Award size={16} className="text-amber-400" />
                  <span>Service Highlights</span>
                </h3>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>On-site residential &amp; commercial wiring</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>CCTV IP camera remote monitoring setup</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>Laptop hardware diagnosis &amp; chip-level repair</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>Moulvibazar town same-day emergency support</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Authorized Brands */}
        <section aria-label="Featured Brands">
          <div className="text-center max-w-xl mx-auto mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Authentic Global Brands We Partner With
            </h2>
            <p className="text-xs text-slate-500 mt-1">Official manufacturer warranties on all serialized products</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {BRANDS.map((b) => (
              <div
                key={b.name}
                className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-center shadow-2xs hover:border-blue-400 dark:hover:border-cyan-400 transition-colors"
              >
                <span className="font-black text-sm text-slate-800 dark:text-slate-100 block">
                  {b.name}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
                  {b.desc}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 9. Showroom & Physical Presence */}
        <section aria-label="Showroom Information" className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="space-y-2 md:col-span-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-md">
                <MapPin size={13} />
                <span>Official Moulvibazar Showroom</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Visit Us at Kusumbag, Moulvibazar
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                Experience products before purchasing. Our showroom features live demo units for HP, Dell, and Lenovo laptops, as well as a live CCTV surveillance display wall.
              </p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 pt-1">
                <Clock size={14} className="text-blue-500" />
                <span>Open Saturday to Thursday: 9:30 AM – 9:30 PM (Friday: 3:00 PM – 9:30 PM)</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 justify-center">
              <a
                href={BUSINESS_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs text-center shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <MapPin size={15} />
                <span>Get Google Maps Directions</span>
              </a>
              <Link
                href="/contact"
                className="w-full py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs text-center transition-colors"
              >
                Showroom Contact Details
              </Link>
            </div>
          </div>
        </section>
      </main>

      <CustomerFooter />
    </div>
  );
}

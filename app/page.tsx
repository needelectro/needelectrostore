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
import { ProductCardData } from '@/src/components/customer/ProductCard';
import { ProductTabsShowcase } from '@/src/components/customer/ProductTabsShowcase';
import {
  Laptop, Monitor, Camera, Zap, Wifi, Smartphone,
  Truck, ShieldCheck, CreditCard, Clock, CheckCircle2,
  Phone, MapPin, ArrowRight, Sparkles, Award, Calculator,
  Wrench, HelpCircle, Layers, ChevronRight, Sun, MessageCircle
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'NEED ELECTRO | Trusted Electrical & Technological Solutions Bangladesh',
    description:
      'Premier store for laptops (HP, Dell, Lenovo), desktop computers, CCTV surveillance cameras, electrical equipment, and certified electrician services in Moulvibazar & across Bangladesh with doorstep cash on delivery.',
    path: '/',
    keywords: [
      'Computer shop in Moulvibazar',
      'Computer price in Moulvibazar',
      'Laptop shop in Moulvibazar',
      'Laptop price in Moulvibazar',
      'CCTV camera shop in Moulvibazar',
      'CCTV camera price in Bangladesh',
      'Tech gadgets in Moulvibazar',
      'Tech gadgets price in Bangladesh',
      'Laptop price in Bangladesh',
      'HP EliteBook price in Bangladesh',
      'Desktop computer price in Bangladesh',
      'Computer accessories in Bangladesh',
      'Electrical shop online Bangladesh',
      'Electrical services in Moulvibazar',
      'Electrician service in Bangladesh',
      'CCTV installation service',
      'Laptop and computer servicing',
      'Networking and Wi-Fi installation',
      'Electrical products online Bangladesh',
      'Genuine laptop with warranty in Bangladesh',
      'NEED ELECTRO',
      'NEED ELECTRO SHOP',
      'মৌলভীবাজার ল্যাপটপ দোকান',
      'কম্পিউটার দোকান মৌলভীবাজার',
      'সিসিটিভি ক্যামেরা মৌলভীবাজার',
    ],
  });
}

// 7-column categories matching trustcomputermb
const CATEGORY_TILES = [
  { name: 'Laptops', slug: '/laptops', icon: Laptop, count: 'HP, Dell, Lenovo', color: 'from-blue-600 to-sky-500' },
  { name: 'Desktop & PC', slug: '/computers', icon: Monitor, count: 'Custom & Branded', color: 'from-indigo-600 to-blue-500' },
  { name: 'CCTV Security', slug: '/cctv', icon: Camera, count: 'Hikvision & Dahua', color: 'from-cyan-600 to-teal-500' },
  { name: 'Electricals', slug: '/electrical-products', icon: Zap, count: 'Switches & Breakers', color: 'from-amber-500 to-orange-500' },
  { name: 'Accessories', slug: '/computer-accessories', icon: Smartphone, count: 'Storage & Hubs', color: 'from-emerald-600 to-teal-500' },
  { name: 'Networking', slug: '/networking', icon: Wifi, count: 'Routers & Switches', color: 'from-violet-600 to-purple-500' },
  { name: 'Solar & IPS', slug: '/electrical-products', icon: Sun, count: 'Inverter & Battery', color: 'from-rose-500 to-pink-500' },
];

const BRANDS = [
  { name: 'HP', desc: 'EliteBook & ProBook', slug: '/laptops/hp', badge: 'Laptops', color: 'from-blue-600 to-sky-500' },
  { name: 'Dell', desc: 'Latitude & XPS', slug: '/laptops/dell', badge: 'Laptops', color: 'from-sky-600 to-cyan-500' },
  { name: 'Lenovo', desc: 'ThinkPad & Legion', slug: '/laptops/lenovo', badge: 'Laptops', color: 'from-rose-600 to-red-500' },
  { name: 'Hikvision', desc: '4K IP & ColorVu', slug: '/cctv', badge: 'CCTV Security', color: 'from-emerald-600 to-teal-500' },
  { name: 'Dahua', desc: 'Smart AI Cameras', slug: '/cctv', badge: 'Surveillance', color: 'from-teal-600 to-cyan-500' },
  { name: 'TP-Link', desc: 'Wi-Fi 6 Routers', slug: '/networking', badge: 'Networking', color: 'from-indigo-600 to-blue-500' },
  { name: 'Schneider', desc: 'Circuit Breakers', slug: '/electrical-products', badge: 'Electrical', color: 'from-emerald-700 to-green-600' },
  { name: 'Super Star', desc: 'Switches & Lighting', slug: '/electrical-products', badge: 'Electrical', color: 'from-amber-600 to-orange-500' },
];

export default async function HomePage() {
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
        take: 36,
      }).catch(() => []),
    ]);

    banners = fetchedBanners;
    products = fetchedProducts;
  } catch (err) {
    console.error('Failed to query homepage data from database:', err);
  }

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
    regularPrice: p.regularPrice ? Number(p.regularPrice) : undefined,
    emiPrice: p.emiPrice ? Number(p.emiPrice) : undefined,
    currentStock: p.currentStock,
    warrantyPeriodMonths: p.warrantyPeriodMonths || undefined,
    specs: p.specs,
  }));

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
    <div className="min-h-screen bg-[#f2f4f8] text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col font-sans">
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

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 space-y-6 sm:space-y-8 flex-1">
        <h1 className="sr-only">
          NEED ELECTRO — Authentic Laptops, CCTV, Computers &amp; Electrical Store in Bangladesh
        </h1>

        {/* 1. Hero Section (Trust Computer MB 12-column Grid: 8 cols Carousel + 4 cols Stacked Cards) */}
        <section aria-label="Hero Promotions" className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-stretch">
          {/* Left 8 Cols: Carousel */}
          <div className="lg:col-span-8">
            <HeroCarousel banners={banners} />
          </div>

          {/* Right 4 Cols: 2 Stacked Feature Cards with Brand Banners */}
          <div className="lg:col-span-4 flex flex-col justify-between gap-4">
            {/* Card 1: Customer Care & Warranty */}
            <div className="flex-1 rounded-2xl bg-gradient-to-br from-[#0a1c2e] to-[#040e19] text-white p-5 sm:p-6 border border-slate-700/80 shadow-md flex flex-col justify-between relative overflow-hidden group">
              {/* High-res Warranty Care Banner Background */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700 pointer-events-none"
                style={{ backgroundImage: "url('/banners/warranty-care-banner.jpg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040e19] via-[#040e19]/80 to-[#040e19]/40 pointer-events-none" />
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/15 rounded-full blur-2xl group-hover:scale-125 transition-transform pointer-events-none" />

              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider mb-2.5 backdrop-blur-xs">
                  <ShieldCheck size={12} />
                  <span>Showroom Care &amp; Warranty</span>
                </span>
                <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug drop-shadow-sm">
                  Customer Support &amp; Official Warranty
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-2">
                  Instant warranty claim processing, technical diagnosis &amp; phone guidance at Kusumbag Moulvibazar.
                </p>
              </div>

              <div className="relative z-10 pt-3 flex items-center justify-between">
                <a
                  href={`tel:${BUSINESS_INFO.phoneClean}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 hover:underline"
                >
                  <Phone size={13} />
                  <span>{BUSINESS_INFO.phone}</span>
                </a>
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-600/30 transition-all active:scale-95"
                >
                  <MessageCircle size={13} />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Card 2: Custom PC & Electrical Servicing */}
            <div className="flex-1 rounded-2xl bg-gradient-to-br from-[#0e1e38] to-[#061021] text-white p-5 sm:p-6 border border-slate-700/80 shadow-md flex flex-col justify-between relative overflow-hidden group">
              {/* High-res Custom Gaming PC & Engineering Banner Background */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700 pointer-events-none"
                style={{ backgroundImage: "url('/banners/custom-pc-banner.jpg')" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#061021] via-[#061021]/80 to-[#061021]/40 pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-amber-500/15 rounded-full blur-2xl group-hover:scale-125 transition-transform pointer-events-none" />

              <div className="relative z-10">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider mb-2.5 backdrop-blur-xs">
                  <Zap size={12} />
                  <span>Engineering Services</span>
                </span>
                <h3 className="text-base sm:text-lg font-black tracking-tight leading-snug drop-shadow-sm">
                  Custom PC &amp; Electrical Installation
                </h3>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed line-clamp-2">
                  Professional gaming desktop build, CCTV IP setup, and certified home/commercial wiring service.
                </p>
              </div>

              <div className="relative z-10 pt-3 flex items-center justify-between">
                <Link
                  href="/services/electrician"
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#0070cc] hover:from-[#0070cc] hover:to-[#005bb5] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/25 transition-all active:scale-95"
                >
                  <span>Book Technician</span>
                  <ArrowRight size={13} />
                </Link>
                <Link
                  href="/laptop-emi"
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 hover:underline"
                >
                  Laptop EMI →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Status / Operational Strip (Trust Computer MB Style: Rounded-full Pill) */}
        <section aria-label="Showroom Operational Notice">
          <div className="bg-white dark:bg-slate-900 rounded-full py-2.5 px-4 sm:px-6 shadow-xs border border-slate-200/90 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Showroom Status:
              </span>
              <span className="text-slate-600 dark:text-slate-400 hidden sm:inline">
                Open Saturday to Thursday (9:30 AM – 9:30 PM). Kusumbag, Moulvibazar.
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <Link
                href="/track-order"
                className="text-[#0084d6] hover:underline flex items-center gap-1"
              >
                <span>Track Your Parcel Online</span>
                <ArrowRight size={12} />
              </Link>
              <span className="text-slate-300 dark:text-slate-700 hidden md:inline">|</span>
              <a
                href={`tel:${BUSINESS_INFO.phoneClean}`}
                className="hidden md:flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 hover:text-[#0084d6]"
              >
                <Phone size={12} className="text-[#0084d6]" />
                <span>Hotline: {BUSINESS_INFO.phone}</span>
              </a>
            </div>
          </div>
        </section>

        {/* 3. 4 Feature / Quick Action Cards (Trust Computer MB Exact 4 Cards) */}
        <section aria-label="Quick Action Tools" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tool 1: Laptop & PC Finder */}
          <Link
            href="/laptops"
            className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Laptop size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-rose-500 transition-colors">
                Laptop &amp; PC Finder
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                Find the ideal laptop or computer for study, office, or gaming within your budget.
              </p>
            </div>
          </Link>

          {/* Tool 2: Online Order & Delivery Help */}
          <Link
            href="/delivery"
            className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Truck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">
                Order &amp; Delivery Help
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                Cash on delivery across all 64 districts in Bangladesh with open-box verification.
              </p>
            </div>
          </Link>

          {/* Tool 3: CCTV Setup Calculator */}
          <Link
            href="/services/cctv-installation"
            className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#ea580c]/10 text-[#ea580c] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Calculator size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-[#ea580c] transition-colors">
                CCTV Setup Calculator
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                Estimate cameras, storage, power supply &amp; installation for home or business.
              </p>
            </div>
          </Link>

          {/* Tool 4: Service & Repair Center */}
          <Link
            href="/services/electrician"
            className="group bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Wrench size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                Service &amp; Repair Center
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                Laptop chip-level repair, desktop upgrades &amp; certified electrician booking.
              </p>
            </div>
          </Link>
        </section>

        {/* 4. Featured Categories (Trust Computer MB 7-Column Grid) */}
        <section aria-label="Product Categories">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Featured Categories
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Explore authentic hardware &amp; equipment by category</p>
            </div>
            <Link
              href="/laptops"
              className="text-xs font-bold text-[#0084d6] hover:underline flex items-center gap-1"
            >
              <span>View All Categories</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4">
            {CATEGORY_TILES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={cat.slug}
                  className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-[#0084d6] dark:hover:border-cyan-400 rounded-2xl p-4 text-center flex flex-col items-center justify-center space-y-2 transition-all hover:shadow-md hover:-translate-y-1"
                >
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white group-hover:text-[#0084d6] transition-colors leading-tight">
                    {cat.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-full block">
                    {cat.count}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 5. Official Brand Partners & Series Showcase */}
        <section aria-label="Official Brand Partners">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Official Brand Lineup
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authorized showroom warranty, genuine serialized products &amp; official distributor supply
              </p>
            </div>
            <Link
              href="/laptops"
              className="text-xs font-bold text-[#008CFF] hover:underline flex items-center gap-1"
            >
              <span>Explore All Brands</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {BRANDS.map((brand) => (
              <Link
                key={brand.name}
                href={brand.slug}
                className="group bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-[#008CFF] dark:hover:border-sky-400 rounded-2xl p-3.5 text-center flex flex-col items-center justify-between transition-all hover:shadow-md hover:-translate-y-1"
              >
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${brand.color} text-white font-black text-xs flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform mb-2`}>
                  {brand.name.substring(0, 3).toUpperCase()}
                </div>
                <h3 className="font-extrabold text-xs text-slate-900 dark:text-white group-hover:text-[#008CFF] transition-colors leading-tight">
                  {brand.name}
                </h3>
                <span className="text-[10px] text-slate-400 font-medium truncate max-w-full block mt-0.5">
                  {brand.desc}
                </span>
                <span className="mt-2 text-[9px] font-bold text-[#008CFF] bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200/60 dark:border-blue-900">
                  {brand.badge}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 6. Products Showcase with Interactive Tabs (Trust Computer Style) */}
        <section aria-label="Featured Products">
          <ProductTabsShowcase products={mappedProducts} />
        </section>

        {/* 6. Electrical Engineering & Services Highlight Banner */}
        <section aria-label="Electrical Solutions & Services">
          <div className="bg-gradient-to-br from-[#081621] via-[#0b1c2d] to-[#040c14] text-white rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-[#0084d6]/15 blur-3xl pointer-events-none" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative">
              <div className="lg:col-span-8 space-y-3.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <Zap size={14} className="text-amber-400" />
                  <span>Certified Electrician &amp; Engineering Services</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                  Need Professional Electrical Installation or Laptop Servicing?
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  Our certified engineers provide residential wiring, circuit breaker upgrades, solar inverter IPS setup, and chip-level laptop maintenance with guaranteed warranty.
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Link
                    href="/services/electrician"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md shadow-amber-500/20"
                  >
                    Book Electrician Service
                  </Link>
                  <a
                    href={`tel:${BUSINESS_INFO.phoneClean}`}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2"
                  >
                    <Phone size={14} />
                    <span>Call Hotline: {BUSINESS_INFO.phone}</span>
                  </a>
                </div>
              </div>

              <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xs space-y-2.5">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Award size={15} className="text-amber-400" />
                  <span>Service Guarantees</span>
                </h3>
                <ul className="text-xs text-slate-300 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>Residential &amp; commercial wiring inspection</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>HD CCTV IP camera mobile live-view setup</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                    <span>Same-day Moulvibazar emergency technician callout</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Authorized Global Brands Showcase */}
        <section aria-label="Featured Brands">
          <div className="text-center max-w-xl mx-auto mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Authentic Global Brands We Supply
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Official manufacturer warranty on all serialized products</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
            {BRANDS.map((b) => (
              <div
                key={b.name}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-3 text-center shadow-xs hover:border-[#0084d6] transition-colors"
              >
                <span className="font-black text-xs sm:text-sm text-slate-800 dark:text-slate-100 block">
                  {b.name}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
                  {b.desc}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 8. Showroom & Physical Presence Hub (Moulvibazar) */}
        <section aria-label="Showroom Information" className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="space-y-2 md:col-span-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0084d6] bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-full">
                <MapPin size={13} />
                <span>Physical Showroom in Moulvibazar</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Visit Us at Kusumbag, Moulvibazar
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl">
                Experience products before purchasing. Our showroom features live demo units for HP, Dell, and Lenovo laptops, as well as an active CCTV surveillance display wall.
              </p>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2 pt-1">
                <Clock size={14} className="text-[#0084d6]" />
                <span>Open Saturday to Thursday: 9:30 AM – 9:30 PM (Friday Closed)</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 justify-center">
              <a
                href={BUSINESS_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#0084d6] hover:bg-[#0073bc] text-white font-bold text-xs text-center shadow-md shadow-blue-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <MapPin size={14} />
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

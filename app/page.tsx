import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  BUSINESS_INFO,
  DEFAULT_OG_IMAGE,
  generateSeoMetadata,
  buildItemListSchema,
  getProductUrlPath,
  isLowQualityOrHotlinkedImage,
} from '@/lib/seoConfig';
import { prisma } from '@/lib/prisma';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { HeroCarousel } from '@/src/components/customer/HeroCarousel';
import { ProductCardData } from '@/src/components/customer/ProductCard';
import { ProductTabsShowcase } from '@/src/components/customer/ProductTabsShowcase';
import { BusinessUpdatesFeed } from '@/src/components/customer/BusinessUpdatesFeed';
import {
  Laptop, Monitor, Camera, Zap, Wifi, Smartphone,
  Truck, ShieldCheck, CreditCard, Clock, CheckCircle2,
  Phone, MapPin, ArrowRight, Wrench, ChevronRight, Cpu
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Computer & Laptop Shop in Moulvibazar | NEED ELECTRO',
    description:
      'Computer and laptop shop in Moulvibazar. Buy genuine HP, Dell, and Lenovo laptops, desktop PCs, monitors, and accessories with warranty at NEED ELECTRO.',
    path: '/',
    ogImage: DEFAULT_OG_IMAGE,
    keywords: [
      'Computer shop in Moulvibazar',
      'Laptop shop in Moulvibazar',
      'Computer price in Moulvibazar',
      'Laptop price in Moulvibazar',
      'Desktop PC Moulvibazar',
      'Computer accessories in Moulvibazar',
      'HP EliteBook price in Bangladesh',
      'Laptop price in Bangladesh',
      'CCTV camera shop in Moulvibazar',
      'Laptop EMI in Moulvibazar',
      'NEED ELECTRO',
      'মৌলভীবাজার ল্যাপটপ দোকান',
      'কম্পিউটার দোকান মৌলভীবাজার',
    ],
  });
}

// 7-column product categories leading with computing hardware
const CATEGORY_TILES = [
  { name: 'Laptops', slug: '/laptops', icon: Laptop, count: 'HP, Dell, Lenovo', color: 'from-blue-600 to-sky-500' },
  { name: 'Desktop & PC', slug: '/computers', icon: Monitor, count: 'Custom & Branded', color: 'from-indigo-600 to-blue-500' },
  { name: 'Accessories', slug: '/computer-accessories', icon: Cpu, count: 'SSD, RAM & Peripherals', color: 'from-emerald-600 to-teal-500' },
  { name: 'CCTV Security', slug: '/cctv', icon: Camera, count: 'Hikvision & Dahua', color: 'from-cyan-600 to-teal-500' },
  { name: 'Networking', slug: '/networking', icon: Wifi, count: 'Routers & Switches', color: 'from-violet-600 to-purple-500' },
  { name: 'Smart Devices', slug: '/smart-devices', icon: Smartphone, count: 'Hubs & Smart Tech', color: 'from-rose-500 to-pink-500' },
  { name: 'Electricals', slug: '/electrical-products', icon: Zap, count: 'Breakers & Power', color: 'from-amber-500 to-orange-500' },
];

const BRANDS = [
  { name: 'HP', desc: 'EliteBook & ProBook', href: '/laptops/hp' },
  { name: 'Dell', desc: 'Latitude & Inspiron', href: '/laptops/dell' },
  { name: 'Lenovo', desc: 'ThinkPad & IdeaPad', href: '/laptops/lenovo' },
  { name: 'Apple', desc: 'MacBook Air & Pro', href: '/laptops' },
  { name: 'ASUS', desc: 'VivoBook & TUF', href: '/laptops' },
  { name: 'MSI', desc: 'Modern & Katana', href: '/laptops' },
  { name: 'Hikvision', desc: 'Monitors & CCTV', href: '/cctv' },
  { name: 'TP-Link', desc: 'Wi-Fi 6 Routers', href: '/networking' },
];

export default async function HomePage() {
  let banners: any[] = [];
  let products: any[] = [];
  let galleryUpdates: any[] = [];

  try {
    const [fetchedBanners, fetchedProducts, fetchedGalleryUpdates] = await Promise.all([
      prisma.banner.findMany({
        where: {
          isActive: true,
          AND: [
            { OR: [{ startDate: null }, { startDate: { lte: new Date() } }] },
            { OR: [{ endDate: null }, { endDate: { gte: new Date() } }] },
          ],
        },
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
      prisma.galleryPost.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          titleBn: true,
          slug: true,
          description: true,
          descriptionBn: true,
          categoryName: true,
          coverImage: true,
          isPinned: true,
          publishedAt: true,
          product: {
            select: { name: true, sku: true, retailPrice: true },
          },
        },
        orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
        take: 4,
      }).catch(() => []),
    ]);

    banners = fetchedBanners;
    products = fetchedProducts;
    galleryUpdates = fetchedGalleryUpdates.map((item) => ({
      ...item,
      product: item.product
        ? {
            ...item.product,
            retailPrice: Number(item.product.retailPrice),
          }
        : null,
    }));
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

  // Prioritize products with clean non-hotlinked images for homepage ItemList JSON-LD
  const cleanImageProducts = mappedProducts.filter((p) => !isLowQualityOrHotlinkedImage(p.imageUrl));
  const itemListSource = cleanImageProducts.length >= 8 ? cleanImageProducts : mappedProducts;

  const featuredItemListSchema = buildItemListSchema({
    name: 'Featured Computers, Laptops & Tech Products in Moulvibazar',
    description:
      'Genuine HP, Dell, Lenovo laptops, desktop PCs, monitors, and computer accessories at NEED ELECTRO Moulvibazar.',
    url: '/',
    items: itemListSource.slice(0, 16).map((p) => ({
      name: p.name,
      url: getProductUrlPath(p.name, p.sku),
      image: p.imageUrl,
      price: p.retailPrice,
      brand: p.brand,
      category: p.category,
    })),
  });

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#002B5B] flex flex-col font-sans selection:bg-[#EAF4FF] selection:text-[#008CFF]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(featuredItemListSchema) }}
      />

      <CustomerHeader />

      <main className="w-full max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4xl:max-w-[2400px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 py-3.5 sm:py-5 space-y-4 sm:space-y-6 flex-1">
        {/* Visible Search Intent & NAP Header Banner */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-lg sm:text-2xl font-black text-[#002B5B] tracking-tight">
              Computer &amp; Laptop Shop in Moulvibazar — NEED ELECTRO
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Shop genuine <strong>Computer, Laptop, Desktop PC &amp; Accessories in Moulvibazar</strong> (HP, Dell, Lenovo, monitors &amp; SSDs) with official warranty at{' '}
              <span className="font-semibold text-[#002B5B]">{BUSINESS_INFO.fullAddress}</span>.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 text-xs">
            <Link
              href="/moulvibazar"
              className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#002B5B] font-bold transition-colors inline-flex items-center gap-1.5"
            >
              <MapPin size={13} className="text-[#008CFF]" />
              <span>Moulvibazar Showroom</span>
            </Link>
            <Link
              href="/shop"
              className="px-4 py-2 rounded-xl bg-[#008CFF] hover:bg-blue-600 text-white font-bold transition-colors inline-flex items-center gap-1.5 shadow-xs"
            >
              <span>Explore Products</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* 1. Hero Section — Compact, Premium Image-Only Banner Carousel */}
        <section aria-label="Hero Promotions" className="w-full">
          <HeroCarousel banners={banners} />
        </section>

        {/* 2. Showroom NAP & Operational Strip */}
        <section aria-label="Showroom Operational Notice">
          <div className="bg-white rounded-full py-2.5 px-4 sm:px-6 shadow-xs border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-[#002B5B]">
                Showroom Open:
              </span>
              <span className="text-slate-600 hidden sm:inline">
                {BUSINESS_INFO.openingHours.display} • {BUSINESS_INFO.address.streetAddress}, {BUSINESS_INFO.address.addressLocality}
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <Link
                href="/track-order"
                className="text-[#008CFF] hover:underline flex items-center gap-1 font-bold"
              >
                <span>Track Your Parcel Online</span>
                <ArrowRight size={12} />
              </Link>
              <span className="text-slate-200 hidden md:inline">|</span>
              <a
                href={`tel:${BUSINESS_INFO.phoneClean}`}
                className="hidden md:flex items-center gap-1.5 font-bold text-[#002B5B] hover:text-[#008CFF]"
              >
                <Phone size={12} className="text-[#008CFF]" />
                <span>Hotline: {BUSINESS_INFO.phone}</span>
              </a>
            </div>
          </div>
        </section>

        {/* 3. 4 Quick Action Cards Focused on Computer & Laptop Buyers */}
        <section aria-label="Quick Action Tools" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tool 1: Laptop Finder */}
          <Link
            href="/laptops"
            className="group bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-[#008CFF] hover:-translate-y-0.5 transition-all flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Laptop size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#002B5B] group-hover:text-rose-600 transition-colors">
                Laptop Finder &amp; Prices
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                Compare genuine HP, Dell, Lenovo &amp; Apple laptops in Moulvibazar within your budget.
              </p>
            </div>
          </Link>

          {/* Tool 2: Desktop PCs & Monitors */}
          <Link
            href="/computers"
            className="group bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-[#008CFF] hover:-translate-y-0.5 transition-all flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#008CFF] border border-sky-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Monitor size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#002B5B] group-hover:text-[#008CFF] transition-colors">
                Desktop PCs &amp; Monitors
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                Custom office &amp; workstation desktop builds, HD monitors, and genuine PC parts.
              </p>
            </div>
          </Link>

          {/* Tool 3: 0% Laptop EMI */}
          <Link
            href="/laptop-emi"
            className="group bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-[#008CFF] hover:-translate-y-0.5 transition-all flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <CreditCard size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#002B5B] group-hover:text-emerald-600 transition-colors">
                0% Laptop EMI Plans
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                Flexible 3 to 12-month laptop installments in Moulvibazar with easy NID approval.
              </p>
            </div>
          </Link>

          {/* Tool 4: Delivery & Coverage */}
          <Link
            href="/delivery"
            className="group bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-[#008CFF] hover:-translate-y-0.5 transition-all flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Truck size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#002B5B] group-hover:text-orange-600 transition-colors">
                Order &amp; Delivery Help
              </h3>
              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                Same-day Moulvibazar delivery &amp; open-box COD across all 64 districts in BD.
              </p>
            </div>
          </Link>
        </section>

        {/* 4. Featured Categories (7-Column Grid) */}
        <section aria-label="Product Categories">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#002B5B] tracking-tight">
                Featured Categories
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Explore laptops, desktop computers, monitors &amp; accessories by category</p>
            </div>
            <Link
              href="/laptops"
              className="text-xs font-bold text-[#008CFF] hover:underline flex items-center gap-1"
            >
              <span>View All Laptops</span>
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
                  className="group bg-white border border-slate-200/90 hover:border-[#008CFF] hover:bg-[#EAF4FF]/40 rounded-2xl p-4 text-center flex flex-col items-center justify-center space-y-2 transition-all hover:shadow-md hover:-translate-y-1"
                >
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#002B5B] group-hover:text-[#008CFF] transition-colors leading-tight">
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

        {/* 5. Dual Promotional Campaign Banners Grid */}
        <section aria-label="Special Offers and Campaigns" className="hidden md:grid md:grid-cols-2 gap-3 sm:gap-4">
          {/* Promo Card 1: Laptop EMI */}
          <div className="relative rounded-2xl overflow-hidden min-h-[160px] sm:min-h-[180px] flex flex-col justify-between p-4 sm:p-5 border border-blue-200/90 shadow-md group transition-all bg-gradient-to-br from-[#EAF4FF] via-white to-sky-50">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none opacity-20"
              style={{ backgroundImage: "url('/banners/laptop-emi-promo-banner.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/95 via-white/80 to-[#EAF4FF]/40 pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform" />

            <div className="relative z-10 space-y-1 sm:space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#008CFF]/15 text-[#008CFF] border border-blue-300/60 uppercase tracking-wider">
                <CreditCard size={12} className="text-[#008CFF]" />
                <span>0% EMI Available</span>
              </span>
              <h3 className="text-base sm:text-lg font-black text-[#002B5B] tracking-tight leading-snug">
                Up to 12 Months 0% Interest Laptop EMI
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-snug max-w-sm line-clamp-2">
                Own genuine HP, Dell &amp; Lenovo laptops in Moulvibazar with easy monthly installments and instant eligibility review.
              </p>
            </div>

            <div className="relative z-10 pt-2 flex items-center justify-between">
              <Link
                href="/laptop-emi"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all active:scale-95"
              >
                <span>Calculate EMI &amp; Apply</span>
                <ArrowRight size={13} />
              </Link>
              <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md shadow-2xs hidden sm:inline-block">
                NID + Local Guarantor
              </span>
            </div>
          </div>

          {/* Promo Card 2: Wi-Fi 6 & Enterprise Networking */}
          <div className="relative rounded-2xl overflow-hidden min-h-[160px] sm:min-h-[180px] flex flex-col justify-between p-4 sm:p-5 border border-cyan-200/90 shadow-md group transition-all bg-gradient-to-br from-cyan-50/70 via-white to-[#EAF4FF]">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none opacity-20"
              style={{ backgroundImage: "url('/banners/wifi-networking-banner.jpg')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-white/95 via-white/80 to-cyan-50/40 pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform" />

            <div className="relative z-10 space-y-1 sm:space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-100 text-cyan-800 border border-cyan-300 uppercase tracking-wider">
                <Wifi size={12} className="text-cyan-700" />
                <span>Gigabit Speeds</span>
              </span>
              <h3 className="text-base sm:text-lg font-black text-[#002B5B] tracking-tight leading-snug">
                Ultra-Fast Wi-Fi 6 &amp; Structured Mesh
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-snug max-w-sm line-clamp-2">
                Eliminate Wi-Fi dead spots with dual-band gigabit routers, PoE switches, and router mini UPS units.
              </p>
            </div>

            <div className="relative z-10 pt-2 flex items-center justify-between">
              <Link
                href="/networking"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-cyan-600/25 transition-all active:scale-95"
              >
                <span>Shop Routers &amp; Switches</span>
                <ArrowRight size={13} />
              </Link>
              <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md shadow-2xs hidden sm:inline-block">
                Up to 3000 Mbps
              </span>
            </div>
          </div>
        </section>

        {/* 6. Products Showcase with Interactive Tabs */}
        <section aria-label="Featured Products">
          <ProductTabsShowcase products={mappedProducts} />
        </section>

        {/* 7. Moulvibazar Computer & Laptop Showroom Advantage */}
        <section aria-label="Moulvibazar Computer Store Advantage" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#008CFF] uppercase tracking-wider mb-1">
                <ShieldCheck size={13} />
                <span>Moulvibazar&apos;s Trusted Computer &amp; Laptop Store</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#002B5B] tracking-tight">
                Genuine Hardware, Warranty &amp; Local Support in Moulvibazar
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every laptop, desktop PC, and monitor is tested in-house before dispatch from {BUSINESS_INFO.address.streetAddress}, Moulvibazar.
              </p>
            </div>
            <Link
              href="/moulvibazar"
              className="text-xs font-bold text-[#008CFF] hover:underline flex items-center gap-1 self-start sm:self-auto shrink-0"
            >
              <span>Visit Moulvibazar Local Hub</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-[#EAF4FF] text-[#008CFF] flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
              <h3 className="font-bold text-sm text-[#002B5B]">24-Point Hardware Diagnostics</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Every HP, Dell, and Lenovo laptop passes battery, display, SSD, RAM, keyboard, and thermal stress checks.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-bold text-sm text-[#002B5B]">7-Day Replacement &amp; 2-Year Service</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Transparent warranty protection handled locally at our Moulvibazar servicing lab with genuine parts.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                <Truck size={20} />
              </div>
              <h3 className="font-bold text-sm text-[#002B5B]">All 7 Moulvibazar Upazilas Covered</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Fast local delivery to Moulvibazar Sadar, Sreemangal, Kulaura, Rajnagar, Kamalganj, Juri &amp; Barlekha.
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Wrench size={20} />
                </div>
                <h3 className="font-bold text-sm text-[#002B5B]">Repair, CCTV &amp; Technical Services</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Need chip-level laptop repair, SSD upgrades, CCTV installation, or electrical services? Book on our dedicated portal.
                </p>
              </div>
              <Link
                href="/services"
                className="text-xs font-bold text-[#008CFF] hover:underline inline-flex items-center gap-1"
              >
                <span>Open Technical Services Hub</span>
                <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </section>

        {/* 7.1 Live Photo Gallery & Business Updates Feed */}
        {galleryUpdates.length > 0 && (
          <BusinessUpdatesFeed updates={galleryUpdates} />
        )}

        {/* 9. Authorized Global Brands Showcase */}
        <section aria-label="Featured Brands">
          <div className="text-center max-w-xl mx-auto mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#002B5B]">
              Authentic Global Brands We Supply
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Official warranty on laptops, desktop PCs, monitors &amp; accessories</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
            {BRANDS.map((b) => (
              <Link
                key={b.name}
                href={b.href}
                className="group bg-white border border-slate-200/90 hover:border-[#008CFF] hover:bg-[#EAF4FF]/30 rounded-xl p-3 text-center shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all block"
              >
                <span className="font-black text-xs sm:text-sm text-[#002B5B] group-hover:text-[#008CFF] block transition-colors">
                  {b.name}
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5 block truncate">
                  {b.desc}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* 10. Showroom NAP & Nationwide Delivery */}
        <section aria-label="Moulvibazar Showroom & Delivery" className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="space-y-2 md:col-span-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#008CFF] bg-[#EAF4FF] border border-blue-200/70 px-2.5 py-0.5 rounded-full">
                <MapPin size={13} />
                <span>{BUSINESS_INFO.fullAddress}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#002B5B]">
                Computer, Laptop, Desktop PC &amp; Accessories in Moulvibazar
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                Visit or order online from NEED ELECTRO for genuine HP, Dell, and Lenovo laptops, custom desktop PCs, HD monitors, and computer accessories with official warranty and open-box courier delivery across Moulvibazar and all 64 districts in Bangladesh.
              </p>
              <p className="text-xs font-semibold text-[#002B5B] flex flex-wrap items-center gap-x-3 gap-y-1 pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <Clock size={14} className="text-[#008CFF]" />
                  <span>{BUSINESS_INFO.openingHours.display}</span>
                </span>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="inline-flex items-center gap-1.5">
                  <Truck size={14} className="text-[#008CFF]" />
                  <span>Same-Day Moulvibazar Delivery &amp; 64-District COD</span>
                </span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 justify-center">
              <a
                href={`tel:${BUSINESS_INFO.phoneClean}`}
                className="w-full py-3 px-4 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white font-bold text-xs text-center shadow-md shadow-blue-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <Phone size={14} />
                <span>Call Hotline: {BUSINESS_INFO.phone}</span>
              </a>
              <Link
                href="/moulvibazar"
                className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-[#002B5B] font-bold text-xs text-center transition-colors"
              >
                Moulvibazar Showroom &amp; FAQ
              </Link>
            </div>
          </div>
        </section>
      </main>

      <CustomerFooter />
    </div>
  );
}

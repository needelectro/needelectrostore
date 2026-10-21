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
  { name: 'HP', desc: 'EliteBook & ProBook', href: '/laptops/hp' },
  { name: 'Dell', desc: 'Latitude & Inspiron', href: '/laptops/dell' },
  { name: 'Lenovo', desc: 'ThinkPad & IdeaPad', href: '/laptops/lenovo' },
  { name: 'Hikvision', desc: 'IP Camera & NVR', href: '/cctv' },
  { name: 'Dahua', desc: 'Smart Surveillance', href: '/cctv' },
  { name: 'Schneider', desc: 'Circuit Breakers', href: '/electrical-products' },
  { name: 'Super Star', desc: 'Electrical Fixtures', href: '/electrical-products' },
  { name: 'TP-Link', desc: 'Wi-Fi 6 Routers', href: '/networking' },
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
    <div className="min-h-screen bg-[#F4F6F8] text-[#002B5B] flex flex-col font-sans selection:bg-[#EAF4FF] selection:text-[#008CFF]">
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

        {/* 1. Hero Section — Full-Width Futuristic Banner Carousel */}
        <section aria-label="Hero Promotions" className="w-full">
          <HeroCarousel banners={banners} />
        </section>

        {/* 2. Showroom Hotline & Custom Engineering Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Customer Care & Warranty */}
          <div className="rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between relative overflow-hidden group min-h-[140px] bg-white">
            <img
              src="/banners/need-electro-service-warranty.jpg"
              alt="NEED ELECTRO Trusted Service & Warranty"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/40 pointer-events-none" />

            <div className="relative z-10 p-4 flex items-start justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-white text-emerald-700 border border-emerald-200 uppercase tracking-wider shadow-xs">
                <ShieldCheck size={11} className="text-emerald-600" />
                <span>Showroom Care &amp; Warranty Support</span>
              </span>
            </div>

            <div className="relative z-10 p-4 pt-0 flex items-center justify-between">
              <a
                href={`tel:${BUSINESS_INFO.phoneClean}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-[#002B5B] hover:text-[#008CFF] shadow-xs transition-colors"
              >
                <Phone size={12} className="text-[#008CFF]" />
                <span>Hotline: {BUSINESS_INFO.phone}</span>
              </a>
              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsappClean}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95"
              >
                <MessageCircle size={12} />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Card 2: Custom PC & Electrical Servicing */}
          <div className="rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between relative overflow-hidden group min-h-[140px] bg-white">
            <img
              src="/banners/need-electro-custom-pc.jpg"
              alt="NEED ELECTRO Custom Gaming PC & Workstations"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-white/40 pointer-events-none" />

            <div className="relative z-10 p-4 flex items-start justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-white text-[#008CFF] border border-blue-200 uppercase tracking-wider shadow-xs">
                <Zap size={11} className="text-[#008CFF]" />
                <span>Custom PC Builds &amp; Technical Services</span>
              </span>
            </div>

            <div className="relative z-10 p-4 pt-0 flex items-center justify-between">
              <Link
                href="/services/electrician"
                className="px-3.5 py-1.5 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95"
              >
                <span>Book Technician</span>
                <ArrowRight size={12} />
              </Link>
              <Link
                href="/computers"
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs font-bold text-[#002B5B] hover:text-[#008CFF] shadow-xs transition-colors"
              >
                Browse PCs →
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Status / Operational Strip (Trust Computer MB Style: Rounded-full Pill) */}
        <section aria-label="Showroom Operational Notice">
          <div className="bg-white rounded-full py-2.5 px-4 sm:px-6 shadow-xs border border-slate-200/90 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-[#002B5B]">
                Showroom Status:
              </span>
              <span className="text-slate-600 hidden sm:inline">
                Open Saturday to Thursday (9:30 AM – 9:30 PM). Kusumbag, Moulvibazar.
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

        {/* 3. 4 Feature / Quick Action Cards (Trust Computer MB Exact 4 Cards) */}
        <section aria-label="Quick Action Tools" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Tool 1: Laptop & PC Finder */}
          <Link
            href="/laptops"
            className="group bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-[#008CFF] hover:-translate-y-0.5 transition-all flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Laptop size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#002B5B] group-hover:text-rose-600 transition-colors">
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
                Cash on delivery across all 64 districts in Bangladesh with open-box verification.
              </p>
            </div>
          </Link>

          {/* Tool 3: CCTV Setup Calculator */}
          <Link
            href="/services/cctv-installation"
            className="group bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-[#008CFF] hover:-translate-y-0.5 transition-all flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#008CFF] border border-sky-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Calculator size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#002B5B] group-hover:text-[#008CFF] transition-colors">
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
            className="group bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-lg hover:border-[#008CFF] hover:-translate-y-0.5 transition-all flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Wrench size={24} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#002B5B] group-hover:text-emerald-600 transition-colors">
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
              <h2 className="text-xl sm:text-2xl font-black text-[#002B5B] tracking-tight">
                Featured Categories
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Explore authentic hardware &amp; equipment by category</p>
            </div>
            <Link
              href="/laptops"
              className="text-xs font-bold text-[#008CFF] hover:underline flex items-center gap-1"
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

        {/* 5. Dual Promotional Campaign Banners Grid (Desktop only - consolidated into single hero carousel on mobile) */}
        <section aria-label="Special Offers and Campaigns" className="hidden md:grid md:grid-cols-2 gap-3 sm:gap-4">
          {/* Promo Card 1: Laptop EMI */}
          <div className="relative rounded-2xl overflow-hidden min-h-[160px] sm:min-h-[180px] flex flex-col justify-between p-4 sm:p-5 border border-blue-200/90 shadow-md group transition-all bg-gradient-to-br from-[#EAF4FF] via-white to-sky-50">
            {/* Background Image with Hover Scale & Soft Light Blend */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none opacity-20"
              style={{ backgroundImage: "url('/banners/laptop-emi-promo-banner.jpg')" }}
            />
            {/* Luminous Light Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/95 via-white/80 to-[#EAF4FF]/40 pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform" />

            {/* Content Top */}
            <div className="relative z-10 space-y-1 sm:space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#008CFF]/15 text-[#008CFF] border border-blue-300/60 uppercase tracking-wider">
                <CreditCard size={12} className="text-[#008CFF]" />
                <span>0% EMI Available</span>
              </span>
              <h3 className="text-base sm:text-lg font-black text-[#002B5B] tracking-tight leading-snug">
                Up to 12 Months 0% Interest Laptop EMI
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-snug max-w-sm line-clamp-2">
                Own genuine HP, Dell &amp; Lenovo laptops with easy monthly credit card installments. Instant showroom eligibility check.
              </p>
            </div>

            {/* Content Bottom CTA */}
            <div className="relative z-10 pt-2 flex items-center justify-between">
              <Link
                href="/laptop-emi"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all active:scale-95"
              >
                <span>Calculate EMI &amp; Apply</span>
                <ArrowRight size={13} />
              </Link>
              <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-0.5 rounded-md shadow-2xs hidden sm:inline-block">
                18+ Partner Banks
              </span>
            </div>
          </div>

          {/* Promo Card 2: Wi-Fi 6 & Enterprise Networking */}
          <div className="relative rounded-2xl overflow-hidden min-h-[160px] sm:min-h-[180px] flex flex-col justify-between p-4 sm:p-5 border border-cyan-200/90 shadow-md group transition-all bg-gradient-to-br from-cyan-50/70 via-white to-[#EAF4FF]">
            {/* Background Image with Hover Scale */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none opacity-20"
              style={{ backgroundImage: "url('/banners/wifi-networking-banner.jpg')" }}
            />
            {/* Luminous Light Vignette Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/95 via-white/80 to-cyan-50/40 pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-125 transition-transform" />

            {/* Content Top */}
            <div className="relative z-10 space-y-1 sm:space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-cyan-100 text-cyan-800 border border-cyan-300 uppercase tracking-wider">
                <Wifi size={12} className="text-cyan-700" />
                <span>Gigabit Speeds</span>
              </span>
              <h3 className="text-base sm:text-lg font-black text-[#002B5B] tracking-tight leading-snug">
                Ultra-Fast Wi-Fi 6 &amp; Structured Mesh
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-snug max-w-sm line-clamp-2">
                Eliminate Wi-Fi dead spots with dual-band gigabit routers, PoE switches, and commercial Cat6 cabling setup.
              </p>
            </div>

            {/* Content Bottom CTA */}
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

        {/* 6. Products Showcase with Interactive Tabs (Trust Computer Style) */}
        <section aria-label="Featured Products">
          <ProductTabsShowcase products={mappedProducts} />
        </section>

        {/* 7. Dedicated Electrical & Technical Services Section */}
        <section aria-label="Electrical & Technical Services" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#008CFF] uppercase tracking-wider mb-1">
                <Wrench size={13} />
                <span>On-Site Engineering &amp; Repair Center</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#002B5B] tracking-tight">
                Dedicated Electrical &amp; Technical Services
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Certified technicians and electricians providing doorstep diagnostics, installations, and repairs across Moulvibazar.
              </p>
            </div>
            <Link
              href="/services"
              className="text-xs font-bold text-[#008CFF] hover:underline flex items-center gap-1 self-start sm:self-auto shrink-0"
            >
              <span>Explore All Technical Services</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Service 1: Certified Electrician */}
            <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-amber-400 p-5 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/70 flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform">
                  <Zap size={24} />
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 uppercase tracking-wide inline-block mb-1.5">
                  Moulvibazar Town &amp; Upazilas
                </span>
                <h3 className="font-bold text-sm text-[#002B5B] group-hover:text-amber-600 transition-colors">
                  Certified Electrician &amp; Wiring
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Residential and commercial wiring, short-circuit diagnostics, MCB circuit breakers, and distribution balance.
                </p>
              </div>
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  href="/services/electrician"
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95"
                >
                  <span>Book Electrician</span>
                  <ArrowRight size={12} />
                </Link>
                <a
                  href={`tel:${BUSINESS_INFO.phoneClean}`}
                  className="p-1.5 rounded-xl bg-[#F4F6F8] hover:bg-amber-50 text-slate-700 hover:text-amber-600 border border-slate-200 transition-colors"
                  title="Call Technician"
                >
                  <Phone size={14} />
                </a>
              </div>
            </div>

            {/* Service 2: CCTV Camera Setup */}
            <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-cyan-400 p-5 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 border border-cyan-200/70 flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform">
                  <Camera size={24} />
                </div>
                <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full border border-cyan-200/60 uppercase tracking-wide inline-block mb-1.5">
                  Hikvision &amp; Dahua Setup
                </span>
                <h3 className="font-bold text-sm text-[#002B5B] group-hover:text-cyan-600 transition-colors">
                  CCTV Camera Installation
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Turnkey HD &amp; IP surveillance, DVR/NVR hard disk storage setup, and live mobile phone surveillance configuration.
                </p>
              </div>
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  href="/services/cctv-installation"
                  className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95"
                >
                  <span>Book CCTV Setup</span>
                  <ArrowRight size={12} />
                </Link>
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20NEED%20ELECTRO%2C%20I%20need%20a%20CCTV%20installation%20quotation.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl bg-[#F4F6F8] hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 border border-slate-200 transition-colors"
                  title="WhatsApp Quotation"
                >
                  <MessageCircle size={14} />
                </a>
              </div>
            </div>

            {/* Service 3: Laptop & Computer Repair Lab */}
            <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#008CFF] p-5 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#EAF4FF] text-[#008CFF] border border-blue-200/70 flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform">
                  <Laptop size={24} />
                </div>
                <span className="text-[10px] font-bold text-[#008CFF] bg-[#EAF4FF] px-2 py-0.5 rounded-full border border-blue-200/60 uppercase tracking-wide inline-block mb-1.5">
                  Hardware &amp; Chip-Level
                </span>
                <h3 className="font-bold text-sm text-[#002B5B] group-hover:text-[#008CFF] transition-colors">
                  Laptop &amp; PC Servicing Lab
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Motherboard micro-soldering, SSD &amp; RAM speed upgrades, thermal paste replacement, and genuine OS tuning.
                </p>
              </div>
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  href="/services/laptop-computer-repair"
                  className="px-3 py-1.5 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95"
                >
                  <span>Book Repair Lab</span>
                  <ArrowRight size={12} />
                </Link>
                <a
                  href={`tel:${BUSINESS_INFO.phoneClean}`}
                  className="p-1.5 rounded-xl bg-[#F4F6F8] hover:bg-blue-50 text-slate-700 hover:text-[#008CFF] border border-slate-200 transition-colors"
                  title="Call Hotline"
                >
                  <Phone size={14} />
                </a>
              </div>
            </div>

            {/* Service 4: Enterprise Networking & Wi-Fi 6 */}
            <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-400 p-5 shadow-xs hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200/70 flex items-center justify-center mb-3.5 group-hover:scale-110 transition-transform">
                  <Wifi size={24} />
                </div>
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60 uppercase tracking-wide inline-block mb-1.5">
                  Home, Office &amp; Retail
                </span>
                <h3 className="font-bold text-sm text-[#002B5B] group-hover:text-indigo-600 transition-colors">
                  Wi-Fi &amp; Structured Networking
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Cat6 structured cabling, dual-band Wi-Fi 6 mesh setup, Gigabit switches, and complete dead-zone elimination.
                </p>
              </div>
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Link
                  href="/services/networking"
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all active:scale-95"
                >
                  <span>Book Networking</span>
                  <ArrowRight size={12} />
                </Link>
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20NEED%20ELECTRO%2C%20I%20need%20a%20Wi-Fi%20or%20office%20networking%20setup.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl bg-[#F4F6F8] hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 border border-slate-200 transition-colors"
                  title="WhatsApp Inquiries"
                >
                  <MessageCircle size={14} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Full-Width Solar Inverter & Emergency IPS Power Banner (Desktop only - consolidated into single hero carousel on mobile) */}
        <section aria-label="Solar and IPS Power Solutions" className="hidden md:block">
          <div className="relative rounded-2xl overflow-hidden border border-amber-200/90 shadow-md p-4 sm:p-6 lg:p-7 group bg-gradient-to-r from-[#EAF4FF] via-white to-amber-50/60">
            {/* Background Solar IPS Banner Image with Zoom */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none opacity-20"
              style={{ backgroundImage: "url('/banners/solar-ips-power-banner.jpg')" }}
            />
            {/* High-Contrast Luminous Gradient Backdrop */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-white/50 pointer-events-none" />
            <div className="absolute -right-10 top-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center relative z-10">
              <div className="lg:col-span-8 space-y-2 sm:space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 backdrop-blur-md">
                  <Sun size={13} className="text-amber-600" />
                  <span>24/7 Load-Shedding Solution — Pure Sine Wave Solar &amp; IPS Systems</span>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#002B5B] tracking-tight leading-tight">
                  Uninterrupted Power for Your Home, Office &amp; Lab
                </h2>
                <p className="text-xs sm:text-[13px] text-slate-600 max-w-2xl leading-relaxed">
                  Heavy-duty pure sine wave inverters, deep-cycle tubular batteries, and hybrid solar installations by certified engineers. Auto-switchover ensures zero reboot downtime for laptops, CCTV, and servers.
                </p>

                {/* Highlights */}
                <div className="flex flex-wrap gap-1.5 pt-0.5 text-[10px] sm:text-[11px] text-slate-700">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs">
                    <CheckCircle2 size={12} className="text-emerald-600" /> 100% Pure Sine Wave
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs">
                    <CheckCircle2 size={12} className="text-emerald-600" /> Up to 36 Months Battery Warranty
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white border border-slate-200 shadow-2xs">
                    <CheckCircle2 size={12} className="text-emerald-600" /> On-site Setup Across Bangladesh
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-1.5">
                  <Link
                    href="/electrical-products"
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/25 active:scale-95"
                  >
                    Explore IPS &amp; Solar Packages
                  </Link>
                  <Link
                    href="/services/electrician"
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-[#002B5B] font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Wrench size={13} className="text-amber-600" />
                    <span>Book Installation Engineer</span>
                  </Link>
                  <a
                    href={`tel:${BUSINESS_INFO.phoneClean}`}
                    className="px-3.5 py-2 rounded-xl bg-[#EAF4FF] hover:bg-blue-100 border border-blue-200 text-[#008CFF] font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Phone size={13} className="text-[#008CFF]" />
                    <span>Call Hotline: {BUSINESS_INFO.phone}</span>
                  </a>
                </div>
              </div>

              {/* Right Column Quick Packages Box */}
              <div className="lg:col-span-4 bg-white/95 border border-slate-200/90 rounded-xl p-4 backdrop-blur-md space-y-2.5 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-[11px] font-bold text-[#002B5B] uppercase tracking-wider flex items-center gap-1.5">
                    <Zap size={13} className="text-amber-500" /> Power Capacity Guide
                  </span>
                  <span className="text-[9px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                    In Stock
                  </span>
                </div>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
                    <div>
                      <div className="font-bold text-[#002B5B] text-xs">Home 600VA – 800VA</div>
                      <div className="text-[10px] text-slate-500">4 Fans + 6 LED Lights</div>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                      Economical
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-0.5 border-b border-slate-100">
                    <div>
                      <div className="font-bold text-[#002B5B] text-xs">Office 1000VA – 1500VA</div>
                      <div className="text-[10px] text-slate-500">Laptops, Wi-Fi &amp; CCTV Wall</div>
                    </div>
                    <span className="text-[10px] font-bold text-[#008CFF] bg-[#EAF4FF] border border-blue-200 px-1.5 py-0.5 rounded">
                      Standard
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-0.5">
                    <div>
                      <div className="font-bold text-[#002B5B] text-xs">Commercial 2.5kVA+ Hybrid</div>
                      <div className="text-[10px] text-slate-500">Full Solar Integration</div>
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                      Heavy-Duty
                    </span>
                  </div>
                </div>
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20NEED%20ELECTRO,%20I%20am%20interested%20in%20an%20IPS%20or%20Solar%20package`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all active:scale-95"
                >
                  <MessageCircle size={13} />
                  <span>Get Free WhatsApp Consultation</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Authorized Global Brands Showcase */}
        <section aria-label="Featured Brands">
          <div className="text-center max-w-xl mx-auto mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#002B5B]">
              Authentic Global Brands We Supply
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Official manufacturer warranty on all serialized products</p>
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

        {/* 10. Showroom & Physical Presence Hub (Moulvibazar) */}
        <section aria-label="Showroom Information" className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="space-y-2 md:col-span-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#008CFF] bg-[#EAF4FF] border border-blue-200/70 px-2.5 py-0.5 rounded-full">
                <MapPin size={13} />
                <span>Physical Showroom in Moulvibazar</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#002B5B]">
                Visit Us at Kusumbag, Moulvibazar
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                Experience products before purchasing. Our showroom features live demo units for HP, Dell, and Lenovo laptops, as well as an active CCTV surveillance display wall.
              </p>
              <p className="text-xs font-semibold text-[#002B5B] flex items-center gap-2 pt-1">
                <Clock size={14} className="text-[#008CFF]" />
                <span>Open Saturday to Thursday: 9:30 AM – 9:30 PM (Friday Closed)</span>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row md:flex-col gap-3 justify-center">
              <a
                href={BUSINESS_INFO.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white font-bold text-xs text-center shadow-md shadow-blue-500/20 transition-colors flex items-center justify-center gap-2"
              >
                <MapPin size={14} />
                <span>Get Google Maps Directions</span>
              </a>
              <Link
                href="/contact"
                className="w-full py-3 px-4 rounded-xl border border-slate-300 hover:bg-slate-50 text-[#002B5B] font-bold text-xs text-center transition-colors"
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

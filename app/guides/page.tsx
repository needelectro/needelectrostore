import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { BUSINESS_INFO, generateSeoMetadata, buildBreadcrumbSchema } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { ProductCard } from '@/src/components/customer/ProductCard';
import { GuidesSearchHero } from '@/src/components/guides/GuidesSearchHero';
import { GuideCard } from '@/src/components/guides/GuideCard';
import { GUIDE_CATEGORIES, GuideCategory } from '@/lib/guidesData';
import { getGuides } from '@/lib/guidesService';
import {
  Tag, Layers, BookOpen, HelpCircle, ArrowRight,
  Sparkles, Wrench, ShieldCheck, Laptop, Camera, Zap, ChevronRight
} from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Guides & Advice: Laptop Prices, Specs & Buying Guides | NEED ELECTRO',
    description:
      'Compare laptop prices in Bangladesh, explore side-by-side specs, read used laptop checklists, CCTV cost guides, and make informed technology and electrical purchases.',
    path: '/guides',
    keywords: [
      'Laptop price in Bangladesh',
      'HP EliteBook price in Bangladesh',
      'Laptop buying guide Bangladesh',
      'Used laptop checklist',
      'CCTV camera price in Bangladesh',
      'HP vs Dell laptop comparison',
      'Desktop computer price in Bangladesh',
      'Computer accessories price guide',
      'Electrical products guide Bangladesh',
      'NEED ELECTRO guides',
    ],
  });
}

export default async function GuidesLandingPage() {
  const featuredGuides = await getGuides({ isFeatured: true, limit: 6 });
  const recentGuides = await getGuides({ limit: 6 });

  // Query real featured products to show in recommendation section
  let featuredProducts: any[] = [];
  try {
    featuredProducts = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
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
        emiPrice: true,
        currentStock: true,
        warrantyPeriodMonths: true,
        specs: true,
      },
      orderBy: [{ isFeatured: 'desc' }, { updatedAt: 'desc' }],
      take: 4,
    });
  } catch (err) {
    console.error('Error fetching featured products for guides hub:', err);
  }

  const breadcrumbs = [{ name: 'Guides & Advice', path: '/guides' }];

  const categoryIcons: Record<GuideCategory, any> = {
    prices: Tag,
    comparisons: Layers,
    'buying-guides': BookOpen,
    faqs: HelpCircle,
  };

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Guides & Advice', path: '/guides' },
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      {/* 1. Hero with Live Search */}
      <GuidesSearchHero />

      {/* 2. Four Prominent Category Cards */}
      <section className="py-12 px-4 max-w-7xl mx-auto w-full -mt-10 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {GUIDE_CATEGORIES.map((cat) => {
            const Icon = categoryIcons[cat.id];
            return (
              <Link
                key={cat.id}
                href={cat.path}
                className="group p-6 rounded-2xl bg-white dark:bg-[#0b1320] border border-slate-200 dark:border-slate-800 hover:border-[#008CFF] dark:hover:border-cyan-500/60 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} text-white flex items-center justify-center shadow-md`}>
                      <Icon size={24} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {cat.badge}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#008CFF] dark:group-hover:text-cyan-400 transition-colors">
                      {cat.title}
                    </h2>
                    <p className="text-xs text-[#008CFF] dark:text-cyan-300 font-medium mt-0.5">
                      {cat.titleBn}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-[#008CFF] dark:text-cyan-400">
                  <span>Explore {cat.title}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Guides */}
      <section className="py-10 px-4 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#008CFF] dark:text-cyan-400 uppercase tracking-wider mb-1">
              <Sparkles size={14} />
              <span>Editor's Top Picks</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Featured Buying &amp; Price Guides
            </h2>
          </div>
          <Link
            href="/guides/prices"
            className="text-xs font-bold text-[#008CFF] hover:underline flex items-center gap-1"
          >
            <span>View All Price Guides</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredGuides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} featured />
          ))}
        </div>
      </section>

      {/* 4. Real Product Recommendations */}
      {featuredProducts.length > 0 && (
        <section className="py-12 px-4 bg-slate-100/70 dark:bg-[#070d18] border-y border-slate-200 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Real Inventory In Stock
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                  Hardware Recommended by Our Engineers
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Verified stock at Kusumbag, Moulvibazar showroom with open-box verification nationwide.
                </p>
              </div>
              <Link
                href="/shop"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#008CFF] hover:underline"
              >
                <span>Browse All Products</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {featuredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={{
                    id: p.id,
                    name: p.name,
                    sku: p.sku,
                    category: p.category,
                    brand: p.brand,
                    model: p.model,
                    description: p.description,
                    imageUrl: p.imageUrl,
                    retailPrice: Number(p.retailPrice),
                    emiPrice: Number(p.emiPrice),
                    currentStock: p.currentStock,
                    warrantyPeriodMonths: p.warrantyPeriodMonths,
                    specs: p.specs,
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Recently Updated Guides */}
      <section className="py-14 px-4 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Recently Updated Articles &amp; Benchmarks
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Freshly audited specifications, thermal test logs, and market pricing adjustments.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentGuides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      </section>

      {/* 6. Related Technical Services Banner */}
      <section className="py-12 px-4 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl bg-gradient-to-br from-[#002B5B] to-[#081621] text-white p-8 sm:p-12 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="bg-[#008CFF]/20 text-cyan-300 border border-[#008CFF]/40 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              On-Site Engineering &amp; Repair
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Need Professional Installation or Laptop Servicing?
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Our certified technicians in Moulvibazar handle chip-level laptop repair, CCTV multi-camera installations, Wi-Fi 6 mesh setup, and residential electrical wiring with certified safety standards.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/services/laptop-computer-repair"
                className="bg-[#008CFF] hover:bg-blue-600 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors shadow-md"
              >
                Laptop Repair Lab
              </Link>
              <Link
                href="/services/cctv-installation"
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors border border-slate-700"
              >
                CCTV Installation
              </Link>
              <Link
                href="/services/electrician"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-colors shadow-md"
              >
                Book Electrician
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Final Category CTA */}
      <section className="py-12 px-4 bg-white dark:bg-[#070d18] border-t border-slate-200 dark:border-slate-800 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Ready to Explore Products with Verified Prices?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Visit our comprehensive online shop or browse by dedicated hardware categories.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/laptops"
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-[#008CFF] hover:text-white transition-colors"
            >
              Laptops &amp; Notebooks
            </Link>
            <Link
              href="/computers"
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-[#008CFF] hover:text-white transition-colors"
            >
              Desktop PCs &amp; Displays
            </Link>
            <Link
              href="/cctv"
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-[#008CFF] hover:text-white transition-colors"
            >
              CCTV Surveillance
            </Link>
            <Link
              href="/electrical-products"
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-[#008CFF] hover:text-white transition-colors"
            >
              Electrical Switchgear
            </Link>
            <Link
              href="/shop"
              className="px-4 py-2 rounded-xl bg-[#008CFF] text-white text-xs font-bold hover:bg-blue-600 transition-colors shadow-sm"
            >
              Complete Online Catalog →
            </Link>
          </div>
        </div>
      </section>

      <CustomerFooter />
    </div>
  );
}

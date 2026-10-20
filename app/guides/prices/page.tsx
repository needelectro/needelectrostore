import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { generateSeoMetadata, buildBreadcrumbSchema } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { GuideCard } from '@/src/components/guides/GuideCard';
import { getGuides } from '@/lib/guidesService';
import { Tag, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Technology & Electrical Price Guides in Bangladesh | NEED ELECTRO',
    description:
      'Compare verified current selling prices and indicative market values for laptops, desktop computers, CCTV cameras, and electrical equipment in Bangladesh.',
    path: '/guides/prices',
    keywords: [
      'Laptop price in Bangladesh',
      'HP EliteBook price in Bangladesh',
      'Desktop computer price in Bangladesh',
      'CCTV camera price in Bangladesh',
      'Computer accessories price guide',
      'Electrical products price guide Bangladesh',
      'Tech gadgets price in Bangladesh',
    ],
  });
}

export default async function PriceGuidesPage() {
  const priceGuides = await getGuides({ category: 'prices' });

  const breadcrumbs = [
    { name: 'Guides & Advice', path: '/guides' },
    { name: 'Price Guides', path: '/guides/prices' },
  ];

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Guides & Advice', path: '/guides' },
    { name: 'Price Guides', path: '/guides/prices' },
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      {/* Header Banner */}
      <section className="py-12 px-4 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-blue-50/70 via-transparent to-transparent dark:from-blue-950/20">
        <div className="max-w-7xl mx-auto space-y-4">
          <Link
            href="/guides"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#008CFF] hover:underline mb-2"
          >
            <ArrowLeft size={13} />
            <span>Back to All Guides</span>
          </Link>

          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 dark:bg-blue-900/40 dark:border-blue-500/30 px-3 py-1 rounded-full text-xs font-semibold text-blue-700 dark:text-cyan-300">
            <Tag size={14} />
            <span>Verified Market Prices &amp; Tiers</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Technology &amp; Electrical Price Guides in Bangladesh
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            Honest, transparent pricing data across laptops, desktop PCs, CCTV cameras, and electrical equipment. Every price guide strictly distinguishes verified selling prices from indicative market ranges.
          </p>

          <div className="pt-2 flex flex-wrap gap-3 text-xs">
            <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 font-semibold">
              <CheckCircle2 size={13} /> Verified Selling Prices from Live Inventory
            </span>
            <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 font-semibold">
              <AlertCircle size={13} /> Indicative Market Benchmarks
            </span>
          </div>
        </div>
      </section>

      {/* Guide Cards Grid */}
      <section className="py-12 px-4 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {priceGuides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      </section>

      <CustomerFooter />
    </div>
  );
}

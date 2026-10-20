import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { generateSeoMetadata, buildBreadcrumbSchema } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { GuideCard } from '@/src/components/guides/GuideCard';
import { getGuides } from '@/lib/guidesService';
import { Layers, ArrowLeft, ShieldCheck } from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Product & Technology Comparisons | Specs & Benchmarks | NEED ELECTRO',
    description:
      'Compare competing laptops, chips, and security systems. Side-by-side specs, pros and cons, thermal tests, and practical trade-off evaluations.',
    path: '/guides/comparisons',
    keywords: [
      'HP EliteBook vs Dell Latitude',
      'IP camera vs analog CCTV',
      'RAM vs SSD comparison',
      'Laptop vs desktop for students',
      'Product comparisons Bangladesh',
    ],
  });
}

export default async function ComparisonsHubPage() {
  const comparisonGuides = await getGuides({ category: 'comparisons' });

  const breadcrumbs = [
    { name: 'Guides & Advice', path: '/guides' },
    { name: 'Product Comparisons', path: '/guides/comparisons' },
  ];

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Guides & Advice', path: '/guides' },
    { name: 'Product Comparisons', path: '/guides/comparisons' },
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <section className="py-12 px-4 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-indigo-50/70 via-transparent to-transparent dark:from-indigo-950/20">
        <div className="max-w-7xl mx-auto space-y-4">
          <Link
            href="/guides"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#008CFF] hover:underline mb-2"
          >
            <ArrowLeft size={13} />
            <span>Back to All Guides</span>
          </Link>

          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 dark:bg-indigo-900/40 dark:border-indigo-500/30 px-3 py-1 rounded-full text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <Layers size={14} />
            <span>Side-by-Side Specifications</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Product &amp; Technology Comparisons
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            Detailed, objective hardware analyses without biased winners. We examine build materials, thermal limitations, long-term upgradeability, and real-world value for Bangladeshi buyers.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comparisonGuides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      </section>

      <CustomerFooter />
    </div>
  );
}

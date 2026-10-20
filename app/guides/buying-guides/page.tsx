import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { generateSeoMetadata, buildBreadcrumbSchema } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { GuideCard } from '@/src/components/guides/GuideCard';
import { getGuides } from '@/lib/guidesService';
import { BookOpen, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Buying Guides & Practical Checklists | NEED ELECTRO',
    description:
      'Actionable buying guides for student laptops, used PC checklists, home CCTV selection, and electrical safety standards written by certified engineers in Moulvibazar.',
    path: '/guides/buying-guides',
    keywords: [
      'Best laptop for students in Bangladesh',
      'Used laptop checklist',
      'How to choose a CCTV camera',
      'How to choose a Wi-Fi router',
      'Electrical safety guide Bangladesh',
    ],
  });
}

export default async function BuyingGuidesHubPage() {
  const buyingGuides = await getGuides({ category: 'buying-guides' });

  const breadcrumbs = [
    { name: 'Guides & Advice', path: '/guides' },
    { name: 'Buying Guides', path: '/guides/buying-guides' },
  ];

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Guides & Advice', path: '/guides' },
    { name: 'Buying Guides', path: '/guides/buying-guides' },
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <section className="py-12 px-4 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-emerald-50/70 via-transparent to-transparent dark:from-emerald-950/20">
        <div className="max-w-7xl mx-auto space-y-4">
          <Link
            href="/guides"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#008CFF] hover:underline mb-2"
          >
            <ArrowLeft size={13} />
            <span>Back to All Guides</span>
          </Link>

          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/40 dark:border-emerald-500/30 px-3 py-1 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            <BookOpen size={14} />
            <span>Actionable Hardware Checklists</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Technology &amp; Electrical Buying Guides
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            Written by our engineering and technician team in Moulvibazar. Discover step-by-step checklists to avoid expensive pitfalls when purchasing pre-owned hardware, configuring security cameras, and maintaining electrical safety.
          </p>
        </div>
      </section>

      <section className="py-12 px-4 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buyingGuides.map((guide) => (
            <GuideCard key={guide.id} guide={guide} />
          ))}
        </div>
      </section>

      <CustomerFooter />
    </div>
  );
}

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { generateSeoMetadata, buildBreadcrumbSchema, buildFaqSchema } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { GuideFaqAccordion } from '@/src/components/guides/GuideFaqAccordion';
import { MASTER_FAQS } from '@/lib/guidesData';
import {
  HelpCircle, ArrowLeft, Laptop, Monitor, Camera,
  Zap, Wifi, ShieldCheck, Truck, RefreshCw, Wrench
} from 'lucide-react';

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Frequently Asked Questions (FAQs) | Laptops, CCTV & Services | NEED ELECTRO',
    description:
      'Verified answers to customer questions regarding laptop specifications, used PC testing, CCTV camera options, electrician bookings, warranty terms, and delivery across Bangladesh.',
    path: '/guides/faqs',
    keywords: [
      'Laptop FAQ Bangladesh',
      'Used laptop warranty questions',
      'CCTV installation questions',
      'Electrician booking Moulvibazar',
      'NEED ELECTRO delivery FAQ',
      'Laptop EMI FAQ',
    ],
  });
}

export default function FaqsHubPage() {
  const categoryIcons: Record<string, any> = {
    laptops: Laptop,
    computers: Monitor,
    cctv: Camera,
    electrical: Zap,
    networking: Wifi,
    warranty: ShieldCheck,
    delivery: Truck,
    returns: RefreshCw,
    services: Wrench,
  };

  const breadcrumbs = [
    { name: 'Guides & Advice', path: '/guides' },
    { name: 'Frequently Asked Questions', path: '/guides/faqs' },
  ];

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Guides & Advice', path: '/guides' },
    { name: 'Frequently Asked Questions', path: '/guides/faqs' },
  ]);

  // Aggregate all FAQs for JSON-LD FAQPage schema
  const allFaqItems = Object.values(MASTER_FAQS).flatMap(cat => cat.items);
  const faqSchema = buildFaqSchema(allFaqItems);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <section className="py-12 px-4 border-b border-slate-200 dark:border-slate-800/80 bg-gradient-to-b from-amber-50/70 via-transparent to-transparent dark:from-amber-950/20">
        <div className="max-w-7xl mx-auto space-y-4">
          <Link
            href="/guides"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#008CFF] hover:underline mb-2"
          >
            <ArrowLeft size={13} />
            <span>Back to All Guides</span>
          </Link>

          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 dark:bg-amber-900/40 dark:border-amber-500/30 px-3 py-1 rounded-full text-xs font-semibold text-amber-700 dark:text-amber-300">
            <HelpCircle size={14} />
            <span>Customer Knowledge Base</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Frequently Asked Questions (FAQs)
          </h1>

          <p className="text-slate-600 dark:text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            Direct, factual answers based on official NEED ELECTRO business policies, diagnostic procedures, and technical standards across all 9 commercial categories.
          </p>

          {/* Quick jump anchor chips */}
          <div className="pt-2 flex flex-wrap gap-2 text-xs">
            {Object.entries(MASTER_FAQS).map(([key, cat]) => (
              <a
                key={key}
                href={`#faq-${key}`}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#008CFF] px-3 py-1 rounded-full text-slate-700 dark:text-slate-300 font-semibold transition-colors"
              >
                {cat.categoryTitle}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main FAQ Categories Grid */}
      <section className="py-12 px-4 max-w-5xl mx-auto w-full flex-1 space-y-12">
        {Object.entries(MASTER_FAQS).map(([key, cat]) => {
          const Icon = categoryIcons[key] || HelpCircle;
          return (
            <div key={key} id={`faq-${key}`} className="scroll-mt-24 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-slate-800 text-[#008CFF] flex items-center justify-center">
                  <Icon size={18} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {cat.categoryTitle} FAQs
                  </h2>
                </div>
              </div>

              <GuideFaqAccordion faqs={cat.items} title="" />
            </div>
          );
        })}
      </section>

      <CustomerFooter />
    </div>
  );
}

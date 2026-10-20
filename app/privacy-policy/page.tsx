import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { BUSINESS_INFO, generateSeoMetadata, buildBreadcrumbSchema } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { ShieldCheck, Lock, FileText, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await prisma.websitePage.findUnique({
    where: { slug: 'privacy-policy' },
  }).catch(() => null);

  return generateSeoMetadata({
    title: page?.seoTitle || 'Privacy Policy | Data Protection | NEED ELECTRO',
    description: page?.metaDescription || 'Read the official Privacy Policy of NEED ELECTRO. How we safeguard customer contact numbers, delivery addresses, and payment data across Bangladesh.',
    path: '/privacy-policy',
  });
}

export default async function PrivacyPolicyPage() {
  const page = await prisma.websitePage.findUnique({
    where: { slug: 'privacy-policy' },
  }).catch(() => null);

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { name: 'Privacy Policy', path: '/privacy-policy' },
  ];
  const breadcrumbSchema = buildBreadcrumbSchema(breadcrumbs);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <section className="py-10 px-4 bg-gradient-to-b from-[#081621] to-[#040e19] text-white">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0084d6]/20 border border-[#0084d6]/40 text-sky-300">
            <Lock size={13} />
            <span>Official Policy &amp; Security</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            {page?.title || 'Privacy Policy'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            {page?.metaDescription || `How ${BUSINESS_INFO.name} protects your personal information, order history, and privacy across all digital services.`}
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-xs space-y-6">
          <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
            {page?.content || `## Privacy & Data Protection Policy\nAt NEED ELECTRO, we respect your privacy and are committed to protecting your personal data.`}
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>Last Updated: {page?.updatedAt ? new Date(page.updatedAt).toLocaleDateString('en-BD') : 'October 2026'}</span>
            <Link href="/contact" className="text-blue-600 dark:text-cyan-400 font-semibold hover:underline">
              Questions? Contact Support →
            </Link>
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}

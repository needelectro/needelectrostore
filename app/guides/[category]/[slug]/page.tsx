import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  BUSINESS_INFO, generateSeoMetadata, buildBreadcrumbSchema,
  buildArticleSchema, buildFaqSchema
} from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { ProductCard } from '@/src/components/customer/ProductCard';
import { PriceTableComponent } from '@/src/components/guides/PriceTableComponent';
import { ComparisonTableComponent } from '@/src/components/guides/ComparisonTableComponent';
import { GuideFaqAccordion } from '@/src/components/guides/GuideFaqAccordion';
import { GuideCard } from '@/src/components/guides/GuideCard';
import { INITIAL_GUIDES, GuideCategory } from '@/lib/guidesData';
import { getGuideBySlug, getGuides, getRelatedProductsForGuide } from '@/lib/guidesService';
import {
  Clock, User, Calendar, ArrowLeft, Share2, ShieldCheck,
  CheckCircle2, ArrowRight, BookOpen, ExternalLink, Sparkles
} from 'lucide-react';

export const revalidate = 60;

export async function generateStaticParams() {
  return INITIAL_GUIDES.map(guide => ({
    category: guide.category,
    slug: guide.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: { category: string; slug: string };
}): Promise<Metadata> {
  const guide = await getGuideBySlug(params.slug);
  if (!guide) {
    return generateSeoMetadata({
      title: 'Guide Not Found',
      description: 'The requested guide could not be found.',
      path: `/guides/${params.category}/${params.slug}`,
      noIndex: true,
    });
  }

  const categoryName = guide.category === 'prices' ? 'Price Guide' :
    guide.category === 'comparisons' ? 'Comparison' : 'Buying Guide';

  return generateSeoMetadata({
    title: guide.seoTitle || `${guide.title} | ${categoryName} | NEED ELECTRO`,
    description: guide.metaDescription,
    path: `/guides/${guide.category}/${guide.slug}`,
    keywords: [
      guide.title,
      guide.category,
      'NEED ELECTRO',
      'Moulvibazar',
      'Bangladesh',
      'Laptop price in Bangladesh',
    ],
    ogImage: guide.featuredImage || '/logo-dark-transparent.png',
  });
}

export default async function GuideArticlePage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const guide = await getGuideBySlug(params.slug);
  if (!guide) {
    notFound();
  }

  // Fetch real products from inventory matching the article's relatedSkus
  const relatedProducts = await getRelatedProductsForGuide(guide.relatedSkus || []);

  // Fetch related guide articles
  const otherGuides = await getGuides({ category: guide.category as GuideCategory, limit: 3 });
  const relatedArticles = otherGuides.filter(g => g.slug !== guide.slug).slice(0, 3);

  const categoryLabels: Record<string, string> = {
    prices: 'Price Guides',
    comparisons: 'Product Comparisons',
    'buying-guides': 'Buying Guides',
    faqs: 'FAQs',
  };

  const breadcrumbs = [
    { name: 'Guides & Advice', path: '/guides' },
    { name: categoryLabels[guide.category] || guide.category, path: `/guides/${guide.category}` },
    { name: guide.title, path: `/guides/${guide.category}/${guide.slug}` },
  ];

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Guides & Advice', path: '/guides' },
    { name: categoryLabels[guide.category] || guide.category, path: `/guides/${guide.category}` },
    { name: guide.title, path: `/guides/${guide.category}/${guide.slug}` },
  ]);

  const articleSchema = buildArticleSchema({
    title: guide.title,
    slug: `guides/${guide.category}/${guide.slug}`,
    description: guide.metaDescription,
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    authorName: guide.author,
  });

  const faqSchema = guide.faqs && guide.faqs.length > 0 ? buildFaqSchema(guide.faqs) : null;

  const publishedDateFormatted = new Date(guide.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const updatedDateFormatted = new Date(guide.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      {/* Article Header Hero */}
      <header className="py-10 sm:py-14 px-4 bg-white dark:bg-[#081621] border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto space-y-4">
          <Link
            href={`/guides/${guide.category}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#008CFF] hover:underline mb-1"
          >
            <ArrowLeft size={13} />
            <span>Back to {categoryLabels[guide.category] || 'Guides'}</span>
          </Link>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <span className="uppercase text-[10px] font-bold tracking-wider px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-900">
              {categoryLabels[guide.category] || guide.category}
            </span>
            <span className="text-slate-400">•</span>
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Clock size={13} />
              <span>{guide.readingTime}</span>
            </span>
            <span className="text-slate-400">•</span>
            <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
              <Calendar size={13} />
              <span>Published {publishedDateFormatted}</span>
            </span>
            {guide.updatedAt !== guide.publishedAt && (
              <>
                <span className="text-slate-400">•</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                  Updated {updatedDateFormatted}
                </span>
              </>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {guide.title}
          </h1>

          {guide.titleBn && (
            <p className="text-sm sm:text-base text-[#008CFF] dark:text-cyan-300 font-medium">
              {guide.titleBn}
            </p>
          )}

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
            {guide.summary}
          </p>

          {/* Author Box */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#008CFF] to-cyan-400 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                AR
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-xs">{guide.author}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{guide.authorRole}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${guide.title} - ${BUSINESS_INFO.domain}/guides/${guide.category}/${guide.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors"
                title="Share via WhatsApp"
              >
                <Share2 size={14} />
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout with Sticky Table of Contents */}
      <div className="max-w-7xl mx-auto px-4 py-10 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Article Body Column */}
          <main className="lg:col-span-8 space-y-8">
            {/* Embedded Price Table if available */}
            {guide.priceTable && guide.priceTable.length > 0 && (
              <PriceTableComponent items={guide.priceTable} />
            )}

            {/* Embedded Comparison Table if available */}
            {guide.comparisonTable && (
              <ComparisonTableComponent table={guide.comparisonTable} />
            )}

            {/* Article Markdown/HTML Body */}
            <article className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-[#008CFF] prose-img:rounded-2xl text-sm sm:text-base leading-relaxed">
              <div
                dangerouslySetInnerHTML={{
                  __html: guide.content
                    .replace(/### (.*?)\n/g, '<h3 class="text-xl font-bold mt-8 mb-3 text-slate-900 dark:text-white">$1</h3>')
                    .replace(/## (.*?)\n/g, '<h2 class="text-2xl font-bold mt-10 mb-4 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2">$1</h2>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
                    .replace(/\n\n/g, '<p class="mb-4 text-slate-700 dark:text-slate-300"></p>'),
                }}
              />
            </article>

            {/* Embedded FAQs if available */}
            {guide.faqs && guide.faqs.length > 0 && (
              <GuideFaqAccordion faqs={guide.faqs} />
            )}

            {/* Live Product Recommendations related to this guide */}
            {relatedProducts.length > 0 && (
              <section className="my-10 p-6 rounded-3xl bg-slate-100 dark:bg-[#070d18] border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sparkles size={18} className="text-[#008CFF]" />
                      <span>In-Stock Products Mentioned in This Guide</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Available with verified warranty at NEED ELECTRO Moulvibazar showroom.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {relatedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            )}

            {/* Related Services Recommendation Links */}
            {guide.relatedServices && guide.relatedServices.length > 0 && (
              <section className="my-8 p-6 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/50 dark:from-blue-950/30 dark:to-slate-900 border border-blue-200/80 dark:border-blue-900/60 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#008CFF]" />
                  <span>Related On-Site Engineering Services</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {guide.relatedServices.map((srv, idx) => (
                    <Link
                      key={idx}
                      href={srv.href}
                      className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#008CFF] transition-all flex items-center justify-between group shadow-2xs"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#008CFF] transition-colors">
                          {srv.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {srv.description}
                        </p>
                      </div>
                      <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </main>

          {/* Right Sidebar Column (TOC + Actions) */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Table of Contents */}
            {guide.tableOfContents && guide.tableOfContents.length > 0 && (
              <div className="sticky top-20 rounded-2xl p-5 bg-white dark:bg-[#0b1320] border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                  <BookOpen size={14} className="text-[#008CFF]" />
                  <span>Table of Contents</span>
                </div>
                <nav className="space-y-1.5 text-xs">
                  {guide.tableOfContents.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block py-1 px-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-[#008CFF] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Quick Contact & Showroom Visit Widget */}
            <div className="rounded-2xl p-5 bg-slate-900 text-white space-y-3 shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                Moulvibazar Showroom
              </span>
              <h4 className="text-sm font-bold leading-snug">
                Have questions about this hardware?
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visit {BUSINESS_INFO.address.streetAddress}, Kusumbag or speak directly with our engineers.
              </p>
              <div className="pt-2 space-y-2 text-xs">
                <a
                  href={`tel:${BUSINESS_INFO.phoneClean}`}
                  className="block text-center w-full py-2 rounded-xl bg-[#008CFF] hover:bg-blue-600 text-white font-bold transition-colors shadow-sm"
                >
                  Call Hotline: {BUSINESS_INFO.phone}
                </a>
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors"
                >
                  WhatsApp Consultation
                </a>
              </div>
            </div>
          </aside>
        </div>

        {/* Bottom Related Articles Grid */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800 space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Related Guides &amp; Comparisons
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <GuideCard key={rel.id} guide={rel} />
              ))}
            </div>
          </section>
        )}
      </div>

      <CustomerFooter />
    </div>
  );
}

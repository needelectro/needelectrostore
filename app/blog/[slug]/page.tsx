import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { BUSINESS_INFO, BLOG_POSTS, generateSeoMetadata, buildArticleSchema, buildFaqSchema } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { Clock, User, Calendar, ArrowLeft, ShieldCheck, MessageCircle, Phone } from 'lucide-react';

export async function generateStaticParams() {
  return BLOG_POSTS.map(post => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = BLOG_POSTS.find(p => p.slug === params.slug);
  if (!post) {
    return generateSeoMetadata({
      title: 'Article Not Found',
      description: 'The requested guide could not be found.',
      path: `/blog/${params.slug}`,
      noIndex: true,
    });
  }

  return generateSeoMetadata({
    title: `${post.title} | NEED ELECTRO`,
    description: post.description,
    path: `/blog/${post.slug}`,
    keywords: [
      post.title,
      post.category,
      'Moulvibazar',
      'Laptop guide',
      'Tech tips Bangladesh',
    ],
  });
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = BLOG_POSTS.find(p => p.slug === params.slug);
  if (!post) {
    notFound();
  }

  const articleSchema = buildArticleSchema({
    title: post.title,
    slug: post.slug,
    description: post.description,
    datePublished: post.publishedDate,
    authorName: post.author,
  });

  const faqSchema = post.faqs.length > 0 ? buildFaqSchema(post.faqs) : null;

  const breadcrumbs = [
    { name: 'Knowledge Center', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ];

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex flex-col">
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

      {/* Article Header */}
      <article className="max-w-4xl mx-auto px-4 py-10 w-full flex-1 space-y-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft size={13} />
          <span>Back to All Guides</span>
        </Link>

        <header className="space-y-4 border-b border-slate-800 pb-8">
          <div className="flex items-center gap-2">
            <span className="bg-blue-950 text-cyan-400 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold">
              {post.category}
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">{post.readingTime}</span>
          </div>

          <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          <p className="text-sm md:text-base text-cyan-300 font-medium">
            {post.bnTitle}
          </p>

          <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
            <div className="flex items-center gap-1.5">
              <User size={14} className="text-cyan-400" />
              <span>By {post.author}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-slate-500" />
              <span>Published {post.publishedDate}</span>
            </div>
          </div>
        </header>

        {/* Executive Summary */}
        <div className="p-6 rounded-2xl bg-blue-950/20 border border-blue-800/40 text-sm text-slate-200 leading-relaxed space-y-2">
          <span className="font-bold text-cyan-300 block text-xs uppercase tracking-wider">Executive Summary</span>
          <p>{post.summary}</p>
        </div>

        {/* Article Body Sections */}
        <div className="space-y-8 text-sm text-slate-300 leading-relaxed">
          {post.sections.map((section, idx) => (
            <section key={idx} className="space-y-3">
              <h2 className="text-lg md:text-xl font-bold text-white tracking-tight border-b border-slate-800/60 pb-2">
                {section.heading}
              </h2>
              <p className="leading-relaxed text-slate-300">
                {section.content}
              </p>
            </section>
          ))}
        </div>

        {/* Article FAQs if any */}
        {post.faqs.length > 0 && (
          <div className="pt-8 border-t border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {post.faqs.map((faq, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <h3 className="text-sm font-bold text-cyan-300">{faq.question}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Showroom CTA Box */}
        <div className="mt-12 p-8 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900 border border-blue-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-base font-bold text-white">Have Questions for Our Tech Team?</h3>
            <p className="text-xs text-slate-400">
              Visit our showroom at MR Plaza, Kusumbag, Moulvibazar or consult directly with our technicians.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-blue-500/20"
            >
              <Phone size={14} />
              <span>{BUSINESS_INFO.phone}</span>
            </a>
            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20NEED%20ELECTRO%2C%20I%20read%20your%20article%20on%20${encodeURIComponent(post.title)}%20and%20have%20a%20question.`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5"
            >
              <MessageCircle size={14} />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </div>
      </article>

      <CustomerFooter />
    </div>
  );
}

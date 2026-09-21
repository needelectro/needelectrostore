import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { BUSINESS_INFO, BLOG_POSTS, generateSeoMetadata } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { BookOpen, Clock, User, ArrowRight, Sparkles } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return generateSeoMetadata({
    title: 'Technology & Electrical Knowledge Center | Blog | NEED ELECTRO',
    description: 'Expert technology guides, laptop buying checklists, CCTV security tips, and electrical safety advice written by certified professionals at NEED ELECTRO Moulvibazar.',
    path: '/blog',
    keywords: [
      'Laptop buying guide Moulvibazar',
      'Used laptop checklist Bangladesh',
      'CCTV guide Moulvibazar',
      'Electrical safety tips Bangladesh',
      'Laptop EMI guide Moulvibazar',
      'টেকনিক্যাল ব্লগ',
    ],
  });
}

export default function BlogIndexPage() {
  const breadcrumbs = [{ name: 'Knowledge Center', path: '/blog' }];

  return (
    <div className="min-h-screen bg-[#060a14] text-slate-100 flex flex-col">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <section className="py-12 px-4 border-b border-slate-800/80 bg-gradient-to-b from-blue-950/20 to-transparent">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-blue-900/40 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-semibold text-cyan-300">
            <BookOpen size={14} />
            <span>Tech Insights & Practical Guides</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            NEED ELECTRO Knowledge Center — Practical Tech & Electrical Guides
          </h1>

          <p className="text-slate-300 max-w-3xl text-sm md:text-base leading-relaxed">
            Written by our engineering and technician team in Moulvibazar. Discover practical, zero-fluff checklists to help you choose the right laptop, configure security cameras, safely maintain electrical circuits, and understand installment financing.
          </p>
        </div>
      </section>

      {/* Blog Cards Grid */}
      <section className="py-14 px-4 max-w-7xl mx-auto w-full flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map(post => (
            <article
              key={post.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-2xl overflow-hidden shadow-lg transition-all duration-200 flex flex-col justify-between group"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="bg-blue-950 text-cyan-400 border border-blue-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                    {post.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock size={13} />
                    <span>{post.readingTime}</span>
                  </div>
                </div>

                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors leading-snug">
                    {post.title}
                  </h2>
                </Link>

                <p className="text-xs text-cyan-300 font-medium">
                  {post.bnTitle}
                </p>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {post.description}
                </p>
              </div>

              <div className="p-6 pt-0 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <User size={13} className="text-slate-500" />
                  <span>{post.author}</span>
                </div>

                <Link
                  href={`/blog/${post.slug}`}
                  className="font-bold text-cyan-400 group-hover:text-cyan-300 transition-colors inline-flex items-center gap-1"
                >
                  <span>Read Guide</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <CustomerFooter />
    </div>
  );
}

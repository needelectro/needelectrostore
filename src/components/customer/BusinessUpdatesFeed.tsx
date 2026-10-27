'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Camera, Calendar, ArrowRight, Eye, Sparkles, ShoppingBag, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/src/services/languageContext';
import { slugify } from '@/lib/seoConfig';

export interface BusinessUpdateCardData {
  id: string;
  title: string;
  titleBn?: string | null;
  slug: string;
  description?: string | null;
  descriptionBn?: string | null;
  categoryName: string;
  coverImage: string;
  isPinned: boolean;
  publishedAt: string | Date;
  imagesCount?: number;
  product?: {
    name: string;
    sku: string;
    retailPrice: number;
  } | null;
}

interface BusinessUpdatesFeedProps {
  updates: BusinessUpdateCardData[];
}

export const BusinessUpdatesFeed: React.FC<BusinessUpdatesFeedProps> = ({ updates }) => {
  const { isBangla } = useLanguage();

  if (!updates || updates.length === 0) return null;

  const formatDate = (dateInput: string | Date) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(isBangla ? 'bn-BD' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <section aria-label="Business Updates and Photo Gallery" className="space-y-4">
      {/* Header with Title and "View All" Link */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EAF4FF] text-[#008CFF] border border-blue-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-[#008CFF] animate-pulse" />
            <Camera size={13} />
            <span>{isBangla ? 'লাইভ শোরুম ফটো ও বিজনেস আপডেট' : 'Live Showroom & Business Feed'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-[#002B5B] tracking-tight">
            {isBangla ? 'ফটো গ্যালারি ও সাম্প্রতিক আপডেট' : 'Photo Gallery & Business Updates'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            {isBangla
              ? 'আমাদের শোরুমের নতুন ল্যাপটপ স্টক, সফল সিসিটিভি ইনস্টলেশন, কাস্টমার ডেলিভারি এবং বিশেষ ক্যাম্পেইনের আসল ছবি।'
              : 'Real photos from our Moulvibazar showroom: fresh laptop arrivals, CCTV installations, customer deliveries, and company milestones.'}
          </p>
        </div>

        <Link
          href="/gallery"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#008CFF] hover:text-[#0070cc] self-start sm:self-auto group"
        >
          <span>{isBangla ? 'সব ছবি ও আপডেট দেখুন' : 'View All Gallery Updates'}</span>
          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Grid of Update Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {updates.slice(0, 4).map((item) => {
          const title = isBangla && item.titleBn ? item.titleBn : item.title;
          const description = isBangla && item.descriptionBn ? item.descriptionBn : item.description;

          return (
            <Link
              key={item.id}
              href="/gallery"
              className="group bg-white rounded-2xl border border-slate-200/90 hover:border-[#008CFF]/50 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
                  <Image
                    src={item.coverImage}
                    alt={title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1 z-10">
                    {item.isPinned && (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-black bg-amber-500 text-slate-950 shadow-xs flex items-center gap-1 uppercase">
                        <Sparkles size={10} />
                        <span>Pinned</span>
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#002B5B]/90 text-white backdrop-blur-xs border border-white/20 shadow-xs">
                      {item.categoryName}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-1.5">
                  <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Calendar size={11} />
                    <time dateTime={new Date(item.publishedAt).toISOString()}>
                      {formatDate(item.publishedAt)}
                    </time>
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm text-[#002B5B] group-hover:text-[#008CFF] transition-colors line-clamp-2 leading-snug">
                    {title}
                  </h3>
                  {description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom Snippet */}
              <div className="p-4 pt-0 border-t border-slate-100 mt-2">
                <div className="pt-2.5 flex items-center justify-between text-xs font-bold text-[#008CFF]">
                  <span>{isBangla ? 'ফটো গ্যালারি খুলুন' : 'Open in Gallery'}</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

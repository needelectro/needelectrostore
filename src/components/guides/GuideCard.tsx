import React from 'react';
import Link from 'next/link';
import { Clock, User, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';
import { GuideArticleData } from '@/lib/guidesData';

interface GuideCardProps {
  guide: GuideArticleData;
  featured?: boolean;
}

export const GuideCard: React.FC<GuideCardProps> = ({ guide, featured = false }) => {
  const categoryBadgeColors: Record<string, string> = {
    prices: 'bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-cyan-300 border-blue-200 dark:border-blue-900',
    comparisons: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900',
    'buying-guides': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
    faqs: 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-900',
  };

  const categoryLabels: Record<string, string> = {
    prices: 'Price Guide',
    comparisons: 'Product Comparison',
    'buying-guides': 'Buying Guide',
    faqs: 'Technical FAQ',
  };

  return (
    <article
      className={`group relative bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden hover:border-[#008CFF] dark:hover:border-cyan-500/50 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between ${
        featured ? 'ring-1 ring-[#008CFF]/20 bg-gradient-to-br from-white via-white to-blue-50/20 dark:from-[#0c1322] dark:to-blue-950/20' : ''
      }`}
    >
      <div className="p-6 sm:p-7 space-y-3.5">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              categoryBadgeColors[guide.category] || categoryBadgeColors.prices
            }`}
          >
            {categoryLabels[guide.category] || guide.category}
          </span>
          <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-xs">
            <Clock size={12} />
            <span>{guide.readingTime}</span>
          </div>
        </div>

        <Link href={`/guides/${guide.category}/${guide.slug}`} className="block">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-[#008CFF] dark:group-hover:text-cyan-400 transition-colors leading-snug">
            {guide.title}
          </h3>
        </Link>

        {guide.titleBn && (
          <p className="text-xs text-[#008CFF] dark:text-cyan-300 font-medium line-clamp-1">
            {guide.titleBn}
          </p>
        )}

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
          {guide.summary}
        </p>

        {/* Highlight badge if price guide has verified prices */}
        {guide.priceTable && guide.priceTable.length > 0 && (
          <div className="pt-1 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 size={13} />
            <span>Includes {guide.priceTable.length} verified selling prices</span>
          </div>
        )}

        {/* Highlight badge if comparison has comparison table */}
        {guide.comparisonTable && (
          <div className="pt-1 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
            <ShieldCheck size={13} />
            <span>Side-by-side spec comparison table</span>
          </div>
        )}
      </div>

      <div className="px-6 sm:px-7 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <User size={13} className="text-slate-400" />
          <span className="font-medium text-slate-700 dark:text-slate-300">{guide.author}</span>
        </div>

        <Link
          href={`/guides/${guide.category}/${guide.slug}`}
          className="inline-flex items-center gap-1 font-bold text-[#008CFF] group-hover:translate-x-0.5 transition-transform"
        >
          <span>Read Guide</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </article>
  );
};

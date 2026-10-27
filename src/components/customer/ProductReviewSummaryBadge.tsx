'use client';

import React, { useEffect, useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { useLanguage } from '@/src/services/languageContext';

interface ProductReviewSummaryBadgeProps {
  productId: string;
}

export const ProductReviewSummaryBadge: React.FC<ProductReviewSummaryBadgeProps> = ({
  productId,
}) => {
  const { isBangla, formatNumber } = useLanguage();
  const [data, setData] = useState<{
    averageRating: number;
    totalReviews: number;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/reviews?productId=${productId}&limit=1`)
      .then((r) => r.json())
      .then((res) => {
        if (isMounted && res.success && res.summary) {
          setData({
            averageRating: res.summary.averageRating,
            totalReviews: res.summary.totalReviews,
          });
        }
      })
      .catch((e) => console.error('Failed to fetch rating badge:', e));

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const scrollToReviews = (e: React.MouseEvent) => {
    e.preventDefault();
    const elem = document.getElementById('reviews');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!data) {
    return (
      <div className="h-5 w-24 bg-slate-100 rounded-md animate-pulse inline-block" />
    );
  }

  if (data.totalReviews === 0) {
    return (
      <a
        href="#reviews"
        onClick={scrollToReviews}
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-[#008CFF] transition-colors"
      >
        <div className="flex items-center text-slate-300">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star key={s} size={13} className="text-slate-300" />
          ))}
        </div>
        <span className="font-medium underline decoration-slate-300 hover:decoration-[#008CFF]">
          {isBangla ? 'প্রথম রিভিউ দিন' : 'Be the first to review'}
        </span>
      </a>
    );
  }

  return (
    <a
      href="#reviews"
      onClick={scrollToReviews}
      className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#008CFF] transition-colors group"
      title={`${data.averageRating.toFixed(1)} out of 5 based on ${data.totalReviews} reviews`}
    >
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={13}
            className={
              star <= Math.round(data.averageRating)
                ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                : 'text-slate-200'
            }
          />
        ))}
      </div>
      <span className="font-bold text-[#002B5B] group-hover:text-[#008CFF] font-mono text-[13px]">
        {data.averageRating.toFixed(1)}
      </span>
      <span className="text-slate-400 underline decoration-slate-200 group-hover:decoration-[#008CFF]">
        ({formatNumber(data.totalReviews)} {isBangla ? 'রিভিউ' : 'reviews'})
      </span>
    </a>
  );
};

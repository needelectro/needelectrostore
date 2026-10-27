'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star, ShieldCheck, ThumbsUp, MessageSquare, Camera,
  CheckCircle2, AlertTriangle, AlertCircle, Filter,
  ArrowUpDown, X, Upload, Trash2, Edit3, Flag, ChevronDown,
  Sparkles, RefreshCw, Send, Check
} from 'lucide-react';
import { useCustomerAuth } from '@/src/services/customerAuthContext';
import { useLanguage } from '@/src/services/languageContext';

interface ReviewItem {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  isVerifiedPurchase: boolean;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  helpfulCount: number;
  userHasVoted: boolean;
  isOwner: boolean;
  images: string[];
  officialResponse: {
    id: string;
    authorName: string;
    response: string;
    createdAt: string;
  } | null;
}

interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  percentages: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  verifiedCount: number;
  photosCount: number;
}

interface ProductReviewsSectionProps {
  productId: string;
  productName: string;
  productSku: string;
}

export const ProductReviewsSection: React.FC<ProductReviewsSectionProps> = ({
  productId,
  productName,
  productSku,
}) => {
  const { customer, isLoading: isAuthLoading } = useCustomerAuth();
  const { isBangla, formatNumber } = useLanguage();

  // Review list state
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [summary, setSummary] = useState<ReviewSummary>({
    averageRating: 0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    percentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    verifiedCount: 0,
    photosCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters & sorting
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [withPhotos, setWithPhotos] = useState(false);
  const [sortBy, setSortBy] = useState<string>('newest');

  // Customer eligibility & review write modal
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [eligibility, setEligibility] = useState<{
    authenticated: boolean;
    canReview: boolean;
    isVerifiedPurchase: boolean;
    orderId: string | null;
    existingReview: any | null;
  } | null>(null);

  // Write review form state
  const [formRating, setFormRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Lightbox photo preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Report modal state
  const [reportReviewId, setReportReviewId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState<string>('INAPPROPRIATE');
  const [reportDetails, setReportDetails] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Fetch reviews
  const loadReviews = useCallback(async (targetPage = 1) => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        productId,
        page: String(targetPage),
        limit: '6',
        sort: sortBy,
      });

      if (ratingFilter !== 'all') {
        queryParams.set('rating', ratingFilter);
      }
      if (verifiedOnly) {
        queryParams.set('verifiedOnly', 'true');
      }
      if (withPhotos) {
        queryParams.set('withPhotos', 'true');
      }

      const res = await fetch(`/api/reviews?${queryParams.toString()}`);
      const data = await res.json();

      if (data.success) {
        setReviews(data.reviews || []);
        if (data.summary) {
          setSummary(data.summary);
        }
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setPage(data.pagination.page || 1);
        }
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [productId, ratingFilter, verifiedOnly, withPhotos, sortBy]);

  useEffect(() => {
    loadReviews(1);
  }, [loadReviews]);

  // Check customer review eligibility
  const checkEligibility = useCallback(async () => {
    if (!customer) return;
    try {
      const res = await fetch(`/api/reviews/eligibility?productId=${productId}`);
      const data = await res.json();
      if (data.success) {
        setEligibility(data);
        if (data.existingReview) {
          setFormRating(data.existingReview.rating || 5);
          setFormTitle(data.existingReview.title || '');
          setFormComment(data.existingReview.comment || '');
          setFormImages(data.existingReview.images || []);
        }
      }
    } catch (err) {
      console.error('Failed to check eligibility:', err);
    }
  }, [customer, productId]);

  useEffect(() => {
    if (customer) {
      checkEligibility();
    }
  }, [customer, checkEligibility]);

  // Handle helpful vote toggle
  const handleToggleVote = async (reviewId: string) => {
    if (!customer) {
      alert(isBangla ? 'ভোট দিতে দয়া করে আপনার অ্যাকাউন্টে লগইন করুন।' : 'Please sign in to vote on reviews.');
      return;
    }

    try {
      const res = await fetch('/api/reviews/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? {
                  ...r,
                  userHasVoted: data.hasVoted,
                  helpfulCount: data.helpfulCount,
                }
              : r
          )
        );
      } else {
        alert(data.error || 'Failed to update vote');
      }
    } catch (err) {
      console.error('Vote error:', err);
    }
  };

  // Upload review image
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (formImages.length >= 5) {
      alert(isBangla ? 'সর্বোচ্চ ৫টি ছবি আপলোড করা যাবে।' : 'You can upload up to 5 photos.');
      return;
    }

    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      alert(isBangla ? 'ছবির সাইজ সর্বোচ্চ ৫ মেগাবাইট হতে হবে।' : 'File size must be under 5MB.');
      return;
    }

    try {
      setIsUploadingPhoto(true);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/reviews/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.imageUrl) {
        setFormImages((prev) => [...prev, data.imageUrl]);
      } else {
        alert(data.error || 'Failed to upload photo');
      }
    } catch (err) {
      console.error('Upload err:', err);
      alert('Photo upload failed. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  // Submit or edit review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (formComment.trim().length < 10) {
      setFormError(isBangla ? 'রিভিউ কমপক্ষে ১০ অক্ষরের হতে হবে।' : 'Review must be at least 10 characters long.');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          rating: formRating,
          title: formTitle.trim() || null,
          comment: formComment.trim(),
          images: formImages,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setFormSuccess(data.message || 'Review submitted successfully!');
        setTimeout(() => {
          setIsWriteModalOpen(false);
          setFormSuccess(null);
          loadReviews(1);
          checkEligibility();
        }, 1200);
      } else {
        setFormError(data.error || 'Failed to submit review');
      }
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while saving your review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Delete customer's own review
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm(isBangla ? 'আপনি কি নিশ্চিত যে আপনার রিভিউ মুছে ফেলতে চান?' : 'Are you sure you want to delete your review?')) {
      return;
    }

    try {
      const res = await fetch(`/api/reviews?reviewId=${reviewId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        loadReviews(1);
        checkEligibility();
      } else {
        alert(data.error || 'Failed to delete review');
      }
    } catch (err) {
      console.error('Delete review error:', err);
    }
  };

  // Submit report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReviewId) return;

    try {
      setSubmittingReport(true);
      const res = await fetch('/api/reviews/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId: reportReviewId,
          reason: reportReason,
          details: reportDetails.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReportSuccess(true);
        setTimeout(() => {
          setReportReviewId(null);
          setReportSuccess(false);
          setReportDetails('');
        }, 1500);
      } else {
        alert(data.error || 'Failed to report review');
      }
    } catch (err) {
      console.error('Report error:', err);
    } finally {
      setSubmittingReport(false);
    }
  };

  const renderStars = (rating: number, size = 16, interactive = false) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = interactive
            ? star <= (hoverRating || formRating)
            : star <= Math.round(rating);

          return (
            <button
              type="button"
              key={star}
              disabled={!interactive}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              onClick={() => interactive && setFormRating(star)}
              className={`${interactive ? 'cursor-pointer hover:scale-115 transition-transform p-0.5' : 'cursor-default pointer-events-none'}`}
              aria-label={`${star} Star`}
            >
              <Star
                size={size}
                className={`${
                  isFilled
                    ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                    : 'text-slate-200 dark:text-slate-700'
                }`}
              />
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <section id="reviews" className="mt-14 pt-10 border-t border-slate-200/90 text-[#002B5B]">
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#008CFF] animate-pulse" />
            <span className="text-[11px] font-black tracking-widest text-[#008CFF] uppercase">
              {isBangla ? 'সত্য ও ভেরিফাইড গ্রাহক রিভিউ' : 'Customer Feedback & Ratings'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#002B5B] tracking-tight mt-1">
            {isBangla ? 'পণ্য রিভিউ ও রেটিং' : 'Customer Reviews & Ratings'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isBangla
              ? 'NEED ELECTRO এর সকল রিভিউ জেনুইন গ্রাহকদের প্রত্যক্ষ অভিজ্ঞতার ভিত্তিতে প্রকাশিত।'
              : 'Real, authentic feedback from verified purchasers in Moulvibazar and across Bangladesh.'}
          </p>
        </div>

        {/* Write a Review Button */}
        <div>
          {customer ? (
            <button
              type="button"
              onClick={() => setIsWriteModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#0070cc] hover:from-[#007cdb] hover:to-[#005fb3] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#008CFF]/25 hover:shadow-lg hover:shadow-[#008CFF]/35 transition-all flex items-center gap-2"
            >
              <Edit3 size={16} />
              <span>
                {eligibility?.existingReview
                  ? (isBangla ? 'আমার রিভিউ এডিট করুন' : 'Edit My Review')
                  : (isBangla ? 'রিভিউ লিখুন' : 'Write a Review')}
              </span>
            </button>
          ) : (
            <Link
              href={`/customer/login?redirect=/product/${productSku.toLowerCase()}#reviews`}
              className="px-5 py-2.5 rounded-xl bg-[#002B5B] hover:bg-[#001d3d] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2"
            >
              <Edit3 size={16} />
              <span>{isBangla ? 'রিভিউ দিতে সাইন ইন করুন' : 'Sign In to Review'}</span>
            </Link>
          )}
        </div>
      </div>

      {/* 2. Rating Summary & Star Distribution Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-7 shadow-xs mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Average Rating Big Display */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-slate-100">
            <div className="text-4xl sm:text-5xl font-black text-[#002B5B] font-mono tracking-tight flex items-baseline gap-1">
              <span>{summary.averageRating > 0 ? summary.averageRating.toFixed(1) : '5.0'}</span>
              <span className="text-base text-slate-400 font-normal">/ 5</span>
            </div>

            <div className="my-2.5">
              {renderStars(summary.averageRating || 5, 20)}
            </div>

            <p className="text-xs text-slate-500 font-medium">
              {summary.totalReviews > 0 ? (
                <>
                  <strong className="text-[#002B5B] font-bold">
                    {formatNumber(summary.totalReviews)}
                  </strong>{' '}
                  {isBangla ? 'টি মোট রিভিউ' : 'verified reviews'}
                </>
              ) : (
                isBangla ? 'এখনো কোনো রিভিউ দেওয়া হয়নি' : 'No reviews recorded yet'
              )}
            </p>

            {summary.verifiedCount > 0 && (
              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10.5px] font-bold">
                <ShieldCheck size={13} className="text-emerald-600" />
                <span>
                  {Math.round((summary.verifiedCount / summary.totalReviews) * 100)}% {isBangla ? 'ভেরিফাইড ক্রেতা' : 'Verified Purchases'}
                </span>
              </div>
            )}
          </div>

          {/* Star Distribution Bars */}
          <div className="md:col-span-8 space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary.distribution[star as 1 | 2 | 3 | 4 | 5] || 0;
              const pct = summary.percentages[star as 1 | 2 | 3 | 4 | 5] || 0;
              const isSelected = ratingFilter === String(star);

              return (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRatingFilter(isSelected ? 'all' : String(star))}
                  className={`w-full flex items-center gap-3 text-xs p-1.5 rounded-lg transition-all group ${
                    isSelected ? 'bg-blue-50/80 ring-1 ring-[#008CFF]' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className="font-bold text-slate-700 w-12 flex items-center justify-end gap-1 shrink-0">
                    <span>{star}</span>
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                  </span>

                  <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden relative">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        star >= 4
                          ? 'bg-emerald-500'
                          : star === 3
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <span className="font-mono text-slate-500 w-12 text-right shrink-0">
                    {pct}%
                  </span>
                  <span className="font-mono text-slate-400 text-[10px] w-8 text-right shrink-0">
                    ({formatNumber(count)})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Filter & Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-[#F4F6F8]/80 p-3 sm:p-3.5 rounded-xl border border-slate-200/80">
        <div className="flex flex-wrap items-center gap-2">
          {/* Star filter chips */}
          <button
            type="button"
            onClick={() => setRatingFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              ratingFilter === 'all'
                ? 'bg-[#008CFF] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {isBangla ? 'সকল রিভিউ' : 'All Reviews'}
          </button>

          {[5, 4, 3, 2, 1].map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setRatingFilter(ratingFilter === String(s) ? 'all' : String(s))}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                ratingFilter === String(s)
                  ? 'bg-[#008CFF] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{s}</span>
              <Star size={11} className={ratingFilter === String(s) ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'} />
            </button>
          ))}

          {/* Verified toggle */}
          <button
            type="button"
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              verifiedOnly
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck size={13} />
            <span>{isBangla ? 'ভেরিফাইড ক্রয়' : 'Verified Only'}</span>
          </button>

          {/* Photos toggle */}
          {summary.photosCount > 0 && (
            <button
              type="button"
              onClick={() => setWithPhotos(!withPhotos)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                withPhotos
                  ? 'bg-[#002B5B] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Camera size={13} />
              <span>{isBangla ? 'ছবিসহ রিভিউ' : 'With Photos'}</span>
            </button>
          )}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <ArrowUpDown size={13} className="text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white border border-slate-200 text-xs font-bold text-[#002B5B] rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#008CFF]"
          >
            <option value="newest">{isBangla ? 'নতুন রিভিউ আগে' : 'Newest First'}</option>
            <option value="highest">{isBangla ? 'সর্বোচ্চ রেটিং' : 'Highest Rated'}</option>
            <option value="lowest">{isBangla ? 'সর্বনিম্ন রেটিং' : 'Lowest Rated'}</option>
            <option value="helpful">{isBangla ? 'সবচেয়ে সহায়ক' : 'Most Helpful'}</option>
          </select>
        </div>
      </div>

      {/* 4. Reviews List */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-[#008CFF] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">
            {isBangla ? 'রিভিউ লোড হচ্ছে...' : 'Loading verified reviews...'}
          </p>
        </div>
      ) : reviews.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 sm:p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#008CFF] flex items-center justify-center mx-auto shadow-inner">
            <MessageSquare size={26} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#002B5B]">
              {isBangla ? 'এই পণ্যে এখনো কোনো রিভিউ নেই' : 'Be the first to review this product'}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              {isBangla
                ? 'আপনি কি এই পণ্যটি ব্যবহার করেছেন? আপনার মূল্যবান মতামত অন্যান্য ক্রেতাদের সঠিক পণ্য বেছে নিতে সহায়তা করবে।'
                : 'Have you purchased or used this product? Share your experience, performance thoughts, and photos to help fellow tech shoppers in Bangladesh.'}
            </p>
          </div>
          {customer ? (
            <button
              type="button"
              onClick={() => setIsWriteModalOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all inline-flex items-center gap-2"
            >
              <Edit3 size={15} />
              <span>{isBangla ? 'প্রথম রিভিউ দিন' : 'Write First Review'}</span>
            </button>
          ) : (
            <Link
              href={`/customer/login?redirect=/product/${productSku.toLowerCase()}#reviews`}
              className="px-5 py-2.5 rounded-xl bg-[#002B5B] hover:bg-[#001d3d] text-white text-xs font-bold shadow-md transition-all inline-flex items-center gap-2"
            >
              <Edit3 size={15} />
              <span>{isBangla ? 'রিভিউ দিতে সাইন ইন করুন' : 'Sign in to write review'}</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs hover:border-[#008CFF]/50 transition-all space-y-3"
            >
              {/* Review Card Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-[#002B5B] to-[#008CFF] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                    {review.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[#002B5B]">
                        {review.authorName}
                      </span>
                      {review.isVerifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <ShieldCheck size={12} className="text-emerald-600" />
                          <span>{isBangla ? 'ভেরিফাইড ক্রেতা' : 'Verified Purchase'}</span>
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {renderStars(review.rating, 13)}
                      <span className="text-[11px] text-slate-400">
                        {new Date(review.createdAt).toLocaleDateString(isBangla ? 'bn-BD' : 'en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Owner Actions & Report */}
                <div className="flex items-center gap-1.5">
                  {review.isOwner && (
                    <>
                      <button
                        type="button"
                        onClick={() => setIsWriteModalOpen(true)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-[#008CFF] hover:bg-blue-50 transition-colors"
                        title={isBangla ? 'এডিট করুন' : 'Edit review'}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(review.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                        title={isBangla ? 'মুছে ফেলুন' : 'Delete review'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => setReportReviewId(review.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    title={isBangla ? 'রিপোর্ট করুন' : 'Report review'}
                  >
                    <Flag size={14} />
                  </button>
                </div>
              </div>

              {/* Review Title & Comment */}
              <div className="space-y-1.5 pt-1">
                {review.title && (
                  <h4 className="text-sm font-bold text-[#002B5B]">
                    {review.title}
                  </h4>
                )}
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {review.comment}
                </p>
              </div>

              {/* Uploaded Customer Photos */}
              {review.images && review.images.length > 0 && (
                <div className="flex items-center gap-2.5 overflow-x-auto pt-2 pb-1">
                  {review.images.map((imgUrl, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setPreviewImage(imgUrl)}
                      className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-slate-200 shrink-0 group hover:ring-2 hover:ring-[#008CFF] transition-all bg-slate-50"
                    >
                      <Image
                        src={imgUrl}
                        alt={`Review photo ${idx + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Official NEED ELECTRO Business Response */}
              {review.officialResponse && (
                <div className="mt-3 p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/70 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-[#002B5B] font-bold">
                    <Sparkles size={13} className="text-[#008CFF]" />
                    <span>{review.officialResponse.authorName}</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      •{' '}
                      {new Date(review.officialResponse.createdAt).toLocaleDateString(
                        isBangla ? 'bn-BD' : 'en-US',
                        { month: 'short', day: 'numeric', year: 'numeric' }
                      )}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed pl-5">
                    {review.officialResponse.response}
                  </p>
                </div>
              )}

              {/* Helpful Vote Button */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleToggleVote(review.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                    review.userHasVoted
                      ? 'bg-blue-50 text-[#008CFF] border border-blue-200'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                  }`}
                >
                  <ThumbsUp size={13} className={review.userHasVoted ? 'fill-[#008CFF]' : ''} />
                  <span>{isBangla ? 'সহায়ক' : 'Helpful'}</span>
                  <span className="font-mono text-[11px]">({formatNumber(review.helpfulCount)})</span>
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pt-4 flex items-center justify-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => loadReviews(page - 1)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold disabled:opacity-40 hover:bg-slate-50"
              >
                {isBangla ? 'আগের পাতা' : 'Previous'}
              </button>
              <span className="text-xs text-slate-500 font-mono px-2">
                {formatNumber(page)} / {formatNumber(totalPages)}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => loadReviews(page + 1)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold disabled:opacity-40 hover:bg-slate-50"
              >
                {isBangla ? 'পরের পাতা' : 'Next'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. Write a Review Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsWriteModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#008CFF]" />
                <span className="text-[11px] font-black uppercase tracking-wider text-[#008CFF]">
                  {isBangla ? 'গ্রাহক মূল্যায়ন' : 'Customer Review'}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[#002B5B] mt-1">
                {eligibility?.existingReview
                  ? (isBangla ? 'রিভিউ এডিট করুন' : 'Edit Your Review')
                  : (isBangla ? 'আপনার মতামত লিখুন' : 'Write a Product Review')}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{productName}</p>

              {eligibility?.isVerifiedPurchase && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  <ShieldCheck size={13} className="text-emerald-600" />
                  <span>{isBangla ? 'ভেরিফাইড ক্রয় অর্ডার সনাক্ত হয়েছে' : 'Verified Purchase Order Confirmed'}</span>
                </div>
              )}
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} className="shrink-0" />
                <span>{formSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Rating Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isBangla ? 'আপনার রেটিং *' : 'Overall Rating *'}
                </label>
                <div className="flex items-center gap-3">
                  {renderStars(formRating, 28, true)}
                  <span className="text-xs font-bold text-[#008CFF] font-mono">
                    {hoverRating || formRating} / 5
                  </span>
                </div>
              </div>

              {/* Review Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isBangla ? 'রিভিউ শিরোনাম (ঐচ্ছিক)' : 'Review Headline (Optional)'}
                </label>
                <input
                  type="text"
                  maxLength={100}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={isBangla ? 'সংক্ষেপে পণ্যের মূল সুবিধা লিখুন...' : 'e.g., Best laptop for programming in Moulvibazar!'}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 bg-[#F4F6F8]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                />
              </div>

              {/* Detailed Comment */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isBangla ? 'বিস্তারিত পর্যালোচনা *' : 'Detailed Review *'}
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {formComment.length} / 2000
                  </span>
                </div>
                <textarea
                  rows={4}
                  required
                  minLength={10}
                  maxLength={2000}
                  value={formComment}
                  onChange={(e) => setFormComment(e.target.value)}
                  placeholder={
                    isBangla
                      ? 'পণ্যের গুণমান, ব্যাটারি ব্যাকআপ, বিল্ড কোয়ালিটি এবং ডেলিভারির অভিজ্ঞতা বিস্তারিত লিখুন...'
                      : 'Tell other customers about performance, build quality, battery life, packaging, and store support...'
                  }
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 bg-[#F4F6F8]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                />
              </div>

              {/* Photo Uploads */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isBangla ? 'পণ্যের বাস্তব ছবি (ঐচ্ছিক, সর্বোচ্চ ৫টি)' : 'Upload Real Product Photos (Optional, max 5)'}
                </label>

                <div className="flex flex-wrap items-center gap-2.5">
                  {formImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 group">
                      <Image src={imgUrl} alt="Uploaded preview" fill sizes="64px" className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormImages(formImages.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-rose-600 text-white rounded-full p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}

                  {formImages.length < 5 && (
                    <label className={`w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-[#008CFF] flex flex-col items-center justify-center text-slate-400 hover:text-[#008CFF] cursor-pointer transition-colors bg-slate-50 ${isUploadingPhoto ? 'opacity-50 pointer-events-none' : ''}`}>
                      {isUploadingPhoto ? (
                        <div className="w-4 h-4 border-2 border-[#008CFF] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Camera size={18} />
                          <span className="text-[9px] font-bold mt-1">+ Photo</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsWriteModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  {isBangla ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submittingReview || formComment.trim().length < 10}
                  className="px-6 py-2.5 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {submittingReview ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{isBangla ? 'জমা হচ্ছে...' : 'Submitting...'}</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>{isBangla ? 'রিভিউ প্রকাশ করুন' : 'Publish Review'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Lightbox Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] w-full h-[70vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={previewImage}
              alt="Review Full Photo"
              fill
              sizes="100vw"
              className="object-contain"
            />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 bg-black/60 hover:bg-black/90 text-white rounded-full p-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* 7. Report Review Modal */}
      {reportReviewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl relative">
            <button
              type="button"
              onClick={() => setReportReviewId(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-rose-600 mb-2">
              <AlertTriangle size={18} />
              <h3 className="text-base font-bold text-[#002B5B]">
                {isBangla ? 'রিভিউ রিপোর্ট করুন' : 'Report Inappropriate Review'}
              </h3>
            </div>

            {reportSuccess ? (
              <div className="py-6 text-center text-xs text-emerald-700 font-bold space-y-2">
                <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
                <p>{isBangla ? 'আপনার রিপোর্ট গ্রহণ করা হয়েছে।' : 'Report received. Our moderation team will review this.'}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReport} className="space-y-3.5">
                <p className="text-xs text-slate-500">
                  {isBangla
                    ? 'এই রিভিউটি কেন নীতিবিরুদ্ধ বা আপত্তিকর মনে হচ্ছে নির্বাচন করুন:'
                    : 'Select the reason why this review violates community standards:'}
                </p>

                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-[#008CFF]"
                >
                  <option value="INAPPROPRIATE">{isBangla ? 'অশালীন বা বিভ্রান্তিকর তথ্য' : 'Inappropriate or Misleading'}</option>
                  <option value="SPAM">{isBangla ? 'স্প্যাম বা বিজ্ঞাপন' : 'Spam or Promotional'}</option>
                  <option value="FAKE">{isBangla ? 'ভুয়া রিভিউ বা অন্য পণ্যের' : 'Fake Review / Wrong Product'}</option>
                  <option value="OFFENSIVE">{isBangla ? 'আক্রমণাত্মক ভাষা' : 'Offensive Language'}</option>
                  <option value="OTHER">{isBangla ? 'অন্যান্য কারণ' : 'Other'}</option>
                </select>

                <textarea
                  rows={3}
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder={isBangla ? 'অতিরিক্ত বিবরণ লিখুন (ঐচ্ছিক)...' : 'Additional details (optional)...'}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#008CFF]"
                />

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setReportReviewId(null)}
                    className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    {isBangla ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all disabled:opacity-50"
                  >
                    {submittingReport ? (isBangla ? 'জমা হচ্ছে...' : 'Submitting...') : (isBangla ? 'রিপোর্ট পাঠান' : 'Submit Report')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

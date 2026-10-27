'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star, MessageSquare, ShieldCheck, CheckCircle2, Clock,
  AlertCircle, AlertTriangle, Trash2, Edit3, ExternalLink,
  ChevronRight, ArrowRight, Package, Sparkles, X, Camera, Send
} from 'lucide-react';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';
import { Breadcrumb } from '@/src/components/customer/Breadcrumb';
import { useCustomerAuth } from '@/src/services/customerAuthContext';
import { useLanguage } from '@/src/services/languageContext';

interface CustomerReview {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  productCategory: string;
  productBrand: string;
  productImageUrl: string | null;
  productSlug: string;
  rating: number;
  title: string | null;
  comment: string;
  status: 'PUBLISHED' | 'PENDING' | 'REJECTED' | 'HIDDEN';
  isVerifiedPurchase: boolean;
  orderId: string | null;
  helpfulCount: number;
  reportCount: number;
  moderationNotes: string | null;
  images: string[];
  officialResponses: Array<{
    id: string;
    authorName: string;
    response: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface PendingProduct {
  productId: string;
  name: string;
  sku: string;
  imageUrl: string | null;
  price: number;
  orderNumber: string;
  deliveredAt: string;
  slug: string;
}

export default function CustomerReviewsPage() {
  const router = useRouter();
  const { customer, isLoading } = useCustomerAuth();
  const { isBangla, formatNumber } = useLanguage();

  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [pendingProducts, setPendingProducts] = useState<PendingProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'pending' | 'rejected'>('all');

  // Edit review modal state
  const [editingReview, setEditingReview] = useState<CustomerReview | null>(null);
  const [editRating, setEditRating] = useState<number>(5);
  const [editHoverRating, setEditHoverRating] = useState<number>(0);
  const [editTitle, setEditTitle] = useState('');
  const [editComment, setEditComment] = useState('');
  const [editImages, setEditImages] = useState<string[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/customer/reviews');
      const json = await res.json();
      if (json.success && json.data) {
        setReviews(json.data.reviews || []);
        setPendingProducts(json.data.pendingReviewProducts || []);
      }
    } catch (err) {
      console.error('Fetch reviews error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !customer) {
      router.push('/customer/login?redirect=/customer/reviews');
      return;
    }
    if (customer) {
      fetchReviews();
    }
  }, [customer, isLoading, router, fetchReviews]);

  // Open edit modal
  const handleOpenEdit = (review: CustomerReview) => {
    setEditingReview(review);
    setEditRating(review.rating);
    setEditTitle(review.title || '');
    setEditComment(review.comment);
    setEditImages(review.images || []);
    setEditError(null);
    setEditSuccess(null);
  };

  // Submit edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReview) return;
    setEditError(null);
    setEditSuccess(null);

    if (editComment.trim().length < 10) {
      setEditError(isBangla ? 'রিভিউ কমপক্ষে ১০ অক্ষরের হতে হবে।' : 'Review must be at least 10 characters long.');
      return;
    }

    try {
      setSavingEdit(true);
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: editingReview.productId,
          rating: editRating,
          title: editTitle.trim() || null,
          comment: editComment.trim(),
          images: editImages,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEditSuccess(isBangla ? 'রিভিউ সফলভাবে আপডেট হয়েছে!' : 'Review updated successfully!');
        setTimeout(() => {
          setEditingReview(null);
          fetchReviews();
        }, 1000);
      } else {
        setEditError(data.error || 'Failed to update review');
      }
    } catch (err: any) {
      setEditError(err.message || 'An error occurred');
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete review
  const handleDelete = async (reviewId: string) => {
    if (!confirm(isBangla ? 'আপনি কি নিশ্চিত যে আপনার রিভিউ মুছে ফেলতে চান?' : 'Are you sure you want to delete this review?')) {
      return;
    }
    try {
      const res = await fetch(`/api/reviews?reviewId=${reviewId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchReviews();
      } else {
        alert(data.error || 'Failed to delete review');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  if (isLoading || !customer) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] text-[#002B5B] flex flex-col">
        <CustomerHeader />
        <main className="flex-1 flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-[#008CFF] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading reviews...</p>
          </div>
        </main>
        <CustomerFooter />
      </div>
    );
  }

  const breadcrumbs = [
    { name: isBangla ? 'হোম' : 'Home', path: '/' },
    { name: isBangla ? 'ড্যাশবোর্ড' : 'Customer Dashboard', path: '/customer/dashboard' },
    { name: isBangla ? 'আমার রিভিউসমূহ' : 'My Reviews', path: '/customer/reviews' },
  ];

  const filteredReviews = reviews.filter((r) => {
    if (activeTab === 'published') return r.status === 'PUBLISHED';
    if (activeTab === 'pending') return r.status === 'PENDING';
    if (activeTab === 'rejected') return r.status === 'REJECTED' || r.status === 'HIDDEN';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} className="text-emerald-600" />
            <span>{isBangla ? 'প্রকাশিত' : 'Published'}</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} className="text-amber-600" />
            <span>{isBangla ? 'পর্যালোচনাধীন' : 'Pending Moderation'}</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle size={12} className="text-rose-600" />
            <span>{isBangla ? 'বাতিল' : 'Rejected'}</span>
          </span>
        );
      case 'HIDDEN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <span>{isBangla ? 'লুকানো' : 'Hidden'}</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#002B5B] flex flex-col font-sans">
      <CustomerHeader />
      <Breadcrumb items={breadcrumbs} />

      <main className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[2000px] 4xl:max-w-[2400px] mx-auto w-full px-3 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 space-y-6 sm:space-y-8">
        {/* 1. Header Banner */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200 bg-gradient-to-r from-[#002B5B] via-[#003d7a] to-[#081621] text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-[#008CFF] to-sky-400 text-white flex items-center justify-center shadow-lg shadow-[#008CFF]/30 shrink-0 border-2 border-white/20">
              <Star size={28} className="fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-[11px] font-bold tracking-widest text-sky-300 uppercase">
                  {isBangla ? 'গ্রাহক কন্ট্রোল' : 'Feedback Hub'}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-0.5">
                {isBangla ? 'আমার পণ্য রিভিউ ও রেটিং' : 'My Product Reviews & Ratings'}
              </h1>
              <p className="text-xs text-sky-100/80 mt-1">
                {isBangla
                  ? 'আপনার দেওয়া সকল মতামত ও মডারেশন স্ট্যাটাস এখানে দেখতে এবং সম্পাদনা করতে পারবেন।'
                  : 'Manage and track the moderation status of your verified feedback.'}
              </p>
            </div>
          </div>

          <Link
            href="/customer/dashboard"
            className="text-xs font-bold px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 transition-all text-white shrink-0"
          >
            ← {isBangla ? 'ড্যাশবোর্ডে ফিরুন' : 'Back to Dashboard'}
          </Link>
        </div>

        {/* 2. Prompt Banner for Delivered Items Awaiting Review */}
        {pendingProducts.length > 0 && (
          <div className="bg-gradient-to-r from-blue-500/10 via-sky-500/10 to-emerald-500/10 border border-[#008CFF]/30 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3.5">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-[#008CFF]" />
              <h2 className="text-sm sm:text-base font-bold text-[#002B5B]">
                {isBangla ? 'রিভিউ প্রদানের জন্য অপেক্ষমাণ পণ্যসমূহ' : 'Awaiting Your Review — Delivered Products'}
              </h2>
            </div>
            <p className="text-xs text-slate-600">
              {isBangla
                ? 'আপনার সফলভাবে ডেলিভারি হওয়া পণ্যে রিভিউ দিলে তা ভেরিফাইড ক্রেতা ব্যাজ সহ সরাসরি প্রদর্শিত হবে।'
                : 'Share your genuine experience with these recently delivered items to receive the Verified Purchase badge.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {pendingProducts.map((p, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 relative shrink-0 overflow-hidden flex items-center justify-center">
                      <Image
                        src={p.imageUrl || '/logo-icon.png'}
                        alt={p.name}
                        fill
                        sizes="48px"
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#002B5B] truncate group-hover:text-[#008CFF] transition-colors">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        SKU: {p.sku} • Ord: {p.orderNumber}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/product/${p.slug}#reviews`}
                    className="px-3 py-1.5 rounded-lg bg-[#008CFF] hover:bg-[#0070cc] text-white text-[11px] font-bold shrink-0 transition-all flex items-center gap-1 shadow-xs"
                  >
                    <span>{isBangla ? 'রিভিউ দিন' : 'Review'}</span>
                    <ArrowRight size={11} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Filter Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
          {[
            { id: 'all', label: isBangla ? 'সকল রিভিউ' : 'All Reviews', count: reviews.length },
            { id: 'published', label: isBangla ? 'প্রকাশিত' : 'Published', count: reviews.filter((r) => r.status === 'PUBLISHED').length },
            { id: 'pending', label: isBangla ? 'পর্যালোচনাধীন' : 'Pending', count: reviews.filter((r) => r.status === 'PENDING').length },
            { id: 'rejected', label: isBangla ? 'বাতিল' : 'Rejected', count: reviews.filter((r) => r.status === 'REJECTED' || r.status === 'HIDDEN').length },
          ].map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#008CFF] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                {formatNumber(tab.count)}
              </span>
            </button>
          ))}
        </div>

        {/* 4. Reviews List */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-[#008CFF] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading your reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#008CFF] flex items-center justify-center mx-auto">
              <MessageSquare size={22} />
            </div>
            <h3 className="text-sm font-bold text-[#002B5B]">
              {isBangla ? 'এই বিভাগে কোনো রিভিউ পাওয়া যায়নি' : 'No reviews in this category'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {isBangla
                ? 'আপনার কেনা পণ্যগুলোতে মতামত জানাতে অনলাইন স্টোরে প্রবেশ করুন।'
                : 'Browse our computer and electronics store to submit reviews on products you own.'}
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#008CFF] text-white text-xs font-bold hover:bg-[#0070cc] transition-all shadow-xs"
            >
              <span>{isBangla ? 'শপে যান' : 'Browse Store'}</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs space-y-3"
              >
                {/* Product row & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 relative shrink-0 overflow-hidden flex items-center justify-center">
                      <Image
                        src={r.productImageUrl || '/logo-icon.png'}
                        alt={r.productName}
                        fill
                        sizes="48px"
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/product/${r.productSlug}`}
                        className="text-sm font-bold text-[#002B5B] hover:text-[#008CFF] transition-colors truncate block"
                      >
                        {r.productName}
                      </Link>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                        <span>SKU: {r.productSku}</span>
                        <span>•</span>
                        <span>{r.productCategory}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {getStatusBadge(r.status)}
                    {r.isVerifiedPurchase && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck size={12} className="text-emerald-600" />
                        <span>{isBangla ? 'ভেরিফাইড' : 'Verified Purchase'}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating & Submission Date */}
                <div className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          className={
                            star <= r.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }
                        />
                      ))}
                    </div>
                    <span className="font-bold text-[#002B5B] font-mono">{r.rating}/5</span>
                  </div>

                  <span className="text-[11px] text-slate-400">
                    {new Date(r.createdAt).toLocaleDateString(isBangla ? 'bn-BD' : 'en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {/* Title & Comment */}
                <div className="space-y-1">
                  {r.title && <h4 className="text-xs sm:text-sm font-bold text-[#002B5B]">{r.title}</h4>}
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {r.comment}
                  </p>
                </div>

                {/* Images */}
                {r.images && r.images.length > 0 && (
                  <div className="flex items-center gap-2 pt-1">
                    {r.images.map((imgUrl, i) => (
                      <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                        <Image src={imgUrl} alt="Review attachment" fill sizes="56px" className="object-cover" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Official Response */}
                {r.officialResponses && r.officialResponses.length > 0 && (
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-[#002B5B] font-bold">
                      <Sparkles size={12} className="text-[#008CFF]" />
                      <span>{r.officialResponses[0].authorName}</span>
                    </div>
                    <p className="text-slate-700 pl-4">{r.officialResponses[0].response}</p>
                  </div>
                )}

                {/* Moderation Notes if rejected/pending */}
                {r.moderationNotes && (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800">
                    <strong>Moderator Note:</strong> {r.moderationNotes}
                  </div>
                )}

                {/* Actions Row */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-slate-400 text-[11px]">
                    {r.helpfulCount > 0 && (
                      <span>
                        {formatNumber(r.helpfulCount)} {isBangla ? 'জন সহায়ক হিসেবে চিহ্নিত করেছেন' : 'customers found this helpful'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(r)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#008CFF] hover:bg-blue-50 border border-blue-200 transition-colors flex items-center gap-1"
                    >
                      <Edit3 size={13} />
                      <span>{isBangla ? 'এডিট করুন' : 'Edit'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={13} />
                      <span>{isBangla ? 'মুছুন' : 'Delete'}</span>
                    </button>
                    <Link
                      href={`/product/${r.productSlug}#reviews`}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-1"
                    >
                      <ExternalLink size={13} />
                      <span>{isBangla ? 'পণ্য দেখুন' : 'View on Store'}</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. Edit Modal */}
        {editingReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setEditingReview(null)}
                className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={20} />
              </button>

              <div className="mb-4">
                <h3 className="text-lg font-black text-[#002B5B]">
                  {isBangla ? 'রিভিউ সম্পাদনা করুন' : 'Edit Review'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{editingReview.productName}</p>
              </div>

              {editError && (
                <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                  {editError}
                </div>
              )}
              {editSuccess && (
                <div className="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs">
                  {editSuccess}
                </div>
              )}

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBangla ? 'রেটিং *' : 'Rating *'}
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onMouseEnter={() => setEditHoverRating(s)}
                        onMouseLeave={() => setEditHoverRating(0)}
                        onClick={() => setEditRating(s)}
                        className="p-1 hover:scale-115 transition-transform"
                      >
                        <Star
                          size={24}
                          className={
                            s <= (editHoverRating || editRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200'
                          }
                        />
                      </button>
                    ))}
                    <span className="text-xs font-mono font-bold text-[#008CFF] ml-2">
                      {editHoverRating || editRating} / 5
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBangla ? 'শিরোনাম (ঐচ্ছিক)' : 'Headline (Optional)'}
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 bg-[#F4F6F8]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {isBangla ? 'বিস্তারিত পর্যালোচনা *' : 'Review Text *'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    minLength={10}
                    maxLength={2000}
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 bg-[#F4F6F8]/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingReview(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    {isBangla ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit || editComment.trim().length < 10}
                    className="px-5 py-2 rounded-xl bg-[#008CFF] text-white text-xs font-bold hover:bg-[#0070cc] transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {savingEdit ? (
                      <span>{isBangla ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>{isBangla ? 'আপডেট করুন' : 'Update Review'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <CustomerFooter />
    </div>
  );
}

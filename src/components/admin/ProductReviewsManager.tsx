'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Star, ShieldCheck, CheckCircle2, Clock, AlertTriangle,
  AlertCircle, MessageSquare, Search, Filter, RefreshCw,
  ExternalLink, Eye, Trash2, Edit3, Flag, ThumbsUp, X,
  Check, Send, Sparkles, User, ShoppingBag, ArrowUpDown
} from 'lucide-react';
import { useERP } from '@/src/services/erpStore';
import { useLanguage } from '@/src/services/languageContext';

interface AdminReviewItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    sku: string;
    category: string;
    brand: string;
    imageUrl: string | null;
    retailPrice: number;
  };
  customer: {
    id: string;
    customerId: string;
    name: string;
    phone: string;
    email: string | null;
  };
  customerName: string;
  rating: number;
  title: string | null;
  comment: string;
  status: 'PUBLISHED' | 'PENDING' | 'REJECTED' | 'HIDDEN';
  isVerifiedPurchase: boolean;
  orderId: string | null;
  helpfulCount: number;
  reportCount: number;
  moderationNotes: string | null;
  moderatedById: string | null;
  moderatedAt: string | null;
  createdAt: string;
  updatedAt: string;
  images: string[];
  reports: Array<{
    id: string;
    reason: string;
    details: string | null;
    createdAt: string;
    status: string;
  }>;
  responses: Array<{
    id: string;
    authorName: string;
    response: string;
    createdAt: string;
  }>;
}

interface ReviewKPIs {
  totalReviews: number;
  averageRating: number;
  pendingModeration: number;
  published: number;
  flaggedReports: number;
}

interface ProductReviewsManagerProps {
  onNavigate?: (module: string) => void;
}

export const ProductReviewsManager: React.FC<ProductReviewsManagerProps> = ({
  onNavigate,
}) => {
  const { currentUser, hasPermission } = useERP();
  const { isBangla, formatNumber } = useLanguage();

  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [kpis, setKpis] = useState<ReviewKPIs>({
    totalReviews: 0,
    averageRating: 0,
    pendingModeration: 0,
    published: 0,
    flaggedReports: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [reportedOnly, setReportedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Active review for moderation modal
  const [selectedReview, setSelectedReview] = useState<AdminReviewItem | null>(null);
  const [moderationNote, setModerationNote] = useState('');
  const [officialResponseText, setOfficialResponseText] = useState('');
  const [officialAuthorName, setOfficialAuthorName] = useState('NEED ELECTRO Official Support');
  const [actionLoading, setActionLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fetchReviews = useCallback(async (targetPage = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(targetPage),
        limit: '15',
        status: statusFilter,
      });

      if (searchTerm) params.set('search', searchTerm);
      if (ratingFilter !== 'ALL') params.set('rating', ratingFilter);
      if (verifiedOnly) params.set('verifiedOnly', 'true');
      if (reportedOnly) params.set('reportedOnly', 'true');

      const res = await fetch(`/api/admin/reviews?${params.toString()}`);
      const json = await res.json();

      if (json.success && json.data) {
        setReviews(json.data.reviews || []);
        if (json.data.kpis) setKpis(json.data.kpis);
        if (json.data.pagination) {
          setTotalPages(json.data.pagination.totalPages || 1);
          setPage(json.data.pagination.page || 1);
        }
      }
    } catch (err) {
      console.error('Admin reviews fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, ratingFilter, verifiedOnly, reportedOnly]);

  useEffect(() => {
    fetchReviews(1);
  }, [fetchReviews]);

  // Update status (PUBLISHED, REJECTED, HIDDEN)
  const handleUpdateStatus = async (reviewId: string, newStatus: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          moderationNotes: moderationNote.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedReview(null);
        setModerationNote('');
        fetchReviews(page);
      } else {
        alert(data.error || 'Failed to update review status');
      }
    } catch (err) {
      console.error('Status update error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Submit official reply
  const handleSubmitResponse = async (reviewId: string) => {
    if (!officialResponseText.trim()) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response: officialResponseText.trim(),
          authorName: officialAuthorName.trim() || 'NEED ELECTRO Official Support',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOfficialResponseText('');
        fetchReviews(page);
        if (selectedReview) {
          setSelectedReview({
            ...selectedReview,
            responses: [data.response],
          });
        }
      } else {
        alert(data.error || 'Failed to post official response');
      }
    } catch (err) {
      console.error('Response error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete review
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to permanently delete this review? This action will be recorded in the audit log.')) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setSelectedReview(null);
        fetchReviews(page);
      } else {
        alert(data.error || 'Failed to delete review');
      }
    } catch (err) {
      console.error('Delete review error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 size={12} />
            <span>Published</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse">
            <Clock size={12} />
            <span>Pending Moderation</span>
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <AlertTriangle size={12} />
            <span>Rejected</span>
          </span>
        );
      case 'HIDDEN':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <span>Hidden</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl 2xl:max-w-[1600px] mx-auto w-full">
      {/* 1. Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#008CFF] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#008CFF]">
              E-Commerce CRM Subsystem
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
            Product Reviews & Customer Ratings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Moderate genuine customer feedback, respond officially as NEED ELECTRO, verify purchases, and safeguard store credibility.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchReviews(page)}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-all flex items-center gap-2 self-start"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. KPI Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>Total Reviews</span>
            <MessageSquare size={16} className="text-[#008CFF]" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">
            {formatNumber(kpis.totalReviews)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>Average Rating</span>
            <Star size={16} className="fill-amber-400 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1 text-2xl font-black text-amber-500 font-mono">
            <span>{kpis.averageRating.toFixed(2)}</span>
            <span className="text-xs text-slate-400 font-normal">/ 5.0</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>Published</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-500 font-mono">
            {formatNumber(kpis.published)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>Pending Review</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-500 font-mono">
            {formatNumber(kpis.pendingModeration)}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>Flagged / Reports</span>
            <Flag size={16} className="text-rose-500" />
          </div>
          <p className="text-2xl font-black text-rose-500 font-mono">
            {formatNumber(kpis.flaggedReports)}
          </p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product, SKU, customer name, review text..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#008CFF]"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Moderation</option>
            <option value="PUBLISHED">Published</option>
            <option value="REJECTED">Rejected</option>
            <option value="HIDDEN">Hidden</option>
          </select>

          {/* Rating filter */}
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none"
          >
            <option value="ALL">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded text-[#008CFF] focus:ring-0"
            />
            <span>Verified Purchases</span>
          </label>

          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={reportedOnly}
              onChange={(e) => setReportedOnly(e.target.checked)}
              className="rounded text-rose-500 focus:ring-0"
            />
            <span>Reported Only</span>
          </label>
        </div>
      </div>

      {/* 4. Reviews Moderation Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-[#008CFF] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading reviews catalog...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <MessageSquare size={32} className="mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No reviews found matching the filters.</p>
            <p className="text-xs text-slate-400">Try adjusting your search criteria or resetting filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[10.5px]">
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Rating & Review</th>
                  <th className="py-3 px-4">Photos</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Engagement</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {reviews.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Product */}
                    <td className="py-3 px-4 max-w-[220px]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 relative shrink-0 overflow-hidden flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          <Image
                            src={r.product.imageUrl || '/logo-icon.png'}
                            alt={r.product.name}
                            fill
                            sizes="40px"
                            className="object-contain p-0.5"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-white truncate" title={r.product.name}>
                            {r.product.name}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {r.product.sku}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4 max-w-[160px]">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white truncate">
                          {r.customerName}
                        </p>
                        <p className="text-[10.5px] text-slate-400 font-mono">
                          {r.customer.phone}
                        </p>
                        {r.isVerifiedPurchase ? (
                          <span className="inline-flex items-center gap-1 text-[9.5px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.2 rounded mt-0.5 border border-emerald-200 dark:border-emerald-800">
                            <ShieldCheck size={10} />
                            <span>Verified Buyer</span>
                          </span>
                        ) : (
                          <span className="text-[9.5px] text-slate-400">Guest / Standard</span>
                        )}
                      </div>
                    </td>

                    {/* Rating & Review */}
                    <td className="py-3 px-4 max-w-[320px]">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={12}
                                className={s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}
                              />
                            ))}
                          </div>
                          <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-[11px]">
                            {r.rating}/5
                          </span>
                          <span className="text-[10px] text-slate-400">
                            • {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {r.title && (
                          <p className="font-bold text-slate-900 dark:text-white line-clamp-1">
                            {r.title}
                          </p>
                        )}
                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2 text-[11px] leading-relaxed">
                          {r.comment}
                        </p>
                        {r.responses && r.responses.length > 0 && (
                          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-[#008CFF] bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 mt-1">
                            <Sparkles size={10} />
                            <span>Replied: {r.responses[0].authorName}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Photos */}
                    <td className="py-3 px-4">
                      {r.images && r.images.length > 0 ? (
                        <div className="flex items-center gap-1">
                          {r.images.map((imgUrl, i) => (
                            <button
                              type="button"
                              key={i}
                              onClick={() => setPreviewImage(imgUrl)}
                              className="relative w-8 h-8 rounded border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0 hover:ring-2 hover:ring-[#008CFF]"
                            >
                              <Image src={imgUrl} alt="Review thumb" fill sizes="32px" className="object-cover" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {getStatusBadge(r.status)}
                        {r.reportCount > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20 block w-max">
                            <Flag size={10} />
                            <span>{r.reportCount} Report(s)</span>
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Engagement */}
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <ThumbsUp size={12} className="text-[#008CFF]" />
                        <span>{r.helpfulCount} helpful</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReview(r);
                          setModerationNote(r.moderationNotes || '');
                          setOfficialResponseText(r.responses?.[0]?.response || '');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#008CFF] hover:bg-[#0070cc] text-white text-[11px] font-bold shadow-xs transition-all inline-flex items-center gap-1"
                      >
                        <Edit3 size={12} />
                        <span>Moderate</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => fetchReviews(page - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => fetchReviews(page + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Moderation Drawer / Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5">
            <button
              type="button"
              onClick={() => setSelectedReview(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#008CFF]" />
                <span className="text-xs font-bold text-[#008CFF] uppercase tracking-wider">
                  Review Moderation Desk
                </span>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                Moderate Customer Review
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review ID: <span className="font-mono">{selectedReview.id}</span>
              </p>
            </div>

            {/* Product & Customer Details Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Product</span>
                <p className="font-bold text-slate-900 dark:text-white">{selectedReview.product.name}</p>
                <p className="font-mono text-slate-500">SKU: {selectedReview.product.sku}</p>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Customer</span>
                <p className="font-bold text-slate-900 dark:text-white">{selectedReview.customerName}</p>
                <p className="font-mono text-slate-500">{selectedReview.customer.phone}</p>
                {selectedReview.isVerifiedPurchase && (
                  <span className="text-emerald-600 font-bold">✓ Verified Purchase</span>
                )}
              </div>
            </div>

            {/* Review Rating & Content */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={14}
                        className={s <= selectedReview.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}
                      />
                    ))}
                  </div>
                  <span className="font-bold font-mono text-slate-900 dark:text-white text-sm">
                    {selectedReview.rating} / 5 Stars
                  </span>
                </div>
                {getStatusBadge(selectedReview.status)}
              </div>

              {selectedReview.title && (
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {selectedReview.title}
                </h4>
              )}
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
                {selectedReview.comment}
              </p>

              {/* Photos */}
              {selectedReview.images && selectedReview.images.length > 0 && (
                <div className="flex items-center gap-2 pt-2">
                  {selectedReview.images.map((imgUrl, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setPreviewImage(imgUrl)}
                      className="relative w-14 h-14 rounded-lg overflow-hidden border border-slate-300 hover:ring-2 hover:ring-[#008CFF]"
                    >
                      <Image src={imgUrl} alt="Review attachment" fill sizes="56px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Reports if any */}
            {selectedReview.reports && selectedReview.reports.length > 0 && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-rose-600">
                  <AlertTriangle size={15} />
                  <span>Abuse Reports ({selectedReview.reports.length})</span>
                </div>
                {selectedReview.reports.map((rep, idx) => (
                  <div key={idx} className="text-slate-600 dark:text-slate-400 pl-4 border-l-2 border-rose-400">
                    <p className="font-bold text-rose-700 dark:text-rose-400">Reason: {rep.reason}</p>
                    {rep.details && <p>{rep.details}</p>}
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(rep.createdAt).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Moderation Notes Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Moderation Reason / Internal Audit Notes
              </label>
              <input
                type="text"
                value={moderationNote}
                onChange={(e) => setModerationNote(e.target.value)}
                placeholder="e.g., Verified authentic purchase receipt; passed quality check."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#008CFF]"
              />
            </div>

            {/* Status Change Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Set Moderation Status
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedReview.id, 'PUBLISHED')}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <CheckCircle2 size={14} />
                  <span>Approve & Publish</span>
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedReview.id, 'REJECTED')}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <AlertTriangle size={14} />
                  <span>Reject</span>
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleUpdateStatus(selectedReview.id, 'HIDDEN')}
                  className="px-4 py-2 rounded-xl bg-slate-600 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <span>Hide from SERP/Store</span>
                </button>

                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleDeleteReview(selectedReview.id)}
                  className="px-3.5 py-2 rounded-xl text-rose-500 hover:bg-rose-500/10 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5 ml-auto"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            {/* Official Response Section */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-[#008CFF]" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Official Public Business Reply
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                This reply will be published visibly below the customer review on the live storefront.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={officialAuthorName}
                  onChange={(e) => setOfficialAuthorName(e.target.value)}
                  placeholder="Author label (e.g. NEED ELECTRO Official Support)"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <textarea
                rows={3}
                value={officialResponseText}
                onChange={(e) => setOfficialResponseText(e.target.value)}
                placeholder="Write official response thanking the customer or addressing their questions..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#008CFF]"
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={actionLoading || !officialResponseText.trim()}
                  onClick={() => handleSubmitResponse(selectedReview.id)}
                  className="px-5 py-2 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  <Send size={13} />
                  <span>Post Official Response</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Preview */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl w-full h-[60vh]" onClick={(e) => e.stopPropagation()}>
            <Image src={previewImage} alt="Attachment" fill sizes="100vw" className="object-contain" />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-2"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

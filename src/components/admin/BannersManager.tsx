'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon, Plus, Edit2, Trash2, CheckCircle2,
  XCircle, ExternalLink, RefreshCw, Eye, ArrowUpDown, Sparkles,
  AlertCircle, Upload, Calendar, Link2, Monitor, Smartphone,
  Layers, Clock, ToggleLeft, ToggleRight, X, ArrowRight, ShieldCheck
} from 'lucide-react';
import { api } from '@/src/services/api';

export interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  imageUrl: string;
  mobileImageUrl?: string | null;
  targetUrl?: string | null;
  buttonText?: string | null;
  sortOrder: number;
  isActive: boolean;
  startDate?: string | null;
  endDate?: string | null;
  placement?: string;
  createdAt?: string;
  campaignStatus?: 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'DISABLED';
}

const COMMON_DESTINATIONS = [
  { label: 'All Laptops', value: '/laptops' },
  { label: 'Lenovo ThinkPad', value: '/laptops/lenovo' },
  { label: 'HP EliteBook & ProBook', value: '/laptops/hp' },
  { label: 'Dell Latitude & XPS', value: '/laptops/dell' },
  { label: 'CCTV & Surveillance', value: '/cctv' },
  { label: 'Custom Desktop PCs', value: '/computers' },
  { label: 'Electrical Products', value: '/electrical-products' },
  { label: 'Computer Accessories', value: '/computer-accessories' },
  { label: 'Networking & Routers', value: '/networking' },
  { label: 'Technical Services', value: '/services' },
  { label: 'Laptop EMI Financing', value: '/laptops' },
  { label: 'Hotline Call (+880 1733-983752)', value: 'tel:+8801733983752' }
];

export const BannersManager: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SCHEDULED' | 'EXPIRED' | 'DISABLED'>('ALL');

  // Modal & Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDesktop, setUploadingDesktop] = useState(false);
  const [uploadingMobile, setUploadingMobile] = useState(false);

  // Form inputs
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [mobileImageUrl, setMobileImageUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('/laptops');
  const [buttonText, setButtonText] = useState('Shop Now');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [placement, setPlacement] = useState('HERO');

  // Preview state inside modal
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const desktopFileInputRef = useRef<HTMLInputElement>(null);
  const mobileFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.banners.getBanners({ activeOnly: false });
      if (res.success) {
        setBanners(res.data || []);
      } else {
        throw new Error('Failed to load banners');
      }
    } catch (err: any) {
      console.error('Fetch banners error:', err);
      setError(err.message || 'Failed to load promotional banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setBadge('OFFICIAL SHOWROOM PROMOTION');
    setImageUrl('/banners/lenovo-thinkpad-banner.jpg');
    setMobileImageUrl('');
    setTargetUrl('/laptops');
    setButtonText('Shop Now');
    setSortOrder(banners.length + 1);
    setIsActive(true);
    setStartDate('');
    setEndDate('');
    setPlacement('HERO');
    setPreviewMode('desktop');
    setIsModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title || '');
    setSubtitle(b.subtitle || '');
    setBadge(b.badge || '');
    setImageUrl(b.imageUrl || '');
    setMobileImageUrl(b.mobileImageUrl || '');
    setTargetUrl(b.targetUrl || '/laptops');
    setButtonText(b.buttonText || 'Shop Now');
    setSortOrder(b.sortOrder || 0);
    setIsActive(b.isActive);
    setStartDate(b.startDate ? new Date(b.startDate).toISOString().slice(0, 16) : '');
    setEndDate(b.endDate ? new Date(b.endDate).toISOString().slice(0, 16) : '');
    setPlacement(b.placement || 'HERO');
    setPreviewMode('desktop');
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMobileCrop = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isMobileCrop) setUploadingMobile(true);
    else setUploadingDesktop(true);

    try {
      const res = await api.banners.uploadImage(file, 'banners');
      if (res.success && res.publicUrl) {
        if (isMobileCrop) {
          setMobileImageUrl(res.publicUrl);
        } else {
          setImageUrl(res.publicUrl);
        }
        showToast('success', `${isMobileCrop ? 'Mobile' : 'Desktop'} banner image uploaded successfully!`);
      } else {
        throw new Error(res.error || 'Upload failed');
      }
    } catch (err: any) {
      showToast('error', err.message || 'Failed to upload image');
    } finally {
      if (isMobileCrop) setUploadingMobile(false);
      else setUploadingDesktop(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('error', 'Campaign Title is required');
      return;
    }
    if (!imageUrl.trim()) {
      showToast('error', 'Desktop Banner image is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        badge: badge.trim() || undefined,
        imageUrl: imageUrl.trim(),
        mobileImageUrl: mobileImageUrl.trim() || undefined,
        targetUrl: targetUrl.trim() || '/laptops',
        buttonText: buttonText.trim() || 'Shop Now',
        sortOrder: Number(sortOrder) || 0,
        isActive,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        placement: placement || 'HERO',
      };

      if (editingBanner) {
        await api.banners.updateBanner(editingBanner.id, payload);
        showToast('success', 'Banner campaign updated successfully!');
      } else {
        await api.banners.createBanner(payload);
        showToast('success', 'New banner campaign created successfully!');
      }

      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to save banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete banner "${name}"?`)) return;
    try {
      await api.banners.deleteBanner(id);
      showToast('success', 'Banner campaign deleted');
      fetchBanners();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to delete banner');
    }
  };

  const handleToggleActive = async (b: Banner) => {
    try {
      await api.banners.updateBanner(b.id, { isActive: !b.isActive });
      showToast('success', `Banner ${!b.isActive ? 'activated' : 'deactivated'}`);
      fetchBanners();
    } catch (err: any) {
      showToast('error', err.message);
    }
  };

  // Filtered list
  const filteredBanners = banners.filter((b) => {
    if (statusFilter === 'ALL') return true;
    return b.campaignStatus === statusFilter;
  });

  // Stats calculation
  const totalCount = banners.length;
  const activeCount = banners.filter((b) => b.campaignStatus === 'ACTIVE').length;
  const scheduledCount = banners.filter((b) => b.campaignStatus === 'SCHEDULED').length;
  const expiredCount = banners.filter((b) => b.campaignStatus === 'EXPIRED').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-semibold transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-sky-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-500/10 border border-blue-400/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold tracking-wider uppercase mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Storefront Merchandising
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Banner &amp; Promotion Manager
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-2xl font-medium leading-relaxed">
            Configure desktop and mobile promotional sliders, schedule time-limited campaigns,
            and guide customers directly to featured product offers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBanners}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/25 font-semibold text-sm flex items-center gap-2 transition-all active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl bg-white text-[#002B5B] hover:bg-blue-50 font-black text-sm shadow-md flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#008CFF]" />
            New Banner Campaign
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter('ALL')}
          className={`cursor-pointer rounded-2xl p-5 border shadow-xs transition-all ${
            statusFilter === 'ALL'
              ? 'bg-blue-50/60 border-blue-300 ring-2 ring-blue-500/30'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Campaigns</div>
          <div className="text-2xl font-black text-[#002B5B]">{totalCount}</div>
          <div className="text-xs text-slate-400 mt-1">Configured slides</div>
        </div>

        <div
          onClick={() => setStatusFilter('ACTIVE')}
          className={`cursor-pointer rounded-2xl p-5 border shadow-xs transition-all ${
            statusFilter === 'ACTIVE'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/30'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Active on Store</div>
          <div className="text-2xl font-black text-emerald-600">{activeCount}</div>
          <div className="text-xs text-emerald-700/80 mt-1">Live in rotation</div>
        </div>

        <div
          onClick={() => setStatusFilter('SCHEDULED')}
          className={`cursor-pointer rounded-2xl p-5 border shadow-xs transition-all ${
            statusFilter === 'SCHEDULED'
              ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500/30'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Scheduled Future</div>
          <div className="text-2xl font-black text-purple-600">{scheduledCount}</div>
          <div className="text-xs text-purple-700/80 mt-1">Upcoming campaigns</div>
        </div>

        <div
          onClick={() => setStatusFilter('EXPIRED')}
          className={`cursor-pointer rounded-2xl p-5 border shadow-xs transition-all ${
            statusFilter === 'EXPIRED'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/30'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Expired / Past</div>
          <div className="text-2xl font-black text-amber-600">{expiredCount}</div>
          <div className="text-xs text-amber-700/80 mt-1">Automatically hidden</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {(['ALL', 'ACTIVE', 'SCHEDULED', 'EXPIRED', 'DISABLED'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === s
                ? 'bg-[#008CFF] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {s === 'ALL' ? 'All Banners' : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Banners Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-[#008CFF] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold">Loading promotional banners...</p>
        </div>
      ) : filteredBanners.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No banners found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4 max-w-sm mx-auto">
            No promotional campaigns match the selected filter. Click below to add a new banner.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-[#008CFF] text-white font-bold text-xs shadow-sm hover:bg-[#0070cc]"
          >
            Add New Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBanners.map((b) => {
            const status = b.campaignStatus || (b.isActive ? 'ACTIVE' : 'DISABLED');
            return (
              <div
                key={b.id}
                className={`bg-white rounded-2xl border overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition-all ${
                  b.isActive ? 'border-slate-200 hover:border-[#008CFF]/50' : 'border-slate-200 opacity-60'
                }`}
              >
                <div>
                  {/* Banner Image Preview Container */}
                  <div className="relative aspect-[16/8] bg-slate-100 overflow-hidden border-b border-slate-200 group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={b.imageUrl}
                      alt={b.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Status Badges Overlay */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                      <span className="bg-white/95 backdrop-blur-md text-slate-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-slate-200 shadow-xs">
                        Order #{b.sortOrder}
                      </span>

                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs ${
                          status === 'ACTIVE'
                            ? 'bg-emerald-500 text-white'
                            : status === 'SCHEDULED'
                            ? 'bg-purple-600 text-white'
                            : status === 'EXPIRED'
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-500 text-white'
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    {/* Mobile Crop Indicator */}
                    {b.mobileImageUrl && (
                      <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-blue-700 border border-blue-200 flex items-center gap-1 shadow-xs">
                        <Smartphone className="w-3 h-3" /> Mobile Variant
                      </div>
                    )}
                  </div>

                  {/* Banner Details */}
                  <div className="p-5 space-y-2.5">
                    {b.badge && (
                      <span className="text-[10px] font-bold text-[#008CFF] uppercase tracking-wider block truncate">
                        {b.badge}
                      </span>
                    )}

                    <h3 className="font-bold text-base text-[#002B5B] line-clamp-1">
                      {b.title}
                    </h3>

                    {b.subtitle && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {b.subtitle}
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                      <span className="font-semibold flex items-center gap-1 text-[#008CFF]">
                        <Link2 className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[180px]">{b.targetUrl || '/laptops'}</span>
                      </span>

                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-semibold text-slate-700">
                        {b.buttonText || 'Shop Now'}
                      </span>
                    </div>

                    {(b.startDate || b.endDate) && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono pt-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {b.startDate ? new Date(b.startDate).toLocaleDateString() : 'Start'} &rarr;{' '}
                          {b.endDate ? new Date(b.endDate).toLocaleDateString() : 'Continuous'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="p-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(b)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                      b.isActive
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300'
                    }`}
                  >
                    {b.isActive ? 'Active on Store' : 'Inactive'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(b)}
                      className="p-2 rounded-xl text-slate-600 hover:text-[#008CFF] hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-colors"
                      title="Edit Campaign"
                    >
                      <Edit2 size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(b.id, b.title)}
                      className="p-2 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                      title="Delete Campaign"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-[#002B5B]">
                  {editingBanner ? 'Edit Banner Campaign' : 'Create New Banner Campaign'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure desktop artwork, mobile crops, call-to-actions, and campaign scheduling.
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Split Form & Live Preview */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Live Interactive Preview Box */}
              <div className="bg-[#F4F6F8] rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-[#008CFF]" />
                    Live Campaign Preview
                  </span>

                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setPreviewMode('desktop')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                        previewMode === 'desktop'
                          ? 'bg-[#008CFF] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      <Monitor className="w-3.5 h-3.5" /> Desktop
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode('mobile')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                        previewMode === 'mobile'
                          ? 'bg-[#008CFF] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-800'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" /> Mobile
                    </button>
                  </div>
                </div>

                {/* Preview Frame */}
                <div
                  className={`mx-auto rounded-2xl overflow-hidden border border-slate-300 shadow-sm relative transition-all ${
                    previewMode === 'desktop'
                      ? 'w-full aspect-[16/6] min-h-[160px]'
                      : 'w-72 aspect-[4/3] min-h-[220px]'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={(previewMode === 'mobile' && mobileImageUrl) ? mobileImageUrl : imageUrl || '/banners/lenovo-thinkpad-banner.jpg'}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/banners/lenovo-thinkpad-banner.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/70 to-transparent pointer-events-none" />

                  <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-center max-w-md">
                    {badge && (
                      <span className="text-[9px] font-bold text-[#008CFF] uppercase tracking-wider mb-1">
                        {badge}
                      </span>
                    )}
                    <h4 className="text-base sm:text-xl font-black text-[#002B5B] leading-tight line-clamp-2">
                      {title || 'Campaign Title Headline'}
                    </h4>
                    {subtitle && (
                      <p className="text-[11px] sm:text-xs text-slate-600 line-clamp-2 mt-1">
                        {subtitle}
                      </p>
                    )}
                    <div className="mt-3">
                      <span className="inline-block px-3 py-1.5 rounded-lg bg-[#008CFF] text-white font-bold text-[11px] shadow-xs">
                        {buttonText || 'Shop Now'} &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Input Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 1. Title */}
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-slate-700 block">Campaign Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lenovo ThinkPad X1 Carbon Flagship Edition"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                  />
                </div>

                {/* 2. Subtitle */}
                <div className="space-y-1 md:col-span-2">
                  <label className="font-bold text-slate-700 block">Supporting Description / Offer Details</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Intel Core i7, 16GB RAM, military-grade carbon fiber chassis with showroom inspection."
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                  />
                </div>

                {/* 3. Badge Text */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Badge / Overline Label</label>
                  <input
                    type="text"
                    placeholder="e.g. LENOVO LEGENDARY DURABILITY"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                  />
                </div>

                {/* 4. CTA Button Label */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">CTA Button Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Shop ThinkPad"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                  />
                </div>

                {/* 5. Destination URL */}
                <div className="space-y-1 md:col-span-2">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-700">CTA Destination URL *</label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) setTargetUrl(e.target.value);
                      }}
                      className="text-[11px] font-semibold text-[#008CFF] bg-transparent border-none cursor-pointer focus:outline-none"
                    >
                      <option value="">Select Quick Destination &darr;</option>
                      {COMMON_DESTINATIONS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label} ({d.value})
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="/laptops/lenovo"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                  />
                </div>

                {/* 6. Desktop Image Upload & URL */}
                <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="font-bold text-slate-800 block flex items-center justify-between">
                    <span>Desktop Artwork (1920&times;600) *</span>
                    {uploadingDesktop && <span className="text-blue-600 font-semibold animate-pulse">Uploading...</span>}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="/banners/lenovo-thinkpad-banner.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={desktopFileInputRef}
                      onChange={(e) => handleFileUpload(e, false)}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => desktopFileInputRef.current?.click()}
                      disabled={uploadingDesktop}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-600" /> Upload File
                    </button>
                    <span className="text-[11px] text-slate-400">JPEG, PNG, WebP up to 5MB</span>
                  </div>
                </div>

                {/* 7. Mobile Image Variant Upload & URL */}
                <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="font-bold text-slate-800 block flex items-center justify-between">
                    <span>Mobile Optimized Variant (Optional)</span>
                    {uploadingMobile && <span className="text-blue-600 font-semibold animate-pulse">Uploading...</span>}
                  </label>
                  <input
                    type="text"
                    placeholder="Leave blank to use responsive desktop crop"
                    value={mobileImageUrl}
                    onChange={(e) => setMobileImageUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono text-xs"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={mobileFileInputRef}
                      onChange={(e) => handleFileUpload(e, true)}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => mobileFileInputRef.current?.click()}
                      disabled={uploadingMobile}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-600" /> Upload Mobile File
                    </button>
                    <span className="text-[11px] text-slate-400">Recommended ~750&times;900px</span>
                  </div>
                </div>

                {/* 8. Campaign Start Date */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Campaign Start (Optional)</label>
                  <input
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                  />
                </div>

                {/* 9. Campaign End Date */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Campaign Expiry (Optional)</label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                  />
                </div>

                {/* 10. Display Order */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 block">Sort Order / Priority</label>
                  <input
                    type="number"
                    min={0}
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#008CFF]"
                  />
                </div>

                {/* 11. Active Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200 mt-5">
                  <div>
                    <div className="font-bold text-slate-800">Publish Immediately</div>
                    <div className="text-[11px] text-slate-500">Enable in customer storefront carousel</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="rounded text-[#008CFF] focus:ring-[#008CFF] w-5 h-5 cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannersManager;

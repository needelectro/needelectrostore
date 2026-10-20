'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles, Plus, Edit2, Trash2, Eye, EyeOff,
  Upload, Link as LinkIcon, Check, X, ArrowUp, ArrowDown,
  RefreshCw, AlertCircle, Image as ImageIcon, ExternalLink
} from 'lucide-react';
import { api } from '@/src/services/api';
import { Banner } from '@/src/types';

export const BannerManager: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [buttonText, setButtonText] = useState('Explore Now');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  // Image source method: 'UPLOAD' | 'URL'
  const [imageMethod, setImageMethod] = useState<'UPLOAD' | 'URL'>('UPLOAD');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.banners.getBanners();
      setBanners(res.data || []);
    } catch (err: any) {
      console.error('Failed to load banners:', err);
      setError(err.message || 'Failed to load banners from server');
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
    setBadge('Hot Deal / Featured');
    setImageUrl('');
    setTargetUrl('/laptops');
    setButtonText('Shop Now');
    setSortOrder(banners.length);
    setIsActive(true);
    setImageMethod('UPLOAD');
    setUploadError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setSubtitle(banner.subtitle || '');
    setBadge(banner.badge || '');
    setImageUrl(banner.imageUrl || '');
    setTargetUrl(banner.targetUrl || '');
    setButtonText(banner.buttonText || 'Discover Now');
    setSortOrder(banner.sortOrder || 0);
    setIsActive(banner.isActive);
    setImageMethod(banner.imageUrl?.startsWith('http') && !banner.imageUrl.includes('/uploads/') ? 'URL' : 'UPLOAD');
    setUploadError(null);
    setIsModalOpen(true);
  };

  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG, WebP, SVG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size exceeds 5MB limit.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const res = await api.storage.uploadFile(file, 'banners');
      if (res.success && res.publicUrl) {
        setImageUrl(res.publicUrl);
      } else {
        throw new Error(res.error || 'Upload failed');
      }
    } catch (err: any) {
      console.error('Banner upload error:', err);
      setUploadError(err.message || 'Failed to upload image to server');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a banner title.');
      return;
    }

    setSaveLoading(true);
    try {
      const payload: Partial<Banner> = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        badge: badge.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        targetUrl: targetUrl.trim() || undefined,
        buttonText: buttonText.trim() || undefined,
        sortOrder: Number(sortOrder) || 0,
        isActive,
      };

      if (editingBanner) {
        await api.banners.updateBanner(editingBanner.id, payload);
      } else {
        await api.banners.createBanner(payload);
      }

      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      console.error('Save banner error:', err);
      alert(err.message || 'Failed to save banner');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      await api.banners.updateBanner(banner.id, { isActive: !banner.isActive });
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, isActive: !b.isActive } : b))
      );
    } catch (err: any) {
      alert(err.message || 'Failed to toggle banner status');
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotional banner?')) return;
    try {
      await api.banners.deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete banner');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-600 dark:text-cyan-400" size={20} />
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Storefront Banners &amp; Campaigns
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage the hero promotional carousel and campaign banners on the customer website homepage.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchBanners}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Refresh banners"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus size={16} />
            <span>Create New Banner</span>
          </button>
        </div>
      </div>

      {/* Banner list */}
      {loading ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading storefront banners...</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 text-xs flex items-center gap-3">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      ) : banners.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <ImageIcon size={40} className="mx-auto text-slate-400" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">No Custom Banners Created</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            The homepage currently displays default showcase slides. Create your first promotional banner to highlight laptops, CCTV packages, or electrical discounts.
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
          >
            Create First Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {banners.map((b) => (
            <div
              key={b.id}
              className={`rounded-2xl border p-5 bg-white dark:bg-slate-900 flex flex-col justify-between transition-all ${
                b.isActive
                  ? 'border-slate-200 dark:border-slate-800 hover:border-blue-400 shadow-xs'
                  : 'border-slate-200/60 dark:border-slate-800/60 opacity-60'
              }`}
            >
              <div>
                {/* Banner preview thumbnail */}
                <div className="aspect-[21/9] rounded-xl bg-slate-100 dark:bg-slate-950 overflow-hidden mb-4 relative border border-slate-200 dark:border-slate-800 flex items-center justify-center p-4">
                  {b.imageUrl ? (
                    <img src={b.imageUrl} alt={b.title} className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center text-slate-400 text-xs flex flex-col items-center gap-1">
                      <ImageIcon size={24} />
                      <span>No image provided</span>
                    </div>
                  )}

                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    {b.badge && (
                      <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                        {b.badge}
                      </span>
                    )}
                    <span className="bg-black/60 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-mono">
                      Order: {b.sortOrder}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        b.isActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-500 text-white'
                      }`}
                    >
                      {b.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                  {b.title}
                </h3>
                {b.subtitle && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {b.subtitle}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                  <span className="font-semibold text-blue-600 dark:text-cyan-400">{b.buttonText || 'Discover Now'}</span>
                  <span>→</span>
                  <span className="truncate font-mono text-[11px]">{b.targetUrl || '/'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleToggleActive(b)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    b.isActive
                      ? 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                      : 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40'
                  }`}
                >
                  {b.isActive ? <EyeOff size={13} /> : <Eye size={13} />}
                  <span>{b.isActive ? 'Deactivate' : 'Activate'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(b)}
                    className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Edit banner"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    onClick={() => handleDeleteBanner(b.id)}
                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete banner"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingBanner ? 'Edit Promotional Banner' : 'Create New Promotional Banner'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="p-5 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Main Headline / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Authentic Laptops & Tech in Bangladesh"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Supporting Subtitle / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Explore HP, Dell & Lenovo laptops with official warranty and Cash on Delivery..."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Badge Pill Text
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hot Deal / 0% EMI"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sort Order Index
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              {/* Image Input Section (Upload or URL) */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Banner Image</span>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setImageMethod('UPLOAD')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                        imageMethod === 'UPLOAD'
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs'
                          : 'text-slate-500'
                      }`}
                    >
                      Device Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMethod('URL')}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                        imageMethod === 'URL'
                          ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-2xs'
                          : 'text-slate-500'
                      }`}
                    >
                      External URL
                    </button>
                  </div>
                </div>

                {imageMethod === 'UPLOAD' ? (
                  <div>
                    <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                      <Upload size={20} className="text-slate-400 mb-1" />
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        {isUploading ? 'Uploading image...' : 'Click to upload banner image (PNG, JPG, WebP)'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleDeviceUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                    </label>
                    {uploadError && <p className="text-[11px] text-rose-500 mt-1">{uploadError}</p>}
                  </div>
                ) : (
                  <div>
                    <input
                      type="url"
                      placeholder="https://example.com/images/banner.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                )}

                {imageUrl && (
                  <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <img src={imageUrl} alt="Preview" className="w-12 h-12 object-contain rounded bg-white" />
                    <span className="text-[11px] text-slate-500 truncate flex-1">{imageUrl}</span>
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="text-rose-500 text-[11px] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Destination Link (URL)
                  </label>
                  <input
                    type="text"
                    placeholder="/laptops or /cctv"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Button Text
                  </label>
                  <input
                    type="text"
                    placeholder="Shop Now"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="bannerIsActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="bannerIsActive" className="font-bold text-slate-700 dark:text-slate-300">
                  Publish on storefront homepage immediately
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading || isUploading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {saveLoading ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

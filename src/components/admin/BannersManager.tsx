'use client';

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon, Plus, Edit2, Trash2, CheckCircle2,
  XCircle, ExternalLink, RefreshCw, Eye, ArrowUpDown, Sparkles, AlertCircle
} from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  imageUrl?: string | null;
  targetUrl?: string | null;
  buttonText?: string | null;
  sortOrder: number;
  isActive: boolean;
  placement: string;
  createdAt: string;
}

export const BannersManager: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [badge, setBadge] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [targetUrl, setTargetUrl] = useState('/laptops');
  const [buttonText, setButtonText] = useState('Discover Now');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/banners?activeOnly=false');
      const json = await res.json();
      if (json.success) {
        setBanners(json.data || []);
      } else {
        throw new Error(json.error || 'Failed to load banners');
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
    setBadge('Official Showroom & Nationwide Delivery');
    setImageUrl('/logo-dark-transparent.png');
    setTargetUrl('/laptops');
    setButtonText('Browse Laptops');
    setSortOrder(banners.length);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title || '');
    setSubtitle(b.subtitle || '');
    setBadge(b.badge || '');
    setImageUrl(b.imageUrl || '');
    setTargetUrl(b.targetUrl || '/laptops');
    setButtonText(b.buttonText || 'Discover Now');
    setSortOrder(b.sortOrder || 0);
    setIsActive(b.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        badge: badge.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        targetUrl: targetUrl.trim() || undefined,
        buttonText: buttonText.trim() || undefined,
        sortOrder: Number(sortOrder) || 0,
        isActive,
        placement: 'HOMEPAGE_HERO',
      };

      const url = editingBanner ? `/api/banners/${editingBanner.id}` : '/api/banners';
      const method = editingBanner ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to save banner');
      }

      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      alert(err.message || 'Failed to save banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotional banner?')) return;
    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete banner');
      }
      setBanners(prev => prev.filter(b => b.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete banner');
    }
  };

  const handleToggleActive = async (b: Banner) => {
    try {
      const res = await fetch(`/api/banners/${b.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !b.isActive }),
      });
      const json = await res.json();
      if (json.success) {
        setBanners(prev => prev.map(item => item.id === b.id ? { ...item, isActive: !item.isActive } : item));
      }
    } catch (err: any) {
      alert('Failed to update banner status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 text-white border border-slate-800 shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0084d6]/20 border border-[#0084d6]/40 text-sky-300 mb-1">
            <Sparkles size={13} className="text-[#0084d6]" />
            <span>Customer Storefront Live Synchronizer</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Homepage Hero Carousel &amp; Banners
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage the primary hero slides displayed on the customer website matching the Trust Computer MB layout.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchBanners}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh Banners"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <span>Preview Storefront</span>
            <ExternalLink size={14} />
          </a>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-[#0084d6] hover:bg-[#0073bc] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus size={16} />
            <span>Add New Banner</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Banners Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <div className="w-8 h-8 border-2 border-[#0084d6] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs">Loading promotional slides...</p>
        </div>
      ) : banners.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-slate-800">
          <ImageIcon size={36} className="mx-auto text-slate-600 mb-3" />
          <p className="text-sm font-bold text-slate-300">No promotional banners configured yet.</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">The customer storefront is currently using default showcase slides.</p>
          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-[#0084d6] text-white font-bold text-xs"
          >
            Create First Banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {banners.map((b) => (
            <div
              key={b.id}
              className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all shadow-sm ${
                b.isActive 
                  ? 'bg-slate-900 border-slate-800 hover:border-[#0084d6]' 
                  : 'bg-slate-950/60 border-slate-800/60 opacity-60'
              }`}
            >
              <div>
                {/* Image Preview Box */}
                <div className="aspect-[16/9] bg-[#081621] p-4 flex items-center justify-center relative border-b border-slate-800">
                  <img
                    src={b.imageUrl || '/logo-dark-transparent.png'}
                    alt={b.title}
                    className="max-h-full max-w-full object-contain filter drop-shadow-md"
                  />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="bg-slate-800/90 text-slate-300 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-slate-700">
                      Sort: {b.sortOrder}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        b.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {b.isActive ? 'Active on Store' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  {b.badge && (
                    <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                      {b.badge}
                    </span>
                  )}
                  <h3 className="font-bold text-sm text-white line-clamp-1">
                    {b.title}
                  </h3>
                  {b.subtitle && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {b.subtitle}
                    </p>
                  )}
                  <div className="pt-2 flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <span>Link:</span>
                    <span className="text-[#0084d6] truncate">{b.targetUrl || '/laptops'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleToggleActive(b)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors ${
                    b.isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  {b.isActive ? 'Turn Off' : 'Activate'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(b)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    title="Edit Banner"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
                    title="Delete Banner"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl text-white space-y-4">
            <h3 className="text-lg font-black tracking-tight">
              {editingBanner ? 'Edit Promotional Slide' : 'Create New Hero Slide'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Banner Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Authentic Laptops & Tech in Bangladesh"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#0084d6]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Subtitle / Marketing Copy</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Explore HP, Dell & Lenovo laptops with official warranty and doorstep COD."
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#0084d6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Top Badge Label</label>
                  <input
                    type="text"
                    placeholder="e.g. 0% EMI Available"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#0084d6]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Button CTA Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Discover Now"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#0084d6]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Target Page URL</label>
                  <input
                    type="text"
                    placeholder="e.g. /laptops or /laptop-emi"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#0084d6]"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Sort Order (0, 1, 2...)</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#0084d6]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Image / Asset URL</label>
                <input
                  type="text"
                  placeholder="e.g. /logo-dark-transparent.png or Supabase Storage URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#0084d6]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-[#0084d6] focus:ring-0"
                />
                <label htmlFor="isActive" className="text-slate-300 font-semibold cursor-pointer">
                  Display this banner actively on the customer website
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#0084d6] hover:bg-[#0073bc] text-white font-bold flex items-center gap-1.5 shadow-md"
                >
                  {submitting ? 'Saving...' : editingBanner ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

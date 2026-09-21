import React, { useState } from 'react';
import { useERP } from '../../services/erpStore';
import {
  Globe, Search, FileText, CheckCircle2, AlertCircle, Save,
  Plus, Trash2, ExternalLink, Code, Database, RefreshCw,
  Layers, MapPin, Laptop, Video, Wrench, Shield, Check
} from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/seoConfig';

export const SeoControlCenter: React.FC = () => {
  const { settings, updateSettings, addToast, products } = useERP();

  const [activeSubTab, setActiveSubTab] = useState<
    'global' | 'homepage' | 'redirects' | 'sitemap_robots' | 'schema' | 'analytics'
  >('global');

  // Form states
  const [seoForm, setSeoForm] = useState({
    seoTitle: settings.seoTitle || 'NEED ELECTRO | Laptop, Computer, CCTV & Electrical Solutions in Moulvibazar',
    seoDescription: settings.seoDescription || 'Trusted laptop shop, desktop computers, CCTV security cameras, and certified electrician services in Moulvibazar, Sylhet. HP, Dell, and Lenovo laptops with EMI installments.',
    seoKeywords: settings.seoKeywords || 'Laptop shop Moulvibazar, Computer shop Moulvibazar, CCTV camera Moulvibazar, Electrician in Moulvibazar, Laptop EMI Moulvibazar, মৌলভীবাজার ল্যাপটপ',
    googleSearchConsoleVerification: settings.googleSearchConsoleVerification || '',
    googleAnalyticsId: settings.googleAnalyticsId || '',
    googleTagManagerId: settings.googleTagManagerId || '',
  });

  const [redirects, setRedirects] = useState<Array<{ from: string; to: string; permanent: boolean }>>(
    settings.seoRedirects || [
      { from: '/laptop', to: '/laptops', permanent: true },
      { from: '/security', to: '/cctv', permanent: true },
      { from: '/electrician', to: '/services/electrician', permanent: true },
      { from: '/emi', to: '/laptop-emi', permanent: true },
      { from: '/moulvibazar-laptop', to: '/moulvibazar', permanent: true },
    ]
  );

  const [newRedirectFrom, setNewRedirectFrom] = useState('');
  const [newRedirectTo, setNewRedirectTo] = useState('');

  const handleSaveSeoSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...seoForm,
      seoRedirects: redirects,
    });
    addToast('success', 'SEO Settings Updated', 'Search engine optimization parameters and meta tags saved successfully.');
  };

  const handleAddRedirect = () => {
    if (!newRedirectFrom.trim() || !newRedirectTo.trim()) {
      addToast('error', 'Validation Error', 'Both source and destination paths are required.');
      return;
    }
    const cleanFrom = newRedirectFrom.startsWith('/') ? newRedirectFrom.trim() : `/${newRedirectFrom.trim()}`;
    const cleanTo = newRedirectTo.startsWith('/') ? newRedirectTo.trim() : `/${newRedirectTo.trim()}`;

    setRedirects([...redirects, { from: cleanFrom, to: cleanTo, permanent: true }]);
    setNewRedirectFrom('');
    setNewRedirectTo('');
    addToast('info', 'Redirect Added', 'Remember to click Save Changes to persist.');
  };

  const handleRemoveRedirect = (index: number) => {
    const updated = [...redirects];
    updated.splice(index, 1);
    setRedirects(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div>
          <div className="inline-flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Globe size={14} />
            <span>Super Admin SEO & Geo-SEO Control Center</span>
          </div>
          <h2 className="text-xl font-bold text-white">Search Engine & Local SEO Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage metadata, Google Search Console, Schema.org structured data, and 301 redirects without touching code.
          </p>
        </div>

        <button
          onClick={handleSaveSeoSettings}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all shrink-0"
        >
          <Save size={14} />
          <span>Save All SEO Settings</span>
        </button>
      </div>

      {/* Subtabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('global')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'global'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Global & Meta Tags
        </button>
        <button
          onClick={() => setActiveSubTab('homepage')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'homepage'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Homepage & H1
        </button>
        <button
          onClick={() => setActiveSubTab('redirects')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'redirects'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          301 Redirects ({redirects.length})
        </button>
        <button
          onClick={() => setActiveSubTab('sitemap_robots')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'sitemap_robots'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Sitemap & Robots
        </button>
        <button
          onClick={() => setActiveSubTab('schema')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'schema'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Structured Data (Schema.org)
        </button>
        <button
          onClick={() => setActiveSubTab('analytics')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'analytics'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          Search Console & GA4
        </button>
      </div>

      {/* Subtab 1: Global & Meta Tags */}
      {activeSubTab === 'global' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-base font-bold text-white">Default Global Search Metadata</h3>
          <p className="text-xs text-slate-400">
            Fallback meta tags applied to all public pages when page-specific overrides are omitted.
          </p>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Default SEO Page Title</label>
              <input
                type="text"
                value={seoForm.seoTitle}
                onChange={e => setSeoForm({ ...seoForm, seoTitle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Recommended: 50-60 characters.</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Default Meta Description</label>
              <textarea
                rows={3}
                value={seoForm.seoDescription}
                onChange={e => setSeoForm({ ...seoForm, seoDescription: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Recommended: 150-160 characters.</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Default Target Keywords (Comma Separated)</label>
              <textarea
                rows={2}
                value={seoForm.seoKeywords}
                onChange={e => setSeoForm({ ...seoForm, seoKeywords: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Homepage & H1 */}
      {activeSubTab === 'homepage' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-base font-bold text-white">Homepage Headings & Geo-SEO Target</h3>
          <p className="text-xs text-slate-400">
            Verify the single primary H1 tag and target search queries for Moulvibazar.
          </p>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block mb-1">Verified Single Homepage H1:</span>
              <span className="text-cyan-400 font-mono font-bold text-sm">
                Trusted Electrical & Technological Solutions in Moulvibazar — NEED ELECTRO
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-white block">Primary Geo Targeting:</span>
                <p className="text-slate-400">Moulvibazar Town, Kusumbag, Chowmuhana, Sylhet Division, Bangladesh</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-white block">Active Database Products Indexed:</span>
                <p className="text-emerald-400 font-bold">{products.length} Products connected to live catalog</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: 301 Redirects Manager */}
      {activeSubTab === 'redirects' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white">301 Permanent Redirects</h3>
              <p className="text-xs text-slate-400">Preserve search equity when page URLs or product slugs change.</p>
            </div>
          </div>

          {/* Add New Redirect */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-white block">Add 301 Redirect Rule</span>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <input
                type="text"
                placeholder="From path (e.g. /old-laptop-url)"
                value={newRedirectFrom}
                onChange={e => setNewRedirectFrom(e.target.value)}
                className="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
              />
              <input
                type="text"
                placeholder="To path (e.g. /laptops/hp)"
                value={newRedirectTo}
                onChange={e => setNewRedirectTo(e.target.value)}
                className="sm:col-span-2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
              />
              <button
                type="button"
                onClick={handleAddRedirect}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus size={14} />
                <span>Add Rule</span>
              </button>
            </div>
          </div>

          {/* List of Redirects */}
          <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Old Request Path</th>
                  <th className="py-2.5 px-4">Permanent 301 Destination</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                  <th className="py-2.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {redirects.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-mono text-cyan-400">{r.from}</td>
                    <td className="py-2.5 px-4 font-mono text-emerald-400">→ {r.to}</td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-bold">
                        301 Permanent
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveRedirect(idx)}
                        className="text-rose-400 hover:text-rose-300 p-1"
                        title="Remove Rule"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 4: Sitemap & Robots Live Status */}
      {activeSubTab === 'sitemap_robots' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-base font-bold text-white">Dynamic Sitemap & Robots.txt Status</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400" /> XML Sitemap
                </span>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>View Live XML</span>
                  <ExternalLink size={12} />
                </a>
              </div>
              <p className="text-slate-400">
                Generated dynamically at <code>/sitemap.xml</code>. Automatically fetches all active products, category pages, brand hubs, services, locations, and blog articles from PostgreSQL.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-2">
                  <Shield size={16} className="text-cyan-400" /> Robots.txt
                </span>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>View Live TXT</span>
                  <ExternalLink size={12} />
                </a>
              </div>
              <p className="text-slate-400">
                Configured at <code>/robots.txt</code>. Allows Googlebot/Bingbot to index public customer landing pages while strictly disallowing private administrative routes (<code>/admin/</code>, <code>/api/</code>, <code>/dashboard/</code>).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 5: Schema.org Structured Data */}
      {activeSubTab === 'schema' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Active Schema.org Structured Data</h3>
          <p className="text-xs text-slate-400">
            JSON-LD schemas generated automatically for rich snippet eligibility on Google Search.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-cyan-300">LocalBusiness Schema</span>
              <p className="text-slate-400">Active on Homepage, Moulvibazar hub, and contact page. Contains business NAP, coordinates, and opening hours.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-cyan-300">Product & Offer Schema</span>
              <p className="text-slate-400">Active on all <code>/product/[slug]</code> routes. Syncs real-time prices in BDT, InStock status, and specs.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-cyan-300">BreadcrumbList & FAQPage</span>
              <p className="text-slate-400">Embedded on all category pages, blog articles, and FAQ pages for sitelinks and accordion display in search results.</p>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 6: Analytics & Search Console */}
      {activeSubTab === 'analytics' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-base font-bold text-white">Google Search Console & Analytics Integration</h3>
          <p className="text-xs text-slate-400">
            Enter your Google verification tokens and measurement IDs.
          </p>

          <div className="space-y-4 text-xs max-w-xl">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Google Search Console Verification Tag / Content
              </label>
              <input
                type="text"
                placeholder="e.g. google-site-verification=abc123xyz..."
                value={seoForm.googleSearchConsoleVerification}
                onChange={e => setSeoForm({ ...seoForm, googleSearchConsoleVerification: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Google Analytics 4 (GA4) Measurement ID
              </label>
              <input
                type="text"
                placeholder="e.g. G-XXXXXXXXXX"
                value={seoForm.googleAnalyticsId}
                onChange={e => setSeoForm({ ...seoForm, googleAnalyticsId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Google Tag Manager (GTM) Container ID (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. GTM-XXXXXXX"
                value={seoForm.googleTagManagerId}
                onChange={e => setSeoForm({ ...seoForm, googleTagManagerId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

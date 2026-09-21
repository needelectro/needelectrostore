import React, { useState } from 'react';
import { useERP } from '../../services/erpStore';
import {
  Globe, Search, FileText, CheckCircle2, AlertCircle, Save,
  Plus, Trash2, ExternalLink, Code, Database, RefreshCw,
  Layers, MapPin, Laptop, Video, Wrench, Shield, Check,
  Share2, BarChart2, Eye, HelpCircle, Tag, ArrowRight, CornerDownRight
} from 'lucide-react';
import { BUSINESS_INFO, BLOG_POSTS, slugify } from '@/lib/seoConfig';

type SeoSubTab =
  | 'global'
  | 'homepage'
  | 'product_seo'
  | 'category_seo'
  | 'service_seo'
  | 'location_seo'
  | 'blog_seo'
  | 'meta_tags'
  | 'sitemap'
  | 'robots'
  | 'redirects'
  | 'structured_data'
  | 'open_graph'
  | 'analytics';

export const SeoControlCenter: React.FC = () => {
  const { settings, updateSettings, addToast, products } = useERP();

  const [activeSubTab, setActiveSubTab] = useState<SeoSubTab>('global');

  // Form states
  const [seoForm, setSeoForm] = useState({
    seoTitle: settings.seoTitle || 'NEED ELECTRO | Laptop, Computer, CCTV & Electrical Solutions in Moulvibazar',
    seoDescription: settings.seoDescription || 'Trusted laptop shop, desktop computers, CCTV security cameras, and certified electrician services in Moulvibazar, Sylhet. HP, Dell, and Lenovo laptops with EMI installments.',
    seoKeywords: settings.seoKeywords || 'Laptop shop Moulvibazar, Computer shop Moulvibazar, CCTV camera Moulvibazar, Electrician in Moulvibazar, Laptop EMI Moulvibazar, মৌলভীবাজার ল্যাপটপ, ল্যাপটপ কিস্তিতে',
    googleSearchConsoleVerification: settings.googleSearchConsoleVerification || '',
    googleAnalyticsId: settings.googleAnalyticsId || '',
    googleTagManagerId: settings.googleTagManagerId || '',
  });

  const [redirects, setRedirects] = useState<Array<{ from: string; to: string; permanent: boolean }>>(
    settings.seoRedirects || [
      { from: '/laptop', to: '/laptops', permanent: true },
      { from: '/security', to: '/cctv', permanent: true },
      { from: '/cctv-camera', to: '/cctv', permanent: true },
      { from: '/electrician', to: '/services/electrician', permanent: true },
      { from: '/emi', to: '/laptop-emi', permanent: true },
      { from: '/installments', to: '/laptop-emi', permanent: true },
      { from: '/moulvibazar-laptop', to: '/moulvibazar', permanent: true },
    ]
  );

  const [newRedirectFrom, setNewRedirectFrom] = useState('');
  const [newRedirectTo, setNewRedirectTo] = useState('');

  // Product SEO search inspector state
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  const inspectedProduct = filteredProducts[selectedProductIndex] || products[0];

  const handleSaveSeoSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ...seoForm,
      seoRedirects: redirects,
    });
    addToast('success', 'SEO Settings Saved', 'All search engine parameters, structured data, and 301 redirects saved.');
  };

  const handleAddRedirect = () => {
    if (!newRedirectFrom.trim() || !newRedirectTo.trim()) {
      addToast('error', 'Validation Error', 'Both source and destination paths are required.');
      return;
    }
    const cleanFrom = newRedirectFrom.startsWith('/') ? newRedirectFrom.trim() : `/${newRedirectFrom.trim()}`;
    const cleanTo = newRedirectTo.startsWith('/') ? newRedirectTo.trim() : `/${newRedirectTo.trim()}`;

    if (cleanFrom.toLowerCase() === cleanTo.toLowerCase()) {
      addToast('error', 'Loop Prevention', 'Redirect source and destination cannot be identical.');
      return;
    }

    setRedirects([...redirects, { from: cleanFrom, to: cleanTo, permanent: true }]);
    setNewRedirectFrom('');
    setNewRedirectTo('');
    addToast('info', 'Redirect Added', 'Click "Save All SEO Settings" to persist changes.');
  };

  const handleRemoveRedirect = (index: number) => {
    const updated = [...redirects];
    updated.splice(index, 1);
    setRedirects(updated);
  };

  const subTabs: Array<{ id: SeoSubTab; label: string; icon: any }> = [
    { id: 'global', label: '1. Global SEO', icon: Globe },
    { id: 'homepage', label: '2. Homepage SEO', icon: Layers },
    { id: 'product_seo', label: '3. Product SEO', icon: Laptop },
    { id: 'category_seo', label: '4. Category SEO', icon: Tag },
    { id: 'service_seo', label: '5. Service SEO', icon: Wrench },
    { id: 'location_seo', label: '6. Location SEO', icon: MapPin },
    { id: 'blog_seo', label: '7. Blog SEO', icon: FileText },
    { id: 'meta_tags', label: '8. Meta Tags', icon: Code },
    { id: 'sitemap', label: '9. Sitemap', icon: Database },
    { id: 'robots', label: '10. Robots.txt', icon: Shield },
    { id: 'redirects', label: '11. Redirects (301)', icon: CornerDownRight },
    { id: 'structured_data', label: '12. Structured Data', icon: Code },
    { id: 'open_graph', label: '13. Open Graph Preview', icon: Share2 },
    { id: 'analytics', label: '14. Search Console & GA4', icon: BarChart2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Globe size={14} />
            <span>Super Admin SEO Management Control Center</span>
          </div>
          <h2 className="text-xl font-bold text-white">Search Engine & Local SEO Management</h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage metadata, local Moulvibazar rankings, Schema.org structured data, 301 redirects, and Google Search Console without modifying code.
          </p>
        </div>

        <button
          onClick={handleSaveSeoSettings}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all shrink-0 cursor-pointer"
        >
          <Save size={14} />
          <span>Save All SEO Settings</span>
        </button>
      </div>

      {/* Subtabs Bar (14 Subsections) */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-3">
        {subTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon size={12} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Global SEO */}
      {activeSubTab === 'global' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Default Global Search Metadata</h3>
              <p className="text-xs text-slate-400">Universal fallbacks applied across the customer website.</p>
            </div>
            <span className="bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-[11px] px-2.5 py-1 rounded-lg font-mono font-bold">
              Canonical Domain: {BUSINESS_INFO.domain}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Global Default Title</label>
              <input
                type="text"
                value={seoForm.seoTitle}
                onChange={e => setSeoForm({ ...seoForm, seoTitle: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Recommended: 50-60 characters with primary brand and location.</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Global Meta Description</label>
              <textarea
                rows={3}
                value={seoForm.seoDescription}
                onChange={e => setSeoForm({ ...seoForm, seoDescription: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-400"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Recommended: 150-160 characters. Highlight products, services, and Moulvibazar location.</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Target Keywords (Comma Separated)</label>
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

      {/* 2. Homepage SEO */}
      {activeSubTab === 'homepage' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Homepage Headings & Geo-SEO Target</h3>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Preview Live Homepage</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block mb-1">Single Verified Semantic H1:</span>
              <span className="text-cyan-400 font-mono font-bold text-sm">
                Trusted Electrical & Technological Solutions in Moulvibazar — NEED ELECTRO
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Rendered with <code>className="sr-only"</code> for accessibility and strict heading hierarchy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-white block">Primary Geo Targeting:</span>
                <p className="text-slate-400">Moulvibazar Town, Kusumbag, Chowmuhana, Sylhet Division, Bangladesh</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-white block">Live Products Connected to Search:</span>
                <p className="text-emerald-400 font-bold">{products.length} Products synchronized in PostgreSQL</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Product SEO */}
      {activeSubTab === 'product_seo' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div>
            <h3 className="text-base font-bold text-white">Product SEO & Live Schema Inspector</h3>
            <p className="text-xs text-slate-400">Inspect how any product in your inventory generates SEO titles, URLs, and Schema.org Product data.</p>
          </div>

          <div className="flex gap-2 text-xs">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                placeholder="Search products by name, brand, or SKU..."
                value={productSearchQuery}
                onChange={e => {
                  setProductSearchQuery(e.target.value);
                  setSelectedProductIndex(0);
                }}
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100"
              />
            </div>
          </div>

          {inspectedProduct ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="font-bold text-cyan-400 block text-sm">Product SEO Meta Details</span>
                <div>
                  <span className="text-slate-400 block">Product Name:</span>
                  <span className="text-white font-semibold">{inspectedProduct.name}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Generated SEO Title:</span>
                  <span className="text-slate-200 font-mono text-[11px]">
                    {inspectedProduct.name} | Price & Specs in Moulvibazar | NEED ELECTRO
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Canonical URL:</span>
                  <span className="text-cyan-400 font-mono text-[11px]">
                    /product/{slugify(inspectedProduct.name)}-{inspectedProduct.sku.toLowerCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="text-slate-400 block">Retail Price (BDT):</span>
                    <span className="text-emerald-400 font-bold text-sm">৳{Number(inspectedProduct.retailPrice).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Stock Status:</span>
                    <span className={`font-bold ${inspectedProduct.currentStock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {inspectedProduct.currentStock > 0 ? `In Stock (${inspectedProduct.currentStock})` : 'Out of Stock'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-amber-400 text-sm">Schema.org Product JSON-LD</span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Real-time DB Sync</span>
                </div>
                <pre className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto max-h-48">
{JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": inspectedProduct.name,
  "sku": inspectedProduct.sku,
  "brand": { "@type": "Brand", "name": inspectedProduct.brand },
  "offers": {
    "@type": "Offer",
    "priceCurrency": "BDT",
    "price": Number(inspectedProduct.retailPrice).toFixed(2),
    "availability": inspectedProduct.currentStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    "seller": { "@type": "Organization", "name": "NEED ELECTRO" }
  }
}, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 text-xs">No matching products found.</p>
          )}
        </div>
      )}

      {/* 4. Category SEO */}
      {activeSubTab === 'category_seo' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-base font-bold text-white">Category Pages SEO Hierarchy</h3>
          <p className="text-xs text-slate-400">All 7 primary categories have dedicated landing pages with custom H1, introductory content, and schema.</p>

          <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Clean Path</th>
                  <th className="py-2.5 px-4">Target Keyword Focus</th>
                  <th className="py-2.5 px-4 text-right">Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {BUSINESS_INFO.categories.map((cat, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-bold text-white">{cat.title}</td>
                    <td className="py-2.5 px-4 font-mono text-cyan-400">/{cat.slug}</td>
                    <td className="py-2.5 px-4 text-slate-400">{cat.description.slice(0, 50)}...</td>
                    <td className="py-2.5 px-4 text-right">
                      <a
                        href={`/${cat.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1"
                      >
                        <span>View</span>
                        <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Service SEO */}
      {activeSubTab === 'service_seo' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-base font-bold text-white">Technical & Electrical Service SEO</h3>
          <p className="text-xs text-slate-400">
            Dedicated service landing pages with real online booking submission to ERP PostgreSQL.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-amber-400 block text-sm">Electrician Service Page</span>
              <p className="text-slate-300">URL: <code>/services/electrician</code></p>
              <p className="text-slate-400">Targets: Electrician in Moulvibazar, home electrical wiring, circuit breaker troubleshooting.</p>
              <div className="pt-2">
                <span className="bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold">
                  ✓ Connected to ERP ServiceJob booking API
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-cyan-400 block text-sm">CCTV Installation Service Page</span>
              <p className="text-slate-300">URL: <code>/services/cctv-installation</code></p>
              <p className="text-slate-400">Targets: CCTV camera installation Moulvibazar, security camera setup, DVR/NVR surveillance.</p>
              <div className="pt-2">
                <span className="bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold">
                  ✓ Connected to ERP ServiceJob booking API
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Location SEO */}
      {activeSubTab === 'location_seo' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-base font-bold text-white">Local SEO & Geo-Targeting Coverage</h3>
          <p className="text-xs text-slate-400">
            Individual location landing pages covering Moulvibazar district and major upazilas.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {[
              { name: 'Moulvibazar Town', path: '/moulvibazar', primary: true, desc: 'Primary showroom & central service hub at Kusumbag' },
              { name: 'Sreemangal', path: '/sreemangal', primary: false, desc: 'Tea capital coverage for laptops, CCTV & delivery' },
              { name: 'Kulaura', path: '/kulaura', primary: false, desc: 'North Moulvibazar computer and electrical solutions' },
              { name: 'Rajnagar', path: '/rajnagar', primary: false, desc: 'Fast courier & on-site technician coverage' },
            ].map((loc, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{loc.name}</span>
                  {loc.primary && (
                    <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded font-bold">Primary</span>
                  )}
                </div>
                <code className="text-cyan-400 block text-[11px]">{loc.path}</code>
                <p className="text-slate-400 text-[11px]">{loc.desc}</p>
                <a
                  href={loc.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold text-[11px]"
                >
                  <span>Inspect Hub</span>
                  <ExternalLink size={10} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Blog SEO */}
      {activeSubTab === 'blog_seo' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-base font-bold text-white">Knowledge Center & Blog Articles ({BLOG_POSTS.length})</h3>
          <p className="text-xs text-slate-400">In-depth guides addressing high-intent customer search queries in Moulvibazar.</p>

          <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Article Title</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">Reading Time</th>
                  <th className="py-2.5 px-4 text-right">View Article</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {BLOG_POSTS.map((post, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-4 font-semibold text-white max-w-xs truncate">{post.title}</td>
                    <td className="py-2.5 px-4">
                      <span className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded text-[10px] font-bold">
                        {post.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-400">{post.readingTime}</td>
                    <td className="py-2.5 px-4 text-right">
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:underline inline-flex items-center gap-1 font-semibold"
                      >
                        <span>Read</span>
                        <ExternalLink size={11} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Meta Tags */}
      {activeSubTab === 'meta_tags' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-base font-bold text-white">Universal Meta Tags & Crawler Instructions</h3>
          <p className="text-xs text-slate-400">Standard tags automatically injected into all public landing pages.</p>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1.5 overflow-x-auto">
            <p className="text-cyan-400">&lt;meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" /&gt;</p>
            <p className="text-cyan-400">&lt;meta name="theme-color" content="#008CFF" /&gt;</p>
            <p className="text-cyan-400">&lt;meta name="robots" content="index, follow, max-image-preview:large" /&gt;</p>
            <p className="text-cyan-400">&lt;meta property="og:site_name" content="NEED ELECTRO" /&gt;</p>
            <p className="text-cyan-400">&lt;meta name="twitter:card" content="summary_large_image" /&gt;</p>
            <p className="text-cyan-400">&lt;link rel="canonical" href="{BUSINESS_INFO.domain}/..." /&gt;</p>
          </div>
        </div>
      )}

      {/* 9. Sitemap */}
      {activeSubTab === 'sitemap' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Dynamic XML Sitemap Status</h3>
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Inspect Live /sitemap.xml</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Core Static Hubs:</span>
              <span className="text-white font-bold text-lg">24 Pages</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Blog Guides:</span>
              <span className="text-cyan-400 font-bold text-lg">{BLOG_POSTS.length} Articles</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 block">Indexed Products:</span>
              <span className="text-emerald-400 font-bold text-lg">{products.length} Products</span>
            </div>
          </div>
        </div>
      )}

      {/* 10. Robots */}
      {activeSubTab === 'robots' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Robots.txt Security & Crawling Rules</h3>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Inspect Live /robots.txt</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
            <p className="text-emerald-400">User-agent: *</p>
            <p className="text-emerald-400">Allow: /</p>
            <p className="text-emerald-400">Allow: /laptops/</p>
            <p className="text-emerald-400">Allow: /computers/</p>
            <p className="text-emerald-400">Allow: /cctv/</p>
            <p className="text-emerald-400">Allow: /electrical-products/</p>
            <p className="text-emerald-400">Allow: /services/*</p>
            <p className="text-rose-400">Disallow: /admin/</p>
            <p className="text-rose-400">Disallow: /api/</p>
            <p className="text-rose-400">Disallow: /dashboard/</p>
            <p className="text-rose-400">Disallow: /erp/</p>
            <p className="text-rose-400">Disallow: /account/private/</p>
            <p className="text-cyan-400 pt-2">Sitemap: {BUSINESS_INFO.domain}/sitemap.xml</p>
          </div>
        </div>
      )}

      {/* 11. Redirects */}
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
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
                        className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
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

      {/* 12. Structured Data */}
      {activeSubTab === 'structured_data' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold text-white">Schema.org Structured Data Architecture</h3>
          <p className="text-xs text-slate-400">All Schema.org markup is strictly validated against current Google Search guidelines.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-cyan-300">LocalBusiness Schema</span>
              <p className="text-slate-400">Active on Homepage & Moulvibazar page with exact physical address, opening hours, and phone.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-cyan-300">Product & Offer Schema</span>
              <p className="text-slate-400">Active on all <code>/product/[slug]</code> routes. Syncs real-time prices in BDT and InStock status.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="font-bold text-cyan-300">Service & FAQPage Schema</span>
              <p className="text-slate-400">Active on electrician, CCTV, and FAQ pages for rich snippets on Google Search.</p>
            </div>
          </div>
        </div>
      )}

      {/* 13. Open Graph Preview */}
      {activeSubTab === 'open_graph' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-base font-bold text-white">Social Media & Messaging Card Preview</h3>
          <p className="text-xs text-slate-400">Preview how links appear when shared across WhatsApp, Facebook, and LinkedIn.</p>

          <div className="max-w-md bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="h-44 bg-gradient-to-br from-blue-900 via-slate-900 to-cyan-950 flex items-center justify-center p-6 text-center border-b border-slate-800">
              <div>
                <h4 className="text-lg font-extrabold text-white">NEED ELECTRO</h4>
                <p className="text-xs text-cyan-300 mt-1">Trusted Electrical & Technological Solutions in Moulvibazar</p>
              </div>
            </div>
            <div className="p-4 space-y-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                {BUSINESS_INFO.domain.replace('https://', '')}
              </span>
              <h5 className="font-bold text-white text-sm">
                {seoForm.seoTitle}
              </h5>
              <p className="text-xs text-slate-400 line-clamp-2">
                {seoForm.seoDescription}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 14. Search Console & GA4 */}
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

'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen, Plus, Edit2, Trash2, CheckCircle2, XCircle,
  ExternalLink, RefreshCw, Eye, Sparkles, Tag, Layers,
  Search, Check, ShieldCheck, AlertCircle
} from 'lucide-react';
import { slugify } from '@/lib/seoConfig';
import { GuideCategory, GUIDE_CATEGORIES } from '@/lib/guidesData';
import { useERP } from '@/src/services/erpStore';

interface GuideArticleRecord {
  id: string;
  slug: string;
  category: GuideCategory;
  title: string;
  titleBn?: string | null;
  seoTitle?: string | null;
  metaDescription: string;
  summary: string;
  content: string;
  featuredImage?: string | null;
  readingTime: string;
  author: string;
  authorRole: string;
  isFeatured: boolean;
  isPublished: boolean;
  views: number;
  publishedAt: string;
  updatedAt: string;
  priceTable?: any[];
  comparisonTable?: any;
  faqs?: any[];
  relatedSkus?: string[];
}

export const GuidesCmsManager: React.FC = () => {
  const { products } = useERP();
  const [articles, setArticles] = useState<GuideArticleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<GuideArticleRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [titleBn, setTitleBn] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<GuideCategory>('prices');
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [readingTime, setReadingTime] = useState('6 min read');
  const [author, setAuthor] = useState('Amdadur Rahman');
  const [authorRole, setAuthorRole] = useState('Founder & Managing Director');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [selectedSkus, setSelectedSkus] = useState<string[]>([]);

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/guides');
      const json = await res.json();
      if (json.success) {
        setArticles(json.data || []);
      } else {
        throw new Error(json.error || 'Failed to fetch guide articles');
      }
    } catch (err: any) {
      console.error('Fetch guide articles error:', err);
      setError(err.message || 'Failed to load guide articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const openCreateModal = () => {
    setEditingArticle(null);
    setTitle('');
    setTitleBn('');
    setSlug('');
    setCategory('prices');
    setSeoTitle('');
    setMetaDescription('');
    setSummary('');
    setContent('');
    setReadingTime('6 min read');
    setAuthor('Amdadur Rahman');
    setAuthorRole('Founder & Managing Director');
    setIsFeatured(false);
    setIsPublished(true);
    setSelectedSkus([]);
    setIsModalOpen(true);
  };

  const openEditModal = (article: GuideArticleRecord) => {
    setEditingArticle(article);
    setTitle(article.title);
    setTitleBn(article.titleBn || '');
    setSlug(article.slug);
    setCategory(article.category);
    setSeoTitle(article.seoTitle || '');
    setMetaDescription(article.metaDescription);
    setSummary(article.summary);
    setContent(article.content);
    setReadingTime(article.readingTime || '6 min read');
    setAuthor(article.author);
    setAuthorRole(article.authorRole || 'Founder & Managing Director');
    setIsFeatured(article.isFeatured);
    setIsPublished(article.isPublished);
    setSelectedSkus((article.relatedSkus as string[]) || []);
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingArticle) {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Title and content are required.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        titleBn: titleBn.trim() || null,
        slug: slugify(slug || title),
        category,
        seoTitle: seoTitle.trim() || null,
        metaDescription: metaDescription.trim() || summary.trim() || title,
        summary: summary.trim() || title,
        content,
        readingTime,
        author,
        authorRole,
        isFeatured,
        isPublished,
        relatedSkus: selectedSkus,
      };

      const url = editingArticle ? `/api/guides/${editingArticle.id}` : '/api/guides';
      const method = editingArticle ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Failed to save guide article');
      }

      setIsModalOpen(false);
      fetchArticles();
    } catch (err: any) {
      alert(err.message || 'Failed to save guide article');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (article: GuideArticleRecord) => {
    try {
      const res = await fetch(`/api/guides/${article.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !article.isPublished }),
      });
      const json = await res.json();
      if (json.success) {
        setArticles(prev =>
          prev.map(a => (a.id === article.id ? { ...a, isPublished: !a.isPublished } : a))
        );
      }
    } catch (err) {
      console.error('Toggle publish error:', err);
    }
  };

  const handleDelete = async (article: GuideArticleRecord) => {
    if (!confirm(`Are you sure you want to delete "${article.title}"?`)) return;

    try {
      const res = await fetch(`/api/guides/${article.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setArticles(prev => prev.filter(a => a.id !== article.id));
      } else {
        alert(json.error || 'Failed to delete article');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredArticles = articles.filter(a => {
    const matchesCategory = selectedCategory === 'ALL' || a.category === selectedCategory;
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0c1322] border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#008CFF]/20 text-[#008CFF]">
              <BookOpen size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Content SEO Hub &amp; Guides CMS</h1>
              <p className="text-xs text-slate-400">
                Manage Price Guides, Comparisons, Buying Guides, and Technical FAQs
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchArticles}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Refresh Guides"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>

          <a
            href="/guides"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <Eye size={14} />
            <span>View Live Hub</span>
            <ExternalLink size={12} className="text-slate-400" />
          </a>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-[#008CFF] hover:bg-blue-600 text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
          >
            <Plus size={16} />
            <span>Create New Guide</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#0c1322] border border-slate-800 p-3 rounded-xl text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-400 font-semibold px-2">Category:</span>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              selectedCategory === 'ALL' ? 'bg-[#008CFF] text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Categories ({articles.length})
          </button>
          {GUIDE_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                selectedCategory === cat.id ? 'bg-[#008CFF] text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.title} ({articles.filter(a => a.category === cat.id).length})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search guides by title..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:border-[#008CFF]"
          />
          <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-[#0c1322] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Article Title &amp; Category</th>
                <th className="py-3.5 px-4">Canonical Slug</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Featured</th>
                <th className="py-3.5 px-4">Updated</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-950 text-cyan-300 border border-blue-900">
                          {article.category}
                        </span>
                        <p className="font-bold text-white text-sm line-clamp-1">{article.title}</p>
                        {article.titleBn && (
                          <p className="text-[11px] text-cyan-400 line-clamp-1">{article.titleBn}</p>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      /guides/{article.category}/{article.slug}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => handleTogglePublish(article)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors ${
                          article.isPublished
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {article.isPublished ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        <span>{article.isPublished ? 'Published' : 'Draft'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {article.isFeatured ? (
                        <span className="inline-flex items-center gap-1 text-amber-400 text-[11px] font-bold">
                          <Sparkles size={13} /> Yes
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(article.updatedAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/guides/${article.category}/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
                          title="Preview Live Guide"
                        >
                          <ExternalLink size={14} />
                        </a>
                        <button
                          onClick={() => openEditModal(article)}
                          className="p-1.5 rounded-lg bg-blue-900/40 text-cyan-400 hover:bg-blue-800/60"
                          title="Edit Guide"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(article)}
                          className="p-1.5 rounded-lg bg-rose-950/40 text-rose-400 hover:bg-rose-900/60"
                          title="Delete Guide"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No articles match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b1320] border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-slate-100 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  {editingArticle ? 'Edit Guide Article' : 'Create New Guide Article'}
                </h3>
                <p className="text-xs text-slate-400">
                  Update article content, SEO metadata, verified prices, and product links.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Article Title (English) *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Laptop Price in Bangladesh: 2026 Guide"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#008CFF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Bangla Title (Optional)</label>
                  <input
                    type="text"
                    value={titleBn}
                    onChange={(e) => setTitleBn(e.target.value)}
                    placeholder="বাংলা শিরোনাম"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#008CFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as GuideCategory)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#008CFF]"
                  >
                    <option value="prices">Price Guides (/guides/prices)</option>
                    <option value="comparisons">Product Comparisons (/guides/comparisons)</option>
                    <option value="buying-guides">Buying Guides (/guides/buying-guides)</option>
                    <option value="faqs">Technical FAQs (/guides/faqs)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="laptop-price-in-bangladesh"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-cyan-400 focus:outline-none focus:border-[#008CFF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Estimated Reading Time</label>
                  <input
                    type="text"
                    value={readingTime}
                    onChange={(e) => setReadingTime(e.target.value)}
                    placeholder="6 min read"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#008CFF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">SEO Meta Title</label>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Optimized 60-char title for Google"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#008CFF]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Meta Description</label>
                  <input
                    type="text"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="150-160 char snippet for search results"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#008CFF]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Summary / Introduction Paragraph *</label>
                <textarea
                  rows={2}
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Concise overview summarizing key findings..."
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-[#008CFF]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-300">Full Article Content (Markdown) *</label>
                <textarea
                  rows={8}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write complete article using markdown headings (##, ###), bullet lists, and tables..."
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-white focus:outline-none focus:border-[#008CFF]"
                />
              </div>

              {/* Related Real Product SKUs Selector */}
              <div className="space-y-2 p-3 bg-slate-900 rounded-xl border border-slate-800">
                <label className="font-bold text-slate-300 flex items-center justify-between">
                  <span>Linked In-Stock Products (from Active Catalog)</span>
                  <span className="text-slate-400 font-normal">{selectedSkus.length} selected</span>
                </label>
                <div className="max-h-36 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 bg-slate-950 rounded-lg">
                  {products.map(prod => {
                    const isSelected = selectedSkus.includes(prod.sku);
                    return (
                      <button
                        type="button"
                        key={prod.id}
                        onClick={() => {
                          setSelectedSkus(prev =>
                            isSelected ? prev.filter(s => s !== prod.sku) : [...prev, prod.sku]
                          );
                        }}
                        className={`p-2 rounded-lg text-left text-[11px] border transition-colors flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#008CFF]/20 border-[#008CFF] text-cyan-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span className="truncate pr-1">{prod.name}</span>
                        {isSelected && <Check size={12} className="text-[#008CFF] shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded text-[#008CFF] focus:ring-0"
                  />
                  <span className="font-bold text-slate-300">Feature on Guides Hub Hero</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="rounded text-[#008CFF] focus:ring-0"
                  />
                  <span className="font-bold text-emerald-400">Published Live (Indexable)</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-[#008CFF] hover:bg-blue-600 text-white font-bold transition-colors shadow-lg shadow-blue-500/20"
                >
                  {submitting ? 'Saving...' : editingArticle ? 'Update Article' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

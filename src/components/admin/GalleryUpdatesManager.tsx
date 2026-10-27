'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  Camera, Plus, Search, Filter, Edit2, Trash2, Eye, Share2,
  CheckCircle2, AlertCircle, Sparkles, Pin, PinOff, Upload,
  X, Calendar, Tag, Layers, RefreshCw, ShoppingBag, ExternalLink,
  ChevronUp, ChevronDown, Check, FolderPlus, ToggleLeft, ToggleRight,
  Globe, AlertTriangle, ArrowRight, Image as ImageIcon
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { useLanguage } from '../../services/languageContext';
import { slugify } from '@/lib/seoConfig';

interface GalleryImage {
  url: string;
  caption?: string;
  captionBn?: string;
  alt?: string;
  order?: number;
}

interface GalleryPost {
  id: string;
  title: string;
  titleBn?: string | null;
  slug: string;
  description?: string | null;
  descriptionBn?: string | null;
  categoryId?: string | null;
  categoryName: string;
  coverImage: string;
  images: GalleryImage[];
  tags: string[];
  productId?: string | null;
  destinationUrl?: string | null;
  isPinned: boolean;
  isPublished: boolean;
  publishedAt: string | Date;
  views: number;
  createdAt: string | Date;
  category?: {
    id: string;
    name: string;
    nameBn?: string | null;
    slug: string;
  } | null;
  product?: {
    id: string;
    name: string;
    sku: string;
    category: string;
    retailPrice: number;
    imageUrl?: string | null;
  } | null;
}

interface GalleryCategory {
  id: string;
  name: string;
  nameBn?: string | null;
  slug: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
  postCount?: number;
}

export const GalleryUpdatesManager: React.FC = () => {
  const { addToast } = useERP();
  const { isBangla } = useLanguage();

  const [activeTab, setActiveTab] = useState<'posts' | 'categories'>('posts');
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [categories, setCategories] = useState<GalleryCategory[]>([]);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({ total: 0, published: 0, drafts: 0 });

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Modal States
  const [isPostModalOpen, setIsPostModalOpen] = useState<boolean>(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [editingPost, setEditingPost] = useState<GalleryPost | null>(null);
  const [editingCategory, setEditingCategory] = useState<GalleryCategory | null>(null);
  const [previewPost, setPreviewPost] = useState<GalleryPost | null>(null);

  // Post Form State
  const [formTitle, setFormTitle] = useState<string>('');
  const [formTitleBn, setFormTitleBn] = useState<string>('');
  const [formSlug, setFormSlug] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formDescriptionBn, setFormDescriptionBn] = useState<string>('');
  const [formCategoryId, setFormCategoryId] = useState<string>('');
  const [formCoverImage, setFormCoverImage] = useState<string>('');
  const [formImages, setFormImages] = useState<GalleryImage[]>([]);
  const [formTags, setFormTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');
  const [formProductId, setFormProductId] = useState<string>('');
  const [formDestinationUrl, setFormDestinationUrl] = useState<string>('');
  const [formIsPinned, setFormIsPinned] = useState<boolean>(false);
  const [formIsPublished, setFormIsPublished] = useState<boolean>(true);
  const [formPublishedAt, setFormPublishedAt] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgressText, setUploadProgressText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category Form State
  const [catName, setCatName] = useState<string>('');
  const [catNameBn, setCatNameBn] = useState<string>('');
  const [catSlug, setCatSlug] = useState<string>('');
  const [catDesc, setCatDesc] = useState<string>('');
  const [catSortOrder, setCatSortOrder] = useState<number>(0);
  const [catIsActive, setCatIsActive] = useState<boolean>(true);

  // Fetch initial posts and categories
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '';
      const [postsRes, catsRes] = await Promise.all([
        fetch('/api/admin/gallery', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/admin/gallery/categories', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const postsData = await postsRes.json();
      const catsData = await catsRes.json();

      if (postsData.success) {
        setPosts(postsData.data.posts || []);
        setStats(postsData.data.stats || { total: 0, published: 0, drafts: 0 });
        setAvailableProducts(postsData.data.products || []);
      }

      if (catsData.success) {
        setCategories(catsData.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load gallery admin data:', err);
      addToast('error', 'Network Error', 'Failed to fetch gallery updates.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered posts for view
  const filteredPosts = posts.filter((p) => {
    const matchCat = categoryFilter === 'all' || p.categoryId === categoryFilter;
    const matchStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && p.isPublished) ||
      (statusFilter === 'draft' && !p.isPublished);

    if (!searchQuery.trim()) return matchCat && matchStatus;

    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      p.title.toLowerCase().includes(q) ||
      (p.titleBn && p.titleBn.toLowerCase().includes(q)) ||
      p.categoryName.toLowerCase().includes(q) ||
      (Array.isArray(p.tags) && p.tags.some((t) => t.toLowerCase().includes(q)));

    return matchCat && matchStatus && matchSearch;
  });

  // Handle Multi-file Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '';
    const uploadedImages: GalleryImage[] = [...formImages];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgressText(`Uploading image ${i + 1} of ${files.length}...`);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', 'gallery');

        const res = await fetch('/api/storage/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const data = await res.json();
        if (data.success && data.publicUrl) {
          uploadedImages.push({
            url: data.publicUrl,
            caption: '',
            captionBn: '',
            alt: file.name.replace(/\.[^/.]+$/, ''),
            order: uploadedImages.length + 1,
          });

          // Set first uploaded image as cover image if cover image is empty
          if (!formCoverImage) {
            setFormCoverImage(data.publicUrl);
          }
        } else {
          addToast('error', 'Upload Warning', data.error || `Failed to upload ${file.name}`);
        }
      }

      setFormImages(uploadedImages);
      addToast('success', 'Images Uploaded', `${files.length} photo(s) added successfully.`);
    } catch (err: any) {
      console.error('Upload error:', err);
      addToast('error', 'Upload Error', err.message);
    } finally {
      setIsUploading(false);
      setUploadProgressText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Open Create / Edit Modal
  const openPostModal = (postToEdit?: GalleryPost) => {
    if (postToEdit) {
      setEditingPost(postToEdit);
      setFormTitle(postToEdit.title);
      setFormTitleBn(postToEdit.titleBn || '');
      setFormSlug(postToEdit.slug);
      setFormDescription(postToEdit.description || '');
      setFormDescriptionBn(postToEdit.descriptionBn || '');
      setFormCategoryId(postToEdit.categoryId || '');
      setFormCoverImage(postToEdit.coverImage);
      setFormImages(
        Array.isArray(postToEdit.images) && postToEdit.images.length > 0
          ? postToEdit.images
          : [{ url: postToEdit.coverImage, order: 1 }]
      );
      setFormTags(Array.isArray(postToEdit.tags) ? postToEdit.tags : []);
      setFormProductId(postToEdit.productId || '');
      setFormDestinationUrl(postToEdit.destinationUrl || '');
      setFormIsPinned(postToEdit.isPinned);
      setFormIsPublished(postToEdit.isPublished);
      setFormPublishedAt(
        new Date(postToEdit.publishedAt).toISOString().split('T')[0]
      );
    } else {
      setEditingPost(null);
      setFormTitle('');
      setFormTitleBn('');
      setFormSlug('');
      setFormDescription('');
      setFormDescriptionBn('');
      setFormCategoryId(categories[0]?.id || '');
      setFormCoverImage('');
      setFormImages([]);
      setFormTags([]);
      setFormProductId('');
      setFormDestinationUrl('');
      setFormIsPinned(false);
      setFormIsPublished(true);
      setFormPublishedAt(new Date().toISOString().split('T')[0]);
    }
    setIsPostModalOpen(true);
  };

  // Save Post (Create / Update)
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      addToast('error', 'Validation Error', 'Post title is required.');
      return;
    }

    if (!formCoverImage.trim()) {
      addToast('error', 'Validation Error', 'Cover image is required. Please upload or paste a photo.');
      return;
    }

    setIsSubmitting(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '';

    try {
      const payload = {
        id: editingPost?.id,
        title: formTitle,
        titleBn: formTitleBn,
        slug: formSlug ? slugify(formSlug) : slugify(formTitle),
        description: formDescription,
        descriptionBn: formDescriptionBn,
        categoryId: formCategoryId || null,
        coverImage: formCoverImage,
        images: formImages.length > 0 ? formImages : [{ url: formCoverImage, order: 1 }],
        tags: formTags,
        productId: formProductId || null,
        destinationUrl: formDestinationUrl,
        isPinned: formIsPinned,
        isPublished: formIsPublished,
        publishedAt: formPublishedAt,
      };

      const res = await fetch('/api/admin/gallery', {
        method: editingPost ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        addToast(
          'success',
          'Post Saved',
          editingPost ? 'Gallery post updated successfully.' : 'New gallery update published.'
        );
        setIsPostModalOpen(false);
        fetchData();
      } else {
        addToast('error', 'Save Failed', data.error || 'Failed to save post.');
      }
    } catch (err: any) {
      console.error('Save post error:', err);
      addToast('error', 'Save Error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Toggle Published / Pinned
  const handleToggleStatus = async (id: string, action: 'toggle_publish' | 'toggle_pin') => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '';
    try {
      const res = await fetch('/api/admin/gallery', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (data.success) {
        addToast('success', 'Status Updated', data.message);
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id === id) {
              if (action === 'toggle_publish') return { ...p, isPublished: !p.isPublished };
              if (action === 'toggle_pin') return { ...p, isPinned: !p.isPinned };
            }
            return p;
          })
        );
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  // Delete Post
  const handleDeletePost = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this gallery update?')) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '';
    try {
      const res = await fetch(`/api/admin/gallery?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        addToast('success', 'Deleted', 'Gallery post deleted.');
        setPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        addToast('error', 'Delete Failed', data.error);
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  // Open Category Modal
  const openCategoryModal = (catToEdit?: GalleryCategory) => {
    if (catToEdit) {
      setEditingCategory(catToEdit);
      setCatName(catToEdit.name);
      setCatNameBn(catToEdit.nameBn || '');
      setCatSlug(catToEdit.slug);
      setCatDesc(catToEdit.description || '');
      setCatSortOrder(catToEdit.sortOrder);
      setCatIsActive(catToEdit.isActive);
    } else {
      setEditingCategory(null);
      setCatName('');
      setCatNameBn('');
      setCatSlug('');
      setCatDesc('');
      setCatSortOrder(categories.length + 1);
      setCatIsActive(true);
    }
    setIsCategoryModalOpen(true);
  };

  // Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) {
      addToast('error', 'Validation Error', 'Category name is required.');
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '';
    try {
      const payload = {
        id: editingCategory?.id,
        name: catName,
        nameBn: catNameBn,
        slug: catSlug ? slugify(catSlug) : slugify(catName),
        description: catDesc,
        sortOrder: Number(catSortOrder),
        isActive: catIsActive,
      };

      const res = await fetch('/api/admin/gallery/categories', {
        method: editingCategory ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        addToast('success', 'Category Saved', 'Category saved successfully.');
        setIsCategoryModalOpen(false);
        fetchData();
      } else {
        addToast('error', 'Save Failed', data.error);
      }
    } catch (err: any) {
      addToast('error', 'Save Error', err.message);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Delete this category? Any associated posts will be moved to General.')) return;
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') || '' : '';
    try {
      const res = await fetch(`/api/admin/gallery/categories?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        addToast('success', 'Category Deleted', 'Category removed.');
        fetchData();
      } else {
        addToast('error', 'Delete Failed', data.error);
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message);
    }
  };

  // Tag Handlers
  const handleAddTag = () => {
    if (tagInput.trim() && !formTags.includes(tagInput.trim())) {
      setFormTags([...formTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (t: string) => {
    setFormTags(formTags.filter((tag) => tag !== t));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#002B5B] via-[#003B7B] to-[#008CFF] rounded-2xl p-6 text-white shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-blue-100 border border-white/20">
              <Camera size={13} className="text-cyan-300" />
              <span>NEED ELECTRO ERP — Official Photo Feed &amp; Updates</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Gallery &amp; Business Updates Manager
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Upload real showroom photos, new laptop arrivals, CCTV installations, customer deliveries, and company announcements. Synced seamlessly across public website and homepage.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <a
              href="/gallery"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ExternalLink size={14} />
              <span>View Live Gallery</span>
            </a>
            <button
              type="button"
              onClick={() => openPostModal()}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Plus size={16} />
              <span>Create New Update</span>
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/15 text-xs">
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <div className="text-blue-200 text-[11px] font-semibold">Total Posts</div>
            <div className="text-xl font-black text-white">{stats.total}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <div className="text-emerald-300 text-[11px] font-semibold">Live Published</div>
            <div className="text-xl font-black text-white">{stats.published}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <div className="text-amber-300 text-[11px] font-semibold">Drafts</div>
            <div className="text-xl font-black text-white">{stats.drafts}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3 backdrop-blur-xs">
            <div className="text-cyan-200 text-[11px] font-semibold">Active Categories</div>
            <div className="text-xl font-black text-white">{categories.length}</div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex items-center gap-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('posts')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'posts'
                ? 'border-[#008CFF] text-[#008CFF]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Camera size={15} />
            <span>Photo Posts &amp; Updates ({posts.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`pb-3 px-1 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'border-[#008CFF] text-[#008CFF]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers size={15} />
            <span>Manage Categories ({categories.length})</span>
          </button>
        </div>

        <button
          type="button"
          onClick={fetchData}
          title="Refresh"
          className="p-1.5 text-slate-500 hover:text-[#008CFF] rounded-lg transition-colors"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* TAB 1: POSTS LIST VIEW */}
      {activeTab === 'posts' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search size={15} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search updates by title, category, or tag..."
                className="w-full text-xs outline-none bg-transparent placeholder:text-slate-400 text-slate-700"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 overflow-x-auto text-xs">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                aria-label="Filter gallery updates by category"
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none font-medium"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                aria-label="Filter gallery updates by publication status"
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 outline-none font-medium"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>
            </div>
          </div>

          {/* Posts Table / Grid */}
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading gallery updates...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center space-y-3">
              <Camera size={32} className="mx-auto text-slate-300" />
              <p className="text-xs text-slate-500 font-semibold">No gallery posts found.</p>
              <button
                type="button"
                onClick={() => openPostModal()}
                className="px-4 py-2 rounded-xl bg-[#008CFF] text-white font-bold text-xs shadow-xs"
              >
                Create First Update
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Photo / Cover</th>
                      <th className="py-3 px-4">Title &amp; Category</th>
                      <th className="py-3 px-4">Linked Product</th>
                      <th className="py-3 px-4">Published Date</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Pinned</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="relative w-14 h-11 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                            <Image
                              src={post.coverImage}
                              alt={post.title}
                              fill
                              className="object-cover"
                            />
                            {Array.isArray(post.images) && post.images.length > 1 && (
                              <span className="absolute bottom-0 right-0 bg-black/75 text-white text-[9px] font-bold px-1 rounded-tl">
                                +{post.images.length}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-bold text-[#002B5B] line-clamp-1">{post.title}</div>
                          {post.titleBn && (
                            <div className="text-[11px] text-slate-500 line-clamp-1">{post.titleBn}</div>
                          )}
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-semibold text-[#008CFF] bg-blue-50 px-2 py-0.2 rounded-md">
                              {post.categoryName}
                            </span>
                            <span className="text-[10px] text-slate-400">/{post.slug}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 max-w-[180px]">
                          {post.product ? (
                            <div>
                              <div className="font-bold text-[#008CFF] line-clamp-1 flex items-center gap-1">
                                <ShoppingBag size={12} />
                                <span>{post.product.name}</span>
                              </div>
                              <div className="text-[10px] text-slate-400">
                                ৳{Number(post.product.retailPrice).toLocaleString()} BDT
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">None</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(post.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(post.id, 'toggle_publish')}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                              post.isPublished
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {post.isPublished ? 'Live' : 'Draft'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(post.id, 'toggle_pin')}
                            title={post.isPinned ? 'Unpin from top' : 'Pin to top'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              post.isPinned
                                ? 'bg-amber-100 text-amber-800'
                                : 'text-slate-300 hover:text-amber-500'
                            }`}
                          >
                            <Pin size={14} className={post.isPinned ? 'fill-current' : ''} />
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openPostModal(post)}
                              title="Edit Post"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-[#008CFF] hover:bg-blue-50 transition-colors"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePost(post.id)}
                              title="Delete Post"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CATEGORIES VIEW */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#002B5B]">Gallery Categories &amp; Tags</h2>
            <button
              type="button"
              onClick={() => openCategoryModal()}
              className="px-3.5 py-2 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Plus size={14} />
              <span>Add New Category</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Category Name (EN)</th>
                  <th className="py-3 px-4">Category Name (BN)</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4 text-center">Posts Count</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-500">{cat.sortOrder}</td>
                    <td className="py-3 px-4 font-bold text-[#002B5B]">{cat.name}</td>
                    <td className="py-3 px-4 text-slate-600">{cat.nameBn || '—'}</td>
                    <td className="py-3 px-4 font-mono text-slate-400">/{cat.slug}</td>
                    <td className="py-3 px-4 text-center font-bold text-[#008CFF]">
                      {cat.postCount || 0}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          cat.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {cat.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openCategoryModal(cat)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#008CFF] hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE / EDIT GALLERY POST */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden my-4">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <h3 className="font-bold text-base text-[#002B5B] flex items-center gap-2">
                <Camera size={18} className="text-[#008CFF]" />
                <span>{editingPost ? 'Edit Gallery Post & Update' : 'New Gallery Post & Business Update'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPostModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSavePost} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">
                    Post Title (English) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => {
                      setFormTitle(e.target.value);
                      if (!editingPost && !formSlug) {
                        setFormSlug(slugify(e.target.value));
                      }
                    }}
                    placeholder="e.g. Fresh Shipment of HP EliteBook Laptops"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008CFF] text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Post Title (Bangla)</label>
                  <input
                    type="text"
                    value={formTitleBn}
                    onChange={(e) => setFormTitleBn(e.target.value)}
                    placeholder="e.g. এইচপি এলিটবুক ল্যাপটপের নতুন স্টক এসে পৌঁছেছে"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008CFF] text-slate-800"
                  />
                </div>
              </div>

              {/* Slug & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">URL Slug</label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    placeholder="auto-generated-slug"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008CFF] text-slate-800 font-mono text-[11px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008CFF] text-slate-800"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Description (English)</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Details about this arrival, delivery, or update..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008CFF] text-slate-800 leading-relaxed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Description (Bangla)</label>
                  <textarea
                    rows={3}
                    value={formDescriptionBn}
                    onChange={(e) => setFormDescriptionBn(e.target.value)}
                    placeholder="এই ডেলিভারি বা পণ্যের বিস্তারিত বাংলা বিবরণ..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008CFF] text-slate-800 leading-relaxed"
                  />
                </div>
              </div>

              {/* Photo Upload Zone */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-[#008CFF]" />
                    <span>Upload Photos &amp; Image Gallery</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Max 5MB per photo (JPEG, PNG, WebP)
                  </span>
                </div>

                {/* Upload Action Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-[#008CFF] rounded-2xl p-6 text-center cursor-pointer transition-all bg-slate-50 hover:bg-blue-50/50 group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                  <Upload
                    size={24}
                    className="mx-auto text-slate-400 group-hover:text-[#008CFF] transition-colors mb-2"
                  />
                  <div className="font-bold text-[#002B5B] text-xs">
                    {isUploading ? uploadProgressText : 'Click to Upload Multiple Photos'}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Select 1 or more images from your computer or phone.
                  </p>
                </div>

                {/* Cover Image URL field */}
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-bold text-slate-600">
                    Cover Image URL (Direct Link)
                  </label>
                  <input
                    type="text"
                    required
                    value={formCoverImage}
                    onChange={(e) => setFormCoverImage(e.target.value)}
                    placeholder="/banners/need-electro-laptops-flagship.jpg or https://..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008CFF] text-slate-800 font-mono text-[11px]"
                  />
                </div>

                {/* Thumbnails Preview List */}
                {formImages.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-bold text-slate-700">
                      Uploaded Images ({formImages.length}):
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {formImages.map((img, idx) => {
                        const isCover = img.url === formCoverImage;
                        return (
                          <div
                            key={idx}
                            className={`relative rounded-xl overflow-hidden border p-1 bg-white space-y-1 ${
                              isCover ? 'border-[#008CFF] ring-2 ring-[#008CFF]/20' : 'border-slate-200'
                            }`}
                          >
                            <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-slate-100">
                              <Image src={img.url} alt="Photo" fill className="object-cover" />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = formImages.filter((_, i) => i !== idx);
                                  setFormImages(updated);
                                  if (isCover && updated.length > 0) {
                                    setFormCoverImage(updated[0].url);
                                  }
                                }}
                                className="absolute top-1 right-1 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-full transition-colors"
                              >
                                <X size={10} />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => setFormCoverImage(img.url)}
                              className={`w-full py-0.5 rounded text-[10px] font-bold transition-colors ${
                                isCover
                                  ? 'bg-[#008CFF] text-white'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {isCover ? 'Cover Photo' : 'Set as Cover'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Linked Product & Custom URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1.5">
                    <ShoppingBag size={13} className="text-[#008CFF]" />
                    <span>Link to Catalog Product</span>
                  </label>
                  <select
                    value={formProductId}
                    onChange={(e) => setFormProductId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008CFF] text-slate-800"
                  >
                    <option value="">None (General Update)</option>
                    {availableProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (SKU: {p.sku}) — ৳{p.retailPrice.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Custom Destination URL (Optional)</label>
                  <input
                    type="text"
                    value={formDestinationUrl}
                    onChange={(e) => setFormDestinationUrl(e.target.value)}
                    placeholder="/services/cctv-installation"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008CFF] text-slate-800"
                  />
                </div>
              </div>

              {/* Tags & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Tags</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="Add tag and press Enter..."
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800 text-xs"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                    >
                      Add
                    </button>
                  </div>

                  {formTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {formTags.map((t, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-[#008CFF] flex items-center gap-1"
                        >
                          #{t}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(t)}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Publication Date</label>
                  <input
                    type="date"
                    value={formPublishedAt}
                    onChange={(e) => setFormPublishedAt(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-800"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 border-t border-slate-100 pt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPublished}
                    onChange={(e) => setFormIsPublished(e.target.checked)}
                    className="rounded text-[#008CFF] focus:ring-0 w-4 h-4"
                  />
                  <span className="font-bold text-slate-700">Publish to Live Gallery</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsPinned}
                    onChange={(e) => setFormIsPinned(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-0 w-4 h-4"
                  />
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Pin size={13} className="text-amber-500" />
                    <span>Pin to Top of Gallery &amp; Feed</span>
                  </span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPostModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white font-bold text-xs shadow-md shadow-blue-500/20 disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSubmitting ? 'Saving Update...' : editingPost ? 'Update Post' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE / EDIT CATEGORY */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-sm text-[#002B5B]">
                {editingCategory ? 'Edit Gallery Category' : 'Add New Category'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Category Name (English) *</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => {
                    setCatName(e.target.value);
                    if (!editingCategory && !catSlug) setCatSlug(slugify(e.target.value));
                  }}
                  placeholder="e.g. Completed Projects"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008CFF]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Category Name (Bangla)</label>
                <input
                  type="text"
                  value={catNameBn}
                  onChange={(e) => setCatNameBn(e.target.value)}
                  placeholder="e.g. সম্পন্ন হওয়া প্রজেক্টসমূহ"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[#008CFF]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Slug</label>
                <input
                  type="text"
                  value={catSlug}
                  onChange={(e) => setCatSlug(e.target.value)}
                  placeholder="completed-projects"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Description</label>
                <input
                  type="text"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  placeholder="Short description..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Sort Order</label>
                  <input
                    type="number"
                    value={catSortOrder}
                    onChange={(e) => setCatSortOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={catIsActive}
                      onChange={(e) => setCatIsActive(e.target.checked)}
                      className="rounded text-[#008CFF]"
                    />
                    <span className="font-bold text-slate-700">Active</span>
                  </label>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white font-bold"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

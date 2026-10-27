'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Camera, Search, Filter, Calendar, Tag, ChevronLeft, ChevronRight,
  X, Share2, ExternalLink, Check, ShoppingBag, Eye, ArrowRight,
  Sparkles, Layers, ShieldCheck, Phone, MessageCircle, Clock, MapPin
} from 'lucide-react';
import { useLanguage } from '@/src/services/languageContext';
import { BUSINESS_INFO, slugify } from '@/lib/seoConfig';

export interface GalleryImageItem {
  url: string;
  caption?: string;
  captionBn?: string;
  alt?: string;
  order?: number;
}

export interface GalleryPostItem {
  id: string;
  title: string;
  titleBn?: string | null;
  slug: string;
  description?: string | null;
  descriptionBn?: string | null;
  categoryId?: string | null;
  categoryName: string;
  coverImage: string;
  images: GalleryImageItem[] | any;
  tags?: string[] | any;
  productId?: string | null;
  destinationUrl?: string | null;
  isPinned: boolean;
  isPublished: boolean;
  publishedAt: string | Date;
  views: number;
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
    brand: string;
    retailPrice: number;
    currentStock: number;
    imageUrl?: string | null;
    status: string;
  } | null;
}

export interface GalleryCategoryItem {
  id: string;
  name: string;
  nameBn?: string | null;
  slug: string;
  description?: string | null;
  count?: number;
}

interface GalleryViewClientProps {
  initialPosts: GalleryPostItem[];
  categories: GalleryCategoryItem[];
}

export const GalleryViewClient: React.FC<GalleryViewClientProps> = ({
  initialPosts,
  categories,
}) => {
  const { isBangla } = useLanguage();
  const [posts, setPosts] = useState<GalleryPostItem[]>(initialPosts);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeLightboxPost, setActiveLightboxPost] = useState<GalleryPostItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(18);

  // Filter posts based on category and search query
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Category match
      const matchesCategory =
        selectedCategory === 'all' ||
        post.category?.slug === selectedCategory ||
        post.categoryId === selectedCategory;

      if (!matchesCategory) return false;

      // Search match
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const titleMatch =
        post.title.toLowerCase().includes(q) ||
        (post.titleBn && post.titleBn.toLowerCase().includes(q));
      const descMatch =
        (post.description && post.description.toLowerCase().includes(q)) ||
        (post.descriptionBn && post.descriptionBn.toLowerCase().includes(q));
      const catMatch = post.categoryName.toLowerCase().includes(q);
      const tagMatch =
        Array.isArray(post.tags) &&
        post.tags.some((t: string) => t.toLowerCase().includes(q));

      return titleMatch || descMatch || catMatch || tagMatch;
    });
  }, [posts, selectedCategory, searchQuery]);

  // Paginated visible slice
  const displayedPosts = useMemo(() => {
    return filteredPosts.slice(0, visibleCount);
  }, [filteredPosts, visibleCount]);

  // Helper to get normalized images array
  const getPostImages = useCallback((post: GalleryPostItem): GalleryImageItem[] => {
    if (Array.isArray(post.images) && post.images.length > 0) {
      return post.images.map((img: any, idx: number) => {
        if (typeof img === 'string') {
          return { url: img, alt: post.title, order: idx + 1 };
        }
        return {
          url: img.url || post.coverImage,
          caption: img.caption || '',
          captionBn: img.captionBn || '',
          alt: img.alt || post.title,
          order: img.order || idx + 1,
        };
      });
    }
    return [{ url: post.coverImage, alt: post.title, order: 1 }];
  }, []);

  // Lightbox navigation
  const openLightbox = (post: GalleryPostItem, index: number = 0) => {
    setActiveLightboxPost(post);
    setCurrentImageIndex(index);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  };

  const closeLightbox = () => {
    setActiveLightboxPost(null);
    setCurrentImageIndex(0);
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'auto';
    }
  };

  const nextImage = useCallback(() => {
    if (!activeLightboxPost) return;
    const images = getPostImages(activeLightboxPost);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [activeLightboxPost, getPostImages]);

  const prevImage = useCallback(() => {
    if (!activeLightboxPost) return;
    const images = getPostImages(activeLightboxPost);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [activeLightboxPost, getPostImages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeLightboxPost) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeLightboxPost, nextImage, prevImage]);

  // Handle Share functionality
  const handleShare = async (e: React.MouseEvent, post: GalleryPostItem) => {
    e.stopPropagation();
    const url = `${typeof window !== 'undefined' ? window.location.origin : BUSINESS_INFO.domain}/gallery?post=${post.slug}`;
    const shareData = {
      title: isBangla && post.titleBn ? post.titleBn : post.title,
      text: isBangla && post.descriptionBn ? post.descriptionBn : post.description || post.title,
      url,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        // Fallback to copy link
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      setCopiedId(post.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  // Format date helper
  const formatDate = (dateInput: string | Date) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(isBangla ? 'bn-BD' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-8">
      {/* Search & Category Filter Bar */}
      <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search Bar & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isBangla
                  ? 'গ্যালারি ফটো ও আপডেট খুঁজুন...'
                  : 'Search photo gallery, arrivals & projects...'
              }
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#008CFF] rounded-xl outline-none transition-all placeholder:text-slate-400 text-[#002B5B]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 self-end sm:self-auto">
            <Camera size={15} className="text-[#008CFF]" />
            <span>
              {isBangla ? 'মোট প্রকাশিত ফটো ও পোস্ট: ' : 'Showing: '}
              <strong className="text-[#002B5B]">{filteredPosts.length}</strong>{' '}
              {isBangla ? 'টি' : 'Updates'}
            </span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-[#002B5B] text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/70'
            }`}
          >
            <Layers size={13} />
            <span>{isBangla ? 'সব ছবি ও পোস্ট' : 'All Photos'}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {posts.length}
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#008CFF] text-white font-bold shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/70'
                }`}
              >
                <span>{isBangla && cat.nameBn ? cat.nameBn : cat.name}</span>
                {typeof cat.count === 'number' && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Gallery Cards Grid */}
      {displayedPosts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-[#008CFF] flex items-center justify-center mx-auto">
            <Camera size={26} />
          </div>
          <h3 className="font-bold text-base text-[#002B5B]">
            {isBangla ? 'কোনো ফটো বা আপডেট পাওয়া যায়নি' : 'No Gallery Posts Found'}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {isBangla
              ? 'আপনার অনুসন্ধান বা নির্বাচিত ক্যাটাগরির সাথে কোনো ফটো মেলেনি। অনুগ্রহ করে অন্য ক্যাটাগরি নির্বাচন করুন।'
              : 'No photos match your current search query or filter. Try choosing another category or clearing your search.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-[#008CFF] text-white font-bold text-xs shadow-xs hover:bg-[#0070cc] transition-colors"
          >
            {isBangla ? 'ফিল্টার রিসেট করুন' : 'Reset Filters'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {displayedPosts.map((post) => {
            const postImages = getPostImages(post);
            const title = isBangla && post.titleBn ? post.titleBn : post.title;
            const description =
              isBangla && post.descriptionBn ? post.descriptionBn : post.description;

            return (
              <article
                key={post.id}
                onClick={() => openLightbox(post, 0)}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-[#008CFF]/50 overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Image Container with Badge Overlay */}
                  <div className="relative aspect-4/3 sm:aspect-16/10 bg-slate-100 overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3.5">
                      <span className="text-white text-xs font-bold inline-flex items-center gap-1.5">
                        <Eye size={14} />
                        <span>{isBangla ? 'পূর্ণ ছবি দেখুন' : 'View Full Image'}</span>
                      </span>
                    </div>

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
                      {post.isPinned && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500 text-slate-950 shadow-xs flex items-center gap-1 uppercase tracking-wider">
                          <Sparkles size={11} />
                          <span>{isBangla ? 'পিন্ড' : 'Pinned'}</span>
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#002B5B]/90 text-white backdrop-blur-xs border border-white/20 shadow-xs">
                        {isBangla && post.category?.nameBn
                          ? post.category.nameBn
                          : post.categoryName}
                      </span>
                    </div>

                    {/* Multi-Photo Indicator Badge */}
                    {postImages.length > 1 && (
                      <div className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-xs">
                        <Camera size={12} />
                        <span>+{postImages.length}</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 sm:p-5 space-y-2.5">
                    {/* Date and Tags */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        <time dateTime={new Date(post.publishedAt).toISOString()}>
                          {formatDate(post.publishedAt)}
                        </time>
                      </span>
                      {post.views > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          <span>{post.views}</span>
                        </span>
                      )}
                    </div>

                    <h2 className="font-bold text-sm sm:text-base text-[#002B5B] group-hover:text-[#008CFF] transition-colors line-clamp-2 leading-snug">
                      {title}
                    </h2>

                    {description && (
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {description}
                      </p>
                    )}

                    {/* Tags Pills */}
                    {Array.isArray(post.tags) && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {post.tags.slice(0, 3).map((tag: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer: Linked Product & Share Actions */}
                <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 mt-2">
                  <div className="pt-3 flex items-center justify-between gap-2">
                    {post.product ? (
                      <Link
                        href={`/product/${slugify(post.product.name)}-${post.product.sku.toLowerCase()}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#008CFF] hover:text-[#0070cc] transition-colors"
                      >
                        <ShoppingBag size={13} />
                        <span className="truncate max-w-[170px] sm:max-w-[200px]">
                          {post.product.name}
                        </span>
                        <ArrowRight size={12} />
                      </Link>
                    ) : post.destinationUrl ? (
                      <Link
                        href={post.destinationUrl}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#008CFF] transition-colors"
                      >
                        <span>{isBangla ? 'বিস্তারিত দেখুন' : 'Explore Details'}</span>
                        <ExternalLink size={12} />
                      </Link>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400">
                        NEED ELECTRO Official
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(e) => handleShare(e, post)}
                      title={isBangla ? 'পোস্ট শেয়ার করুন' : 'Share Update'}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-[#008CFF] hover:bg-blue-50 transition-colors"
                    >
                      {copiedId === post.id ? (
                        <Check size={14} className="text-emerald-600" />
                      ) : (
                        <Share2 size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Progressive Load More Button */}
      {filteredPosts.length > visibleCount && (
        <div className="text-center pt-4">
          <button
            type="button"
            onClick={() => setVisibleCount((prev) => prev + 18)}
            className="px-6 py-2.5 rounded-xl bg-white hover:bg-[#EAF4FF] border border-slate-300 hover:border-[#008CFF] text-[#002B5B] hover:text-[#008CFF] font-bold text-xs transition-all shadow-xs"
          >
            {isBangla ? 'আরও ফটো লোড করুন' : 'Load More Photos'} (
            {filteredPosts.length - visibleCount} {isBangla ? 'বাকি' : 'remaining'})
          </button>
        </div>
      )}

      {/* Lightbox Modal */}
      {activeLightboxPost && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6"
          onClick={closeLightbox}
        >
          <div
            className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/80">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-[#008CFF] text-white">
                  {isBangla && activeLightboxPost.category?.nameBn
                    ? activeLightboxPost.category.nameBn
                    : activeLightboxPost.categoryName}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">
                  {formatDate(activeLightboxPost.publishedAt)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleShare(e, activeLightboxPost)}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Share"
                >
                  {copiedId === activeLightboxPost.id ? (
                    <Check size={16} className="text-emerald-400" />
                  ) : (
                    <Share2 size={16} />
                  )}
                </button>
                <button
                  type="button"
                  onClick={closeLightbox}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Close (Esc)"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Image Carousel Body */}
            <div className="relative flex-1 bg-black flex items-center justify-center min-h-[300px] sm:min-h-[440px] md:min-h-[500px]">
              {(() => {
                const images = getPostImages(activeLightboxPost);
                const currentImg = images[currentImageIndex] || images[0];

                return (
                  <>
                    <div className="relative w-full h-[320px] sm:h-[450px] md:h-[540px]">
                      <Image
                        src={currentImg.url}
                        alt={currentImg.alt || activeLightboxPost.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 1200px"
                        className="object-contain"
                        priority
                      />
                    </div>

                    {/* Prev / Next Controls */}
                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all hover:scale-105"
                          title="Previous Photo"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all hover:scale-105"
                          title="Next Photo"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}

                    {/* Image Caption overlay if present */}
                    {(currentImg.caption || currentImg.captionBn) && (
                      <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-md rounded-xl p-2.5 text-center text-xs text-slate-200 border border-white/10">
                        {isBangla && currentImg.captionBn
                          ? currentImg.captionBn
                          : currentImg.caption}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Modal Footer: Title, Description, and Actions */}
            <div className="p-4 sm:p-6 bg-slate-950 border-t border-slate-800 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    {isBangla && activeLightboxPost.titleBn
                      ? activeLightboxPost.titleBn
                      : activeLightboxPost.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                    {isBangla && activeLightboxPost.descriptionBn
                      ? activeLightboxPost.descriptionBn
                      : activeLightboxPost.description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  {activeLightboxPost.product && (
                    <Link
                      href={`/product/${slugify(activeLightboxPost.product.name)}-${activeLightboxPost.product.sku.toLowerCase()}`}
                      className="px-3.5 py-2 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
                    >
                      <ShoppingBag size={14} />
                      <span>{isBangla ? 'পণ্যটি কিনুন' : 'View Product'}</span>
                    </Link>
                  )}

                  <a
                    href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20NEED%20ELECTRO%2C%20I%20am%20inquiring%20about%20your%20gallery%20update:%20${encodeURIComponent(activeLightboxPost.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp Inquiry</span>
                  </a>
                </div>
              </div>

              {/* Thumbnails row if multiple images */}
              {(() => {
                const images = getPostImages(activeLightboxPost);
                if (images.length <= 1) return null;

                return (
                  <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800 scrollbar-none">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                          idx === currentImageIndex
                            ? 'border-[#008CFF] scale-105'
                            : 'border-slate-700 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={img.url}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

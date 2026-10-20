'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag, Check, Heart, ShieldCheck,
  Zap, MessageCircle, ArrowRight
} from 'lucide-react';
import { BUSINESS_INFO, slugify } from '@/lib/seoConfig';
import { useCart } from '@/src/services/cartContext';

export interface ProductCardData {
  id: string;
  name: string;
  sku: string;
  category: string;
  brand: string;
  model?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  retailPrice: number;
  regularPrice?: number | null;
  emiPrice?: number;
  currentStock: number;
  warrantyPeriodMonths?: number;
  specs?: any;
}

interface ProductCardProps {
  product: ProductCardData;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem, openCart } = useCart();
  const [added, setAdded] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const slug = `${slugify(product.name)}-${product.sku.toLowerCase()}`;
  const isLaptop = product.category.toLowerCase().includes('laptop') || product.name.toLowerCase().includes('laptop');
  const fallbackImage = isLaptop ? '/logo-dark-transparent.png' : '/logo-icon.png';
  const imgUrl = product.imageUrl || fallbackImage;
  const isAvailable = product.currentStock > 0;

  // Approximate regular price and savings if regular price is not explicitly set
  const regularPrice = product.regularPrice && product.regularPrice > product.retailPrice
    ? product.regularPrice
    : Math.round(product.retailPrice * 1.08); // 8% discount simulation like trustcomputermb

  const savings = regularPrice - product.retailPrice;
  const discountPercent = regularPrice > 0 ? Math.round((savings / regularPrice) * 100) : 0;
  const warrantyText = product.warrantyPeriodMonths 
    ? `${product.warrantyPeriodMonths} Months Warranty`
    : isLaptop 
    ? '2 Years Official Warranty'
    : '1 Year Warranty';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.retailPrice,
      imageUrl: product.imageUrl || null,
      maxStock: product.currentStock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
    openCart();
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    try {
      const saved = JSON.parse(localStorage.getItem('customer_wishlist') || '[]');
      if (isWishlisted) {
        const filtered = saved.filter((id: string) => id !== product.id);
        localStorage.setItem('customer_wishlist', JSON.stringify(filtered));
      } else {
        if (!saved.includes(product.id)) {
          saved.push(product.id);
          localStorage.setItem('customer_wishlist', JSON.stringify(saved));
        }
      }
    } catch (e) {}
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-[#0084d6] dark:hover:border-blue-500 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative">
      {/* Top Image Box */}
      <div className="relative block bg-slate-50/80 dark:bg-slate-950 aspect-[4/3] overflow-hidden border-b border-slate-100 dark:border-slate-800/80 p-3 sm:p-5">
        <Link href={`/product/${slug}`} className="block w-full h-full">
          <img
            src={imgUrl}
            alt={`${product.name} at ${BUSINESS_INFO.name} Bangladesh`}
            loading="lazy"
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Badges on Top Left (Discount & In Stock) */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 flex flex-col gap-1 items-start pointer-events-none">
          {discountPercent > 0 && (
            <span className="bg-rose-500 text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded-full shadow-xs tracking-wider">
              -{discountPercent}% OFF
            </span>
          )}
          <span
            className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wide flex items-center gap-1 shadow-2xs ${
              isAvailable
                ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700'
                : 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            <span>{isAvailable ? 'In Stock' : 'Out of Stock'}</span>
          </span>
        </div>

        {/* Wishlist Button on Top Right (Trust Computer Style) */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label="Add to wishlist"
          className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-white text-slate-400 hover:text-rose-500 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center justify-center transition-all"
        >
          <Heart
            size={14}
            className={isWishlisted ? 'fill-rose-500 text-rose-500' : ''}
          />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
        <div>
          {/* Category & Brand row */}
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 font-medium mb-1">
            <span className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider truncate max-w-[70%]">
              {product.brand} • {product.category}
            </span>
            <span className="font-mono text-[9px] sm:text-[10px] bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded text-slate-500">
              {product.sku}
            </span>
          </div>

          {/* Product Title */}
          <Link href={`/product/${slug}`}>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#0084d6] transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Warranty Pill (Trust Computer MB Shield highlight) */}
          <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-[9px] sm:text-[10px] font-semibold">
            <ShieldCheck size={11} className="text-[#0084d6]" />
            <span>{warrantyText}</span>
          </div>
        </div>

        {/* Pricing & Add To Cart Button */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2 sm:space-y-2.5">
          <div className="flex items-baseline justify-between gap-1">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-base lg:text-lg font-black text-[#0084d6] font-mono">
                  ৳{product.retailPrice.toLocaleString()}
                </span>
                {savings > 0 && (
                  <span className="text-[10px] sm:text-xs text-slate-400 line-through font-mono">
                    ৳{regularPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {savings > 0 && (
                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block">
                  Save ৳{savings.toLocaleString()}
                </span>
              )}
            </div>

            {/* WhatsApp Quick Inquiry */}
            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20NEED%20ELECTRO%2C%20I%20am%20interested%20in%20${encodeURIComponent(product.name)}%20(SKU:%20${product.sku}).%20Is%20it%20available%20for%20delivery%3F`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Inquiry"
              className="p-1 sm:p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 transition-colors"
              title="Chat on WhatsApp"
            >
              <MessageCircle size={13} />
            </a>
          </div>

          {/* Full-width "Add to Cart" button (Trust Computer MB Blue Style) */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className={`w-full py-2 sm:py-2.5 px-2 rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
              !isAvailable
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-[#0084d6] hover:bg-[#0073bc] text-white shadow-blue-500/25 active:scale-[0.98]'
            }`}
          >
            {added ? (
              <>
                <Check size={13} className="stroke-3" />
                <span>Added!</span>
              </>
            ) : isAvailable ? (
              <>
                <ShoppingBag size={13} />
                <span>Add to Cart</span>
              </>
            ) : (
              <span>Out of Stock</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const isInStock = product.currentStock > 0;
  // Business Policy: allow_order_when_stock_is_zero = true
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
    <div className="bg-white border border-slate-200/90 hover:border-[#008CFF] rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative h-full">
      {/* Top Image Box: Generous 4:3 aspect ratio */}
      <div className="relative aspect-[4/3] w-full bg-[#F4F6F8]/60 overflow-hidden border-b border-slate-100 p-2 sm:p-3 md:p-4 flex items-center justify-center">
        <Link href={`/product/${slug}`} className="w-full h-full flex items-center justify-center">
          <img
            src={imgUrl}
            alt={`${product.name} at ${BUSINESS_INFO.name} Bangladesh`}
            loading="lazy"
            className="max-h-full max-w-full object-contain group-hover:scale-108 transition-transform duration-300 drop-shadow-xs"
          />
        </Link>

        {/* Badges on Top Left (Discount & In Stock) */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start pointer-events-none z-10">
          {discountPercent > 0 && (
            <span className="bg-rose-500 text-white text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-md shadow-xs tracking-wider">
              -{discountPercent}% OFF
            </span>
          )}
          <span
            className={`px-2 py-0.5 rounded-md text-[9.5px] sm:text-[10.5px] font-bold tracking-wide flex items-center gap-1.5 shadow-xs ${
              isInStock
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-blue-50 text-[#008CFF] border border-blue-200/80'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isInStock ? 'bg-emerald-500 animate-pulse' : 'bg-[#008CFF]'
              }`}
            />
            <span>{isInStock ? 'In Stock' : 'Available to Order'}</span>
          </span>
        </div>

        {/* Top Right: Wishlist & WhatsApp */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <a
            href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20NEED%20ELECTRO%2C%20I%20am%20interested%20in%20${encodeURIComponent(product.name)}%20(SKU:%20${product.sku}).%20Is%20it%20available%20for%20delivery%3F`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp Inquiry"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 hover:bg-emerald-50 text-emerald-600 border border-slate-200/90 shadow-xs flex items-center justify-center transition-all opacity-90 hover:opacity-100 hover:scale-105"
            title="Chat on WhatsApp"
          >
            <MessageCircle size={14} />
          </a>
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label="Add to wishlist"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 hover:bg-white text-slate-400 hover:text-rose-500 border border-slate-200/90 shadow-xs flex items-center justify-center transition-all opacity-90 hover:opacity-100 hover:scale-105"
          >
            <Heart
              size={14}
              className={isWishlisted ? 'fill-rose-500 text-rose-500' : ''}
            />
          </button>
        </div>

        {/* Warranty Badge at bottom of image */}
        <div className="absolute bottom-2 left-2.5 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-md text-[9px] sm:text-[10px] font-semibold text-[#002B5B] border border-slate-200/90 shadow-2xs flex items-center gap-1 pointer-events-none z-10">
          <ShieldCheck size={11} className="text-[#008CFF]" />
          <span>{warrantyText}</span>
        </div>
      </div>

      {/* Card Body: Spacious and well-proportioned */}
      <div className="p-2.5 sm:p-3.5 md:p-4 bg-white flex-1 flex flex-col justify-between gap-2 sm:gap-2.5">
        {/* Category & Brand row */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-400 font-medium leading-none">
          <span className="text-slate-500 font-bold uppercase tracking-wider truncate max-w-[65%]">
            {product.brand} • {product.category}
          </span>
          <span className="font-mono text-[9px] sm:text-[10px] bg-[#F4F6F8] px-1.5 py-0.5 rounded text-slate-600 font-semibold border border-slate-200/60">
            {product.sku}
          </span>
        </div>

        {/* Product Title */}
        <Link href={`/product/${slug}`} className="block">
          <h3
            className="text-xs sm:text-sm md:text-[15px] font-bold text-[#002B5B] group-hover:text-[#008CFF] transition-colors line-clamp-2 leading-snug min-h-[2.25rem] sm:min-h-[2.6rem]"
            title={product.name}
          >
            {product.name}
          </h3>
        </Link>

        {/* Pricing row */}
        <div className="flex items-baseline justify-between gap-1.5 pt-0.5">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base md:text-lg font-black text-[#008CFF] font-mono">
              ৳{product.retailPrice.toLocaleString()}
            </span>
            {savings > 0 && (
              <span className="text-[10px] sm:text-xs text-slate-400 line-through font-mono">
                ৳{regularPrice.toLocaleString()}
              </span>
            )}
          </div>
          {savings > 0 && (
            <span className="text-[9px] sm:text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/70 shrink-0">
              Save ৳{savings.toLocaleString()}
            </span>
          )}
        </div>

        {/* Full-width "Add to Cart" / "Order Now" button */}
        <button
          type="button"
          onClick={handleAddToCart}
          className={`w-full py-2 sm:py-2.5 px-2 sm:px-3 rounded-xl font-bold text-xs sm:text-sm min-h-[38px] sm:min-h-[42px] flex items-center justify-center gap-1.5 transition-all shadow-xs ${
            added
              ? 'bg-emerald-600 text-white shadow-emerald-500/25 scale-[0.98]'
              : 'bg-[#008CFF] hover:bg-[#0070cc] text-white shadow-blue-500/20 hover:shadow-blue-500/35 active:scale-[0.98]'
          }`}
        >
          {added ? (
            <>
              <Check size={14} className="stroke-3" />
              <span>Added to Cart!</span>
            </>
          ) : isInStock ? (
            <>
              <ShoppingBag size={14} />
              <span>Add to Cart</span>
            </>
          ) : (
            <>
              <ShoppingBag size={14} />
              <span>Order Now</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

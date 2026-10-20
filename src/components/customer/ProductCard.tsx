'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MessageCircle, ArrowRight, ShoppingBag, Check } from 'lucide-react';
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

  const slug = `${slugify(product.name)}-${product.sku.toLowerCase()}`;
  const isLaptop = product.category.toLowerCase().includes('laptop') || product.name.toLowerCase().includes('laptop');
  const fallbackImage = isLaptop ? '/logo-dark-transparent.png' : '/logo-icon.png';
  const imgUrl = product.imageUrl || fallbackImage;
  const isAvailable = product.currentStock > 0;
  
  // Calculate approximate 6-month EMI starting payment
  const emiMonthly = product.retailPrice > 0 ? Math.round((product.retailPrice * 0.75) / 6) : null;

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

  return (
    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-cyan-500/50 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-200 flex flex-col group">
      {/* Product Image */}
      <Link href={`/product/${slug}`} className="relative block bg-slate-50 dark:bg-slate-950/70 p-6 aspect-[4/3] overflow-hidden border-b border-slate-100 dark:border-slate-800/80">
        <img
          src={imgUrl}
          alt={`${product.name} available at ${BUSINESS_INFO.name} Bangladesh`}
          loading="lazy"
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300 px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide shadow-2xs">
            {product.brand}
          </span>
          {isLaptop && emiMonthly && (
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded-md text-[10px] font-bold shadow-2xs">
              EMI ৳{emiMonthly.toLocaleString()}/mo
            </span>
          )}
        </div>

        <div className="absolute top-3 right-3">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isAvailable 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-400 dark:border-emerald-500/30' 
              : 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/80 dark:text-rose-400 dark:border-rose-500/30'
          }`}>
            {isAvailable ? 'In Stock' : 'Pre-Order'}
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-1">
            <span>SKU: {product.sku}</span>
            <span>{product.category}</span>
          </div>

          <Link href={`/product/${slug}`}>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Quick Specs preview */}
          {product.specs && typeof product.specs === 'object' && (
            <div className="mt-2.5 flex flex-wrap gap-1.5 text-[11px]">
              {product.specs.processor && (
                <span className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700/60 font-medium">
                  {product.specs.processor}
                </span>
              )}
              {product.specs.ram && (
                <span className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700/60 font-medium">
                  {product.specs.ram}
                </span>
              )}
              {product.specs.storage && (
                <span className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700/60 font-medium">
                  {product.specs.storage}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Price</span>
              <span className="text-lg font-extrabold text-blue-600 dark:text-cyan-400 font-mono">
                ৳{product.retailPrice.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <a
                href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20NEED%20ELECTRO%2C%20I%20am%20interested%20in%20buying%20${encodeURIComponent(product.name)}%20(SKU:%20${product.sku}).%20Is%20it%20available%20for%20delivery%3F`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Inquire about ${product.name} on WhatsApp`}
                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 dark:text-emerald-400 dark:border-emerald-500/30 transition-colors"
                title="WhatsApp Inquiry"
              >
                <MessageCircle size={15} />
              </a>
              <Link
                href={`/product/${slug}`}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 transition-colors"
                aria-label={`View details of ${product.name}`}
                title="View Details"
              >
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Direct Add to Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!isAvailable}
            className={`w-full py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs ${
              !isAvailable
                ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-98'
            }`}
          >
            {added ? (
              <>
                <Check size={14} className="stroke-3" />
                <span>Added to Cart!</span>
              </>
            ) : isAvailable ? (
              <>
                <ShoppingBag size={14} />
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

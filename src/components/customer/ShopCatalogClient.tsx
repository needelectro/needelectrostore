'use client';

import React from 'react';
import Link from 'next/link';
import { PackageOpen, Phone, Search, X } from 'lucide-react';
import { ProductCard, ProductCardData } from '@/src/components/customer/ProductCard';
import { BUSINESS_INFO } from '@/lib/seoConfig';

export type ShopCategoryTab =
  | 'all'
  | 'laptops'
  | 'accessories'
  | 'networking'
  | 'cables'
  | 'cctv'
  | 'electrical'
  | 'computers';

interface ShopCatalogClientProps {
  initialProducts: ProductCardData[];
  defaultCategory?: ShopCategoryTab;
  searchQuery?: string;
}

export const ShopCatalogClient: React.FC<ShopCatalogClientProps> = ({
  initialProducts,
  searchQuery,
}) => {
  const trimmedQuery = searchQuery?.trim() || '';

  return (
    <div className="space-y-6">
      {trimmedQuery && (
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200 px-4 py-3 shadow-2xs">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-[#002B5B]">
            <Search size={15} className="text-[#008CFF] shrink-0" />
            <span>
              Showing <strong>{initialProducts.length}</strong> result{initialProducts.length === 1 ? '' : 's'} for{' '}
              <strong className="text-[#008CFF]">&ldquo;{trimmedQuery}&rdquo;</strong>
            </span>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-[#002B5B] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
          >
            <X size={13} />
            <span>Clear Search</span>
          </Link>
        </div>
      )}

      {/* Product Grid */}
      {initialProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 4xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-6">
          {initialProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 max-w-md mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-full bg-blue-50 text-[#008CFF] flex items-center justify-center mx-auto">
            <PackageOpen size={28} />
          </div>
          <div>
            <h3 className="font-bold text-base text-[#002B5B]">
              {trimmedQuery ? `No products matched "${trimmedQuery}"` : 'No products currently available'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {trimmedQuery
                ? 'Try searching for another brand, model, or browse all available products in our catalog.'
                : 'Please check back soon or contact customer support for specific orders.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {trimmedQuery && (
              <Link
                href="/shop"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#002B5B] text-xs font-bold transition-all"
              >
                Browse Full Catalog
              </Link>
            )}
            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="px-4 py-2 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Phone size={13} />
              <span>Call Helpline: {BUSINESS_INFO.phone}</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

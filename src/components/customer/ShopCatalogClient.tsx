'use client';

import React from 'react';
import { PackageOpen, Phone } from 'lucide-react';
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
}

export const ShopCatalogClient: React.FC<ShopCatalogClientProps> = ({
  initialProducts,
}) => {
  return (
    <div className="space-y-6">
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
            <h3 className="font-bold text-base text-[#002B5B]">No products currently available</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Please check back soon or contact customer support for specific orders.
            </p>
          </div>
          <div className="flex items-center justify-center pt-2">
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

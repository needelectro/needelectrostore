'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Layers,
  Laptop,
  Smartphone,
  Wifi,
  Zap,
  Camera,
  Cable,
  Monitor,
  Search,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  CheckCircle2,
  PackageOpen,
  Phone,
  Sparkles,
} from 'lucide-react';
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

const isAccessory = (p: ProductCardData) => {
  const cat = (p.category || '').toLowerCase();
  const name = (p.name || '').toLowerCase();
  const sku = (p.sku || '').toUpperCase();
  return (
    cat.includes('accessori') ||
    cat.includes('accessory') ||
    cat.includes('mouse') ||
    cat.includes('keyboard') ||
    cat.includes('cable') ||
    cat.includes('charger') ||
    name.includes('mouse') ||
    name.includes('keyboard') ||
    name.includes('headset') ||
    name.includes('headphone') ||
    name.includes('charger') ||
    name.includes('adapter') ||
    name.includes('power bank') ||
    sku.startsWith('SKU-ACC-')
  );
};

const isLaptopProduct = (p: ProductCardData) => {
  const cat = (p.category || '').toLowerCase();
  const name = (p.name || '').toLowerCase();
  const isMatch =
    cat.includes('laptop') ||
    cat.includes('notebook') ||
    cat.includes('macbook') ||
    cat.includes('chromebook') ||
    name.includes('laptop') ||
    name.includes('elitebook') ||
    name.includes('thinkpad') ||
    name.includes('latitude') ||
    name.includes('chromebook') ||
    name.includes('macbook') ||
    name.includes('probook');
  return isMatch && !isAccessory(p);
};

export const ShopCatalogClient: React.FC<ShopCatalogClientProps> = ({
  initialProducts,
  defaultCategory = 'all',
}) => {
  const [activeTab, setActiveTab] = useState<ShopCategoryTab>(defaultCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'stock' | 'name'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Compute category counts across all initial products
  const categoryCounts = useMemo(() => {
    return {
      all: initialProducts.length,
      laptops: initialProducts.filter(isLaptopProduct).length,
      accessories: initialProducts.filter(
        (p) =>
          isAccessory(p) &&
          !p.category?.toLowerCase().includes('charger') &&
          !p.category?.toLowerCase().includes('cable')
      ).length,
      networking: initialProducts.filter(
        (p) =>
          p.category?.toLowerCase().includes('network') ||
          p.category?.toLowerCase().includes('router') ||
          p.name?.toLowerCase().includes('router')
      ).length,
      cables: initialProducts.filter(
        (p) =>
          p.category?.toLowerCase().includes('charger') ||
          p.category?.toLowerCase().includes('cable') ||
          p.name?.toLowerCase().includes('charger') ||
          p.name?.toLowerCase().includes('cable')
      ).length,
      cctv: initialProducts.filter(
        (p) =>
          p.category?.toLowerCase().includes('cctv') ||
          p.category?.toLowerCase().includes('camera') ||
          p.name?.toLowerCase().includes('cctv')
      ).length,
      electrical: initialProducts.filter(
        (p) =>
          p.category?.toLowerCase().includes('electr') ||
          p.name?.toLowerCase().includes('breaker') ||
          p.name?.toLowerCase().includes('switch')
      ).length,
      computers: initialProducts.filter(
        (p) =>
          (p.category?.toLowerCase().includes('computer') && !isAccessory(p) && !isLaptopProduct(p)) ||
          p.name?.toLowerCase().includes('pc setup')
      ).length,
    };
  }, [initialProducts]);

  const tabs = [
    { id: 'all' as ShopCategoryTab, label: 'All Products', icon: Layers, count: categoryCounts.all },
    { id: 'laptops' as ShopCategoryTab, label: 'Laptops', icon: Laptop, count: categoryCounts.laptops },
    { id: 'accessories' as ShopCategoryTab, label: 'Accessories', icon: Smartphone, count: categoryCounts.accessories },
    { id: 'networking' as ShopCategoryTab, label: 'Networking & Wi-Fi', icon: Wifi, count: categoryCounts.networking },
    { id: 'cables' as ShopCategoryTab, label: 'Chargers & Cables', icon: Cable, count: categoryCounts.cables },
    { id: 'cctv' as ShopCategoryTab, label: 'CCTV & Security', icon: Camera, count: categoryCounts.cctv },
    { id: 'electrical' as ShopCategoryTab, label: 'Electrical', icon: Zap, count: categoryCounts.electrical },
    { id: 'computers' as ShopCategoryTab, label: 'Desktops & PCs', icon: Monitor, count: categoryCounts.computers },
  ];

  // Filtering and sorting
  const filteredProducts = useMemo(() => {
    let result = initialProducts;

    // 1. Tab category filter
    if (activeTab === 'laptops') {
      result = result.filter(isLaptopProduct);
    } else if (activeTab === 'accessories') {
      result = result.filter(
        (p) =>
          isAccessory(p) &&
          !p.category?.toLowerCase().includes('charger') &&
          !p.category?.toLowerCase().includes('cable')
      );
    } else if (activeTab === 'networking') {
      result = result.filter(
        (p) =>
          p.category?.toLowerCase().includes('network') ||
          p.category?.toLowerCase().includes('router') ||
          p.name?.toLowerCase().includes('router')
      );
    } else if (activeTab === 'cables') {
      result = result.filter(
        (p) =>
          p.category?.toLowerCase().includes('charger') ||
          p.category?.toLowerCase().includes('cable') ||
          p.name?.toLowerCase().includes('charger') ||
          p.name?.toLowerCase().includes('cable')
      );
    } else if (activeTab === 'cctv') {
      result = result.filter(
        (p) =>
          p.category?.toLowerCase().includes('cctv') ||
          p.category?.toLowerCase().includes('camera') ||
          p.name?.toLowerCase().includes('cctv')
      );
    } else if (activeTab === 'electrical') {
      result = result.filter(
        (p) =>
          p.category?.toLowerCase().includes('electr') ||
          p.name?.toLowerCase().includes('breaker') ||
          p.name?.toLowerCase().includes('switch')
      );
    } else if (activeTab === 'computers') {
      result = result.filter(
        (p) =>
          (p.category?.toLowerCase().includes('computer') && !isAccessory(p) && !isLaptopProduct(p)) ||
          p.name?.toLowerCase().includes('pc setup')
      );
    }

    // 2. In stock filter
    if (inStockOnly) {
      result = result.filter((p) => p.currentStock > 0);
    }

    // 3. Search query filter
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((p) => {
        const nameMatch = (p.name || '').toLowerCase().includes(q);
        const skuMatch = (p.sku || '').toLowerCase().includes(q);
        const brandMatch = (p.brand || '').toLowerCase().includes(q);
        const catMatch = (p.category || '').toLowerCase().includes(q);
        const modelMatch = (p.model || '').toLowerCase().includes(q);
        return nameMatch || skuMatch || brandMatch || catMatch || modelMatch;
      });
    }

    // 4. Sorting
    return [...result].sort((a, b) => {
      if (sortBy === 'price-asc') {
        return a.retailPrice - b.retailPrice;
      }
      if (sortBy === 'price-desc') {
        return b.retailPrice - a.retailPrice;
      }
      if (sortBy === 'stock') {
        return b.currentStock - a.currentStock;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      // 'featured' default: in-stock first, then id/update order
      if (b.currentStock !== a.currentStock) {
        return (b.currentStock > 0 ? 1 : 0) - (a.currentStock > 0 ? 1 : 0);
      }
      return 0;
    });
  }, [initialProducts, activeTab, inStockOnly, searchQuery, sortBy]);

  const clearAllFilters = () => {
    setActiveTab('all');
    setSearchQuery('');
    setInStockOnly(false);
    setSortBy('featured');
  };

  const hasActiveFilters = activeTab !== 'all' || searchQuery.trim() !== '' || inStockOnly || sortBy !== 'featured';

  return (
    <div className="space-y-6">
      {/* Search & Filter Controls Header (Mobile-First Optimization) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3 sm:p-4 space-y-3.5 sticky top-14 md:top-20 z-30 backdrop-blur-md bg-white/95 transition-all">
        {/* Row 1: Search Input & Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Real-time Search Box */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all products (e.g. Dell, HP, mouse, router, CCTV)..."
              className="w-full pl-9 pr-9 py-2 text-xs sm:text-sm bg-[#F4F6F8] rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#008CFF]/20 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Controls: In-Stock Toggle & Sort */}
          <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0">
            {/* In-Stock Pill Filter */}
            <button
              type="button"
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                inStockOnly
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs font-bold'
                  : 'bg-[#F4F6F8] text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 size={13} className={inStockOnly ? 'text-emerald-600' : 'text-slate-400'} />
              <span>In Stock Only</span>
            </button>

            {/* Sort Dropdown */}
            <div className="relative flex items-center">
              <ArrowUpDown size={13} className="absolute left-3 text-slate-400 pointer-events-none" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort products"
                className="pl-8 pr-7 py-2 bg-[#F4F6F8] border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#008CFF]/20 cursor-pointer appearance-none"
              >
                <option value="featured">Featured / Stock</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Touch-Scrollable Category Chips with Count Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 pt-0.5 -mx-1 px-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all select-none active:scale-95 ${
                  isActive
                    ? 'bg-[#008CFF] text-white shadow-sm shadow-blue-500/25 ring-2 ring-[#008CFF]/20'
                    : 'bg-[#F4F6F8] text-slate-700 hover:text-[#002B5B] hover:bg-blue-50 border border-slate-200/80'
                }`}
              >
                <Icon size={13} className={isActive ? 'text-white' : 'text-slate-500'} />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 3: Active Status & Clear Filters (only when filtered) */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#002B5B]">
              Showing {filteredProducts.length} of {initialProducts.length} products
            </span>
            {searchQuery && (
              <span className="text-[11px] text-slate-400">
                matching &ldquo;{searchQuery}&rdquo;
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-[#008CFF] hover:underline"
            >
              <X size={12} />
              <span>Reset All Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 4xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-6">
          {filteredProducts.map((p) => (
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
            <h3 className="font-bold text-base text-[#002B5B]">No matching products found</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              We couldn&apos;t find any item matching your current filter or search criteria.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <button
              type="button"
              onClick={clearAllFilters}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white text-xs font-bold transition-all shadow-xs"
            >
              View All {initialProducts.length} Products
            </button>
            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#F4F6F8] hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all border border-slate-200 flex items-center justify-center gap-1.5"
            >
              <Phone size={13} />
              <span>Call Hotline</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

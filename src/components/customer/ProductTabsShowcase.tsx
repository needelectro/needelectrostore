'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, Laptop, Camera, Zap, Monitor, Smartphone, Layers } from 'lucide-react';
import { ProductCard, ProductCardData } from '@/src/components/customer/ProductCard';

interface ProductTabsShowcaseProps {
  products: ProductCardData[];
}

export const ProductTabsShowcase: React.FC<ProductTabsShowcaseProps> = ({ products }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'laptop' | 'cctv' | 'electrical' | 'computer'>('all');

  const filteredProducts = products.filter((p) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'laptop') {
      return p.category.toLowerCase().includes('laptop') || p.name.toLowerCase().includes('laptop');
    }
    if (activeTab === 'cctv') {
      return (
        p.category.toLowerCase().includes('cctv') ||
        p.category.toLowerCase().includes('camera') ||
        p.name.toLowerCase().includes('cctv')
      );
    }
    if (activeTab === 'electrical') {
      return (
        p.category.toLowerCase().includes('electric') ||
        p.category.toLowerCase().includes('breaker') ||
        p.category.toLowerCase().includes('switch') ||
        p.category.toLowerCase().includes('wire')
      );
    }
    if (activeTab === 'computer') {
      return (
        p.category.toLowerCase().includes('computer') ||
        p.category.toLowerCase().includes('monitor') ||
        p.category.toLowerCase().includes('desktop')
      );
    }
    return true;
  });

  const tabs = [
    { id: 'all', label: 'All Featured', icon: Layers, count: products.length },
    {
      id: 'laptop',
      label: 'Laptops',
      icon: Laptop,
      count: products.filter(
        (p) => p.category.toLowerCase().includes('laptop') || p.name.toLowerCase().includes('laptop')
      ).length,
    },
    {
      id: 'cctv',
      label: 'CCTV & Security',
      icon: Camera,
      count: products.filter(
        (p) =>
          p.category.toLowerCase().includes('cctv') ||
          p.category.toLowerCase().includes('camera') ||
          p.name.toLowerCase().includes('cctv')
      ).length,
    },
    {
      id: 'electrical',
      label: 'Electrical',
      icon: Zap,
      count: products.filter(
        (p) =>
          p.category.toLowerCase().includes('electric') ||
          p.category.toLowerCase().includes('breaker') ||
          p.category.toLowerCase().includes('switch')
      ).length,
    },
    {
      id: 'computer',
      label: 'PCs & Displays',
      icon: Monitor,
      count: products.filter(
        (p) =>
          p.category.toLowerCase().includes('computer') ||
          p.category.toLowerCase().includes('monitor') ||
          p.category.toLowerCase().includes('desktop')
      ).length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0084d6] uppercase tracking-wider mb-1">
            <Sparkles size={13} />
            <span>Top Picks in Moulvibazar</span>
          </div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Featured Products
          </h2>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0084d6] text-white shadow-sm shadow-blue-500/25'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Product Cards */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <p className="font-bold text-slate-700 dark:text-slate-300">No products found in this category.</p>
          <p className="text-xs text-slate-500 mt-1">Please call 01733-983752 for instant product availability.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

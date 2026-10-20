'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Sparkles, BookOpen, Clock, ArrowRight, X } from 'lucide-react';

interface SearchResult {
  id: string;
  slug: string;
  category: string;
  title: string;
  summary: string;
  readingTime: string;
}

export const GuidesSearchHero: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/guides/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setResults(data.data || []);
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Guides search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const popularTopics = [
    { label: 'Laptop Prices', href: '/guides/prices/laptop-price-in-bangladesh' },
    { label: 'HP vs Dell', href: '/guides/comparisons/hp-elitebook-vs-dell-latitude' },
    { label: 'Used Laptop Checklist', href: '/guides/buying-guides/used-laptop-buying-checklist' },
    { label: 'CCTV Camera Price', href: '/guides/prices/cctv-camera-price-in-bangladesh' },
    { label: 'RAM vs SSD', href: '/guides/comparisons/computer-ram-vs-ssd-explained' },
    { label: 'Wi-Fi 6 Routers', href: '/guides/buying-guides/how-to-choose-wifi-router' },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#002B5B] via-[#001D3D] to-[#081621] text-white pt-16 pb-20 px-4 border-b border-slate-800">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#008CFF]/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2" />

      <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
        <div className="inline-flex items-center gap-2 bg-[#008CFF]/20 border border-[#008CFF]/40 text-cyan-300 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">
          <Sparkles size={14} className="text-[#008CFF]" />
          <span>NEED ELECTRO Knowledge &amp; Research Center</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight sm:leading-tight">
          NEED ELECTRO <span className="text-[#008CFF]">Guides &amp; Advice</span>
        </h1>

        <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Compare verified prices, explore side-by-side specification differences, and make smarter, confident buying decisions for laptops, computers, CCTV, and electrical gear.
        </p>

        {/* Search Bar */}
        <div ref={dropdownRef} className="max-w-2xl mx-auto relative pt-2">
          <div className="relative flex items-center shadow-2xl rounded-2xl overflow-hidden border border-slate-700 focus-within:border-[#008CFF] focus-within:ring-2 focus-within:ring-[#008CFF]/30 transition-all bg-white dark:bg-slate-900">
            <div className="pl-4 text-slate-400">
              <Search size={20} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => { if (results.length > 0) setIsOpen(true); }}
              placeholder="Search buying guides, prices and product comparisons..."
              className="w-full py-4 pl-3 pr-12 text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 bg-transparent focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setResults([]); }}
                className="absolute right-4 text-slate-400 hover:text-slate-200"
                aria-label="Clear search"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {isOpen && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 text-left divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-500 flex justify-between items-center">
                <span>Matching Guides ({results.length})</span>
                <span className="text-xs text-[#008CFF] font-semibold">Press Esc to close</span>
              </div>
              {results.map((item) => (
                <Link
                  key={item.id}
                  href={`/guides/${item.category}/${item.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="p-4 block hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors group"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-[#008CFF] mb-1">
                    <span className="uppercase text-[10px] tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900">
                      {item.category.replace('-', ' ')}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock size={11} />
                      {item.readingTime}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#008CFF] transition-colors line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {item.summary}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Popular Quick Pills */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold mr-1">Popular:</span>
          {popularTopics.map((topic) => (
            <Link
              key={topic.label}
              href={topic.href}
              className="bg-slate-800/80 hover:bg-[#008CFF] text-slate-300 hover:text-white border border-slate-700/80 hover:border-[#008CFF] px-3 py-1 rounded-full transition-all text-[11px] font-medium"
            >
              {topic.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

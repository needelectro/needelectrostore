'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Search, Phone, MessageCircle, Menu, X, ChevronDown,
  Laptop, Monitor, Camera, Zap, Cpu, Wifi, Smartphone,
  MapPin, ShieldCheck, CreditCard, BookOpen, Clock, ArrowRight,
  Sun, Moon
} from 'lucide-react';
import { BUSINESS_INFO, slugify } from '@/lib/seoConfig';
import { NeedElectroLogo } from '@/src/components/NeedElectroLogo';

interface SearchResult {
  id: string;
  name: string;
  sku: string;
  slug: string;
  category: string;
  brand: string;
  retailPrice: number;
  currentStock: number;
}

export const CustomerHeader: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Theme state: defaults to 'light'
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    try {
      const saved = (localStorage.getItem('customer_theme') as 'light' | 'dark') || 'light';
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } catch (e) {}
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      localStorage.setItem('customer_theme', next);
      document.documentElement.setAttribute('data-theme', next);
    } catch (e) {}
  };

  // Debounced live search
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/catalog/search?q=${encodeURIComponent(searchQuery)}&limit=6`);
        const json = await res.json();
        if (json.success) {
          setSearchResults(json.data || []);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside search dismiss
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLight = theme === 'light';

  return (
    <header className={`sticky top-0 z-50 w-full backdrop-blur-md border-b transition-colors duration-200 ${
      isLight 
        ? 'bg-white/95 border-slate-200 text-slate-800 shadow-sm' 
        : 'bg-[#080d1a]/95 border-slate-800 text-slate-100'
    }`}>
      {/* Top Banner Notice */}
      <div className={`py-1.5 px-4 text-xs border-b transition-colors ${
        isLight 
          ? 'bg-gradient-to-r from-blue-50 via-sky-50 to-blue-50 border-blue-100/80 text-slate-600' 
          : 'bg-gradient-to-r from-blue-900/40 via-cyan-900/30 to-blue-900/40 border-blue-500/20 text-slate-300'
      }`}>
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">Moulvibazar Showroom Open: 9:30 AM – 9:30 PM</span>
            <span className="hidden md:inline opacity-40">|</span>
            <span className={`hidden md:inline font-semibold ${isLight ? 'text-blue-700' : 'text-cyan-400'}`}>
              Laptop EMI & Certified Electrician Service
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className={`flex items-center gap-1.5 font-bold transition-colors ${
                isLight ? 'hover:text-blue-600 text-slate-700' : 'hover:text-cyan-400 text-slate-200'
              }`}
            >
              <Phone size={13} className={isLight ? 'text-blue-600' : 'text-cyan-400'} />
              <span>{BUSINESS_INFO.phone}</span>
            </a>
            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20NEED%20ELECTRO%2C%20I%20would%20like%20to%20inquire%20about%20your%20products%20and%20services.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
            >
              <MessageCircle size={13} />
              <span>WhatsApp</span>
            </a>
            <Link
              href="/admin"
              className={`hidden lg:inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold border transition-colors ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              Staff Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <NeedElectroLogo size="sm" theme={isLight ? 'light' : 'dark'} showSisterConcern={false} />
        </Link>

        {/* Live Search Bar */}
        <div ref={searchRef} className="relative flex-1 max-w-lg hidden md:block">
          <div className="relative">
            <input
              type="text"
              placeholder="Search laptops (HP, Dell, Lenovo), CCTV, electrical, parts..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className={`w-full rounded-xl pl-9 pr-4 py-2 text-sm transition-all focus:outline-none focus:ring-2 ${
                isLight
                  ? 'bg-slate-100/90 hover:bg-slate-100 focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-slate-900 placeholder-slate-400'
                  : 'bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 focus:ring-cyan-400/30 text-slate-100 placeholder-slate-400'
              }`}
            />
            <Search size={16} className={`absolute left-3 top-2.5 ${isLight ? 'text-slate-400' : 'text-slate-400'}`} />
            {isSearching && (
              <div className="absolute right-3 top-2.5">
                <div className={`w-4 h-4 border-2 border-t-transparent rounded-full animate-spin ${
                  isLight ? 'border-blue-600' : 'border-cyan-400'
                }`} />
              </div>
            )}
          </div>

          {/* Search Dropdown Results */}
          {searchOpen && searchQuery.trim().length >= 2 && (
            <div className={`absolute top-full left-0 right-0 mt-1.5 rounded-2xl shadow-2xl overflow-hidden z-50 border ${
              isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'
            }`}>
              <div className={`p-2.5 border-b text-[11px] font-bold uppercase tracking-wider flex justify-between ${
                isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}>
                <span>Search Results</span>
                <span>{searchResults.length} items found</span>
              </div>
              {searchResults.length > 0 ? (
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {searchResults.map(p => (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug}`}
                      onClick={() => setSearchOpen(false)}
                      className={`p-3 flex items-center justify-between transition-colors group ${
                        isLight ? 'hover:bg-blue-50/70' : 'hover:bg-slate-800/80'
                      }`}
                    >
                      <div>
                        <p className={`text-sm font-semibold transition-colors ${
                          isLight ? 'text-slate-900 group-hover:text-blue-600' : 'text-slate-200 group-hover:text-cyan-400'
                        }`}>
                          {p.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs opacity-75 mt-0.5">
                          <span className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${
                            isLight ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {p.sku}
                          </span>
                          <span>{p.brand}</span>
                          <span>•</span>
                          <span>{p.category}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className={`text-sm font-extrabold block ${isLight ? 'text-blue-600' : 'text-cyan-400'}`}>
                          ৳{p.retailPrice.toLocaleString()}
                        </span>
                        <span className={`text-[10px] font-semibold ${p.currentStock > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {p.currentStock > 0 ? 'In Stock' : 'Pre-Order'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs opacity-75">
                  {isSearching ? 'Searching catalog...' : `No matching products found for "${searchQuery}". Call +880 1733-983752 for custom sourcing.`}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons & Theme Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-amber-500 border-slate-200'
                : 'bg-slate-900 hover:bg-slate-800 text-cyan-400 border-slate-700'
            }`}
          >
            {isLight ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <Link
            href="/laptop-emi"
            className="hidden lg:flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
          >
            <CreditCard size={14} />
            <span>Laptop EMI</span>
          </Link>
          <Link
            href="/services/electrician"
            className={`hidden lg:flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-colors ${
              isLight
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
          >
            <Zap size={14} className="text-amber-500" />
            <span>Book Electrician</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-2 rounded-lg border ${
              isLight ? 'text-slate-800 border-slate-200 hover:bg-slate-100' : 'text-slate-200 border-slate-800 hover:bg-slate-900'
            }`}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Desktop Secondary Navigation Bar */}
      <nav className={`hidden lg:block border-t px-4 transition-colors ${
        isLight ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-900/60 border-slate-800/80'
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center space-x-1">
            <Link
              href="/"
              className={`px-3 py-2.5 rounded-lg transition-colors ${
                isLight ? 'text-slate-700 hover:text-blue-600 hover:bg-white' : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
              }`}
            >
              Home
            </Link>

            {/* Laptops Dropdown */}
            <div className="relative group">
              <Link
                href="/laptops"
                className={`px-3 py-2.5 rounded-lg transition-colors inline-flex items-center gap-1 ${
                  isLight ? 'text-slate-700 hover:text-blue-600 group-hover:bg-white' : 'text-slate-300 hover:text-cyan-400 group-hover:bg-slate-800/50'
                }`}
              >
                <span>Laptops</span>
                <ChevronDown size={13} className="opacity-60 group-hover:rotate-180 transition-transform" />
              </Link>
              <div className={`absolute top-full left-0 w-60 rounded-2xl shadow-2xl p-2.5 hidden group-hover:block z-50 border ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'
              }`}>
                <Link href="/laptops" className={`block px-3 py-2 rounded-xl text-xs font-bold ${
                  isLight ? 'text-slate-900 hover:bg-blue-50 text-blue-600' : 'text-slate-200 hover:bg-slate-800'
                }`}>
                  All Laptops Overview
                </Link>
                <Link href="/laptops/hp" className={`block px-3 py-2 rounded-xl text-xs ${
                  isLight ? 'text-slate-700 hover:bg-slate-100 hover:text-blue-600' : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800'
                }`}>
                  HP Laptops (EliteBook, ProBook)
                </Link>
                <Link href="/laptops/dell" className={`block px-3 py-2 rounded-xl text-xs ${
                  isLight ? 'text-slate-700 hover:bg-slate-100 hover:text-blue-600' : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800'
                }`}>
                  Dell Laptops (Latitude, Inspiron)
                </Link>
                <Link href="/laptops/lenovo" className={`block px-3 py-2 rounded-xl text-xs ${
                  isLight ? 'text-slate-700 hover:bg-slate-100 hover:text-blue-600' : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800'
                }`}>
                  Lenovo Laptops (ThinkPad)
                </Link>
                <div className={`border-t mt-1.5 pt-1.5 ${isLight ? 'border-slate-100' : 'border-slate-800'}`}>
                  <Link href="/laptop-emi" className="block px-3 py-2 text-blue-600 font-bold hover:underline">
                    Laptop EMI in Moulvibazar →
                  </Link>
                </div>
              </div>
            </div>

            <Link href="/computers" className={`px-3 py-2.5 rounded-lg transition-colors ${
              isLight ? 'text-slate-700 hover:text-blue-600 hover:bg-white' : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
            }`}>
              Computers
            </Link>
            <Link href="/cctv" className={`px-3 py-2.5 rounded-lg transition-colors ${
              isLight ? 'text-slate-700 hover:text-blue-600 hover:bg-white' : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
            }`}>
              CCTV & Security
            </Link>
            <Link href="/electrical-products" className={`px-3 py-2.5 rounded-lg transition-colors ${
              isLight ? 'text-slate-700 hover:text-blue-600 hover:bg-white' : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
            }`}>
              Electrical Products
            </Link>
            <Link href="/computer-accessories" className={`px-3 py-2.5 rounded-lg transition-colors ${
              isLight ? 'text-slate-700 hover:text-blue-600 hover:bg-white' : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
            }`}>
              Accessories
            </Link>
            <Link href="/networking" className={`px-3 py-2.5 rounded-lg transition-colors ${
              isLight ? 'text-slate-700 hover:text-blue-600 hover:bg-white' : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
            }`}>
              Networking
            </Link>

            {/* Services Dropdown */}
            <div className="relative group">
              <Link
                href="/electrical-services"
                className={`px-3 py-2.5 rounded-lg transition-colors inline-flex items-center gap-1 ${
                  isLight ? 'text-slate-700 hover:text-blue-600 group-hover:bg-white' : 'text-slate-300 hover:text-cyan-400 group-hover:bg-slate-800/50'
                }`}
              >
                <span>Services</span>
                <ChevronDown size={13} className="opacity-60 group-hover:rotate-180 transition-transform" />
              </Link>
              <div className={`absolute top-full left-0 w-64 rounded-2xl shadow-2xl p-2.5 hidden group-hover:block z-50 border ${
                isLight ? 'bg-white border-slate-200' : 'bg-slate-900 border-slate-700'
              }`}>
                <Link href="/electrical-services" className={`block px-3 py-2 rounded-xl text-xs font-bold ${
                  isLight ? 'text-slate-900 hover:bg-slate-100' : 'text-slate-200 hover:bg-slate-800'
                }`}>
                  Electrical Services Overview
                </Link>
                <Link href="/services/electrician" className={`block px-3 py-2 rounded-xl text-xs ${
                  isLight ? 'text-slate-700 hover:bg-slate-100 hover:text-blue-600' : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800'
                }`}>
                  ⚡ Certified Electrician Booking
                </Link>
                <Link href="/services/cctv-installation" className={`block px-3 py-2 rounded-xl text-xs ${
                  isLight ? 'text-slate-700 hover:bg-slate-100 hover:text-blue-600' : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800'
                }`}>
                  📹 CCTV Camera Installation
                </Link>
              </div>
            </div>

            <Link href="/moulvibazar" className={`px-3 py-2.5 rounded-lg font-bold transition-colors inline-flex items-center gap-1 ${
              isLight ? 'text-blue-600 hover:bg-blue-50' : 'text-cyan-400 hover:bg-slate-800/50'
            }`}>
              <MapPin size={13} />
              <span>Moulvibazar Hub</span>
            </Link>
            <Link href="/blog" className={`px-3 py-2.5 rounded-lg transition-colors ${
              isLight ? 'text-slate-700 hover:text-blue-600 hover:bg-white' : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
            }`}>
              Blog
            </Link>
            <Link href="/contact" className={`px-3 py-2.5 rounded-lg transition-colors ${
              isLight ? 'text-slate-700 hover:text-blue-600 hover:bg-white' : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50'
            }`}>
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-3 py-2 opacity-80 text-xs">
            <span>Showroom: Kusumbag, Moulvibazar</span>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className={`lg:hidden border-b px-4 py-4 space-y-3 transition-colors ${
          isLight ? 'bg-white border-slate-200' : 'bg-slate-950 border-slate-800'
        }`}>
          {/* Mobile Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search laptops, CCTV, parts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full rounded-xl pl-9 pr-4 py-2 text-sm border ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-700 text-slate-100'
              }`}
            />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          </div>

          {searchResults.length > 0 && searchQuery.trim().length >= 2 && (
            <div className={`rounded-xl p-2 max-h-60 overflow-y-auto space-y-1 border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
            }`}>
              {searchResults.map(p => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block p-2 rounded-lg text-xs ${
                    isLight ? 'hover:bg-slate-200 text-slate-800' : 'hover:bg-slate-800 text-slate-200'
                  }`}
                >
                  <span className="font-semibold block">{p.name}</span>
                  <span className={`font-bold ${isLight ? 'text-blue-600' : 'text-cyan-400'}`}>
                    ৳{p.retailPrice.toLocaleString()}
                  </span>
                </Link>
              ))}
            </div>
          )}

          <div className={`grid grid-cols-2 gap-2 pt-2 border-t text-xs font-medium ${
            isLight ? 'border-slate-200' : 'border-slate-800'
          }`}>
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl ${isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-slate-100'}`}
            >
              Home
            </Link>
            <Link
              href="/laptops"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl ${isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-slate-100'}`}
            >
              💻 Laptops
            </Link>
            <Link
              href="/laptops/hp"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-900 text-slate-300'}`}
            >
              ↳ HP Laptops
            </Link>
            <Link
              href="/laptops/dell"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-900 text-slate-300'}`}
            >
              ↳ Dell Laptops
            </Link>
            <Link
              href="/computers"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl ${isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-slate-100'}`}
            >
              🖥️ Computers
            </Link>
            <Link
              href="/cctv"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl ${isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-slate-100'}`}
            >
              📹 CCTV
            </Link>
            <Link
              href="/electrical-products"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl ${isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-slate-100'}`}
            >
              ⚡ Electrical
            </Link>
            <Link
              href="/services/electrician"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl font-bold ${isLight ? 'bg-amber-100 text-amber-900' : 'bg-amber-950/60 text-amber-300'}`}
            >
              🔧 Book Electrician
            </Link>
            <Link
              href="/laptop-emi"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl font-bold bg-blue-600 text-white"
            >
              💳 Laptop EMI
            </Link>
            <Link
              href="/moulvibazar"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl font-bold ${isLight ? 'bg-blue-50 text-blue-600' : 'bg-slate-900 text-cyan-400'}`}
            >
              📍 Moulvibazar
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl ${isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-slate-100'}`}
            >
              📚 Blog Guides
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`p-2.5 rounded-xl ${isLight ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-slate-100'}`}
            >
              📞 Contact Us
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

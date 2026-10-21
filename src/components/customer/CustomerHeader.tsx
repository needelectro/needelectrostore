'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Search, Phone, MessageCircle, Menu, X, ChevronDown, ChevronLeft, ChevronRight,
  Laptop, Monitor, Camera, Zap, Cpu, Wifi, Smartphone,
  MapPin, ShieldCheck, CreditCard, Clock, ArrowRight,
  Sun, Moon, ShoppingBag, Heart, PackageSearch, Layers, Sparkles, User
} from 'lucide-react';
import { BUSINESS_INFO, slugify } from '@/lib/seoConfig';
import { NeedElectroLogo } from '@/src/components/NeedElectroLogo';
import { useCart } from '@/src/services/cartContext';
import { useCustomerAuth } from '@/src/services/customerAuthContext';
import { CartDrawer } from '@/src/components/customer/CartDrawer';
import { LanguageSwitcher } from '@/src/components/common/LanguageSwitcher';
import { useLanguage } from '@/src/services/languageContext';

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

const CATEGORY_NAV_ITEMS = [
  { name: 'All Products', href: '/shop', icon: Layers, badge: '50+' },
  { name: 'Laptop & Computer', href: '/laptops', icon: Laptop, badge: 'HP, Dell' },
  { name: 'Monitor & Display', href: '/computers', icon: Monitor },
  { name: 'CCTV & Security', href: '/cctv', icon: Camera, badge: 'Hikvision' },
  { name: 'Guides & Advice', href: '/guides', icon: Sparkles, badge: 'Hub' },
  { name: 'Electrical & Switchgear', href: '/electrical-products', icon: Zap },
  { name: 'Computer Accessories', href: '/computer-accessories', icon: Smartphone },
  { name: 'Networking & Router', href: '/networking', icon: Wifi },
  { name: 'Certified Electrician', href: '/services/electrician', icon: Zap, badge: 'Moulvibazar' },
  { name: 'Laptop EMI', href: '/laptop-emi', icon: CreditCard, badge: '0%' },
];

export const CustomerHeader: React.FC = () => {
  const { openCart, totalItems } = useCart();
  const { customer, logout } = useCustomerAuth();
  const { t, formatNumber, isBangla } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const navScrollRef = useRef<HTMLElement>(null);
  const isNavPaused = useRef(false);

  // Auto-scroll category navigation sub-bar continuously with pause-on-hover
  useEffect(() => {
    const el = navScrollRef.current;
    if (!el) return;

    let animId: number;
    let lastTime = performance.now();
    const scrollSpeed = 26; // 26px per second: silky smooth, easy to read

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (!isNavPaused.current && el) {
        const halfWidth = el.scrollWidth / 2;
        el.scrollLeft += scrollSpeed * dt;
        if (el.scrollLeft >= halfWidth) {
          el.scrollLeft -= halfWidth;
        }
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  const scrollNavLeft = () => {
    if (navScrollRef.current) {
      navScrollRef.current.scrollBy({ left: -220, behavior: 'smooth' });
    }
  };

  const scrollNavRight = () => {
    if (navScrollRef.current) {
      navScrollRef.current.scrollBy({ left: 220, behavior: 'smooth' });
    }
  };

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const [announcement, setAnnouncement] = useState<{ active: boolean; text: string; link?: string } | null>(null);

  useEffect(() => {
    try {
      const saved = (localStorage.getItem('customer_theme') as 'light' | 'dark') || 'light';
      setTheme(saved);
      document.documentElement.setAttribute('data-theme', saved);
    } catch (e) {}

    // Check wishlist in localStorage
    try {
      const savedWishlist = JSON.parse(localStorage.getItem('customer_wishlist') || '[]');
      setWishlistCount(Array.isArray(savedWishlist) ? savedWishlist.length : 0);
    } catch (e) {}

    // Fetch live synchronized announcement bar from website settings
    fetch('/api/website-settings')
      .then(r => r.json())
      .then(json => {
        if (json.success && json.data && json.data.announcementActive && json.data.announcementText) {
          setAnnouncement({
            active: true,
            text: json.data.announcementText,
            link: json.data.announcementLink || '/laptops'
          });
        }
      })
      .catch(() => {});
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      localStorage.setItem('customer_theme', next);
      document.documentElement.setAttribute('data-theme', next);
    } catch (e) {}
  };

  // Debounced search
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

  // Click outside to dismiss search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* 0. Live Synchronized Storefront Announcement Bar */}
      {announcement && announcement.active && (
        <div className="bg-gradient-to-r from-[#002B5B] via-[#008CFF] to-[#002B5B] text-white text-[11px] sm:text-xs font-bold py-1.5 px-4 text-center tracking-wide flex items-center justify-center gap-2 shadow-inner">
          <span>{announcement.text}</span>
          {announcement.link && (
            <Link href={announcement.link} className="underline underline-offset-2 hover:text-sky-200 ml-1">
              Explore Now →
            </Link>
          )}
        </div>
      )}

      {/* Sticky Header: Topbar + Category Navigation stay pinned during scroll */}
      <header
        className="sticky top-0 z-40 w-full shadow-md backdrop-blur-xs"
        style={{ position: 'sticky', top: 0, zIndex: 40 }}
      >

      {/* 1. Main Futuristic Light Top Navbar */}
      <div className="bg-white/95 backdrop-blur-md text-[#002B5B] border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo with light theme */}
          <div className="flex items-center shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <NeedElectroLogo size="sm" theme="light" showTagline={false} showSisterConcern={false} />
            </Link>
          </div>

          {/* Pill-shaped Futuristic Search Bar */}
          <div ref={searchRef} className="relative flex-1 max-w-xl hidden md:block">
            <div className="relative flex items-center">
              <input
                type="text"
                placeholder={t('header.searchPlaceholder', 'Search laptops, computers, CCTV, electrical, tools...')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                className="w-full bg-[#F4F6F8] hover:bg-slate-100/90 focus:bg-white text-slate-900 placeholder-slate-400 rounded-full pl-5 pr-11 py-2 text-xs sm:text-sm font-medium border border-slate-200/90 focus:border-[#008CFF] focus:outline-none focus:ring-2 focus:ring-[#008CFF]/20 shadow-inner transition-all"
              />
              <button
                type="button"
                aria-label="Search"
                className="absolute right-1 top-1 bottom-1 w-8 h-8 rounded-full bg-[#008CFF] hover:bg-[#0070cc] text-white flex items-center justify-center transition-colors shadow-xs"
              >
                {isSearching ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search size={14} />
                )}
              </button>
            </div>

            {/* Search Dropdown Results */}
            {searchOpen && searchQuery.trim().length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl overflow-hidden z-50 border border-slate-200/90 bg-white text-slate-900">
                <div className="p-2.5 border-b text-[11px] font-bold uppercase tracking-wider flex justify-between bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <span>{isBangla ? 'পণ্য পরামর্শ' : 'Search Suggestions'}</span>
                  <span>{formatNumber(searchResults.length)} {isBangla ? 'টি ফলাফল' : 'matches'}</span>
                </div>
                {searchResults.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                    {searchResults.map((p) => (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}`}
                        onClick={() => setSearchOpen(false)}
                        className="p-3 flex items-center justify-between hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-colors group"
                      >
                        <div>
                          <p className="text-xs sm:text-sm font-semibold group-hover:text-[#008CFF] transition-colors line-clamp-1">
                            {p.name}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            <span className="font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                              {p.sku}
                            </span>
                            <span>{p.brand}</span>
                            <span>•</span>
                            <span>{p.category}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <span className="text-xs sm:text-sm font-extrabold text-[#008CFF] block font-mono">
                            ৳{formatNumber(p.retailPrice.toLocaleString())}
                          </span>
                          <span className={`text-[10px] font-bold ${p.currentStock > 0 ? 'text-emerald-500' : 'text-rose-400'}`}>
                            {p.currentStock > 0 ? t('common.inStock', 'In Stock') : t('common.outOfStock', 'Pre-Order')}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-slate-500">
                    {isSearching ? t('common.loading', 'Searching catalog...') : `${t('common.noResults', 'No matching products found for')} "${searchQuery}".`}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Items on Right */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Showroom Pill */}
            <div className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF4FF] border border-blue-200/80 text-[11px] text-[#002B5B] font-semibold">
              <MapPin size={12} className="text-[#008CFF]" />
              <span>{isBangla ? 'মৌলভীবাজার' : 'Moulvibazar'}</span>
            </div>

            {/* Hotline Pill */}
            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4F6F8] hover:bg-[#EAF4FF] border border-slate-200 text-[11px] text-[#002B5B] font-bold transition-colors"
            >
              <Phone size={12} className="text-[#008CFF]" />
              <span>{isBangla ? formatNumber(BUSINESS_INFO.phone) : BUSINESS_INFO.phone}</span>
            </a>

            {/* Track Order Button */}
            <Link
              href="/track-order"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all transform hover:-translate-y-0.5"
            >
              <PackageSearch size={14} />
              <span>{t('orders.trackOrder', 'Track Order')}</span>
            </Link>

            {/* Wishlist Icon */}
            <Link
              href="/laptops"
              aria-label="Wishlist"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#F4F6F8] hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 hover:text-[#008CFF] transition-colors"
            >
              <Heart size={14} className="text-rose-500" />
              <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded-full font-bold ml-0.5 text-slate-800">
                {formatNumber(wishlistCount)}
              </span>
            </Link>

            {/* Customer Account Button (hidden on mobile, accessible via mobile bottom nav) */}
            {customer ? (
              <Link
                href="/customer/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF4FF] hover:bg-blue-100/80 border border-blue-200/80 text-[#002B5B] text-xs font-bold transition-all shadow-2xs group"
                title={`Account: ${customer.name}`}
              >
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#008CFF] to-sky-400 flex items-center justify-center text-[10px] text-white font-black shadow-xs">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[80px] truncate">{customer.name.split(' ')[0]}</span>
              </Link>
            ) : (
              <Link
                href="/customer/login"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F4F6F8] hover:bg-[#EAF4FF] border border-slate-200 text-[#002B5B] text-xs font-semibold transition-all group"
                title="Customer Sign In"
              >
                <User size={13} className="text-[#008CFF] group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">{t('nav.login', 'Sign In')}</span>
              </Link>
            )}

            {/* Shopping Cart Pill Button (hidden on mobile, accessible via mobile bottom nav) */}
            <button
              type="button"
              onClick={openCart}
              aria-label="View shopping cart"
              className="hidden sm:flex relative items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#008CFF] hover:bg-[#0070cc] text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all group"
            >
              <ShoppingBag size={15} className="group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline font-semibold">{t('nav.cart', 'Cart')}</span>
              <span className="bg-white text-[#008CFF] text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {formatNumber(totalItems)}
              </span>
            </button>

            {/* Mobile Quick Call Button */}
            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="md:hidden p-1.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center"
              aria-label="Call Sales Hotline"
              title="Call Sales Hotline"
            >
              <Phone size={15} />
            </a>

            {/* Dark / Light Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'light' ? 'Light Mode Active' : 'Switch to Light Mode'}
              className="p-1.5 rounded-full bg-[#F4F6F8] hover:bg-slate-200 border border-slate-200 text-amber-500 transition-colors"
            >
              {theme === 'light' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Mobile Menu Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg bg-[#F4F6F8] text-[#002B5B] hover:bg-slate-200 border border-slate-200 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar inside header */}
        <div ref={searchRef} className="md:hidden px-3 sm:px-4 pb-2.5 relative">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Search CCTV, PC, Laptop, Electricals..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="w-full bg-[#F4F6F8] text-slate-900 placeholder-slate-400 rounded-full pl-4 pr-10 py-2 text-xs font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#008CFF]/20 shadow-inner"
            />
            <button
              type="button"
              aria-label="Submit Search"
              className="absolute right-1 top-1 bottom-1 w-7 h-7 rounded-full bg-[#008CFF] text-white flex items-center justify-center"
            >
              {isSearching ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Search size={13} />
              )}
            </button>
          </div>

          {/* Mobile Search Suggestions Dropdown */}
          {searchOpen && searchQuery.trim().length >= 2 && (
            <div className="absolute top-full left-3 right-3 mt-1.5 rounded-2xl shadow-2xl overflow-hidden z-50 border border-slate-200 bg-white text-slate-900 max-h-72 overflow-y-auto">
              <div className="p-2 border-b text-[10px] font-bold uppercase tracking-wider flex justify-between bg-slate-50 border-slate-200 text-slate-500">
                <span>Suggestions ({searchResults.length})</span>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕ Close
                </button>
              </div>
              {searchResults.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {searchResults.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="p-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                      <div className="pr-2">
                        <p className="text-xs font-semibold line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.brand} • {p.category}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-[#008CFF] font-mono block">
                          ৳{p.retailPrice.toLocaleString()}
                        </span>
                        <span className={`text-[9px] font-bold ${p.currentStock > 0 ? 'text-emerald-500' : 'text-rose-400'}`}>
                          {p.currentStock > 0 ? 'In Stock' : 'Pre-Order'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-xs text-slate-500">
                  {isSearching ? 'Searching...' : `No products found for "${searchQuery}"`}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Horizontal Auto-Scrolling Category Navigation Sub-bar with Infinite Loop */}
      <div className="relative bg-[#F8FAFC] border-b border-slate-200/80 py-1.5 group/nav overflow-hidden select-none">
        {/* Left Gradient Fade & Nudge Button */}
        <div className="absolute left-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-r from-[#F8FAFC] to-transparent flex items-center justify-start pl-1">
          <button
            type="button"
            onClick={scrollNavLeft}
            aria-label="Scroll categories left"
            className="pointer-events-auto opacity-0 group-hover/nav:opacity-100 transition-opacity w-5 h-5 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-[#008CFF] hover:text-white cursor-pointer"
          >
            <ChevronLeft size={13} />
          </button>
        </div>

        {/* Right Gradient Fade & Nudge Button */}
        <div className="absolute right-0 top-0 bottom-0 w-8 z-10 pointer-events-none bg-gradient-to-l from-[#F8FAFC] to-transparent flex items-center justify-end pr-1">
          <button
            type="button"
            onClick={scrollNavRight}
            aria-label="Scroll categories right"
            className="pointer-events-auto opacity-0 group-hover/nav:opacity-100 transition-opacity w-5 h-5 rounded-full bg-white shadow-md border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-[#008CFF] hover:text-white cursor-pointer"
          >
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Scrollable Track: Infinite seamlessly looped */}
        <nav
          ref={navScrollRef}
          onMouseEnter={() => { isNavPaused.current = true; }}
          onMouseLeave={() => { isNavPaused.current = false; }}
          onTouchStart={() => { isNavPaused.current = true; }}
          onTouchEnd={() => { isNavPaused.current = false; }}
          className="overflow-x-auto scrollbar-none flex items-center gap-1.5 sm:gap-2 text-xs font-medium whitespace-nowrap px-4 w-full"
        >
          {/* Double track to enable 100% seamless infinite loop */}
          {[...CATEGORY_NAV_ITEMS, ...CATEGORY_NAV_ITEMS].map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link
                key={`${item.name}-${idx}`}
                href={item.href}
                onFocus={() => { isNavPaused.current = true; }}
                onBlur={() => { isNavPaused.current = false; }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[#002B5B] hover:text-[#008CFF] bg-white border border-slate-200/90 hover:border-blue-200 shadow-2xs transition-all text-[11px] sm:text-xs font-semibold shrink-0 hover:scale-[1.02]"
              >
                <Icon size={13} className="text-[#008CFF] shrink-0" />
                <span>{item.name}</span>
                {item.badge && (
                  <span className="bg-[#EAF4FF] text-[#008CFF] px-1.5 py-0.2 rounded-full text-[9px] font-bold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>

      {/* Mobile Menu Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex flex-col justify-start">
          <div className="bg-white text-[#002B5B] border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
              <NeedElectroLogo size="sm" theme="light" showTagline={false} showSisterConcern={false} />
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <div className="bg-white flex-1 overflow-y-auto px-4 py-4 space-y-4 text-slate-900">
            {/* Language Switcher Card */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {isBangla ? 'ভাষা পরিবর্তন করুন' : 'Select Language'}
              </span>
              <LanguageSwitcher variant="segmented" />
            </div>

            {/* Customer Account / Sign In Card */}
            {customer ? (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/30 to-slate-900/70 border border-blue-500/30 shadow-xs">
                <div className="flex items-center gap-3 mb-2.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#008CFF] to-sky-400 flex items-center justify-center text-sm text-white font-black shadow-md shadow-blue-500/25">
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{customer.name}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{customer.phone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-bold">
                  <Link
                    href="/customer/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-1.5 px-2 rounded-lg bg-[#008CFF]/15 text-[#008CFF] dark:text-sky-300 hover:bg-[#008CFF]/25 text-center transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/customer/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-1.5 px-2 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 text-center transition-colors"
                  >
                    My Orders
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/customer/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 px-3 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white text-xs font-bold text-center transition-all shadow-sm"
                >
                  {isBangla ? 'লগইন করুন' : 'Customer Sign In'}
                </Link>
                <Link
                  href="/customer/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold text-center border border-slate-200 dark:border-slate-700 transition-all"
                >
                  {isBangla ? 'অ্যাকাউন্ট খুলুন' : 'Register'}
                </Link>
              </div>
            )}

            {/* Quick Track Order Banner */}
            <Link
              href="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold shadow-md shadow-emerald-500/20"
            >
              <div className="flex items-center gap-2.5">
                <PackageSearch size={18} />
                <div>
                  <p className="text-xs leading-none">{t('orders.trackOrder', 'Track Order Live')}</p>
                  <p className="text-[10px] text-emerald-100 font-normal mt-0.5">
                    {isBangla ? 'রিয়েল-টাইম ডেলিভারি স্ট্যাটাস দেখুন' : 'Check parcel delivery status'}
                  </p>
                </div>
              </div>
              <ArrowRight size={14} />
            </Link>

            {/* Categories Grid */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                {t('nav.categories', 'Shop Categories')}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <Link
                  href="/laptops"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                >
                  <Laptop size={14} className="text-[#008CFF]" />
                  <span>{t('nav.laptops', 'Laptops')}</span>
                </Link>
                <Link
                  href="/computers"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                >
                  <Monitor size={14} className="text-indigo-500" />
                  <span>{isBangla ? 'ডেস্কটপ ও পিসি' : 'Desktops & PCs'}</span>
                </Link>
                <Link
                  href="/cctv"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                >
                  <Camera size={14} className="text-emerald-500" />
                  <span>{t('nav.cctv', 'CCTV & Security')}</span>
                </Link>
                <Link
                  href="/electrical-products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                >
                  <Zap size={14} className="text-amber-500" />
                  <span>{t('nav.electrical', 'Electrical Equipment')}</span>
                </Link>
                <Link
                  href="/networking"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                >
                  <Wifi size={14} className="text-teal-500" />
                  <span>{isBangla ? 'নেটওয়ার্কিং ও রাউটার' : 'Networking & Routers'}</span>
                </Link>
                <Link
                  href="/computer-accessories"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                >
                  <Smartphone size={14} className="text-sky-500" />
                  <span>{isBangla ? 'কম্পিউটার এক্সেসরিজ' : 'Accessories'}</span>
                </Link>
              </div>
            </div>

            {/* Special Services */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Customer Services</p>
              <div className="space-y-2">
                <Link
                  href="/guides"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-[#008CFF] dark:text-cyan-300 font-bold flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles size={15} />
                    <span>Guides &amp; Advice Hub</span>
                  </div>
                  <span className="text-[10px] bg-[#008CFF] text-white px-2 py-0.5 rounded-full">Explore</span>
                </Link>
                <Link
                  href="/laptop-emi"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0084d6] dark:text-cyan-400 font-bold flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CreditCard size={15} />
                    <span>Laptop EMI (0% Interest)</span>
                  </div>
                  <span className="text-[10px] bg-[#0084d6] text-white px-2 py-0.5 rounded-full">Apply</span>
                </Link>
                <Link
                  href="/services/electrician"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Zap size={15} />
                    <span>Book Certified Electrician</span>
                  </div>
                  <span className="text-[10px] bg-amber-600 text-white px-2 py-0.5 rounded-full">Moulvibazar</span>
                </Link>
              </div>
            </div>

            {/* Contact & Hotline */}
            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <a
                href={`tel:${BUSINESS_INFO.phoneClean}`}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#0070cc] text-white font-bold shadow-md shadow-blue-500/20"
              >
                <Phone size={14} className="text-white" />
                <span>Call Hotline: {BUSINESS_INFO.phone}</span>
              </a>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>📍 Kusumbag, Moulvibazar</span>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-[#0084d6] hover:underline font-semibold"
                >
                  Staff ERP Login →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer />
    </>
  );
};

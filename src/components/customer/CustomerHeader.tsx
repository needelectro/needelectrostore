'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Search, Phone, MessageCircle, Menu, X, ChevronDown,
  Laptop, Monitor, Camera, Zap, Cpu, Wifi, Smartphone,
  MapPin, ShieldCheck, CreditCard, BookOpen, Clock, ArrowRight
} from 'lucide-react';
import { BUSINESS_INFO, slugify } from '@/lib/seoConfig';

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

  return (
    <header className="sticky top-0 z-50 w-full bg-[#080d1a]/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-blue-900/40 via-cyan-900/30 to-blue-900/40 border-b border-blue-500/20 py-1.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Moulvibazar Showroom Open: 9:30 AM – 9:30 PM</span>
            <span className="hidden md:inline text-slate-500">|</span>
            <span className="hidden md:inline text-cyan-400 font-medium">Laptop EMI & Same-Day Service Available</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors font-semibold"
            >
              <Phone size={13} className="text-cyan-400" />
              <span>{BUSINESS_INFO.phone}</span>
            </a>
            <a
              href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20NEED%20ELECTRO%2C%20I%20would%20like%20to%20inquire%20about%20your%20products%20and%20services.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
            >
              <MessageCircle size={13} />
              <span>WhatsApp</span>
            </a>
            <Link
              href="/admin"
              className="hidden lg:inline-flex items-center gap-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-0.5 rounded text-[11px] font-medium border border-slate-700"
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform p-1">
            <img src="/logo-icon.png" alt="NEED ELECTRO Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent block">
              {BUSINESS_INFO.name}
            </span>
            <span className="text-[10px] tracking-wider text-slate-400 uppercase font-semibold block">
              Moulvibazar, Bangladesh
            </span>
          </div>
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
              className="w-full bg-slate-900/90 border border-slate-700/80 focus:border-cyan-400 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            {isSearching && (
              <div className="absolute right-3 top-2.5">
                <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Search Dropdown Results */}
          {searchOpen && searchQuery.trim().length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
              <div className="p-2 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
                <span>Search Results</span>
                <span>{searchResults.length} items found</span>
              </div>
              {searchResults.length > 0 ? (
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                  {searchResults.map(p => (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug}`}
                      onClick={() => setSearchOpen(false)}
                      className="p-2.5 flex items-center justify-between hover:bg-slate-800/80 transition-colors group"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-200 group-hover:text-cyan-400 transition-colors">
                          {p.name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[11px] text-slate-300 font-mono">
                            {p.sku}
                          </span>
                          <span>{p.brand}</span>
                          <span>•</span>
                          <span>{p.category}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <span className="text-sm font-bold text-cyan-400 block">
                          ৳{p.retailPrice.toLocaleString()}
                        </span>
                        <span className={`text-[10px] ${p.currentStock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {p.currentStock > 0 ? 'In Stock' : 'Pre-Order'}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs">
                  {isSearching ? 'Searching database...' : `No matching products found for "${searchQuery}". Call +880 1733-983752 for custom sourcing.`}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Primary Action Buttons */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/laptop-emi"
            className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-md shadow-blue-500/20 transition-all transform hover:-translate-y-0.5"
          >
            <CreditCard size={14} />
            <span>Laptop EMI</span>
          </Link>
          <Link
            href="/services/electrician"
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-lg border border-slate-700 transition-colors"
          >
            <Zap size={14} className="text-amber-400" />
            <span>Book Electrician</span>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-slate-300 hover:text-white p-2"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop Secondary Navigation Bar */}
      <nav className="hidden lg:block bg-slate-900/60 border-t border-slate-800/80 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs font-medium">
          <div className="flex items-center space-x-1">
            <Link
              href="/"
              className="px-3 py-2.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50 rounded-md transition-colors"
            >
              Home
            </Link>

            {/* Laptops Dropdown */}
            <div className="relative group">
              <Link
                href="/laptops"
                className="px-3 py-2.5 text-slate-300 hover:text-cyan-400 group-hover:bg-slate-800/50 rounded-md transition-colors inline-flex items-center gap-1"
              >
                <span>Laptops</span>
                <ChevronDown size={13} className="text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:rotate-180" />
              </Link>
              <div className="absolute top-full left-0 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50">
                <Link href="/laptops" className="block px-3 py-2 text-slate-200 hover:bg-slate-800 rounded-lg text-xs font-semibold">
                  All Laptops Overview
                </Link>
                <Link href="/laptops/hp" className="block px-3 py-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg text-xs">
                  HP Laptops (EliteBook, ProBook)
                </Link>
                <Link href="/laptops/dell" className="block px-3 py-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg text-xs">
                  Dell Laptops (Latitude, Inspiron)
                </Link>
                <Link href="/laptops/lenovo" className="block px-3 py-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg text-xs">
                  Lenovo Laptops (ThinkPad)
                </Link>
                <div className="border-t border-slate-800 mt-1 pt-1">
                  <Link href="/laptop-emi" className="block px-3 py-2 text-cyan-400 hover:bg-slate-800 rounded-lg text-xs font-semibold">
                    Laptop EMI in Moulvibazar →
                  </Link>
                </div>
              </div>
            </div>

            <Link href="/computers" className="px-3 py-2.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50 rounded-md transition-colors">
              Computers
            </Link>
            <Link href="/cctv" className="px-3 py-2.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50 rounded-md transition-colors">
              CCTV & Security
            </Link>
            <Link href="/electrical-products" className="px-3 py-2.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50 rounded-md transition-colors">
              Electrical Products
            </Link>
            <Link href="/computer-accessories" className="px-3 py-2.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50 rounded-md transition-colors">
              Accessories
            </Link>
            <Link href="/networking" className="px-3 py-2.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50 rounded-md transition-colors">
              Networking
            </Link>

            {/* Services Dropdown */}
            <div className="relative group">
              <Link
                href="/electrical-services"
                className="px-3 py-2.5 text-slate-300 hover:text-cyan-400 group-hover:bg-slate-800/50 rounded-md transition-colors inline-flex items-center gap-1"
              >
                <span>Services</span>
                <ChevronDown size={13} className="text-slate-500 group-hover:text-cyan-400 transition-transform group-hover:rotate-180" />
              </Link>
              <div className="absolute top-full left-0 w-60 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 hidden group-hover:block z-50">
                <Link href="/electrical-services" className="block px-3 py-2 text-slate-200 hover:bg-slate-800 rounded-lg text-xs font-semibold">
                  Electrical Services Overview
                </Link>
                <Link href="/services/electrician" className="block px-3 py-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg text-xs">
                  ⚡ Certified Electrician Booking
                </Link>
                <Link href="/services/cctv-installation" className="block px-3 py-2 text-slate-300 hover:text-cyan-400 hover:bg-slate-800 rounded-lg text-xs">
                  📹 CCTV Camera Installation
                </Link>
              </div>
            </div>

            <Link href="/moulvibazar" className="px-3 py-2.5 text-cyan-400 font-semibold hover:bg-slate-800/50 rounded-md transition-colors inline-flex items-center gap-1">
              <MapPin size={13} />
              <span>Moulvibazar Hub</span>
            </Link>
            <Link href="/blog" className="px-3 py-2.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50 rounded-md transition-colors">
              Blog / Guides
            </Link>
            <Link href="/contact" className="px-3 py-2.5 text-slate-300 hover:text-cyan-400 hover:bg-slate-800/50 rounded-md transition-colors">
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-4 text-slate-400 text-xs py-2">
            <span>Showroom: Kusumbag, Moulvibazar</span>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-3">
          {/* Mobile Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search laptops, CCTV, parts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          </div>

          {searchResults.length > 0 && searchQuery.trim().length >= 2 && (
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-2 max-h-60 overflow-y-auto space-y-1">
              {searchResults.map(p => (
                <Link
                  key={p.id}
                  href={`/product/${p.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block p-2 hover:bg-slate-800 rounded text-xs"
                >
                  <span className="font-medium text-slate-200 block">{p.name}</span>
                  <span className="text-cyan-400 font-bold">৳{p.retailPrice.toLocaleString()}</span>
                </Link>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 bg-slate-900 rounded text-slate-200 hover:text-cyan-400"
            >
              Home
            </Link>
            <Link
              href="/laptops"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 bg-slate-900 rounded text-slate-200 hover:text-cyan-400"
            >
              💻 Laptops
            </Link>
            <Link
              href="/laptops/hp"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 bg-slate-900 rounded text-slate-300 pl-4 hover:text-cyan-400"
            >
              ↳ HP Laptops
            </Link>
            <Link
              href="/laptops/dell"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 bg-slate-900 rounded text-slate-300 pl-4 hover:text-cyan-400"
            >
              ↳ Dell Laptops
            </Link>
            <Link
              href="/computers"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 bg-slate-900 rounded text-slate-200 hover:text-cyan-400"
            >
              🖥️ Computers
            </Link>
            <Link
              href="/cctv"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 bg-slate-900 rounded text-slate-200 hover:text-cyan-400"
            >
              📹 CCTV & Security
            </Link>
            <Link
              href="/electrical-products"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 bg-slate-900 rounded text-slate-200 hover:text-cyan-400"
            >
              ⚡ Electrical Products
            </Link>
            <Link
              href="/computer-accessories"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 bg-slate-900 rounded text-slate-200 hover:text-cyan-400"
            >
              ⌨️ Accessories
            </Link>
            <Link
              href="/services/electrician"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 bg-slate-900 rounded text-amber-300 font-semibold"
            >
              🔧 Book Electrician
            </Link>
            <Link
              href="/laptop-emi"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 bg-blue-900/40 border border-blue-600/40 rounded text-cyan-300 font-bold"
            >
              💳 Laptop EMI
            </Link>
            <Link
              href="/moulvibazar"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 bg-slate-900 rounded text-cyan-400 font-medium"
            >
              📍 Moulvibazar Hub
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 bg-slate-900 rounded text-slate-200 hover:text-cyan-400"
            >
              📚 Blog Guides
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 bg-slate-900 rounded text-slate-200 hover:text-cyan-400"
            >
              📞 Contact Us
            </Link>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 bg-slate-900 rounded text-slate-400 hover:text-white"
            >
              🔐 Staff Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, Heart, ShoppingBag, PackageSearch } from 'lucide-react';
import { useCart } from '@/src/services/cartContext';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { openCart, totalItems } = useCart();
  const [wishlistCount, setWishlistCount] = useState<number>(0);

  // Sync wishlist count from localStorage
  useEffect(() => {
    const syncWishlist = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('customer_wishlist') || '[]');
        setWishlistCount(Array.isArray(saved) ? saved.length : 0);
      } catch (e) {
        setWishlistCount(0);
      }
    };

    syncWishlist();
    window.addEventListener('storage', syncWishlist);
    return () => window.removeEventListener('storage', syncWishlist);
  }, []);

  // Do not render on staff ERP routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const isHome = pathname === '/';
  const isCategories =
    pathname?.startsWith('/laptops') ||
    pathname?.startsWith('/computers') ||
    pathname?.startsWith('/cctv') ||
    pathname?.startsWith('/electrical-products') ||
    pathname?.startsWith('/computer-accessories') ||
    pathname?.startsWith('/networking') ||
    pathname?.startsWith('/smart-devices');
  const isWishlist = pathname === '/wishlist';
  const isTrack = pathname?.startsWith('/track-order');

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-[#081621]/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-transform duration-300 translate-y-0"
    >
      <div className="grid grid-cols-5 h-14 items-center">
        {/* 1. Home */}
        <Link
          href="/"
          aria-label="Home"
          className="flex items-center justify-center h-full w-full focus:outline-none"
        >
          <div
            className={`relative flex flex-col items-center justify-center h-full w-full py-1 tap-highlight-transparent transition-colors ${
              isHome
                ? 'text-[#0084d6] dark:text-cyan-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Home className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight leading-tight truncate max-w-full px-0.5 text-center">
              Home
            </span>
            {isHome && (
              <span className="absolute bottom-0 w-6 h-0.5 bg-[#0084d6] dark:bg-cyan-400 rounded-full" />
            )}
          </div>
        </Link>

        {/* 2. Categories / Products */}
        <Link
          href="/laptops"
          aria-label="Categories"
          className="flex items-center justify-center h-full w-full focus:outline-none"
        >
          <div
            className={`relative flex flex-col items-center justify-center h-full w-full py-1 tap-highlight-transparent transition-colors ${
              isCategories
                ? 'text-[#0084d6] dark:text-cyan-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Package className="w-5 h-5 stroke-[2]" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight leading-tight truncate max-w-full px-0.5 text-center">
              Categories
            </span>
            {isCategories && (
              <span className="absolute bottom-0 w-6 h-0.5 bg-[#0084d6] dark:bg-cyan-400 rounded-full" />
            )}
          </div>
        </Link>

        {/* 3. Wishlist */}
        <Link
          href="/laptops"
          aria-label="Wishlist"
          className="flex items-center justify-center h-full w-full focus:outline-none"
        >
          <div
            className={`relative flex flex-col items-center justify-center h-full w-full py-1 tap-highlight-transparent transition-colors ${
              isWishlist
                ? 'text-rose-500 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <Heart className="w-5 h-5 stroke-[2]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight leading-tight truncate max-w-full px-0.5 text-center">
              Wishlist
            </span>
            {isWishlist && (
              <span className="absolute bottom-0 w-6 h-0.5 bg-rose-500 rounded-full" />
            )}
          </div>
        </Link>

        {/* 4. Cart Drawer Trigger */}
        <button
          type="button"
          onClick={openCart}
          aria-label="Shopping Cart"
          className="flex items-center justify-center h-full w-full focus:outline-none"
        >
          <div className="relative flex flex-col items-center justify-center h-full w-full py-1 tap-highlight-transparent transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
            <div className="relative">
              <ShoppingBag className="w-5 h-5 stroke-[2]" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#0084d6] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {totalItems}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight leading-tight truncate max-w-full px-0.5 text-center">
              Cart
            </span>
          </div>
        </button>

        {/* 5. Track Order / Account */}
        <Link
          href="/track-order"
          aria-label="Track Order"
          className="flex items-center justify-center h-full w-full focus:outline-none"
        >
          <div
            className={`relative flex flex-col items-center justify-center h-full w-full py-1 tap-highlight-transparent transition-colors ${
              isTrack
                ? 'text-emerald-600 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <PackageSearch className="w-5 h-5 stroke-[2] text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight leading-tight truncate max-w-full px-0.5 text-center text-emerald-600 dark:text-emerald-400 font-semibold">
              Track
            </span>
            {isTrack && (
              <span className="absolute bottom-0 w-6 h-0.5 bg-emerald-600 rounded-full" />
            )}
          </div>
        </Link>
      </div>
    </nav>
  );
};

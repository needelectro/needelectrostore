'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, Heart, ShoppingBag, PackageSearch, User } from 'lucide-react';
import { useCart } from '@/src/services/cartContext';
import { useLanguage } from '@/src/services/languageContext';
import { useCustomerAuth } from '@/src/services/customerAuthContext';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { openCart, totalItems } = useCart();
  const { customer } = useCustomerAuth();
  const { t, formatNumber } = useLanguage();
  const [wishlistCount, setWishlistCount] = useState<number>(0);

  // Sync wishlist count from localStorage
  useEffect(() => {
    const syncWishlist = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('customer_wishlist') || '[]');
        setWishlistCount(Array.isArray(saved) ? saved.length : 0);
      } catch {
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
    pathname?.startsWith('/smart-devices') ||
    pathname?.startsWith('/shop');
  const isWishlist = pathname === '/wishlist';
  const isTrack = pathname?.startsWith('/track-order');
  const isAccount = pathname?.startsWith('/customer');

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass-panel border-t border-[var(--glass-border)] shadow-[0_-8px_30px_rgba(0,0,0,0.15)] pb-[max(0.5rem,env(safe-area-inset-bottom))] transition-transform duration-300 backdrop-blur-xl"
      style={{
        backgroundColor: 'var(--glass-surface-subtle)',
      }}
    >
      <div className="grid grid-cols-5 h-14 items-center max-w-lg mx-auto">
        {/* 1. Home */}
        <Link
          href="/"
          aria-label={t('nav.home', 'Home')}
          className="flex items-center justify-center h-full w-full focus:outline-none"
        >
          <div
            className={`relative flex flex-col items-center justify-center h-full w-full py-1 transition-all duration-200 active:scale-95 ${
              isHome
                ? 'text-[#008CFF] font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <div className="relative">
              <Home className={`w-5 h-5 transition-transform duration-200 ${isHome ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight leading-tight truncate max-w-full px-0.5 text-center">
              {t('nav.home', 'Home')}
            </span>
            {isHome && (
              <span className="absolute bottom-0 w-6 h-0.5 bg-[#008CFF] rounded-full shadow-sm shadow-[#008CFF]" />
            )}
          </div>
        </Link>

        {/* 2. Categories / Products */}
        <Link
          href="/laptops"
          aria-label={t('nav.categories', 'Categories')}
          className="flex items-center justify-center h-full w-full focus:outline-none"
        >
          <div
            className={`relative flex flex-col items-center justify-center h-full w-full py-1 transition-all duration-200 active:scale-95 ${
              isCategories
                ? 'text-[#008CFF] font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <div className="relative">
              <Package className={`w-5 h-5 transition-transform duration-200 ${isCategories ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight leading-tight truncate max-w-full px-0.5 text-center">
              {t('nav.categories', 'Categories')}
            </span>
            {isCategories && (
              <span className="absolute bottom-0 w-6 h-0.5 bg-[#008CFF] rounded-full shadow-sm shadow-[#008CFF]" />
            )}
          </div>
        </Link>

        {/* 3. Cart Drawer Trigger */}
        <button
          type="button"
          onClick={openCart}
          aria-label={t('nav.cart', 'Cart')}
          className="flex items-center justify-center h-full w-full focus:outline-none"
        >
          <div className="relative flex flex-col items-center justify-center h-full w-full py-1 transition-all duration-200 active:scale-95 text-[var(--text-secondary)] hover:text-[#008CFF]">
            <div className="relative">
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#008CFF] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-md shadow-[#008CFF]/40 animate-pulse">
                  {formatNumber(totalItems)}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight leading-tight truncate max-w-full px-0.5 text-center">
              {t('nav.cart', 'Cart')}
            </span>
          </div>
        </button>

        {/* 4. Track Order */}
        <Link
          href="/track-order"
          aria-label={t('nav.trackOrder', 'Track')}
          className="flex items-center justify-center h-full w-full focus:outline-none"
        >
          <div
            className={`relative flex flex-col items-center justify-center h-full w-full py-1 transition-all duration-200 active:scale-95 ${
              isTrack
                ? 'text-emerald-500 font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <div className="relative">
              <PackageSearch className={`w-5 h-5 transition-transform duration-200 ${isTrack ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight leading-tight truncate max-w-full px-0.5 text-center">
              {t('orders.trackOrder', 'Track')}
            </span>
            {isTrack && (
              <span className="absolute bottom-0 w-6 h-0.5 bg-emerald-500 rounded-full shadow-sm shadow-emerald-500" />
            )}
          </div>
        </Link>

        {/* 5. Customer Account */}
        <Link
          href={customer ? '/customer/dashboard' : '/customer/login'}
          aria-label={customer ? 'Account' : 'Sign In'}
          className="flex items-center justify-center h-full w-full focus:outline-none"
        >
          <div
            className={`relative flex flex-col items-center justify-center h-full w-full py-1 transition-all duration-200 active:scale-95 ${
              isAccount
                ? 'text-[#008CFF] font-bold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <div className="relative">
              {customer ? (
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#008CFF] to-sky-400 flex items-center justify-center text-[10px] text-white font-black shadow-xs">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <User className={`w-5 h-5 transition-transform duration-200 ${isAccount ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8]'}`} />
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight leading-tight truncate max-w-full px-0.5 text-center">
              {customer ? (customer.name.split(' ')[0] || 'Account') : t('nav.login', 'Sign In')}
            </span>
            {isAccount && (
              <span className="absolute bottom-0 w-6 h-0.5 bg-[#008CFF] rounded-full shadow-sm shadow-[#008CFF]" />
            )}
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default MobileBottomNav;

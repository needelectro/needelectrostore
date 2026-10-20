'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutGrid, ShoppingBag, PackageSearch, User } from 'lucide-react';
import { useCart } from '@/src/services/cartContext';
import { useLanguage } from '@/src/services/languageContext';
import { useCustomerAuth } from '@/src/services/customerAuthContext';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const { openCart, totalItems } = useCart();
  const { customer } = useCustomerAuth();
  const { t, formatNumber, isBangla } = useLanguage();

  // Do not render on staff ERP routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const isHome = pathname === '/';
  const isProducts =
    pathname === '/shop' ||
    pathname?.startsWith('/shop') ||
    pathname?.startsWith('/product') ||
    pathname?.startsWith('/laptops') ||
    pathname?.startsWith('/computers') ||
    pathname?.startsWith('/cctv') ||
    pathname?.startsWith('/electrical-products') ||
    pathname?.startsWith('/computer-accessories') ||
    pathname?.startsWith('/networking') ||
    pathname?.startsWith('/smart-devices');
  const isTrack = pathname?.startsWith('/track-order');
  const isAccount = pathname?.startsWith('/customer');

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/90 dark:bg-[#071324]/92 backdrop-blur-2xl border-t border-slate-200/80 dark:border-cyan-500/20 shadow-[0_-10px_35px_rgba(0,0,0,0.12),0_-1px_0_rgba(0,140,255,0.1)] pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-1.5 transition-all duration-300"
    >
      {/* Top Futuristic Neon Beam Edge */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#008CFF]/50 to-transparent pointer-events-none" />

      <div className="grid grid-cols-5 h-14 items-center max-w-lg mx-auto px-1.5">
        {/* 1. Home Button */}
        <Link
          href="/"
          aria-label={t('nav.home', 'Home')}
          className="flex items-center justify-center h-full w-full focus:outline-none"
        >
          <div className="relative flex flex-col items-center justify-center h-full w-full py-1 transition-all duration-200 active:scale-90 group select-none">
            <div
              className={`relative w-11 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                isHome
                  ? 'bg-gradient-to-b from-[#008CFF]/20 to-[#008CFF]/5 text-[#008CFF] dark:text-sky-400 border border-[#008CFF]/30 shadow-[0_0_14px_rgba(0,140,255,0.25)]'
                  : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
              }`}
            >
              <Home
                className={`w-[19px] h-[19px] transition-transform duration-300 ${
                  isHome ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8] group-hover:scale-105'
                }`}
              />
            </div>
            <span
              className={`text-[10px] mt-1 tracking-tight leading-none truncate max-w-full px-0.5 text-center transition-colors duration-200 ${
                isHome ? 'font-bold text-[#008CFF] dark:text-sky-400' : 'font-medium text-slate-500 dark:text-slate-400'
              }`}
            >
              {isBangla ? 'হোম' : 'Home'}
            </span>
            {isHome && (
              <span className="absolute -bottom-1 w-5 h-0.5 rounded-full bg-gradient-to-r from-sky-400 to-[#008CFF] shadow-[0_0_8px_#008CFF]" />
            )}
          </div>
        </Link>

        {/* 2. Products Button (Replaced from Categories) */}
        <Link
          href="/shop"
          aria-label={isBangla ? 'পণ্য' : 'Products'}
          className="flex items-center justify-center h-full w-full focus:outline-none"
        >
          <div className="relative flex flex-col items-center justify-center h-full w-full py-1 transition-all duration-200 active:scale-90 group select-none">
            <div
              className={`relative w-11 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                isProducts
                  ? 'bg-gradient-to-b from-[#008CFF]/20 to-[#008CFF]/5 text-[#008CFF] dark:text-sky-400 border border-[#008CFF]/30 shadow-[0_0_14px_rgba(0,140,255,0.25)]'
                  : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
              }`}
            >
              <LayoutGrid
                className={`w-[19px] h-[19px] transition-transform duration-300 ${
                  isProducts ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8] group-hover:scale-105'
                }`}
              />
            </div>
            <span
              className={`text-[10px] mt-1 tracking-tight leading-none truncate max-w-full px-0.5 text-center transition-colors duration-200 ${
                isProducts ? 'font-bold text-[#008CFF] dark:text-sky-400' : 'font-medium text-slate-500 dark:text-slate-400'
              }`}
            >
              {isBangla ? 'পণ্য' : 'Products'}
            </span>
            {isProducts && (
              <span className="absolute -bottom-1 w-5 h-0.5 rounded-full bg-gradient-to-r from-sky-400 to-[#008CFF] shadow-[0_0_8px_#008CFF]" />
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
          <div className="relative flex flex-col items-center justify-center h-full w-full py-1 transition-all duration-200 active:scale-90 group select-none">
            <div className="relative w-11 h-7 rounded-full flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:text-[#008CFF] transition-all duration-300">
              <ShoppingBag className="w-[19px] h-[19px] stroke-[1.8] group-hover:scale-105 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-0.5 bg-gradient-to-r from-[#008CFF] to-cyan-400 text-white text-[9px] font-black min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center shadow-[0_2px_8px_rgba(0,140,255,0.6)] border border-white/60 dark:border-slate-900 animate-pulse">
                  {formatNumber(totalItems)}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight leading-none truncate max-w-full px-0.5 text-center font-medium text-slate-500 dark:text-slate-400 group-hover:text-[#008CFF] transition-colors duration-200">
              {isBangla ? 'কার্ট' : 'Cart'}
            </span>
          </div>
        </button>

        {/* 4. Track Order */}
        <Link
          href="/track-order"
          aria-label={isBangla ? 'ট্র্যাক' : 'Track Order'}
          className="flex items-center justify-center h-full w-full focus:outline-none"
        >
          <div className="relative flex flex-col items-center justify-center h-full w-full py-1 transition-all duration-200 active:scale-90 group select-none">
            <div
              className={`relative w-11 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                isTrack
                  ? 'bg-gradient-to-b from-emerald-500/20 to-emerald-500/5 text-emerald-500 border border-emerald-500/30 shadow-[0_0_14px_rgba(16,185,129,0.25)]'
                  : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
              }`}
            >
              <PackageSearch
                className={`w-[19px] h-[19px] transition-transform duration-300 ${
                  isTrack ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8] group-hover:scale-105'
                }`}
              />
            </div>
            <span
              className={`text-[10px] mt-1 tracking-tight leading-none truncate max-w-full px-0.5 text-center transition-colors duration-200 ${
                isTrack ? 'font-bold text-emerald-500' : 'font-medium text-slate-500 dark:text-slate-400'
              }`}
            >
              {isBangla ? 'ট্র্যাক' : 'Track Order'}
            </span>
            {isTrack && (
              <span className="absolute -bottom-1 w-5 h-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_8px_#10b981]" />
            )}
          </div>
        </Link>

        {/* 5. Customer Account / Login */}
        <Link
          href={customer ? '/customer/dashboard' : '/customer/login'}
          aria-label={customer ? 'Account' : 'Login'}
          className="flex items-center justify-center h-full w-full focus:outline-none"
        >
          <div className="relative flex flex-col items-center justify-center h-full w-full py-1 transition-all duration-200 active:scale-90 group select-none">
            <div
              className={`relative w-11 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                isAccount
                  ? 'bg-gradient-to-b from-[#008CFF]/20 to-[#008CFF]/5 text-[#008CFF] dark:text-sky-400 border border-[#008CFF]/30 shadow-[0_0_14px_rgba(0,140,255,0.25)]'
                  : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200'
              }`}
            >
              {customer ? (
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#008CFF] to-sky-400 flex items-center justify-center text-[10px] text-white font-black shadow-xs ring-1 ring-white/30">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
              ) : (
                <User
                  className={`w-[19px] h-[19px] transition-transform duration-300 ${
                    isAccount ? 'scale-110 stroke-[2.2]' : 'stroke-[1.8] group-hover:scale-105'
                  }`}
                />
              )}
            </div>
            <span
              className={`text-[10px] mt-1 tracking-tight leading-none truncate max-w-full px-0.5 text-center transition-colors duration-200 ${
                isAccount ? 'font-bold text-[#008CFF] dark:text-sky-400' : 'font-medium text-slate-500 dark:text-slate-400'
              }`}
            >
              {customer ? (customer.name.split(' ')[0] || (isBangla ? 'অ্যাকাউন্ট' : 'Account')) : (isBangla ? 'লগইন' : 'Login')}
            </span>
            {isAccount && (
              <span className="absolute -bottom-1 w-5 h-0.5 rounded-full bg-gradient-to-r from-sky-400 to-[#008CFF] shadow-[0_0_8px_#008CFF]" />
            )}
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default MobileBottomNav;


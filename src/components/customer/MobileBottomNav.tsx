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
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-6px_25px_rgba(0,43,91,0.06)] pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-1.5 transition-all duration-300"
    >
      {/* Top Futuristic Brand Beam Edge */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#008CFF]/40 to-transparent pointer-events-none" />

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
                  ? 'bg-[#EAF4FF] text-[#008CFF] border border-[#008CFF]/30 shadow-xs'
                  : 'text-slate-500 group-hover:text-[#002B5B]'
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
                isHome ? 'font-bold text-[#008CFF]' : 'font-medium text-slate-500 group-hover:text-[#002B5B]'
              }`}
            >
              {isBangla ? 'হোম' : 'Home'}
            </span>
            {isHome && (
              <span className="absolute -bottom-1 w-5 h-0.5 rounded-full bg-[#008CFF]" />
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
                  ? 'bg-[#EAF4FF] text-[#008CFF] border border-[#008CFF]/30 shadow-xs'
                  : 'text-slate-500 group-hover:text-[#002B5B]'
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
                isProducts ? 'font-bold text-[#008CFF]' : 'font-medium text-slate-500 group-hover:text-[#002B5B]'
              }`}
            >
              {isBangla ? 'পণ্য' : 'Products'}
            </span>
            {isProducts && (
              <span className="absolute -bottom-1 w-5 h-0.5 rounded-full bg-[#008CFF]" />
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
            <div className="relative w-11 h-7 rounded-full flex items-center justify-center text-slate-500 group-hover:text-[#008CFF] transition-all duration-300">
              <ShoppingBag className="w-[19px] h-[19px] stroke-[1.8] group-hover:scale-105 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-0.5 bg-[#008CFF] text-white text-[9px] font-black min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center shadow-xs border border-white">
                  {formatNumber(totalItems)}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-1 tracking-tight leading-none truncate max-w-full px-0.5 text-center font-medium text-slate-500 group-hover:text-[#008CFF] transition-colors duration-200">
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
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-300 shadow-xs'
                  : 'text-slate-500 group-hover:text-[#002B5B]'
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
                isTrack ? 'font-bold text-emerald-600' : 'font-medium text-slate-500 group-hover:text-[#002B5B]'
              }`}
            >
              {isBangla ? 'ট্র্যাক' : 'Track Order'}
            </span>
            {isTrack && (
              <span className="absolute -bottom-1 w-5 h-0.5 rounded-full bg-emerald-500" />
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
                  ? 'bg-[#EAF4FF] text-[#008CFF] border border-[#008CFF]/30 shadow-xs'
                  : 'text-slate-500 group-hover:text-[#002B5B]'
              }`}
            >
              {customer ? (
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#008CFF] to-sky-400 flex items-center justify-center text-[10px] text-white font-black shadow-xs ring-1 ring-white">
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
                isAccount ? 'font-bold text-[#008CFF]' : 'font-medium text-slate-500 group-hover:text-[#002B5B]'
              }`}
            >
              {customer ? (customer.name.split(' ')[0] || (isBangla ? 'অ্যাকাউন্ট' : 'Account')) : (isBangla ? 'লগইন' : 'Login')}
            </span>
            {isAccount && (
              <span className="absolute -bottom-1 w-5 h-0.5 rounded-full bg-[#008CFF]" />
            )}
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default MobileBottomNav;


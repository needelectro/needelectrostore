import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Search, Home, ShoppingBag, Laptop, Camera,
  Zap, Monitor, Phone, MessageCircle, ArrowLeft,
  HelpCircle, Compass
} from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';

export const metadata: Metadata = {
  title: '404 - Page Not Found | NEED ELECTRO',
  description: 'The page or product you are looking for does not exist or has been moved. Explore laptops, CCTV cameras, and electrical products at NEED ELECTRO.',
  robots: {
    index: false,
    follow: true,
  },
};

const POPULAR_LINKS = [
  { name: 'Browse Laptops', href: '/laptops', icon: Laptop, desc: 'HP, Dell, Lenovo with Warranty' },
  { name: 'CCTV & Security', href: '/cctv', icon: Camera, desc: 'Hikvision & Dahua HD/IP Kits' },
  { name: 'Desktop & PC', href: '/computers', icon: Monitor, desc: 'Custom Rigs & Office Desktops' },
  { name: 'Electricals', href: '/electrical-products', icon: Zap, desc: 'Switches, Breakers & Fixtures' },
  { name: 'Laptop EMI', href: '/laptop-emi', icon: ShoppingBag, desc: 'Flexible Installment Plans' },
  { name: 'Track Order', href: '/track-order', icon: Compass, desc: 'Real-time Courier Delivery' },
];

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#002B5B] flex flex-col font-sans">
      <CustomerHeader />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex flex-col items-center justify-center text-center">
        {/* Glowing 404 Badge */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full blur-2xl opacity-20 dark:opacity-30 pointer-events-none" />
          <div className="relative inline-flex items-center justify-center px-6 py-2 rounded-full border border-blue-500/30 bg-blue-50 dark:bg-blue-950/40 text-[#008CFF] text-xs sm:text-sm font-black tracking-widest uppercase">
            <span>HTTP 404 &bull; Page Not Found</span>
          </div>
        </div>

        {/* Big Stylized 404 Headline */}
        <h1 className="text-6xl sm:text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#008CFF] to-blue-600 dark:from-white dark:via-sky-400 dark:to-blue-500 tracking-tight mb-4">
          404
        </h1>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
          Oops! We couldn't find that page.
        </h2>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-lg mb-8 leading-relaxed">
          The link you clicked might be outdated, the product may have been relocated, or the URL might have a typo.
          <span className="block mt-1 text-xs text-slate-500 dark:text-slate-400">
            (পৃষ্ঠাটি পাওয়া যায়নি — অনুগ্রহ করে নিচের লিংকসমূহ ব্যবহার করুন বা সরাসরি যোগাযোগ করুন)
          </span>
        </p>

        {/* Search Bar Redirecting to Shop */}
        <form
          action="/shop"
          method="GET"
          className="w-full max-w-md flex items-center gap-2 mb-10 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md shadow-slate-200/50 dark:shadow-none"
        >
          <div className="pl-3 text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            name="q"
            placeholder="Search laptops, CCTV, accessories..."
            className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 py-2"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-[#008CFF] hover:bg-blue-600 text-white font-bold text-xs transition-colors shrink-0 shadow-sm"
          >
            Search
          </button>
        </form>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02]"
          >
            <Home size={16} />
            <span>Back to Home</span>
          </Link>

          <a
            href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20NEED%20ELECTRO,%20I%20was%20looking%20for%20a%20page%20or%20product%20on%20your%20website%20and%20got%20a%20404.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02]"
          >
            <MessageCircle size={16} />
            <span>Chat on WhatsApp</span>
          </a>

          <a
            href={`tel:${BUSINESS_INFO.phoneClean}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs sm:text-sm font-bold shadow-sm transition-all"
          >
            <Phone size={16} />
            <span>Call {BUSINESS_INFO.phone}</span>
          </a>
        </div>

        {/* Popular Destination Cards */}
        <div className="w-full">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Popular Categories &amp; Services
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {POPULAR_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-[#008CFF] dark:hover:border-[#008CFF] transition-all text-left group shadow-xs hover:shadow-md"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-slate-800 text-[#008CFF] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <Icon size={16} />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#008CFF] transition-colors line-clamp-1">
                    {link.name}
                  </h3>
                  <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {link.desc}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/src/services/languageContext';

export default function OfflinePage() {
  const { t, isBangla } = useLanguage();

  const handleRetry = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002B5B] via-[#08182d] to-[#040d1a] flex items-center justify-center p-4 sm:p-6 text-white relative overflow-hidden">
      {/* Decorative glass glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#008CFF]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-[#002B5B]/50 rounded-full blur-2xl pointer-events-none" />

      <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl relative z-10 text-center backdrop-blur-xl">
        {/* Offline Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 4.243a9 9 0 01-5.657-2.657m0 0l2.828-2.829m-2.828 2.829L3 21m3.536-12.536a5 5 0 011.414-1.414m2.829 2.829a1 1 0 101.414 1.414M1 1l22 22"
            />
          </svg>
        </div>

        {/* Offline Badge */}
        <span className="inline-block px-3 py-1 mb-4 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/20 border border-amber-500/30 text-amber-300">
          {isBangla ? 'ইন্টারনেট বিচ্ছিন্ন' : 'No Internet Connection'}
        </span>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
          {t('pwa.offlineTitle', 'You are currently offline')}
        </h1>

        {/* Description */}
        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          {t(
            'pwa.offlineDesc',
            'Please check your internet connection or mobile data. Previously loaded pages and saved cart items remain accessible.'
          )}
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleRetry}
            className="w-full py-3.5 px-6 rounded-xl font-bold bg-[#008CFF] hover:bg-[#0070cc] text-white shadow-lg shadow-[#008CFF]/30 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 animate-spin-hover" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{t('pwa.retryConnection', 'Retry Connection')}</span>
          </button>

          <a
            href="tel:+8801712345678"
            className="w-full py-3 px-6 rounded-xl font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span>{t('pwa.hotlineDirect', 'Call Hotline Directly')}</span>
          </a>

          <Link
            href="/"
            className="inline-block pt-2 text-xs text-slate-400 hover:text-white transition-colors"
          >
            ← {t('common.back', 'Back')} to Home
          </Link>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-4 border-t border-white/10 text-xs text-slate-400">
          NEED ELECTRO • Moulvibazar, Sylhet
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCw, Home, MessageCircle, AlertTriangle, Phone } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/seoConfig';
import { CustomerHeader } from '@/src/components/customer/CustomerHeader';
import { CustomerFooter } from '@/src/components/customer/CustomerFooter';

export default function GlobalErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log client error in console or telemetry
    console.error('Unhandled runtime error in client page:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#f2f4f8] text-slate-800 dark:bg-[#060a14] dark:text-slate-100 flex flex-col font-sans">
      <CustomerHeader />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16 flex flex-col items-center justify-center text-center">
        {/* Warning Icon Badge */}
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-500/5">
          <AlertTriangle size={32} />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mb-2">
          Something went wrong
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mb-6 leading-relaxed">
          An unexpected issue occurred while rendering this page. Our technical team has been notified.
          <span className="block mt-1 text-xs text-slate-500">
            (একটি অপ্রত্যাশিত ত্রুটি দেখা দিয়েছে — অনুগ্রহ করে পৃষ্ঠাটি পুনরায় লোড করুন বা হোমে ফিরে যান)
          </span>
        </p>

        {error.digest && (
          <div className="mb-6 px-3 py-1 rounded bg-slate-200 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400">
            Error Ref: {error.digest}
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#008CFF] hover:bg-blue-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02]"
          >
            <RefreshCw size={15} />
            <span>Try Again (পুনরায় চেষ্টা করুন)</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02]"
          >
            <Home size={15} />
            <span>Homepage</span>
          </Link>

          <a
            href={`https://wa.me/${BUSINESS_INFO.whatsappClean}?text=Hello%20NEED%20ELECTRO,%20I%20faced%20an%20error%20on%20your%20website.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02]"
          >
            <MessageCircle size={15} />
            <span>Support on WhatsApp</span>
          </a>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}

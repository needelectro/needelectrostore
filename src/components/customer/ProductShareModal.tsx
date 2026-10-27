'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  X, Copy, Check, Share2, MessageCircle, Send,
  Mail, ExternalLink, ShieldCheck, Globe
} from 'lucide-react';
import {
  ShareMethod,
  ShareProductPayload,
  getProductCanonicalUrl,
  getShareDestinationUrl,
  copyToClipboard,
  isWebShareSupported,
  triggerNativeShare,
  trackProductShare,
  buildProductShareText
} from '@/lib/productShare';
import { BUSINESS_INFO } from '@/lib/seoConfig';

interface ProductShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ShareProductPayload;
}

export const ProductShareModal: React.FC<ProductShareModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<'en' | 'bn'>('en');
  const [hasNativeShare, setHasNativeShare] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Compute canonical URL and share payload
  const canonicalUrl = getProductCanonicalUrl(product);
  const fallbackImg = '/logo-dark-transparent.png';
  const displayImage = product.imageUrl || fallbackImg;
  const priceFormatted = Number(product.retailPrice).toLocaleString('en-US');

  // Detect Web Share API on mount
  useEffect(() => {
    setHasNativeShare(isWebShareSupported());
  }, []);

  // Handle ESC key to dismiss
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setCopied(false);
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    const success = await copyToClipboard(canonicalUrl);
    if (success) {
      setCopied(true);
      trackProductShare({
        productId: product.id,
        productSku: product.sku,
        method: 'copy_link',
        referrer: product.referralCode || undefined,
      });
      setTimeout(() => setCopied(false), 2600);
    }
  };

  const handlePlatformShare = (method: ShareMethod) => {
    trackProductShare({
      productId: product.id,
      productSku: product.sku,
      method,
      referrer: product.referralCode || undefined,
    });

    const shareUrl = getShareDestinationUrl(method, {
      name: product.name,
      retailPrice: product.retailPrice,
      url: canonicalUrl,
    });

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleNativeShare = async () => {
    trackProductShare({
      productId: product.id,
      productSku: product.sku,
      method: 'native',
      referrer: product.referralCode || undefined,
    });

    const success = await triggerNativeShare({
      name: product.name,
      retailPrice: product.retailPrice,
      url: canonicalUrl,
    });

    if (success) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-300"
      >
        {/* Header Bar */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#002B5B] to-[#003875] text-white flex items-center justify-between relative">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#008CFF]/20 border border-white/20 flex items-center justify-center text-[#008CFF]">
              <Share2 size={16} className="text-white" />
            </div>
            <div>
              <h2 id="share-modal-title" className="text-sm sm:text-base font-bold text-white leading-tight">
                {lang === 'en' ? 'Share Product' : 'পণ্যটি শেয়ার করুন'}
              </h2>
              <p className="text-[11px] text-blue-200">
                {lang === 'en' ? 'NEED ELECTRO Official Catalog' : 'নিড ইলেক্ট্রো অফিসিয়াল ক্যাটালগ'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="px-2 py-1 text-[11px] font-bold rounded-md bg-white/10 hover:bg-white/20 text-blue-100 border border-white/10 transition-colors flex items-center gap-1"
              title="Toggle English / বাংলা"
            >
              <Globe size={12} />
              <span>{lang === 'en' ? 'বাংলা' : 'ENG'}</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 text-white/90 hover:text-white flex items-center justify-center transition-colors"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Product Mini Preview Box */}
        <div className="p-4 bg-[#F4F6F8]/70 border-b border-slate-200 flex items-center gap-3.5">
          <div className="relative w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-2xs">
            <Image
              src={displayImage}
              alt={product.name}
              fill
              sizes="64px"
              className="object-contain"
            />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 block truncate">
              {product.category || 'NEED ELECTRO'}
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-[#002B5B] truncate" title={product.name}>
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm font-black text-[#008CFF] font-mono">
                ৳{priceFormatted}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                <ShieldCheck size={11} />
                <span>{lang === 'en' ? 'Official Warranty' : 'অফিসিয়াল ওয়ারেন্টি'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {/* Quick Copy Link Row */}
          <div>
            <label className="block text-xs font-bold text-[#002B5B] mb-1.5">
              {lang === 'en' ? 'Product Link' : 'পণ্যের লিংক'}
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  readOnly
                  value={canonicalUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 font-mono truncate focus:outline-hidden focus:border-[#008CFF] focus:bg-white transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className={`min-h-[40px] px-4 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                    : 'bg-[#008CFF] hover:bg-[#0070cc] text-white shadow-blue-500/20 active:scale-95'
                }`}
              >
                {copied ? (
                  <>
                    <Check size={14} className="stroke-3" />
                    <span>{lang === 'en' ? 'Copied!' : 'কপি হয়েছে!'}</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>{lang === 'en' ? 'Copy Link' : 'লিংক কপি'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Social Platform Grid */}
          <div>
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              {lang === 'en' ? 'Share To Platform' : 'প্ল্যাটফর্মে শেয়ার করুন'}
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
              {/* WhatsApp */}
              <button
                type="button"
                onClick={() => handlePlatformShare('whatsapp')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 hover:shadow-sm transition-all group active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366]/10 text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white flex items-center justify-center transition-colors">
                  <MessageCircle size={20} />
                </div>
                <span className="text-[11px] font-bold text-slate-700 mt-1.5 group-hover:text-[#25D366]">
                  WhatsApp
                </span>
                <span className="text-[9px] text-slate-400">
                  {lang === 'en' ? 'Chat & Group' : 'চ্যাট ও গ্রুপ'}
                </span>
              </button>

              {/* Facebook */}
              <button
                type="button"
                onClick={() => handlePlatformShare('facebook')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-slate-200 hover:border-[#1877F2] hover:bg-blue-50/50 hover:shadow-sm transition-all group active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-[#1877F2]/10 text-[#1877F2] group-hover:bg-[#1877F2] group-hover:text-white flex items-center justify-center transition-colors">
                  <span className="font-extrabold text-lg leading-none">f</span>
                </div>
                <span className="text-[11px] font-bold text-slate-700 mt-1.5 group-hover:text-[#1877F2]">
                  Facebook
                </span>
                <span className="text-[9px] text-slate-400">
                  {lang === 'en' ? 'Feed & Story' : 'ফিড ও স্টোরি'}
                </span>
              </button>

              {/* Messenger */}
              <button
                type="button"
                onClick={() => handlePlatformShare('messenger')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-slate-200 hover:border-[#0084FF] hover:bg-blue-50/50 hover:shadow-sm transition-all group active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-[#0084FF]/10 text-[#0084FF] group-hover:bg-[#0084FF] group-hover:text-white flex items-center justify-center transition-colors">
                  <Send size={18} />
                </div>
                <span className="text-[11px] font-bold text-slate-700 mt-1.5 group-hover:text-[#0084FF]">
                  Messenger
                </span>
                <span className="text-[9px] text-slate-400">
                  {lang === 'en' ? 'Direct Msg' : 'মেসেজ'}
                </span>
              </button>

              {/* Telegram */}
              <button
                type="button"
                onClick={() => handlePlatformShare('telegram')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-slate-200 hover:border-[#229ED9] hover:bg-sky-50/50 hover:shadow-sm transition-all group active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-[#229ED9]/10 text-[#229ED9] group-hover:bg-[#229ED9] group-hover:text-white flex items-center justify-center transition-colors">
                  <Send size={18} />
                </div>
                <span className="text-[11px] font-bold text-slate-700 mt-1.5 group-hover:text-[#229ED9]">
                  Telegram
                </span>
                <span className="text-[9px] text-slate-400">
                  {lang === 'en' ? 'Channel & Msg' : 'চ্যানেল ও মেসেজ'}
                </span>
              </button>

              {/* Email */}
              <button
                type="button"
                onClick={() => handlePlatformShare('email')}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-slate-200 hover:border-[#002B5B] hover:bg-slate-50 hover:shadow-sm transition-all group active:scale-95"
              >
                <div className="w-10 h-10 rounded-full bg-[#002B5B]/10 text-[#002B5B] group-hover:bg-[#002B5B] group-hover:text-white flex items-center justify-center transition-colors">
                  <Mail size={18} />
                </div>
                <span className="text-[11px] font-bold text-slate-700 mt-1.5 group-hover:text-[#002B5B]">
                  Email
                </span>
                <span className="text-[9px] text-slate-400">
                  {lang === 'en' ? 'Direct Mail' : 'ইমেইল'}
                </span>
              </button>

              {/* Native Device Share (when supported) */}
              {hasNativeShare ? (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-[#008CFF]/5 to-[#008CFF]/15 border border-[#008CFF]/30 hover:border-[#008CFF] hover:shadow-sm transition-all group active:scale-95"
                >
                  <div className="w-10 h-10 rounded-full bg-[#008CFF] text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Share2 size={18} />
                  </div>
                  <span className="text-[11px] font-bold text-[#002B5B] mt-1.5">
                    {lang === 'en' ? 'Device Share' : 'ডিভাইস শেয়ার'}
                  </span>
                  <span className="text-[9px] text-[#008CFF] font-semibold">
                    {lang === 'en' ? 'More Apps' : 'অন্যান্য অ্যাপ'}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex flex-col items-center justify-center p-3 rounded-xl bg-white border border-slate-200 hover:border-[#008CFF] hover:bg-slate-50 transition-all group active:scale-95"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 group-hover:bg-[#008CFF] group-hover:text-white flex items-center justify-center transition-colors">
                    <ExternalLink size={18} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 mt-1.5 group-hover:text-[#008CFF]">
                    {lang === 'en' ? 'Copy URL' : 'কপি ইউআরএল'}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {lang === 'en' ? 'Direct Link' : 'সরাসরি লিংক'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Trust & Verification Footer Note */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>{BUSINESS_INFO.name} — {BUSINESS_INFO.tagline}</span>
            <span className="font-mono text-[10px]">SKU: {product.sku}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

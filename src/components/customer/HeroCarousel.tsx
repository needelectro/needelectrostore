'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Sparkles, CreditCard, Laptop } from 'lucide-react';

export interface BannerSlide {
  id: string;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  imageUrl?: string | null;
  targetUrl?: string | null;
  buttonText?: string | null;
}

interface HeroCarouselProps {
  banners: BannerSlide[];
}

const DEFAULT_SLIDES: BannerSlide[] = [
  {
    id: 'default-1',
    badge: 'Official Showroom & Nationwide Delivery',
    title: 'Authentic Laptops & Tech in Bangladesh',
    subtitle: 'Explore HP, Dell & Lenovo laptops with official warranty, open-box inspection, and doorstep Cash on Delivery across all 64 districts.',
    targetUrl: '/laptops',
    buttonText: 'Browse Laptops',
    imageUrl: '/logo-dark-transparent.png',
  },
  {
    id: 'default-2',
    badge: 'Zero-Interest Showroom Financing',
    title: 'Flexible Laptop EMI Plans',
    subtitle: 'Get your dream laptop today with easy 3 to 12-month installment plans. Available with debit card or showroom document verification.',
    targetUrl: '/laptop-emi',
    buttonText: 'Apply For EMI',
    imageUrl: '/logo-icon.png',
  },
  {
    id: 'default-3',
    badge: 'Security & Surveillance Solutions',
    title: 'High-Definition CCTV Systems',
    subtitle: 'Hikvision, Dahua & Imou smart cameras for homes, offices, and factories. Professional installation and mobile live-view setup.',
    targetUrl: '/cctv',
    buttonText: 'Explore CCTV Packages',
    imageUrl: '/logo-icon.png',
  },
];

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ banners }) => {
  const slides = banners && banners.length > 0 ? banners : DEFAULT_SLIDES;
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isHovered || slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, slides.length]);

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const active = slides[current] || slides[0];

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 bg-[#081621] text-white h-[320px] sm:h-[380px] lg:h-[430px] flex flex-col justify-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background ambient lighting accents */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-sky-400/15 blur-3xl pointer-events-none" />

      {/* Slide Content */}
      <div className="relative px-6 sm:px-10 py-6 flex items-center h-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center w-full">
          {/* Text Left Column */}
          <div className="md:col-span-8 space-y-3 sm:space-y-4">
            {active.badge && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-[#0084d6]/20 border border-[#0084d6]/40 text-sky-300">
                <Sparkles size={12} className="text-sky-400" />
                <span>{active.badge}</span>
              </div>
            )}

            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
              {active.title}
            </h2>

            {active.subtitle && (
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed line-clamp-3">
                {active.subtitle}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={active.targetUrl || '/laptops'}
                className="px-5 py-2.5 rounded-xl bg-[#0084d6] hover:bg-[#0073bc] text-white font-bold text-xs shadow-md shadow-blue-500/30 transition-all flex items-center gap-2 group"
              >
                <span>{active.buttonText || 'Discover Now'}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/delivery"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs backdrop-blur-xs transition-colors flex items-center gap-2"
              >
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Cash on Delivery</span>
              </Link>
            </div>
          </div>

          {/* Graphic / Image Right Column */}
          <div className="hidden md:flex md:col-span-4 justify-center items-center">
            <div className="relative w-48 h-48 lg:w-56 lg:h-56 rounded-2xl bg-white/5 border border-white/10 p-5 flex items-center justify-center backdrop-blur-sm group shadow-xl">
              <img
                src={active.imageUrl || '/logo-dark-transparent.png'}
                alt={active.title}
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,140,255,0.35)] transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[9px] font-mono text-cyan-300 border border-cyan-500/30">
                100% Genuine
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-xs transition-all opacity-80 hover:opacity-100"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-xs transition-all opacity-80 hover:opacity-100"
          >
            <ChevronRight size={18} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all rounded-full ${
                  current === idx
                    ? 'w-6 h-1.5 bg-[#0084d6]'
                    : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

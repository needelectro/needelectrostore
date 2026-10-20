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
    badge: 'HP AUTHORIZED BUSINESS RANGE',
    title: 'HP EliteBook & ProBook Laptops',
    subtitle: 'Intel Core i5 & i7 processors, all-day battery, military-grade aluminum chassis. Certified showroom warranty & express delivery across Bangladesh.',
    targetUrl: '/laptops/hp',
    buttonText: 'Shop HP Series',
    imageUrl: '/banners/hp-elitebook-banner.jpg',
  },
  {
    id: 'default-2',
    badge: 'DELL OFFICIAL SERIES',
    title: 'Dell Latitude & XPS Laptops',
    subtitle: 'Ultra-portable performance, FHD InfinityEdge display & 16GB/32GB RAM for executives, developers, and professionals.',
    targetUrl: '/laptops/dell',
    buttonText: 'Shop Dell Series',
    imageUrl: '/banners/dell-latitude-banner.jpg',
  },
  {
    id: 'default-3',
    badge: 'LENOVO LEGENDARY DURABILITY',
    title: 'Lenovo ThinkPad X1 & T-Series',
    subtitle: 'Legendary typing ergonomics, spill-resistant keyboard, carbon fiber durability. 100% genuine with showroom inspection.',
    targetUrl: '/laptops/lenovo',
    buttonText: 'Shop ThinkPad',
    imageUrl: '/banners/lenovo-thinkpad-banner.jpg',
  },
  {
    id: 'default-4',
    badge: 'HIKVISION SMART SECURITY',
    title: 'Hikvision 4K & ColorVu CCTV',
    subtitle: 'Full-color night vision, AI human & vehicle detection, and smartphone live streaming with certified technician installation.',
    targetUrl: '/cctv',
    buttonText: 'Explore CCTV Packages',
    imageUrl: '/banners/cctv-hikvision-banner.jpg',
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
    }, 6000);

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
      className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-700/80 bg-[#081621] text-white h-[300px] xs:h-[340px] sm:h-[390px] lg:h-[430px] flex flex-col justify-center group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Dynamic Ambient Background Blur derived from active banner */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 filter blur-3xl scale-125 pointer-events-none transition-all duration-1000 ease-out"
        style={{ backgroundImage: `url(${active.imageUrl || '/banners/hp-elitebook-banner.jpg'})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#081621] via-[#081621]/90 to-[#081621]/60 pointer-events-none" />

      {/* Decorative neon ambient glows */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-sky-400/20 blur-3xl pointer-events-none" />

      {/* Slide Content */}
      <div className="relative z-10 px-4 sm:px-8 lg:px-10 py-4 sm:py-6 flex items-center h-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-8 items-center w-full">
          {/* Text Left Column */}
          <div className="md:col-span-7 space-y-2.5 sm:space-y-4">
            {active.badge && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-[#008CFF]/20 border border-[#008CFF]/40 text-sky-300 shadow-sm backdrop-blur-md">
                <Sparkles size={12} className="text-sky-400 animate-pulse" />
                <span className="tracking-wide">{active.badge}</span>
              </div>
            )}

            <h2 className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-md">
              {active.title}
            </h2>

            {active.subtitle && (
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed line-clamp-2 sm:line-clamp-3">
                {active.subtitle}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1.5 sm:pt-2">
              <Link
                href={active.targetUrl || '/laptops'}
                className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#0070cc] hover:from-[#0070cc] hover:to-[#005bb5] text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/30 transition-all flex items-center gap-1.5 sm:gap-2 group/btn active:scale-95"
              >
                <span>{active.buttonText || 'Discover Now'}</span>
                <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/delivery"
                className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-md transition-colors flex items-center gap-2 active:scale-95"
              >
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Cash on Delivery</span>
              </Link>
            </div>
          </div>

          {/* Graphic / Image Right Column: 16:10 Widescreen Glass Showcase */}
          <div className="hidden md:flex md:col-span-5 justify-center items-center">
            <div className="relative w-full max-w-[340px] lg:max-w-[400px] aspect-[16/10] rounded-2xl overflow-hidden border border-white/20 shadow-2xl shadow-blue-500/20 group/img backdrop-blur-md bg-slate-900/50">
              <img
                src={active.imageUrl || '/banners/hp-elitebook-banner.jpg'}
                alt={active.title}
                className="w-full h-full object-cover object-center group-hover/img:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />
              
              {/* Floating Brand Badge */}
              <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-sky-300 border border-sky-400/30 flex items-center gap-1.5 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                <span>{active.badge ? active.badge.split(' ')[0] : 'Brand'} Official</span>
              </div>

              {/* Floating Guarantee Badge */}
              <div className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-md">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span>100% Genuine</span>
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

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
      className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-[#002B5B] via-[#081830] to-[#00142B] text-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background ambient lighting accents */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-sky-400/15 blur-3xl pointer-events-none" />

      {/* Slide Content */}
      <div className="relative min-h-[380px] sm:min-h-[440px] md:min-h-[480px] flex items-center px-6 sm:px-12 md:px-16 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          {/* Text Left Column */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5 animate-in fade-in duration-500 key={active.id}">
            {active.badge && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 border border-blue-400/30 text-blue-300">
                <Sparkles size={13} className="text-blue-400" />
                <span>{active.badge}</span>
              </div>
            )}

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
              {active.title}
            </h2>

            {active.subtitle && (
              <p className="text-xs sm:text-sm md:text-base text-slate-300 max-w-xl leading-relaxed">
                {active.subtitle}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href={active.targetUrl || '/laptops'}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-sky-400 hover:from-blue-600 hover:to-sky-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-blue-500/30 transition-all flex items-center gap-2 group"
              >
                <span>{active.buttonText || 'Discover Now'}</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/delivery"
                className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs sm:text-sm backdrop-blur-xs transition-colors flex items-center gap-2"
              >
                <ShieldCheck size={16} className="text-emerald-400" />
                <span>Cash on Delivery</span>
              </Link>
            </div>
          </div>

          {/* Graphic / Image Right Column */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-2xl bg-gradient-to-tr from-white/5 to-white/10 border border-white/10 p-6 flex items-center justify-center backdrop-blur-sm group shadow-2xl">
              <img
                src={active.imageUrl || '/logo-dark-transparent.png'}
                alt={active.title}
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,140,255,0.35)] transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                100% Genuine Stock
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
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-xs transition-all opacity-80 hover:opacity-100"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-xs transition-all opacity-80 hover:opacity-100"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all rounded-full ${
                  current === idx
                    ? 'w-7 h-2 bg-gradient-to-r from-blue-400 to-sky-300'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

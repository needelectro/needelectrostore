'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Sparkles,
  Phone, MessageCircle, Zap, CreditCard, Laptop
} from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/seoConfig';

export interface BannerSlide {
  id: string;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  imageUrl?: string | null;
  targetUrl?: string | null;
  buttonText?: string | null;
  secondaryType?: 'whatsapp' | 'emi' | 'delivery';
  isFullBleed?: boolean;
}

interface HeroCarouselProps {
  banners: BannerSlide[];
}

// 5 Desktop & Mobile Banners: Lenovo ThinkPad Flagship + HP, Dell, Hikvision & Custom PC
const DEFAULT_SLIDES: BannerSlide[] = [
  {
    id: 'default-lenovo',
    badge: 'LENOVO LEGENDARY DURABILITY',
    title: 'Lenovo ThinkPad X1 & T-Series',
    subtitle: 'Iconic TrackPoint, carbon-fiber toughness, military-spec tested durability. 100% genuine with showroom inspection.',
    targetUrl: '/laptops/lenovo',
    buttonText: 'Shop ThinkPad',
    imageUrl: '/banners/lenovo-thinkpad-banner.jpg',
    secondaryType: 'delivery',
  },
  {
    id: 'default-hp',
    badge: 'HP AUTHORIZED BUSINESS RANGE',
    title: 'HP EliteBook & ProBook Laptops',
    subtitle: 'Intel Core i5 & i7 processors, aluminum chassis, all-day battery. Certified showroom warranty & express delivery across Bangladesh.',
    targetUrl: '/laptops/hp',
    buttonText: 'Shop HP Series',
    imageUrl: '/banners/hp-elitebook-banner.jpg',
    secondaryType: 'delivery',
  },
  {
    id: 'default-dell',
    badge: 'DELL OFFICIAL SERIES',
    title: 'Dell Latitude & XPS Laptops',
    subtitle: 'Ultra-portable performance, FHD InfinityEdge display & 16GB/32GB RAM for executives, developers, and professionals.',
    targetUrl: '/laptops/dell',
    buttonText: 'Shop Dell Series',
    imageUrl: '/banners/dell-latitude-banner.jpg',
    secondaryType: 'delivery',
  },
  {
    id: 'default-hikvision',
    badge: 'HIKVISION SMART SECURITY',
    title: 'Hikvision 4K & ColorVu CCTV',
    subtitle: 'Full-color night vision, AI human & vehicle detection, and smartphone live streaming with certified technician installation.',
    targetUrl: '/cctv',
    buttonText: 'Explore CCTV Packages',
    imageUrl: '/banners/cctv-hikvision-banner.jpg',
    secondaryType: 'delivery',
  },
  {
    id: 'default-pc',
    badge: 'CUSTOM PC & ENGINEERING',
    title: 'High-Performance Custom PCs',
    subtitle: 'Custom gaming rigs, CAD workstations & enterprise office computers assembled with certified warranty.',
    targetUrl: '/computers',
    buttonText: 'Explore Custom PCs',
    imageUrl: '/banners/custom-pc-banner.jpg',
    secondaryType: 'delivery',
  },
];

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ banners }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Responsive mobile mode detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use DB banners if available, otherwise DEFAULT_SLIDES
  const slides = banners && banners.length > 0 ? banners : DEFAULT_SLIDES;

  // Auto-scroll ticker: continuously auto-swipes every 4 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    if (isHovered && !isMobile) return;

    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, isMobile, slides.length]);

  const prevSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const distance = touchStartX.current - touchEndX.current;
      if (distance > 35) {
        nextSlide();
      } else if (distance < -35) {
        prevSlide();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const active = slides[current % slides.length] || slides[0];

  // Helper to extract brand name for top-left image badge
  const getBrandTag = (badgeText?: string | null) => {
    if (!badgeText) return 'LENOVO';
    const firstWord = badgeText.split(' ')[0];
    if (firstWord.length > 2) return firstWord;
    return 'LENOVO';
  };

  return (
    <div
      className="relative rounded-3xl overflow-hidden shadow-xs border border-slate-200/90 bg-gradient-to-br from-white via-[#F4F6F8] to-[#EAF4FF] text-[#002B5B] min-h-[300px] sm:min-h-[330px] lg:h-[350px] flex flex-col justify-center select-none group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Soft light electric-blue ambient glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-[#EAF4FF]/70 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-sky-300/15 blur-3xl pointer-events-none" />

      {/* Slide Content: 2-Column Responsive Layout */}
      <div className="relative z-10 px-5 sm:px-8 lg:px-12 py-6 sm:py-8 flex items-center h-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center w-full">
          
          {/* Left Column: Text & CTAs */}
          <div className="md:col-span-7 space-y-2.5 sm:space-y-3.5">
            {active.badge && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-[#EAF4FF] border border-[#008CFF]/25 text-[#008CFF] shadow-2xs">
                <Sparkles size={13} className="text-[#008CFF]" />
                <span className="tracking-wide uppercase">{active.badge}</span>
              </div>
            )}

            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[40px] font-black tracking-tight leading-[1.14] text-[#002B5B]">
              {active.title}
            </h2>

            {active.subtitle && (
              <p className="text-xs sm:text-sm lg:text-[15px] text-slate-600 max-w-xl leading-relaxed">
                {active.subtitle}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1.5 sm:pt-2">
              {/* Primary Action Button */}
              {active.targetUrl?.startsWith('tel:') ? (
                <a
                  href={active.targetUrl}
                  className="px-5 py-2.5 sm:py-3 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 active:scale-95"
                >
                  <Phone size={14} />
                  <span>{active.buttonText || 'Call Hotline'}</span>
                </a>
              ) : (
                <Link
                  href={active.targetUrl || '/laptops/lenovo'}
                  className="px-5 py-2.5 sm:py-3 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 group/btn active:scale-95"
                >
                  <span>{active.buttonText || 'Shop ThinkPad'}</span>
                  <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              )}

              {/* Secondary Action Pill: Cash on Delivery */}
              <div className="px-4 py-2.5 sm:py-3 rounded-xl bg-white border border-slate-200 text-[#002B5B] font-semibold text-xs sm:text-sm flex items-center gap-2 shadow-2xs">
                <ShieldCheck size={16} className="text-emerald-500 stroke-[2.2]" />
                <span>Cash on Delivery</span>
              </div>
            </div>
          </div>

          {/* Right Column: Dark Floating Tech Product Card */}
          <div className="hidden md:flex md:col-span-5 justify-center lg:justify-end items-center">
            <div className="relative w-full max-w-[320px] sm:max-w-[360px] lg:max-w-[420px] aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl group/img">
              <img
                src={active.imageUrl || '/banners/lenovo-thinkpad-banner.jpg'}
                alt={active.title}
                className="w-full h-full object-cover object-center group-hover/img:scale-105 transition-transform duration-700 ease-out"
              />
              {/* Subtle tech ambient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

              {/* Floating Top-Left Official Brand Badge */}
              <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#002B5B] border border-slate-200 flex items-center gap-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-[#008CFF] animate-pulse" />
                <span>{getBrandTag(active.badge)} Official</span>
              </div>

              {/* Floating Bottom-Right 100% Genuine Badge */}
              <div className="absolute bottom-2.5 right-2.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-emerald-700 border border-emerald-200 flex items-center gap-1.5 shadow-sm">
                <ShieldCheck size={13} className="text-emerald-600 stroke-[2.5]" />
                <span>100% Genuine</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Navigation Arrows (White Frosted Circular Buttons) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-2.5 sm:left-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white border border-slate-200 text-[#002B5B] flex items-center justify-center backdrop-blur-md transition-all shadow-md hover:scale-105 active:scale-95 z-30"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white border border-slate-200 text-[#002B5B] flex items-center justify-center backdrop-blur-md transition-all shadow-md hover:scale-105 active:scale-95 z-30"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all rounded-full ${
                  current === idx
                    ? 'w-7 h-2 bg-[#008CFF] shadow-[0_0_8px_rgba(0,140,255,0.4)]'
                    : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroCarousel;

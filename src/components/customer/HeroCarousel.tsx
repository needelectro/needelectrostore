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
}

interface HeroCarouselProps {
  banners: BannerSlide[];
}

// 4 Desktop Brand Banners
const DEFAULT_SLIDES: BannerSlide[] = [
  {
    id: 'default-1',
    badge: 'HP AUTHORIZED BUSINESS RANGE',
    title: 'HP EliteBook & ProBook Laptops',
    subtitle: 'Intel Core i5 & i7 processors, aluminum chassis, all-day battery. Certified showroom warranty & express delivery across Bangladesh.',
    targetUrl: '/laptops/hp',
    buttonText: 'Shop HP Series',
    imageUrl: '/banners/hp-elitebook-banner.jpg',
    secondaryType: 'delivery',
  },
  {
    id: 'default-2',
    badge: 'DELL OFFICIAL SERIES',
    title: 'Dell Latitude & XPS Laptops',
    subtitle: 'Ultra-portable performance, FHD InfinityEdge display & 16GB/32GB RAM for executives, developers, and professionals.',
    targetUrl: '/laptops/dell',
    buttonText: 'Shop Dell Series',
    imageUrl: '/banners/dell-latitude-banner.jpg',
    secondaryType: 'delivery',
  },
  {
    id: 'default-3',
    badge: 'LENOVO LEGENDARY DURABILITY',
    title: 'Lenovo ThinkPad X1 & T-Series',
    subtitle: 'Legendary typing ergonomics, spill-resistant keyboard, carbon fiber durability. 100% genuine with showroom inspection.',
    targetUrl: '/laptops/lenovo',
    buttonText: 'Shop ThinkPad',
    imageUrl: '/banners/lenovo-thinkpad-banner.jpg',
    secondaryType: 'delivery',
  },
  {
    id: 'default-4',
    badge: 'HIKVISION SMART SECURITY',
    title: 'Hikvision 4K & ColorVu CCTV',
    subtitle: 'Full-color night vision, AI human & vehicle detection, and smartphone live streaming with certified technician installation.',
    targetUrl: '/cctv',
    buttonText: 'Explore CCTV Packages',
    imageUrl: '/banners/cctv-hikvision-banner.jpg',
    secondaryType: 'delivery',
  },
];

// In Mobile Mode: The 3 Banners Combined into 1 Auto-Swiping Banner
const MOBILE_3_BANNERS: BannerSlide[] = [
  {
    id: 'mobile-banner-1',
    badge: 'OFFICIAL SHOWROOM & NATIONWIDE DELIVERY',
    title: 'Authentic Laptops & Tech in Bangladesh',
    subtitle: 'Explore HP, Dell & Lenovo laptops with official warranty, open-box inspection, and doorstep Cash on Delivery across all 64 districts.',
    targetUrl: '/laptops',
    buttonText: 'Browse Laptops',
    imageUrl: '/banners/hp-elitebook-banner.jpg',
    secondaryType: 'delivery',
  },
  {
    id: 'mobile-banner-2',
    badge: 'SHOWROOM CARE & WARRANTY',
    title: 'Customer Support & Official Warranty',
    subtitle: 'Instant warranty claim processing, technical diagnosis & phone guidance at Kusumbag Moulvibazar.',
    targetUrl: `tel:${BUSINESS_INFO.phoneClean}`,
    buttonText: `Call: ${BUSINESS_INFO.phone}`,
    imageUrl: '/banners/warranty-care-banner.jpg',
    secondaryType: 'whatsapp',
  },
  {
    id: 'mobile-banner-3',
    badge: 'ENGINEERING SERVICES',
    title: 'Custom PC & Electrical Installation',
    subtitle: 'Professional gaming desktop build, CCTV IP setup, and certified home/commercial wiring service.',
    targetUrl: '/services/electrician',
    buttonText: 'Book Technician',
    imageUrl: '/banners/custom-pc-banner.jpg',
    secondaryType: 'emi',
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
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Use the 3 combined banners on mobile; desktop uses full brand banners
  const slides = isMobile
    ? MOBILE_3_BANNERS
    : banners && banners.length > 0
    ? banners
    : DEFAULT_SLIDES;

  useEffect(() => {
    if (isHovered || slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

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

  // Touch swipe gesture handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    setIsHovered(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsHovered(false);
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const distance = touchStartX.current - touchEndX.current;
      if (distance > 40) {
        nextSlide();
      } else if (distance < -40) {
        prevSlide();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const active = slides[current % slides.length] || slides[0];

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-700/80 bg-[#081621] text-white min-h-[240px] xs:min-h-[250px] sm:min-h-[280px] lg:h-[330px] flex flex-col justify-center select-none group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
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

      {/* Mobile Slide Counter Badge */}
      {isMobile && (
        <div className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded-full bg-black/60 border border-white/15 text-[9px] font-mono text-slate-300">
          {(current % slides.length) + 1} / {slides.length}
        </div>
      )}

      {/* Slide Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center h-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-center w-full">
          {/* Text Left Column */}
          <div className="md:col-span-7 space-y-1.5 sm:space-y-2.5">
            {active.badge && (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-bold bg-[#008CFF]/20 border border-[#008CFF]/40 text-sky-300 shadow-sm backdrop-blur-md">
                <Sparkles size={11} className="text-sky-400 animate-pulse" />
                <span className="tracking-wide">{active.badge}</span>
              </div>
            )}

            <h2 className="text-base xs:text-lg sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight text-white drop-shadow-md">
              {active.title}
            </h2>

            {active.subtitle && (
              <p className="text-xs sm:text-[13px] text-slate-300 max-w-lg leading-snug line-clamp-2">
                {active.subtitle}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* Primary Action Button */}
              {active.targetUrl?.startsWith('tel:') ? (
                <a
                  href={active.targetUrl}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#0070cc] hover:from-[#0070cc] hover:to-[#005bb5] text-white font-bold text-xs shadow-md shadow-blue-500/30 transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Phone size={13} />
                  <span>{active.buttonText || 'Call Hotline'}</span>
                </a>
              ) : (
                <Link
                  href={active.targetUrl || '/laptops'}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#0070cc] hover:from-[#0070cc] hover:to-[#005bb5] text-white font-bold text-xs shadow-md shadow-blue-500/30 transition-all flex items-center gap-1.5 group/btn active:scale-95"
                >
                  <span>{active.buttonText || 'Discover Now'}</span>
                  <ArrowRight size={13} className="group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              )}

              {/* Secondary Action Button */}
              {active.secondaryType === 'whatsapp' ? (
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappClean}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <MessageCircle size={13} />
                  <span>WhatsApp</span>
                </a>
              ) : active.secondaryType === 'emi' ? (
                <Link
                  href="/laptop-emi"
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <CreditCard size={13} className="text-amber-400" />
                  <span>Laptop EMI →</span>
                </Link>
              ) : (
                <Link
                  href="/delivery"
                  className="px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs backdrop-blur-md transition-colors flex items-center gap-1.5 active:scale-95"
                >
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Cash on Delivery</span>
                </Link>
              )}
            </div>
          </div>

          {/* Graphic / Image Right Column: 16:10 Widescreen Glass Showcase */}
          <div className="hidden md:flex md:col-span-5 justify-center items-center">
            <div className="relative w-full max-w-[270px] lg:max-w-[310px] aspect-[16/10] rounded-xl overflow-hidden border border-white/20 shadow-xl shadow-blue-500/20 group/img backdrop-blur-md bg-slate-900/50">
              <img
                src={active.imageUrl || '/banners/hp-elitebook-banner.jpg'}
                alt={active.title}
                className="w-full h-full object-cover object-center group-hover/img:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />
              
              {/* Floating Brand Badge */}
              <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-bold text-sky-300 border border-sky-400/30 flex items-center gap-1 shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                <span>{active.badge ? active.badge.split(' ')[0] : 'Brand'} Official</span>
              </div>

              {/* Floating Guarantee Badge */}
              <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] font-bold text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-md">
                <ShieldCheck size={11} className="text-emerald-400" />
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
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-xs transition-all opacity-80 hover:opacity-100"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center backdrop-blur-xs transition-all opacity-80 hover:opacity-100"
          >
            <ChevronRight size={16} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all rounded-full ${
                  current === idx
                    ? 'w-5 h-1.5 bg-[#0084d6]'
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

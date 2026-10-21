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

// 5 Desktop Banners: Flagship NEED ELECTRO + 4 Authorized Brands
const DEFAULT_SLIDES: BannerSlide[] = [
  {
    id: 'default-hero-partner',
    badge: 'NEED ELECTRO OFFICIAL FLAGSHIP',
    title: 'Your Partner in Technology',
    subtitle: 'Explore genuine HP, Dell & Lenovo laptops, high-performance custom PCs, and smart tech with verified warranty & express nationwide delivery.',
    targetUrl: '/shop',
    buttonText: 'Explore Products',
    imageUrl: '/banners/need-electro-hero-partner.jpg',
    secondaryType: 'delivery',
    isFullBleed: true,
  },
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

// All Banners Consolidated for Mobile Mode in ONE place with continuous auto-change
const MOBILE_ALL_BANNERS: BannerSlide[] = [
  {
    id: 'mob-1',
    badge: 'NEED ELECTRO FLAGSHIP',
    title: 'Your Partner in Technology',
    subtitle: 'Authentic laptops, custom PCs, CCTV & electrical engineering with warranty.',
    targetUrl: '/shop',
    buttonText: 'Explore Products',
    imageUrl: '/banners/need-electro-hero-partner.jpg',
    secondaryType: 'delivery',
    isFullBleed: true,
  },
  {
    id: 'mob-2',
    badge: 'SHOWROOM CARE & WARRANTY',
    title: 'Customer Care & Official Warranty',
    subtitle: 'Instant warranty claim processing, technical diagnosis & phone guidance at Kusumbag Moulvibazar.',
    targetUrl: `tel:${BUSINESS_INFO.phoneClean}`,
    buttonText: `Call: ${BUSINESS_INFO.phone}`,
    imageUrl: '/banners/need-electro-service-warranty.jpg',
    secondaryType: 'whatsapp',
    isFullBleed: true,
  },
  {
    id: 'mob-3',
    badge: 'CUSTOM PC & ENGINEERING',
    title: 'Custom Gaming PC & Workstations',
    subtitle: 'Professional gaming desktop build, CCTV IP setup, and certified home/commercial wiring service.',
    targetUrl: '/services/electrician',
    buttonText: 'Book Technician',
    imageUrl: '/banners/need-electro-custom-pc.jpg',
    secondaryType: 'emi',
    isFullBleed: true,
  },
  {
    id: 'mob-4',
    badge: '0% EMI AVAILABLE',
    title: 'Up to 12 Months 0% Interest Laptop EMI',
    subtitle: 'Own genuine HP, Dell & Lenovo laptops with easy monthly credit card installments.',
    targetUrl: '/laptop-emi',
    buttonText: 'Calculate EMI',
    imageUrl: '/banners/laptop-emi-promo-banner.jpg',
    secondaryType: 'emi',
    isFullBleed: true,
  },
  {
    id: 'mob-5',
    badge: 'GIGABIT SPEEDS',
    title: 'Ultra-Fast Wi-Fi 6 & Enterprise Mesh',
    subtitle: 'Eliminate Wi-Fi dead spots with dual-band gigabit routers & commercial Cat6 cabling setup.',
    targetUrl: '/networking',
    buttonText: 'Shop Routers',
    imageUrl: '/banners/wifi-networking-banner.jpg',
    secondaryType: 'delivery',
    isFullBleed: true,
  },
  {
    id: 'mob-6',
    badge: '24/7 LOAD-SHEDDING POWER',
    title: 'Pure Sine Wave Solar & IPS Systems',
    subtitle: 'Heavy-duty pure sine wave inverters, deep-cycle tubular batteries & certified installation.',
    targetUrl: '/electrical-products',
    buttonText: 'Explore IPS',
    imageUrl: '/banners/solar-ips-power-banner.jpg',
    secondaryType: 'delivery',
    isFullBleed: true,
  },
  {
    id: 'mob-7',
    badge: 'HP BUSINESS SERIES',
    title: 'HP EliteBook & ProBook Laptops',
    subtitle: 'Intel Core i5 & i7 processors, aluminum chassis, all-day battery with showroom warranty.',
    targetUrl: '/laptops/hp',
    buttonText: 'Shop HP Series',
    imageUrl: '/banners/hp-elitebook-banner.jpg',
    secondaryType: 'delivery',
    isFullBleed: true,
  },
  {
    id: 'mob-8',
    badge: 'DELL OFFICIAL SERIES',
    title: 'Dell Latitude & XPS Laptops',
    subtitle: 'Ultra-portable performance, FHD InfinityEdge display & 16GB/32GB RAM.',
    targetUrl: '/laptops/dell',
    buttonText: 'Shop Dell Series',
    imageUrl: '/banners/dell-latitude-banner.jpg',
    secondaryType: 'delivery',
    isFullBleed: true,
  },
  {
    id: 'mob-9',
    badge: 'LENOVO THINKPAD',
    title: 'Lenovo ThinkPad X1 & T-Series',
    subtitle: 'Legendary typing ergonomics, spill-resistant keyboard, carbon fiber durability.',
    targetUrl: '/laptops/lenovo',
    buttonText: 'Shop ThinkPad',
    imageUrl: '/banners/lenovo-thinkpad-banner.jpg',
    secondaryType: 'delivery',
    isFullBleed: true,
  },
  {
    id: 'mob-10',
    badge: 'HIKVISION SMART CCTV',
    title: 'Hikvision 4K & ColorVu Security',
    subtitle: 'Full-color night vision, AI human & vehicle detection, and smartphone live streaming.',
    targetUrl: '/cctv',
    buttonText: 'Explore CCTV Packages',
    imageUrl: '/banners/cctv-hikvision-banner.jpg',
    secondaryType: 'delivery',
    isFullBleed: true,
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

  // In mobile mode: always consolidate all promotional & brand banners in ONE place
  const slides = isMobile
    ? MOBILE_ALL_BANNERS
    : banners && banners.length > 0
    ? banners
    : DEFAULT_SLIDES;

  // Auto-scroll ticker: continuously auto-swipes every 3.5 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    // On desktop, pause on hover; on mobile, auto-change continuously without pause!
    if (isHovered && !isMobile) return;

    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3500);

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

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-md border border-slate-200/90 bg-gradient-to-br from-white via-[#F4F6F8] to-[#EAF4FF] text-[#002B5B] min-h-[240px] xs:min-h-[260px] sm:min-h-[290px] lg:h-[345px] flex flex-col justify-center select-none group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Mobile Live Slide Counter Badge */}
      {isMobile && (
        <div className="absolute top-2.5 right-2.5 z-30 px-2.5 py-0.5 rounded-full bg-white/95 border border-slate-200 text-[9px] font-mono text-[#002B5B] backdrop-blur-md shadow-xs flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#008CFF] animate-pulse" />
          <span>{(current % slides.length) + 1} / {slides.length}</span>
        </div>
      )}

      {/* FULL-BLEED BANNER MODE */}
      {active.isFullBleed ? (
        <Link
          href={active.targetUrl || '/shop'}
          className="relative w-full h-full block group/full overflow-hidden"
        >
          <img
            src={active.imageUrl || '/banners/need-electro-hero-partner.jpg'}
            alt={active.title}
            className="w-full h-full object-cover object-center group-hover/full:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Subtle light glassmorphism overlay to support interactive buttons */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-white/30 pointer-events-none" />

          {/* Floating Top Badge */}
          {active.badge && (
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-white/95 border border-slate-200/80 text-[#008CFF] shadow-md backdrop-blur-md">
              <Sparkles size={11} className="text-[#008CFF] animate-pulse" />
              <span className="tracking-wide uppercase">{active.badge}</span>
            </div>
          )}

          {/* Floating Bottom Action Strip */}
          <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 z-20 flex items-center justify-between pointer-events-none">
            <span className="px-3.5 py-1.5 rounded-xl bg-white/95 border border-slate-200/80 text-[#002B5B] font-bold text-xs backdrop-blur-md shadow-md hidden sm:inline-flex items-center gap-1.5">
              <span>{active.title}</span>
            </span>
            <span className="ml-auto pointer-events-auto px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#0070cc] hover:from-[#0070cc] hover:to-[#005bb5] text-white font-bold text-xs shadow-md shadow-blue-500/30 flex items-center gap-1.5 transition-all group-hover/full:shadow-blue-500/50">
              <span>{active.buttonText || 'Explore Products'}</span>
              <ArrowRight size={13} className="group-hover/full:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>
      ) : (
        /* REGULAR 2-COLUMN SLIDE MODE */
        <>
          {/* Soft light electric-blue ambient glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/85 to-[#EAF4FF]/70 pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-sky-300/15 blur-3xl pointer-events-none" />

          {/* Slide Content */}
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center h-full">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6 items-center w-full">
              {/* Text Left Column */}
              <div className="md:col-span-7 space-y-1.5 sm:space-y-2.5">
                {active.badge && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-bold bg-[#EAF4FF] border border-blue-200/80 text-[#008CFF] shadow-2xs">
                    <Sparkles size={11} className="text-[#008CFF]" />
                    <span className="tracking-wide uppercase">{active.badge}</span>
                  </div>
                )}

                <h2 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight text-[#002B5B]">
                  {active.title}
                </h2>

                {active.subtitle && (
                  <p className="text-xs sm:text-[13px] text-[#334155] max-w-lg leading-relaxed line-clamp-2">
                    {active.subtitle}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-1.5">
                  {/* Primary Action Button */}
                  {active.targetUrl?.startsWith('tel:') ? (
                    <a
                      href={active.targetUrl}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#0070cc] hover:from-[#0070cc] hover:to-[#005bb5] text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <Phone size={13} />
                      <span>{active.buttonText || 'Call Hotline'}</span>
                    </a>
                  ) : (
                    <Link
                      href={active.targetUrl || '/laptops'}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#008CFF] to-[#0070cc] hover:from-[#0070cc] hover:to-[#005bb5] text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all flex items-center gap-1.5 group/btn active:scale-95"
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
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <MessageCircle size={13} />
                      <span>WhatsApp</span>
                    </a>
                  ) : active.secondaryType === 'emi' ? (
                    <Link
                      href="/laptop-emi"
                      className="px-3.5 py-2 rounded-xl bg-[#EAF4FF] hover:bg-blue-100 border border-blue-200/80 text-[#002B5B] font-bold text-xs transition-all flex items-center gap-1.5 active:scale-95"
                    >
                      <CreditCard size={13} className="text-[#008CFF]" />
                      <span>Laptop EMI →</span>
                    </Link>
                  ) : (
                    <Link
                      href="/delivery"
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/90 text-[#002B5B] font-semibold text-xs shadow-2xs transition-colors flex items-center gap-1.5 active:scale-95"
                    >
                      <ShieldCheck size={13} className="text-emerald-600" />
                      <span>Cash on Delivery</span>
                    </Link>
                  )}
                </div>
              </div>

              {/* Graphic / Image Right Column: 16:10 Widescreen Light Glass Showcase */}
              <div className="hidden md:flex md:col-span-5 justify-center items-center">
                <div className="relative w-full max-w-[270px] lg:max-w-[310px] aspect-[16/10] rounded-2xl overflow-hidden border border-slate-200/90 shadow-xl shadow-blue-500/10 group/img bg-white">
                  <img
                    src={active.imageUrl || '/banners/hp-elitebook-banner.jpg'}
                    alt={active.title}
                    className="w-full h-full object-cover object-center group-hover/img:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Floating Brand Badge */}
                  <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[9px] font-bold text-[#002B5B] border border-slate-200 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#008CFF] animate-pulse" />
                    <span>{active.badge ? active.badge.split(' ')[0] : 'Brand'} Official</span>
                  </div>

                  {/* Floating Guarantee Badge */}
                  <div className="absolute bottom-2 right-2 bg-white/95 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[9px] font-bold text-emerald-700 border border-emerald-200 flex items-center gap-1 shadow-sm">
                    <ShieldCheck size={11} className="text-emerald-600" />
                    <span>100% Genuine</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            aria-label="Previous Slide"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white border border-slate-200 text-[#002B5B] flex items-center justify-center backdrop-blur-md transition-all shadow-md active:scale-95 z-30"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={nextSlide}
            aria-label="Next Slide"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white border border-slate-200 text-[#002B5B] flex items-center justify-center backdrop-blur-md transition-all shadow-md active:scale-95 z-30"
          >
            <ChevronRight size={18} />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`transition-all rounded-full ${
                  current === idx
                    ? 'w-6 h-1.5 bg-[#008CFF] shadow-[0_0_8px_rgba(0,140,255,0.4)]'
                    : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
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

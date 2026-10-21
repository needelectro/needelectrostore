'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, Sparkles,
  Phone, Zap, Laptop, Monitor, Camera, Wrench, ExternalLink
} from 'lucide-react';

export interface BannerSlide {
  id: string;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  imageUrl?: string | null;
  mobileImageUrl?: string | null;
  targetUrl?: string | null;
  buttonText?: string | null;
  sortOrder?: number;
  isActive?: boolean;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  placement?: string;
}

interface HeroCarouselProps {
  banners: BannerSlide[];
  autoplayIntervalMs?: number;
}

// Verified official default showroom showcase slides when no active DB banners exist
const DEFAULT_SHOWCASE_BANNERS: BannerSlide[] = [
  {
    id: 'default-lenovo',
    badge: 'LENOVO LEGENDARY DURABILITY',
    title: 'Lenovo ThinkPad X1 & T-Series',
    subtitle: 'Iconic TrackPoint, carbon-fiber toughness, military-spec tested durability. 100% genuine with showroom inspection.',
    targetUrl: '/laptops/lenovo',
    buttonText: 'Shop ThinkPad',
    imageUrl: '/banners/lenovo-thinkpad-banner.jpg',
    mobileImageUrl: '/banners/lenovo-thinkpad-banner.jpg',
  },
  {
    id: 'default-hp',
    badge: 'HP AUTHORIZED BUSINESS RANGE',
    title: 'HP EliteBook & ProBook Laptops',
    subtitle: 'Intel Core i5 & i7 processors, aluminum chassis, all-day battery. Official warranty with doorstep Cash on Delivery across Bangladesh.',
    targetUrl: '/laptops/hp',
    buttonText: 'Shop HP Series',
    imageUrl: '/banners/hp-elitebook-banner.jpg',
    mobileImageUrl: '/banners/hp-elitebook-banner.jpg',
  },
  {
    id: 'default-dell',
    badge: 'DELL OFFICIAL SERIES',
    title: 'Dell Latitude & XPS Laptops',
    subtitle: 'Ultra-portable performance, FHD InfinityEdge display & 16GB/32GB RAM for executives, developers, and professionals.',
    targetUrl: '/laptops/dell',
    buttonText: 'Shop Dell Laptops',
    imageUrl: '/banners/dell-latitude-banner.jpg',
    mobileImageUrl: '/banners/dell-latitude-banner.jpg',
  },
  {
    id: 'default-hikvision',
    badge: 'HIKVISION SMART SECURITY',
    title: 'Hikvision 4K & ColorVu CCTV',
    subtitle: 'Full-color night vision, AI human & vehicle detection, and smartphone live streaming with certified technician installation.',
    targetUrl: '/cctv',
    buttonText: 'Explore CCTV Packages',
    imageUrl: '/banners/cctv-hikvision-banner.jpg',
    mobileImageUrl: '/banners/cctv-hikvision-banner.jpg',
  },
  {
    id: 'default-pc',
    badge: 'CUSTOM PC & ENGINEERING',
    title: 'High-Performance Custom PCs',
    subtitle: 'Custom gaming rigs, CAD workstations & enterprise office computers assembled with certified warranty.',
    targetUrl: '/computers',
    buttonText: 'Explore Custom PCs',
    imageUrl: '/banners/custom-pc-banner.jpg',
    mobileImageUrl: '/banners/custom-pc-banner.jpg',
  },
];

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  banners,
  autoplayIntervalMs = 5000,
}) => {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter valid, scheduled banners
  const now = new Date();
  const activeBanners = (banners && banners.length > 0 ? banners : DEFAULT_SHOWCASE_BANNERS).filter((b) => {
    if (b.isActive === false) return false;
    if (b.startDate && new Date(b.startDate) > now) return false;
    if (b.endDate && new Date(b.endDate) < now) return false;
    return true;
  });

  const slides = activeBanners.length > 0 ? activeBanners : DEFAULT_SHOWCASE_BANNERS;

  // Responsive mobile & reduced motion detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const motionListener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', motionListener);

    return () => {
      window.removeEventListener('resize', checkMobile);
      mediaQuery.removeEventListener('change', motionListener);
    };
  }, []);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Autoplay Engine: Pauses on hover, touch, and tab hide
  useEffect(() => {
    if (slides.length <= 1) return;
    if (isHovered) return;
    if (prefersReducedMotion) return;

    const handleVisibilityChange = () => {
      if (document.hidden && timerRef.current) {
        clearInterval(timerRef.current);
      } else if (!document.hidden && !isHovered) {
        timerRef.current = setInterval(nextSlide, autoplayIntervalMs);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    timerRef.current = setInterval(nextSlide, autoplayIntervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [slides.length, isHovered, prefersReducedMotion, autoplayIntervalMs, nextSlide]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    }
  };

  // Touch Swipe Handlers (Mobile-optimized with threshold and vertical scroll tolerance)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - endX;
    const diffY = touchStartY.current - endY;

    // Horizontal swipe threshold: 40px, and horizontal travel must exceed vertical
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  const activeSlide = slides[current % slides.length] || slides[0];

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Promotional Showcase"
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm border border-slate-200/90 bg-gradient-to-br from-white via-[#F4F6F8] to-[#EAF4FF] text-[#002B5B] select-none group focus:outline-none focus:ring-2 focus:ring-[#008CFF]/50"
    >
      {/* Ambient electric blue futuristic background light */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-sky-300/15 blur-3xl pointer-events-none" />

      {/* Main Slide Track: Smooth Sliding Viewport */}
      <div className="relative w-full overflow-hidden">
        <div
          className={`flex w-full ${
            prefersReducedMotion ? 'transition-none' : 'transition-transform duration-500 ease-out'
          }`}
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide, index) => {
            const isSlideActive = index === current;
            const desktopSrc = slide.imageUrl || '/banners/lenovo-thinkpad-banner.jpg';
            const mobileSrc = slide.mobileImageUrl || desktopSrc;
            const chosenSrc = isMobile ? mobileSrc : desktopSrc;
            const isErrored = imageErrors[slide.id];
            const target = slide.targetUrl || '/laptops';

            return (
              <div
                key={slide.id || index}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${slides.length}: ${slide.title}`}
                className="w-full shrink-0 relative"
              >
                {/* Responsive Aspect Ratio Wrapper */}
                {/* Desktop: 16/6 or ~380px; Tablet: 16/7.5; Mobile: 16/9.5 or ~250px */}
                <div className="relative w-full aspect-[16/9.5] sm:aspect-[16/7.5] md:aspect-[16/6] lg:aspect-[16/5.8] min-h-[220px] sm:min-h-[280px] md:min-h-[340px] max-h-[460px] overflow-hidden flex items-center">
                  {/* Background Artwork Layer */}
                  {!isErrored ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={chosenSrc}
                      alt={slide.title}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      onError={() => handleImageError(slide.id)}
                      className="absolute inset-0 w-full h-full object-cover object-center transform transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#002B5B] via-[#003B7A] to-[#008CFF] flex items-center justify-center p-8 text-white">
                      <div className="text-center">
                        <Sparkles className="w-10 h-10 text-amber-300 mx-auto mb-2 animate-pulse" />
                        <h3 className="text-2xl font-black">{slide.title}</h3>
                        {slide.subtitle && <p className="text-sm text-blue-100 mt-1 max-w-md">{slide.subtitle}</p>}
                      </div>
                    </div>
                  )}

                  {/* Gentle Gradient Scrim for Text Readability without Obscuring Artwork */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent md:from-white/90 md:via-white/70 md:to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent pointer-events-none md:hidden" />

                  {/* Promotional Content Overlay (Crisp Typography & CTAs) */}
                  <div className="relative z-10 w-full px-5 sm:px-8 md:px-12 lg:px-16 py-4 sm:py-6 flex items-center h-full">
                    <div className="max-w-xl lg:max-w-2xl space-y-2 sm:space-y-3.5">
                      {/* Campaign Badge */}
                      {slide.badge && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-white/90 backdrop-blur-md border border-[#008CFF]/30 text-[#008CFF] shadow-xs">
                          <Sparkles size={12} className="text-[#008CFF] shrink-0" />
                          <span className="tracking-wider uppercase truncate">{slide.badge}</span>
                        </div>
                      )}

                      {/* Main Headline */}
                      <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-[40px] font-black tracking-tight leading-[1.12] text-[#002B5B] drop-shadow-xs">
                        {slide.title}
                      </h2>

                      {/* Subtitle / Campaign Description */}
                      {slide.subtitle && (
                        <p className="text-xs sm:text-sm lg:text-[15px] text-slate-600 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-lg font-medium">
                          {slide.subtitle}
                        </p>
                      )}

                      {/* Action CTAs */}
                      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 pt-1 sm:pt-2">
                        {target.startsWith('tel:') ? (
                          <a
                            href={target}
                            className="px-5 py-2.5 sm:py-3 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            <Phone size={14} />
                            <span>{slide.buttonText || 'Call Showroom'}</span>
                          </a>
                        ) : (
                          <Link
                            href={target}
                            className="px-5 py-2.5 sm:py-3 rounded-xl bg-[#008CFF] hover:bg-[#0070cc] text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all flex items-center gap-2 group/btn active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          >
                            <span>{slide.buttonText || 'Shop Offer'}</span>
                            <ArrowRight size={15} className="group-hover/btn:translate-x-1 transition-transform" />
                          </Link>
                        )}

                        {/* Trust Tag Pill */}
                        <div className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2.5 sm:py-3 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 text-[#002B5B] font-semibold text-xs sm:text-sm shadow-2xs">
                          <ShieldCheck size={16} className="text-emerald-500 stroke-[2.2]" />
                          <span>Showroom Warranty &amp; COD</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Arrows (Subtle Frosted Glass Controls) */}
      {slides.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Previous Banner Slide"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white border border-slate-200 text-[#002B5B] flex items-center justify-center backdrop-blur-md transition-all shadow-md hover:scale-105 active:scale-95 z-20 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Next Banner Slide"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white border border-slate-200 text-[#002B5B] flex items-center justify-center backdrop-blur-md transition-all shadow-md hover:scale-105 active:scale-95 z-20 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Bottom Control Bar: Compact Dots, Slide Counter & Autoplay Progress Bar */}
      {slides.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-200/80 shadow-xs">
          {/* Slide Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(idx);
                }}
                aria-label={`Jump to slide ${idx + 1}`}
                aria-current={current === idx ? 'true' : 'false'}
                className={`transition-all rounded-full ${
                  current === idx
                    ? 'w-6 sm:w-8 h-2 bg-[#008CFF] shadow-xs'
                    : 'w-2 h-2 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            ))}
          </div>

          <span className="text-[11px] font-mono font-bold text-slate-500 pl-1 border-l border-slate-200">
            {current + 1}/{slides.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

// Clean, photographic showcase assets with verified product imagery
const DEFAULT_SHOWCASE_BANNERS: BannerSlide[] = [
  {
    id: 'default-lenovo',
    title: 'Lenovo ThinkPad Series',
    targetUrl: '/laptops/lenovo',
    imageUrl: '/banners/lenovo-thinkpad-banner.jpg',
    mobileImageUrl: '/banners/lenovo-thinkpad-banner.jpg',
  },
  {
    id: 'default-hp',
    title: 'HP EliteBook Series',
    targetUrl: '/laptops/hp',
    imageUrl: '/banners/hp-elitebook-banner.jpg',
    mobileImageUrl: '/banners/hp-elitebook-banner.jpg',
  },
  {
    id: 'default-dell',
    title: 'Dell Latitude Series',
    targetUrl: '/laptops/dell',
    imageUrl: '/banners/dell-latitude-banner.jpg',
    mobileImageUrl: '/banners/dell-latitude-banner.jpg',
  },
  {
    id: 'default-hikvision',
    title: 'Hikvision CCTV Surveillance',
    targetUrl: '/cctv',
    imageUrl: '/banners/cctv-hikvision-banner.jpg',
    mobileImageUrl: '/banners/cctv-hikvision-banner.jpg',
  },
  {
    id: 'default-pc',
    title: 'Custom Desktop PCs',
    targetUrl: '/computers',
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

    const startTimer = () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (!isHovered && !document.hidden) {
          nextSlide();
        }
      }, autoplayIntervalMs);
    };

    const handleVisibilityChange = () => {
      if (document.hidden && timerRef.current) {
        clearInterval(timerRef.current);
      } else {
        startTimer();
      }
    };

    startTimer();
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [slides.length, autoplayIntervalMs, isHovered, nextSlide]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  };

  // Mobile Touch Gestures (Swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = touchStartX.current - endX;
    const diffY = touchStartY.current - endY;

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
      className="relative w-full rounded-xl sm:rounded-2xl overflow-hidden shadow-xs border border-slate-200/90 bg-white select-none group focus:outline-none focus:ring-2 focus:ring-[#008CFF]/40"
    >
      {/* Compact Responsive Viewport:
          Mobile: ~130–160px; Tablet: ~170–200px; Desktop: ~210–235px */}
      <div className="relative w-full h-[135px] sm:h-[175px] md:h-[210px] lg:h-[235px] overflow-hidden bg-slate-50">
        <div
          className={`flex w-full h-full ${
            prefersReducedMotion ? 'transition-none' : 'transition-transform duration-500 ease-out'
          }`}
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {slides.map((slide, index) => {
            const desktopSrc = slide.imageUrl || '/banners/lenovo-thinkpad-banner.jpg';
            const mobileSrc = slide.mobileImageUrl || desktopSrc;
            const chosenSrc = isMobile ? mobileSrc : desktopSrc;
            const isErrored = imageErrors[slide.id];
            const target = slide.targetUrl || '/laptops';

            const SlideContent = (
              <div className="w-full h-full relative overflow-hidden bg-white flex items-center justify-center">
                {!isErrored ? (
                  <picture className="w-full h-full block">
                    {slide.mobileImageUrl && (
                      <source media="(max-width: 640px)" srcSet={slide.mobileImageUrl} />
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={chosenSrc}
                      alt={slide.title || 'NEED ELECTRO Promotional Banner'}
                      loading={index === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      onError={() => handleImageError(slide.id)}
                      className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.01]"
                    />
                  </picture>
                ) : (
                  <div className="w-full h-full bg-[#F4F6F8] flex items-center justify-center p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/logo-icon.png" alt="NEED ELECTRO" className="h-10 opacity-60 object-contain" />
                  </div>
                )}
              </div>
            );

            return (
              <div
                key={slide.id || index}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${slides.length}: ${slide.title}`}
                className="w-full h-full shrink-0 relative"
              >
                {target.startsWith('tel:') ? (
                  <a
                    href={target}
                    className="block w-full h-full"
                    aria-label={slide.title || 'Promotional Banner'}
                  >
                    {SlideContent}
                  </a>
                ) : (
                  <Link
                    href={target}
                    className="block w-full h-full cursor-pointer"
                    aria-label={slide.title || 'Promotional Banner'}
                  >
                    {SlideContent}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Discreet Subtle Previous / Next Chevrons (Hover Only, No Main Artwork Obstruction) */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                prevSlide();
              }}
              aria-label="Previous Slide"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/80 hover:bg-white text-slate-700 backdrop-blur-xs border border-slate-200/80 flex items-center justify-center transition-all shadow-xs z-20 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-105 active:scale-95"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                nextSlide();
              }}
              aria-label="Next Slide"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/80 hover:bg-white text-slate-700 backdrop-blur-xs border border-slate-200/80 flex items-center justify-center transition-all shadow-xs z-20 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:scale-105 active:scale-95"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Minimal Unobtrusive Pagination Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-2 sm:bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 pointer-events-auto">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCurrent(idx);
                }}
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={current === idx ? 'true' : 'false'}
                className={`transition-all rounded-full ${
                  current === idx
                    ? 'w-4 sm:w-5 h-1.5 bg-[#008CFF] shadow-xs'
                    : 'w-1.5 h-1.5 bg-white/75 hover:bg-white backdrop-blur-xs shadow-2xs'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroCarousel;

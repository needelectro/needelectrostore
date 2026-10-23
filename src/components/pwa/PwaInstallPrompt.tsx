'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/src/services/languageContext';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const { t, isBangla } = useLanguage();

  useEffect(() => {
    // Check if already in standalone mode or native app
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      (typeof navigator !== 'undefined' && navigator.userAgent.includes('NeedElectroAndroidApp')) ||
      (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.())
    ) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed recently
    try {
      const dismissedUntil = localStorage.getItem('pwa_prompt_dismissed_until');
      if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
        return;
      }
    } catch {}

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Wait a moment so the page is readable first before showing non-intrusive prompt
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('Install prompt failed:', err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    try {
      // Don't show again for 7 days
      const sevenDays = Date.now() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem('pwa_prompt_dismissed_until', String(sevenDays));
    } catch {}
  };

  if (!showPrompt || isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <aside
      aria-label="PWA Installation"
      className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-slide-up"
    >
      <div className="glass-panel p-4 rounded-2xl border border-[var(--glass-border)] shadow-2xl backdrop-blur-xl bg-[var(--glass-surface-subtle)] text-[var(--text-primary)]">
        <div className="flex items-start gap-3">
          {/* Logo icon */}
          <div className="w-12 h-12 rounded-xl bg-[#002B5B] flex-shrink-0 flex items-center justify-center p-1.5 shadow-md border border-white/10">
            <Image
              src="/logo-icon.png"
              alt="NEED ELECTRO"
              width={40}
              height={40}
              className="object-contain"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold truncate">
                {t('pwa.installApp', 'Install NEED ELECTRO App')}
              </h4>
              <button
                type="button"
                onClick={handleDismiss}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded-full"
                aria-label="Dismiss install prompt"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
              {t('pwa.installPrompt', 'Install our fast, lightweight app for instant access & order tracking!')}
            </p>

            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={handleInstall}
                className="flex-1 py-1.5 px-3 rounded-lg text-xs font-bold bg-[#008CFF] hover:bg-[#0070cc] text-white shadow-md shadow-[#008CFF]/20 active:scale-95 transition-all text-center"
              >
                {t('pwa.installButton', 'Install App')}
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="py-1.5 px-3 rounded-lg text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
              >
                {t('pwa.dismiss', 'Not Now')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default PwaInstallPrompt;

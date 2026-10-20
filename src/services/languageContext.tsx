'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { translations, Language, toBanglaDigits, formatPrice } from '@/src/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (keyPath: string, fallback?: string) => string;
  formatCurrency: (amount: number) => string;
  formatNumber: (input: number | string) => string;
  isBangla: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (keyPath: string, fallback?: string) => fallback || keyPath,
  formatCurrency: (amount: number) => `৳ ${amount}`,
  formatNumber: (input: number | string) => String(input),
  isBangla: false,
});

const STORAGE_KEY = 'need_electro_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved === 'en' || saved === 'bn') {
        setLanguageState(saved);
        document.documentElement.setAttribute('lang', saved);
        if (saved === 'bn') {
          document.documentElement.classList.add('font-bangla');
        } else {
          document.documentElement.classList.remove('font-bangla');
        }
      }
    } catch {
      // localStorage may fail in restricted privacy modes
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.setAttribute('lang', lang);
      if (lang === 'bn') {
        document.documentElement.classList.add('font-bangla');
      } else {
        document.documentElement.classList.remove('font-bangla');
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    const nextLang: Language = language === 'en' ? 'bn' : 'en';
    setLanguage(nextLang);
  }, [language, setLanguage]);

  const t = useCallback(
    (keyPath: string, fallback?: string): string => {
      const keys = keyPath.split('.');
      const currentDictionary = translations[language] as Record<string, any>;
      const englishDictionary = translations.en as Record<string, any>;

      let currentVal: any = currentDictionary;
      for (const key of keys) {
        if (currentVal && typeof currentVal === 'object' && key in currentVal) {
          currentVal = currentVal[key];
        } else {
          currentVal = undefined;
          break;
        }
      }

      if (typeof currentVal === 'string') {
        return currentVal;
      }

      // Fallback to English dictionary
      let fallbackVal: any = englishDictionary;
      for (const key of keys) {
        if (fallbackVal && typeof fallbackVal === 'object' && key in fallbackVal) {
          fallbackVal = fallbackVal[key];
        } else {
          fallbackVal = undefined;
          break;
        }
      }

      if (typeof fallbackVal === 'string') {
        return fallbackVal;
      }

      // Return provided explicit fallback or original key if not found
      return fallback !== undefined ? fallback : keyPath;
    },
    [language]
  );

  const formatCurrency = useCallback(
    (amount: number) => {
      return formatPrice(amount, language);
    },
    [language]
  );

  const formatNumber = useCallback(
    (input: number | string) => {
      if (language === 'bn') {
        return toBanglaDigits(input);
      }
      return String(input);
    },
    [language]
  );

  const contextValue = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      formatCurrency,
      formatNumber,
      isBangla: language === 'bn',
    }),
    [language, setLanguage, toggleLanguage, t, formatCurrency, formatNumber]
  );

  return <LanguageContext.Provider value={contextValue}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  return context || {
    language: 'en',
    setLanguage: () => {},
    toggleLanguage: () => {},
    t: (keyPath: string, fallback?: string) => fallback || keyPath,
    formatCurrency: (amount: number) => `৳ ${amount}`,
    formatNumber: (input: number | string) => String(input),
    isBangla: false,
  };
}

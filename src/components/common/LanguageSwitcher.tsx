'use client';

import React from 'react';
import { useLanguage } from '@/src/services/languageContext';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'pill' | 'compact' | 'segmented';
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'pill',
}) => {
  const { language, setLanguage, toggleLanguage } = useLanguage();

  // Guard: Never render language switcher in admin panel
  if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/admin') || window.location.pathname.includes('admin'))) {
    return null;
  }

  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-full glass-panel-subtle border border-[var(--glass-border)] transition-all ${className}`}
        role="group"
        aria-label="Language selection"
      >
        <button
          type="button"
          onClick={() => setLanguage('en')}
          className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 ${
            language === 'en'
              ? 'bg-[#008CFF] text-white shadow-sm shadow-[#008CFF]/40'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          aria-pressed={language === 'en'}
        >
          English
        </button>
        <button
          type="button"
          onClick={() => setLanguage('bn')}
          className={`px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200 font-bangla ${
            language === 'bn'
              ? 'bg-[#008CFF] text-white shadow-sm shadow-[#008CFF]/40'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
          aria-pressed={language === 'bn'}
        >
          বাংলা
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`glass-panel-subtle inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[var(--text-primary)] hover:border-[#008CFF] hover:text-[#008CFF] transition-all duration-200 group border border-[var(--glass-border)] shadow-xs ${className}`}
      aria-label={`Switch language to ${language === 'en' ? 'Bangla' : 'English'}`}
      title={`Current: ${language === 'en' ? 'English' : 'বাংলা'} - Click to switch`}
    >
      {/* Globe Icon */}
      <svg
        className="w-3.5 h-3.5 text-[#008CFF] group-hover:rotate-12 transition-transform duration-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <circle cx="12" cy="12" r="10" strokeWidth="2" />
        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeWidth="2" />
      </svg>
      <span className="font-medium tracking-wide">
        {language === 'en' ? 'EN' : 'বাং'}
      </span>
      <span className="text-[10px] opacity-40 font-mono">/</span>
      <span className={`text-[11px] ${language === 'en' ? 'text-[var(--text-secondary)] font-bangla' : 'text-[var(--text-secondary)]'}`}>
        {language === 'en' ? 'বাংলা' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;

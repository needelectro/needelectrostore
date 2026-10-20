'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Volume2, VolumeX, Sparkles, X } from 'lucide-react';

const STORAGE_KEY = 'needElectroVoiceWelcomePlayed';
const WELCOME_TEXT = 'Welcome to Need Electro, your trusted electrical and technological solutions.';

export const VoiceWelcome: React.FC = () => {
  const pathname = usePathname();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const hasAttemptedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper to pick the most natural, clear English voice
  const getPreferredVoice = (): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. Premium natural / neural / online voices
    const naturalVoice = voices.find(
      (v) =>
        (v.lang.startsWith('en') || v.lang === 'en-US') &&
        (v.name.includes('Natural') ||
          v.name.includes('Online') ||
          v.name.includes('Google US English') ||
          v.name.includes('Aria') ||
          v.name.includes('Jenny') ||
          v.name.includes('Samantha'))
    );
    if (naturalVoice) return naturalVoice;

    // 2. Standard en-US voices
    const enUsVoice = voices.find((v) => v.lang === 'en-US' || v.lang === 'en_US');
    if (enUsVoice) return enUsVoice;

    // 3. Any English voice
    const anyEnglish = voices.find((v) => v.lang.startsWith('en'));
    return anyEnglish || voices[0] || null;
  };

  const playWelcomeSpeech = (isUserInitiated = false) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setShowPrompt(false);
      return;
    }

    try {
      // Clear any stuck utterances
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(WELCOME_TEXT);
      utterance.lang = 'en-US';
      utterance.rate = 0.95; // Natural, clear speaking speed
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voice = getPreferredVoice();
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setShowPrompt(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setShowPrompt(false);
        try {
          localStorage.setItem(STORAGE_KEY, 'true');
        } catch {
          // ignore localStorage restrictions
        }
      };

      utterance.onerror = (e) => {
        setIsSpeaking(false);
        // If not user-initiated and blocked by browser policy, offer subtle tap button
        if (!isUserInitiated) {
          setShowPrompt(true);
        } else {
          setShowPrompt(false);
          try {
            localStorage.setItem(STORAGE_KEY, 'true');
          } catch {}
        }
      };

      window.speechSynthesis.speak(utterance);

      // Autoplay watchdog: if automatic attempt doesn't trigger onstart within 1200ms,
      // browser autoplay restriction likely intercepted it. Show the friendly prompt.
      if (!isUserInitiated) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          if (!window.speechSynthesis.speaking) {
            setShowPrompt(true);
          }
        }, 1200);
      }
    } catch {
      // Fail silently without breaking the application
      if (!isUserInitiated) {
        setShowPrompt(true);
      }
    }
  };

  useEffect(() => {
    // 1. Never play on administrative or ERP staff routes
    if (pathname?.startsWith('/admin')) {
      return;
    }

    // 2. Check if already played or dismissed
    try {
      const alreadyPlayed = localStorage.getItem(STORAGE_KEY);
      if (alreadyPlayed === 'true' || alreadyPlayed === 'dismissed') {
        return;
      }
    } catch {
      // Storage unavailable
      return;
    }

    // 3. Prevent duplicate attempts in React Strict Mode or fast re-renders
    if (hasAttemptedRef.current) return;
    hasAttemptedRef.current = true;

    // 4. Ensure speech synthesis is available
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // Load voices if not populated yet
    const initVoicesAndSpeak = () => {
      // Small pause after page mount so initial paint finishes smoothly
      const startTimer = setTimeout(() => {
        playWelcomeSpeech(false);
      }, 800);
      return () => clearTimeout(startTimer);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        initVoicesAndSpeak();
      };
    } else {
      initVoicesAndSpeak();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [pathname]);

  const handleManualPlay = () => {
    playWelcomeSpeech(true);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowPrompt(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'dismissed');
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {}
  };

  // If already played or not needed, render nothing
  if (!showPrompt && !isSpeaking) {
    return null;
  }

  // Active Speaking Pill Indicator
  if (isSpeaking) {
    return (
      <aside
        aria-label="Voice Welcome Playing"
        className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 animate-fade-in pointer-events-auto"
      >
        <div className="glass-panel px-3.5 py-2 rounded-full border border-[var(--glass-border)] shadow-xl flex items-center gap-2.5 bg-[var(--glass-surface-solid)] text-[var(--text-primary)] backdrop-blur-xl">
          <div className="w-6 h-6 rounded-full bg-[#008CFF] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#008CFF]/50 animate-pulse">
            <Volume2 size={13} />
          </div>
          <span className="text-xs font-semibold tracking-wide pr-1">
            Welcome to NEED ELECTRO
          </span>
          <div className="flex items-center gap-0.5 ml-1">
            <span className="w-1 h-3 bg-[#008CFF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-4 bg-[#008CFF] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-2 bg-[#008CFF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </aside>
    );
  }

  // Fallback Interactive Prompt when Autoplay is Restricted
  return (
    <aside
      aria-label="Voice Welcome Prompt"
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 animate-slide-up pointer-events-auto"
    >
      <div
        onClick={handleManualPlay}
        className="glass-panel group pl-3 pr-2 py-1.5 rounded-full border border-[#008CFF]/30 hover:border-[#008CFF] shadow-xl flex items-center gap-2.5 bg-[var(--glass-surface-solid)] text-[var(--text-primary)] backdrop-blur-xl cursor-pointer hover:shadow-[#008CFF]/20 transition-all active:scale-95"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleManualPlay();
          }
        }}
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#002B5B] to-[#008CFF] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#008CFF]/40 group-hover:scale-105 transition-transform">
          <Volume2 size={14} className="group-hover:rotate-6 transition-transform" />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-bold text-[#008CFF] group-hover:text-[#0070cc]">
          <span>Tap to hear welcome</span>
          <Sparkles size={13} className="text-amber-400 shrink-0" />
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          className="ml-1 p-1 rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          aria-label="Dismiss voice welcome"
          title="Dismiss"
        >
          <X size={13} />
        </button>
      </div>
    </aside>
  );
};

export default VoiceWelcome;

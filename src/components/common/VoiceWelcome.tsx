'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Volume2, X } from 'lucide-react';

const WELCOME_TEXT =
  'Welcome to Need Electro, your trusted electrical and technological solutions.';

export const VoiceWelcome: React.FC = () => {
  const pathname = usePathname();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const hasTriggeredRef = useRef(false);

  // Pick the most natural, clear English voice available
  const getPreferredVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // 1. Natural / Neural / Online English voices
    const naturalVoice = voices.find(
      (v) =>
        (v.lang.startsWith('en') || v.lang === 'en-US' || v.lang === 'en-GB') &&
        (v.name.includes('Natural') ||
          v.name.includes('Neural') ||
          v.name.includes('Online') ||
          v.name.includes('Google US English') ||
          v.name.includes('Microsoft') ||
          v.name.includes('Aria') ||
          v.name.includes('Jenny') ||
          v.name.includes('Samantha') ||
          v.name.includes('Daniel') ||
          v.name.includes('Guy'))
    );
    if (naturalVoice) return naturalVoice;

    // 2. Standard en-US voice
    const enUsVoice = voices.find((v) => v.lang === 'en-US' || v.lang === 'en_US');
    if (enUsVoice) return enUsVoice;

    // 3. Any English voice
    const anyEnglish = voices.find((v) => v.lang.startsWith('en'));
    return anyEnglish || voices[0] || null;
  }, []);

  const playWelcomeSpeech = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      // Clear any stuck speech queue and resume paused engine
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(WELCOME_TEXT);
      utterance.lang = 'en-US';
      utterance.rate = 0.92; // Natural, clear, confident speaking pace
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voice = getPreferredVoice();
      if (voice) {
        utterance.voice = voice;
      }

      // CRITICAL CHROMIUM FIX: Keep window reference to prevent V8 garbage collection
      (window as any).__needElectroUtterance = utterance;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setHasPlayed(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        (window as any).__needElectroUtterance = null;
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        (window as any).__needElectroUtterance = null;
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsSpeaking(false);
    }
  }, [getPreferredVoice]);

  useEffect(() => {
    // Never play on admin/ERP routes
    if (pathname?.startsWith('/admin')) {
      return;
    }

    // Clean up any old permanent storage lockout keys
    try {
      localStorage.removeItem('needElectroVoiceWelcomePlayed');
      sessionStorage.removeItem('needElectroVoiceSessionPlayed');
    } catch {}

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    const attemptAutoPlay = () => {
      if (hasTriggeredRef.current) return;
      hasTriggeredRef.current = true;
      playWelcomeSpeech();
    };

    // 1. Immediate Auto-Play on visiting the website without clicking any button
    let autoPlayTimer: NodeJS.Timeout | null = null;
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      // Small delay for initial paint, then speak automatically
      autoPlayTimer = setTimeout(attemptAutoPlay, 350);
    } else {
      // Wait for voices to load, or fallback after 500ms
      window.speechSynthesis.onvoiceschanged = () => {
        attemptAutoPlay();
      };
      autoPlayTimer = setTimeout(attemptAutoPlay, 500);
    }

    // 2. Backup listener for strict mobile autoplay policies (scroll, touch, click)
    const backupEvents = ['pointerdown', 'touchstart', 'scroll', 'click', 'keydown', 'wheel'];
    const handlePassiveBackup = () => {
      attemptAutoPlay();
      cleanupBackup();
    };

    const cleanupBackup = () => {
      backupEvents.forEach((evt) => {
        window.removeEventListener(evt, handlePassiveBackup);
        document.removeEventListener(evt, handlePassiveBackup);
      });
    };

    backupEvents.forEach((evt) => {
      window.addEventListener(evt, handlePassiveBackup, { once: true, passive: true });
      document.addEventListener(evt, handlePassiveBackup, { once: true, passive: true });
    });

    return () => {
      if (autoPlayTimer) clearTimeout(autoPlayTimer);
      cleanupBackup();
    };
  }, [pathname, playWelcomeSpeech]);

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSpeaking(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playWelcomeSpeech();
  };

  // Do not render on admin or unsupported browsers
  if (pathname?.startsWith('/admin') || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  // Active Speaking State: Glowing Soundwave Pill
  if (isSpeaking) {
    return (
      <aside
        aria-label="Welcome Voice Playing"
        className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto select-none"
      >
        <div className="pl-3.5 pr-2 py-1.5 rounded-full border border-[#008CFF]/60 shadow-xl shadow-blue-500/25 flex items-center gap-2.5 bg-[#002B5B]/95 text-white backdrop-blur-md">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#008CFF] to-sky-400 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
            <Volume2 size={13} />
          </div>
          <span className="text-xs font-semibold tracking-wide pr-1 text-white">
            Welcome to NEED ELECTRO
          </span>
          {/* Animated Equalizer Waves */}
          <div className="flex items-center gap-0.5">
            <span className="w-1 h-3.5 bg-[#008CFF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1 h-5 bg-sky-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1 h-2.5 bg-[#008CFF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <button
            type="button"
            onClick={handleStop}
            className="ml-1 p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/15 transition-colors"
            aria-label="Stop welcome voice"
            title="Stop Voice"
          >
            <X size={13} />
          </button>
        </div>
      </aside>
    );
  }

  // Finished / Idle State: Discreet Replay Button in corner
  if (hasPlayed) {
    return (
      <aside
        aria-label="Replay Welcome Voice"
        className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 animate-in fade-in duration-300 pointer-events-auto select-none"
      >
        <button
          type="button"
          onClick={handleReplay}
          className="w-8 h-8 rounded-full bg-[#002B5B]/90 hover:bg-[#008CFF] border border-[#008CFF]/40 text-white shadow-lg shadow-blue-500/15 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group backdrop-blur-md"
          title="Replay NEED ELECTRO Welcome Voice"
          aria-label="Replay Welcome Voice"
        >
          <Volume2 size={14} className="group-hover:scale-110 transition-transform text-sky-300 group-hover:text-white" />
        </button>
      </aside>
    );
  }

  return null;
};

export default VoiceWelcome;

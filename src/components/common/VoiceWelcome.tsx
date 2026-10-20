'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Volume2, VolumeX, X } from 'lucide-react';

const STORAGE_KEY = 'needElectroVoiceWelcomePlayed';
const WELCOME_TEXT = 'Welcome to Need Electro, your trusted electrical and technological solutions.';

export const VoiceWelcome: React.FC = () => {
  const pathname = usePathname();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const playedRef = useRef(false);
  const speechAttemptedRef = useRef(false);

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

  const playWelcomeSpeech = () => {
    if (playedRef.current) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      // Check localStorage once more
      const alreadyPlayed = localStorage.getItem(STORAGE_KEY);
      if (alreadyPlayed === 'true' || alreadyPlayed === 'dismissed') {
        playedRef.current = true;
        return;
      }

      // Resume speech synthesis in case the browser suspended the audio context
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(WELCOME_TEXT);
      utterance.lang = 'en-US';
      utterance.rate = 0.93; // Natural, clear speaking speed
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voice = getPreferredVoice();
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        playedRef.current = true;
        try {
          localStorage.setItem(STORAGE_KEY, 'true');
        } catch {}
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = (e) => {
        setIsSpeaking(false);
        // If synthesis error occurs (e.g. cancelled), mark as played so it doesn't loop
        try {
          localStorage.setItem(STORAGE_KEY, 'true');
        } catch {}
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      // Fail silently without errors
    }
  };

  useEffect(() => {
    // 1. Never play on administrative or ERP staff routes
    if (pathname?.startsWith('/admin')) {
      return;
    }

    // 2. Check if already played
    try {
      const alreadyPlayed = localStorage.getItem(STORAGE_KEY);
      if (alreadyPlayed === 'true' || alreadyPlayed === 'dismissed') {
        playedRef.current = true;
        return;
      }
    } catch {
      return;
    }

    // 3. Prevent duplicate setup
    if (speechAttemptedRef.current) return;
    speechAttemptedRef.current = true;

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // 4. Try immediate autoplay on page load
    const attemptImmediate = () => {
      // Small pause after initial render so paint completes
      setTimeout(() => {
        playWelcomeSpeech();
      }, 600);
    };

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        attemptImmediate();
      };
    } else {
      attemptImmediate();
    }

    // 5. Global first-interaction listener:
    // If the browser's autoplay policy blocked the unprompted call, the very first
    // touch, scroll, swipe, click, or tap anywhere on the screen immediately triggers the welcome speech
    // without requiring the visitor to click any specific speaker button!
    const interactionEvents = ['pointerdown', 'touchstart', 'scroll', 'click', 'keydown', 'wheel'];

    const handleFirstInteraction = () => {
      if (!playedRef.current) {
        playWelcomeSpeech();
      }
      cleanupListeners();
    };

    const cleanupListeners = () => {
      interactionEvents.forEach((evt) => {
        window.removeEventListener(evt, handleFirstInteraction);
        document.removeEventListener(evt, handleFirstInteraction);
      });
    };

    interactionEvents.forEach((evt) => {
      window.addEventListener(evt, handleFirstInteraction, { once: true, passive: true });
      document.addEventListener(evt, handleFirstInteraction, { once: true, passive: true });
    });

    return () => {
      cleanupListeners();
    };
  }, [pathname]);

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSpeaking(false);
    playedRef.current = true;
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {}
  };

  // Only render the soundwave indicator while speaking; never render a speaker prompt button
  if (!isSpeaking) {
    return null;
  }

  return (
    <aside
      aria-label="Welcome Voice Playing"
      className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 animate-fade-in pointer-events-auto select-none"
    >
      <div className="glass-panel pl-3 pr-2.5 py-1.5 rounded-full border border-[#008CFF]/40 shadow-xl flex items-center gap-2.5 bg-[#081621]/95 text-white backdrop-blur-xl">
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#008CFF] to-sky-400 text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#008CFF]/50 animate-pulse">
          <Volume2 size={13} />
        </div>
        <span className="text-xs font-semibold tracking-wide pr-1">
          Welcome to NEED ELECTRO
        </span>
        <div className="flex items-center gap-0.5">
          <span className="w-1 h-3 bg-[#008CFF] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1 h-4 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1 h-2 bg-[#008CFF] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <button
          type="button"
          onClick={handleStop}
          className="ml-1 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Mute welcome message"
          title="Mute"
        >
          <X size={13} />
        </button>
      </div>
    </aside>
  );
};

export default VoiceWelcome;

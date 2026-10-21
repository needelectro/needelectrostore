'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Volume2, VolumeX, X, Sparkles } from 'lucide-react';

const SESSION_KEY = 'needElectroVoiceSessionPlayed';
const WELCOME_TEXT =
  'Welcome to Need Electro! Your trusted destination for authentic laptops, custom computers, CCTV security systems, and electrical solutions in Bangladesh.';

export const VoiceWelcome: React.FC = () => {
  const pathname = usePathname();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const playedInSessionRef = useRef(false);

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

  // Web Audio chime to warm up audio pipeline & provide pleasant sonic cue
  const playWelcomeChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;

      // Note 1: D5 (587Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.06, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Note 2: A5 (880Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, now + 0.12);
      gain2.gain.setValueAtTime(0.06, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.55);
    } catch {}
  };

  const playWelcomeSpeech = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    try {
      // Warm up audio pipeline with chime
      playWelcomeChime();

      // Clear any stuck utterances and resume paused engine
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      // Small tick to ensure engine is clear
      setTimeout(() => {
        try {
          const utterance = new SpeechSynthesisUtterance(WELCOME_TEXT);
          utterance.lang = 'en-US';
          utterance.rate = 0.94; // Clear, comfortable cadence
          utterance.pitch = 1.0;
          utterance.volume = 1.0;

          const voice = getPreferredVoice();
          if (voice) {
            utterance.voice = voice;
          }

          // CRITICAL CHROMIUM BUG FIX: Prevent V8 garbage collector from terminating speech
          (window as any).__needElectroUtterance = utterance;

          utterance.onstart = () => {
            setIsSpeaking(true);
            setHasPlayed(true);
            playedInSessionRef.current = true;
            try {
              sessionStorage.setItem(SESSION_KEY, 'true');
            } catch {}
          };

          utterance.onend = () => {
            setIsSpeaking(false);
            (window as any).__needElectroUtterance = null;
          };

          utterance.onerror = (e) => {
            setIsSpeaking(false);
            (window as any).__needElectroUtterance = null;
          };

          window.speechSynthesis.speak(utterance);
        } catch (err) {
          setIsSpeaking(false);
        }
      }, 60);
    } catch (err) {
      setIsSpeaking(false);
    }
  }, [getPreferredVoice]);

  useEffect(() => {
    // 1. Never play on administrative or ERP staff routes
    if (pathname?.startsWith('/admin')) {
      return;
    }

    // 2. Clear legacy permanent storage lock so returning visitors can hear it
    try {
      localStorage.removeItem('needElectroVoiceWelcomePlayed');
    } catch {}

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // 3. Check session storage
    try {
      const sessionPlayed = sessionStorage.getItem(SESSION_KEY);
      if (sessionPlayed === 'true') {
        playedInSessionRef.current = true;
        setHasPlayed(true);
      }
    } catch {}

    // 4. Ensure voices are loaded
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        setIsReady(true);
      }
    };
    loadVoices();
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
    setIsReady(true);

    // 5. Automatic Trigger on First User Gesture (click, tap, keypress)
    // Browsers allow audio output strictly during a user gesture event
    const handleFirstGesture = () => {
      if (!playedInSessionRef.current && !dismissed) {
        playWelcomeSpeech();
      }
      cleanupListeners();
    };

    const cleanupListeners = () => {
      ['click', 'touchend', 'keydown'].forEach((evt) => {
        window.removeEventListener(evt, handleFirstGesture);
        document.removeEventListener(evt, handleFirstGesture);
      });
    };

    ['click', 'touchend', 'keydown'].forEach((evt) => {
      window.addEventListener(evt, handleFirstGesture, { once: true, passive: true });
    });

    return () => {
      cleanupListeners();
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [pathname, dismissed, playWelcomeSpeech]);

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSpeaking(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleStop(e);
    setDismissed(true);
    try {
      sessionStorage.setItem(SESSION_KEY, 'dismissed');
    } catch {}
  };

  const handleManualPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(false);
    playWelcomeSpeech();
  };

  // Do not render on admin or unsupported browsers
  if (pathname?.startsWith('/admin') || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  // State 1: Currently Speaking (Active Soundwave Pill)
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
          {/* Animated Soundwave */}
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

  // State 2: Ready / Dismissed / Played - Floating Interactive Trigger
  return (
    <aside
      aria-label="Welcome Voice Greeting"
      className="fixed bottom-20 md:bottom-6 right-3 sm:right-6 z-40 animate-in fade-in slide-in-from-bottom-2 duration-300 pointer-events-auto select-none"
    >
      {!dismissed && !hasPlayed ? (
        // Expanded Greeting Pill for first-time / active visitors
        <div
          role="button"
          tabIndex={0}
          onClick={handleManualPlay}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              playWelcomeSpeech();
            }
          }}
          className="group pl-3 pr-2 py-1.5 rounded-full border border-[#008CFF]/50 hover:border-[#008CFF] shadow-lg shadow-blue-500/20 flex items-center gap-2 bg-[#002B5B]/95 hover:bg-[#00234a] text-white backdrop-blur-md cursor-pointer transition-all active:scale-95 hover:scale-[1.02]"
          title="Click to hear store welcome voice"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#008CFF] to-sky-400 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform">
            <Volume2 size={13} className="group-hover:rotate-6 transition-transform" />
          </div>
          <span className="text-xs font-semibold tracking-wide text-sky-100 group-hover:text-white transition-colors">
            Welcome Voice
          </span>
          <span className="text-[10px] font-bold bg-[#008CFF] text-white px-2 py-0.5 rounded-full shadow-2xs group-hover:bg-sky-500 transition-colors">
            Tap to Listen
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            className="ml-0.5 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/15 transition-colors"
            aria-label="Dismiss welcome greeting"
            title="Dismiss"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        // Subtle Floating Speaker Replay Button
        <button
          type="button"
          onClick={handleManualPlay}
          className="w-9 h-9 rounded-full bg-[#002B5B]/90 hover:bg-[#008CFF] border border-[#008CFF]/40 text-white shadow-lg shadow-blue-500/15 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group backdrop-blur-md"
          title="Replay NEED ELECTRO Welcome Voice"
          aria-label="Replay Welcome Voice"
        >
          <Volume2 size={15} className="group-hover:scale-110 transition-transform text-sky-300 group-hover:text-white" />
        </button>
      )}
    </aside>
  );
};

export default VoiceWelcome;

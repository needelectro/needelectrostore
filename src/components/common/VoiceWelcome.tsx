'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Volume2, X } from 'lucide-react';

const WELCOME_TEXT =
  'Welcome to Need Electro, your trusted electrical and technological solutions.';
const AUDIO_SRC = '/welcome-voice.mp3';
const STORAGE_KEY = 'needElectroVoiceWelcomePlayed';

export const VoiceWelcome: React.FC = () => {
  const pathname = usePathname();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasPlayedRef = useRef(false);
  const dismissedRef = useRef(false);

  // Helper to pick human-like female voice for Web Speech API fallback
  const getPreferredFemaleVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const femaleNameTokens = [
      'aria',
      'jenny',
      'samantha',
      'victoria',
      'karen',
      'moira',
      'zira',
      'google us english',
      'google uk english female',
      'neural2-f',
      'journey-f',
      'wavenet-c',
      'wavenet-e',
      'wavenet-f',
      'female',
    ];

    const maleNameTokens = [
      'david', 'mark', 'george', 'daniel', 'guy', 'james', 'richard', 'steve', 'male'
    ];

    for (const token of femaleNameTokens) {
      const match = voices.find(
        (v) =>
          (v.lang.startsWith('en') || v.lang === 'en-US' || v.lang === 'en-GB') &&
          v.name.toLowerCase().includes(token)
      );
      if (match) return match;
    }

    const femaleCandidate = voices.find((v) => {
      if (!v.lang.startsWith('en')) return false;
      const lower = v.name.toLowerCase();
      return !maleNameTokens.some((m) => lower.includes(m));
    });

    if (femaleCandidate) return femaleCandidate;

    const enUs = voices.find((v) => v.lang === 'en-US');
    return enUs || voices[0] || null;
  }, []);

  // Web Speech API fallback if MP3 fails
  const playSpeechSynthesisFallback = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSpeaking(false);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(WELCOME_TEXT);
      utterance.lang = 'en-US';
      utterance.rate = 0.94;
      utterance.pitch = 1.08;
      utterance.volume = 1.0;

      const voice = getPreferredFemaleVoice();
      if (voice) {
        utterance.voice = voice;
      }

      (window as any).__needElectroUtterance = utterance;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setHasPlayed(true);
        hasPlayedRef.current = true;
        setNeedsInteraction(false);
        try {
          localStorage.setItem(STORAGE_KEY, 'true');
        } catch {}
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
  }, [getPreferredFemaleVoice]);

  // Main playback: High-fidelity natural female voice audio with speech synthesis backup
  const playWelcome = useCallback(
    (isAutoAttempt = false) => {
      if (typeof window === 'undefined') return;

      // Cancel any ongoing speech synthesis
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {}
      }

      const audio = audioRef.current;
      if (!audio) {
        // Fallback to standalone Audio object if ref unmounted
        try {
          const fallbackAudio = new Audio(AUDIO_SRC);
          fallbackAudio.preload = 'auto';
          fallbackAudio.volume = 1.0;
          fallbackAudio.onplay = () => {
            setIsSpeaking(true);
            setHasPlayed(true);
            hasPlayedRef.current = true;
            setNeedsInteraction(false);
            try {
              localStorage.setItem(STORAGE_KEY, 'true');
            } catch {}
          };
          fallbackAudio.onended = () => setIsSpeaking(false);
          fallbackAudio.onerror = () => playSpeechSynthesisFallback();
          fallbackAudio.play().catch(() => {
            if (!hasPlayedRef.current && !dismissedRef.current) {
              setNeedsInteraction(true);
            }
          });
        } catch {
          playSpeechSynthesisFallback();
        }
        return;
      }

      try {
        audio.currentTime = 0;
        const playPromise = audio.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsSpeaking(true);
              setHasPlayed(true);
              hasPlayedRef.current = true;
              setNeedsInteraction(false);
              try {
                localStorage.setItem(STORAGE_KEY, 'true');
              } catch {}
            })
            .catch((err) => {
              if (err?.name === 'NotAllowedError') {
                // Autoplay blocked by mobile browser policy without user gesture
                if (!hasPlayedRef.current && !dismissedRef.current) {
                  setNeedsInteraction(true);
                }
              } else if (!isAutoAttempt) {
                playSpeechSynthesisFallback();
              }
            });
        }
      } catch {
        if (!isAutoAttempt) {
          playSpeechSynthesisFallback();
        }
      }
    },
    [playSpeechSynthesisFallback]
  );

  useEffect(() => {
    // Never run on admin / ERP routes
    if (pathname?.startsWith('/admin')) {
      return;
    }

    // Check if welcome voice has already been played previously (Run ONLY 1 time on first visit)
    try {
      const alreadyPlayed = localStorage.getItem(STORAGE_KEY) === 'true';
      if (alreadyPlayed) {
        setHasPlayed(true);
        hasPlayedRef.current = true;
        return;
      }
    } catch {}

    // Detect mobile touch capability
    const isTouchDevice =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || (navigator.maxTouchPoints && navigator.maxTouchPoints > 0));

    // If mobile, show the interactive "Tap to Listen" pill immediately so the user has visual feedback
    if (isTouchDevice && !hasPlayedRef.current && !dismissedRef.current) {
      setNeedsInteraction(true);
    }

    // 1. Attempt auto-play shortly after initial paint (works on desktop / allowed policies)
    const autoPlayTimer = setTimeout(() => {
      if (!hasPlayedRef.current && !dismissedRef.current) {
        playWelcome(true);
      }
    }, 350);

    // 2. Mobile User Gesture Unlock: Listen for the very first interaction anywhere on screen
    const interactionEvents = ['touchstart', 'touchend', 'pointerdown', 'click'];

    const handleFirstInteraction = () => {
      if (!hasPlayedRef.current && !dismissedRef.current) {
        playWelcome(false);
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
      if (autoPlayTimer) clearTimeout(autoPlayTimer);
      cleanupListeners();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [pathname, playWelcome]);

  const handleStop = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSpeaking(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    dismissedRef.current = true;
    setDismissed(true);
    setNeedsInteraction(false);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {}
  };

  const handleManualPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    dismissedRef.current = false;
    setDismissed(false);
    playWelcome(false);
  };

  // Do not render on admin routes
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Native DOM Audio Element for Reliable Mobile WebKit / Chromium Decoding */}
      <audio
        ref={audioRef}
        src={AUDIO_SRC}
        preload="auto"
        playsInline
        onPlay={() => {
          setIsSpeaking(true);
          setHasPlayed(true);
          hasPlayedRef.current = true;
          setNeedsInteraction(false);
          try {
            localStorage.setItem(STORAGE_KEY, 'true');
          } catch {}
        }}
        onEnded={() => {
          setIsSpeaking(false);
        }}
        onPause={() => {
          setIsSpeaking(false);
        }}
        onError={() => {
          playSpeechSynthesisFallback();
        }}
        className="hidden"
      />

      {/* State 1: Active Speaking State (Glowing Soundwave Pill) */}
      {isSpeaking && (
        <aside
          aria-label="Welcome Voice Playing"
          className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-6 right-3 sm:right-6 z-50 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto select-none max-w-[calc(100vw-1.5rem)]"
        >
          <div className="pl-3.5 pr-2 py-1.5 rounded-full border border-[#008CFF]/60 shadow-xl shadow-blue-500/25 flex items-center gap-2.5 bg-[#002B5B]/95 text-white backdrop-blur-md">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#008CFF] to-sky-400 text-white flex items-center justify-center shrink-0 shadow-xs animate-pulse">
              <Volume2 size={13} />
            </div>
            <span className="text-xs font-semibold tracking-wide pr-1 text-white truncate max-w-[170px] sm:max-w-none">
              Welcome to NEED ELECTRO
            </span>
            {/* Animated Equalizer Waves */}
            <div className="flex items-center gap-0.5 shrink-0" aria-hidden="true">
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
      )}

      {/* State 2: Mobile / Autoplay Blocked -> Interactive "Tap to Listen" Floating Badge */}
      {!isSpeaking && !hasPlayed && needsInteraction && !dismissed && (
        <aside
          aria-label="Welcome Voice Greeting"
          className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-6 right-3 sm:right-6 z-50 animate-in fade-in slide-in-from-bottom-2 duration-300 pointer-events-auto select-none max-w-[calc(100vw-1.5rem)]"
        >
          <div
            role="button"
            tabIndex={0}
            onClick={handleManualPlay}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                playWelcome(false);
              }
            }}
            className="group pl-3 pr-2 py-1.5 rounded-full border border-[#008CFF]/60 hover:border-[#008CFF] shadow-xl shadow-[#002B5B]/35 flex items-center gap-2.5 bg-[#002B5B]/95 hover:bg-[#00234a] text-white backdrop-blur-md cursor-pointer transition-all active:scale-95 hover:scale-[1.02]"
            title="Tap to hear NEED ELECTRO welcome voice"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#008CFF] to-sky-400 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-110 transition-transform animate-pulse">
              <Volume2 size={13} className="text-white" />
            </div>
            <div className="flex flex-col text-left leading-none pr-0.5">
              <span className="text-[11px] font-bold text-white tracking-wide">
                Welcome to NEED ELECTRO
              </span>
              <span className="text-[9.5px] font-semibold text-sky-300 mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                Tap to Listen 🔊
              </span>
            </div>
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
        </aside>
      )}

      {/* State 3: Played / Dismissed State -> Subtle Replay Button */}
      {!isSpeaking && (hasPlayed || dismissed) && (
        <aside
          aria-label="Replay Welcome Voice"
          className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] md:bottom-6 right-3 sm:right-6 z-50 animate-in fade-in duration-300 pointer-events-auto select-none"
        >
          <button
            type="button"
            onClick={handleManualPlay}
            className="w-8 h-8 rounded-full bg-[#002B5B]/90 hover:bg-[#008CFF] border border-[#008CFF]/40 text-white shadow-lg shadow-blue-500/15 flex items-center justify-center transition-all hover:scale-110 active:scale-95 group backdrop-blur-md"
            title="Replay NEED ELECTRO Welcome Voice"
            aria-label="Replay Welcome Voice"
          >
            <Volume2 size={14} className="group-hover:scale-110 transition-transform text-sky-300 group-hover:text-white" />
          </button>
        </aside>
      )}
    </>
  );
};

export default VoiceWelcome;


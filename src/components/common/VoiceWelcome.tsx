'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { Volume2, X } from 'lucide-react';

const WELCOME_TEXT =
  'Welcome to Need Electro, your trusted electrical and technological solutions.';
const AUDIO_SRC = '/welcome-voice.mp3';

export const VoiceWelcome: React.FC = () => {
  const pathname = usePathname();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const hasTriggeredRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Helper to pick human-like female voice for Web Speech API fallback
  const getPreferredFemaleVoice = useCallback((): SpeechSynthesisVoice | null => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Prioritized list of known high-quality natural female voices across OSs & browsers
    const femaleNameTokens = [
      'aria', // Microsoft Aria Online (Natural) - Female
      'jenny', // Microsoft Jenny Online (Natural) - Female
      'samantha', // Apple Samantha - Female
      'victoria', // Apple Victoria - Female
      'karen', // Apple Karen - Female
      'moira', // Apple Moira - Female
      'zira', // Microsoft Zira Desktop - Female
      'google us english', // Chrome Google US English - Female
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

    // 1. Try to find an English female voice by explicit name match
    for (const token of femaleNameTokens) {
      const match = voices.find(
        (v) =>
          (v.lang.startsWith('en') || v.lang === 'en-US' || v.lang === 'en-GB') &&
          v.name.toLowerCase().includes(token)
      );
      if (match) return match;
    }

    // 2. Filter out explicit male voices and pick any English voice
    const femaleCandidate = voices.find((v) => {
      if (!v.lang.startsWith('en')) return false;
      const lower = v.name.toLowerCase();
      return !maleNameTokens.some((m) => lower.includes(m));
    });

    if (femaleCandidate) return femaleCandidate;

    // 3. Fallback to en-US or first voice
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
      utterance.rate = 0.94; // Natural human pace
      utterance.pitch = 1.08; // Pleasant, natural female pitch
      utterance.volume = 1.0;

      const voice = getPreferredFemaleVoice();
      if (voice) {
        utterance.voice = voice;
      }

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
  }, [getPreferredFemaleVoice]);

  // Main playback: High-fidelity natural human female voice audio with speech synthesis backup
  const playWelcome = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Stop any existing speech synthesis
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }

    // Initialize or reuse HTML5 Audio element
    try {
      if (!audioRef.current) {
        const audio = new Audio(AUDIO_SRC);
        audio.preload = 'auto';
        audio.volume = 1.0;

        audio.onplay = () => {
          setIsSpeaking(true);
          setHasPlayed(true);
        };

        audio.onended = () => {
          setIsSpeaking(false);
        };

        audio.onerror = () => {
          // If MP3 fails to load, fallback gracefully to browser female speech synthesis
          playSpeechSynthesisFallback();
        };

        audioRef.current = audio;
      }

      const audio = audioRef.current;
      audio.currentTime = 0;
      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsSpeaking(true);
            setHasPlayed(true);
          })
          .catch((err) => {
            // If browser autoplay policy blocked raw unmuted playback without user interaction,
            // fallback gracefully or await first passive interaction
            if (err?.name === 'NotAllowedError') {
              // Wait for passive interaction backup
            } else {
              playSpeechSynthesisFallback();
            }
          });
      }
    } catch {
      playSpeechSynthesisFallback();
    }
  }, [playSpeechSynthesisFallback]);

  useEffect(() => {
    // Never play on admin/ERP routes
    if (pathname?.startsWith('/admin')) {
      return;
    }

    try {
      localStorage.removeItem('needElectroVoiceWelcomePlayed');
      sessionStorage.removeItem('needElectroVoiceSessionPlayed');
    } catch {}

    const attemptAutoPlay = () => {
      if (hasTriggeredRef.current) return;
      hasTriggeredRef.current = true;
      playWelcome();
    };

    // 1. Immediate Auto-Play on visiting the website without clicking any button
    const autoPlayTimer = setTimeout(attemptAutoPlay, 250);

    // 2. Backup listener for strict mobile autoplay policies (scroll, touch, click, pointer)
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

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation();
    playWelcome();
  };

  // Do not render on admin routes
  if (pathname?.startsWith('/admin')) {
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

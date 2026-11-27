'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FastForward, Volume2, VolumeX } from 'lucide-react';

export default function BrandedIntro() {
  const [showIntro, setShowIntro] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hasAttemptedPlay = useRef(false);

  useEffect(() => {
    // 1. Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      return; // Skip intro entirely if user prefers reduced motion
    }

    // 2. Check if already played in this browser session (prevents replay on internal navigation)
    const hasPlayed = sessionStorage.getItem('athlos_intro_played');
    if (hasPlayed) {
      return;
    }

    // 3. Read persistent sound preference (unmuted by default unless explicitly muted)
    const storedPref = localStorage.getItem('athlos_sound_pref');
    const shouldMute = storedPref === 'muted';
    setIsMuted(shouldMute);

    setShowIntro(true);
  }, []);

  // Handler to attempt unmuted playback at 70% volume
  const attemptPlayback = () => {
    const video = videoRef.current;
    if (!video || hasAttemptedPlay.current) return;
    hasAttemptedPlay.current = true;

    // Set 70% volume by default
    video.volume = 0.7;

    const storedPref = localStorage.getItem('athlos_sound_pref');
    const shouldMute = storedPref === 'muted';

    if (shouldMute) {
      video.muted = true;
      setIsMuted(true);
      video.play().catch(() => {});
    } else {
      video.muted = false;
      setIsMuted(false);
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Unmuted autoplay permitted by browser policy!
            setIsMuted(false);
            setAutoplayBlocked(false);
          })
          .catch((err) => {
            // Browser restricted unmuted autoplay: fall back to muted playback and show "TAP TO ENABLE SOUND"
            console.warn('Unmuted autoplay blocked by browser policy:', err?.message || err);
            video.muted = true;
            setIsMuted(true);
            setAutoplayBlocked(true);
            video.play().catch(() => {});
          });
      }
    }
  };

  useEffect(() => {
    if (!showIntro) return;
    attemptPlayback();
  }, [showIntro]);

  const handleComplete = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    sessionStorage.setItem('athlos_intro_played', 'true');
    setTimeout(() => {
      setShowIntro(false);
    }, 500);
  };

  const enableSound = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const video = videoRef.current;
    if (video) {
      video.muted = false;
      video.volume = 0.7;
      setIsMuted(false);
      setAutoplayBlocked(false);
      localStorage.setItem('athlos_sound_pref', 'unmuted');
      if (video.paused) {
        video.play().catch(() => {});
      }
    }
  };

  const toggleMute = (e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const video = videoRef.current;
    if (video) {
      const nextMuted = !video.muted;
      video.muted = nextMuted;
      if (!nextMuted) {
        video.volume = 0.7;
        setAutoplayBlocked(false);
        if (video.paused) {
          video.play().catch(() => {});
        }
      }
      setIsMuted(nextMuted);
      localStorage.setItem('athlos_sound_pref', nextMuted ? 'muted' : 'unmuted');
    }
  };

  // Keyboard shortcut: Escape, Space, or Enter to skip
  useEffect(() => {
    if (!showIntro) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showIntro, isFadingOut]);

  if (!showIntro) return null;

  return (
    <div
      role="dialog"
      aria-label="ATHLOS War of Batches Tournament Intro Video"
      onClick={() => {
        if (autoplayBlocked) enableSound();
      }}
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Video Container preserving aspect ratio */}
      <div className="relative w-full h-full flex items-center justify-center">
        <video
          ref={videoRef}
          src="/assets/videos/athlos_war_of_batches_intro_2026-27.mp4"
          playsInline
          preload="auto"
          onCanPlay={attemptPlayback}
          onEnded={handleComplete}
          onError={handleComplete}
          className="w-full h-full object-contain max-h-screen"
        />

        {/* Floating "TAP TO ENABLE SOUND" Prompt when browser blocks unmuted autoplay */}
        {autoplayBlocked && (
          <div className="absolute bottom-16 sm:bottom-20 z-50 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
            <button
              onClick={enableSound}
              onTouchEnd={enableSound}
              aria-label="Tap to enable sound"
              className="group flex items-center space-x-2.5 px-6 py-3 rounded-full bg-black/90 hover:bg-black border-2 border-amber-400 text-amber-300 hover:text-white text-xs sm:text-sm font-spartan font-black uppercase tracking-wider backdrop-blur-xl transition-all shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:shadow-[0_0_35px_rgba(245,158,11,0.7)] hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>TAP TO ENABLE SOUND</span>
            </button>
            <span className="text-[10px] text-slate-400 font-mono mt-2 tracking-wide">
              Browser policy restricted unmuted autoplay • Tap anywhere to unmute
            </span>
          </div>
        )}

        {/* Top-Right Control Buttons */}
        <div className="absolute top-6 right-6 z-50 flex items-center space-x-3">
          {/* Mute/Unmute Toggle */}
          <button
            onClick={toggleMute}
            onTouchEnd={toggleMute}
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 border border-amber-500/30 text-amber-400 backdrop-blur-md transition hover:scale-105 shadow-md cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Skip Intro Button */}
          <button
            onClick={handleComplete}
            onTouchEnd={handleComplete}
            aria-label="Skip branded intro video"
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-black/70 hover:bg-black/90 border border-amber-500/50 text-amber-300 text-xs font-black uppercase tracking-wider backdrop-blur-md transition shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-105 cursor-pointer"
          >
            <span>Skip Intro</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

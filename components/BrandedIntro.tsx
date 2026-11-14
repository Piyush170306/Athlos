'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FastForward, Volume2, VolumeX } from 'lucide-react';

export default function BrandedIntro() {
  const [showIntro, setShowIntro] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    // 1. Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      return; // Skip intro entirely if user prefers reduced motion
    }

    // 2. Check if already played in this browser session
    const hasPlayed = sessionStorage.getItem('athlos_intro_played');
    if (hasPlayed) {
      return;
    }

    setShowIntro(true);
  }, []);

  const handleComplete = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);
    sessionStorage.setItem('athlos_intro_played', 'true');
    setTimeout(() => {
      setShowIntro(false);
    }, 500);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
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
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Video Container preserving aspect ratio */}
      <div className="relative w-full h-full flex items-center justify-center">
        <video
          ref={videoRef}
          src="/assets/videos/athlos_war_of_batches_intro_2026-27.mp4"
          autoPlay
          muted
          playsInline
          onEnded={handleComplete}
          onError={handleComplete}
          className="w-full h-full object-contain max-h-screen"
        />

        {/* Top-Right Control Buttons */}
        <div className="absolute top-6 right-6 z-50 flex items-center space-x-3">
          {/* Mute/Unmute Toggle */}
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            className="p-2.5 rounded-full bg-black/60 hover:bg-black/90 border border-amber-500/30 text-amber-400 backdrop-blur-md transition hover:scale-105"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Skip Intro Button */}
          <button
            onClick={handleComplete}
            aria-label="Skip branded intro video"
            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-black/70 hover:bg-black/90 border border-amber-500/50 text-amber-300 text-xs font-black uppercase tracking-wider backdrop-blur-md transition shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:scale-105"
          >
            <span>Skip Intro</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

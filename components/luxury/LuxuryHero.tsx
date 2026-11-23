'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Trophy, ArrowRight, Play, Volume2, VolumeX, X, Sparkles, Shield } from 'lucide-react';
import { LeaderboardEntry } from '@/lib/db/public';
import GoldParticleCanvas from './GoldParticleCanvas';
import MagneticButton from './MagneticButton';
import TiltCard from './TiltCard';

interface LuxuryHeroProps {
  leaderboard: LeaderboardEntry[];
  onSelectBatch?: (entry: LeaderboardEntry) => void;
}

export default function LuxuryHero({ leaderboard, onSelectBatch }: LuxuryHeroProps) {
  // Find top 3 batches for the podium & mascot composition
  const rank1 = leaderboard.find((b) => b.rank === 1) || leaderboard[0];
  const rank2 = leaderboard.find((b) => b.rank === 2) || leaderboard[1];
  const rank3 = leaderboard.find((b) => b.rank === 3) || leaderboard[2];

  // Mouse coordinates for interactive 3D cursor depth & layered parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });

  // Video intro modal state
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Smooth lerp mouse tracking
  useEffect(() => {
    let animId: number;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Normalize to range [-1, 1]
      const nx = (e.clientX / innerWidth) * 2 - 1;
      const ny = (e.clientY / innerHeight) * 2 - 1;
      setTargetPos({ x: nx, y: ny });
    };

    const updateLerp = () => {
      currentX += (targetPos.x - currentX) * 0.08;
      currentY += (targetPos.y - currentY) * 0.08;
      setMousePos({ x: currentX, y: currentY });
      animId = requestAnimationFrame(updateLerp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    animId = requestAnimationFrame(updateLerp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, [targetPos]);

  // Video modal keyboard listener
  useEffect(() => {
    if (!isVideoModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsVideoModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVideoModalOpen]);

  return (
    <section className="relative overflow-hidden pt-8 sm:pt-12 pb-10 text-center select-none min-h-[620px] flex flex-col justify-center items-center">
      {/* 1. Motion Trails / Subtle Gold Particle Canvas */}
      <GoldParticleCanvas />

      {/* 2. Interactive Cursor Depth: Layered Background Glows (Parallax Speed 0.4) */}
      <div
        className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center transition-transform duration-75 will-change-transform"
        style={{
          transform: `translate3d(${mousePos.x * -24}px, ${mousePos.y * -20}px, 0)`,
        }}
        aria-hidden="true"
      >
        <div className="w-[360px] sm:w-[650px] md:w-[920px] h-[340px] sm:h-[480px] bg-gradient-to-r from-[#17140E]/90 via-[#302719]/45 to-[#17140E]/90 blur-[150px] rounded-full" />
      </div>

      {/* 3. Interactive 3D Mascot Artwork Floating Cards (Layered Depth Parallax) */}
      <div
        className="pointer-events-none absolute inset-0 z-0 hidden lg:block overflow-hidden"
        aria-hidden="true"
      >
        {/* Left Floating Mascot Artwork (IPM06) - Parallax Speed 0.85 */}
        <div
          className="absolute left-6 xl:left-14 top-20 pointer-events-auto transition-transform duration-100 will-change-transform"
          style={{
            transform: `perspective(1200px) translate3d(${mousePos.x * 32}px, ${mousePos.y * 24}px, 0) rotateY(${14 + mousePos.x * 8}deg) rotateX(${-6 - mousePos.y * 6}deg)`,
          }}
        >
          <div
            onClick={() => {
              const entry = leaderboard.find((b) => b.batch.code === 'IPM06');
              if (entry && onSelectBatch) onSelectBatch(entry);
            }}
            className="group relative w-36 xl:w-44 p-3 rounded-2xl bg-gradient-to-b from-[#17140E]/90 via-[#120F0B]/90 to-[#0A0907]/95 border border-[#302719] hover:border-[#E6CA83]/70 backdrop-blur-md shadow-[0_15px_35px_rgba(0,0,0,0.8)] cursor-pointer transition-all duration-300 hover:scale-105"
          >
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black/60 border border-slate-700/40 p-1 mb-2">
              <img
                src="/assets/branding/ipm06_dragon_layer.jpeg"
                alt="IPM06 Mascot"
                className="w-full h-full object-cover rounded-lg mix-blend-screen transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="font-spartan font-black text-sm text-slate-200 tracking-wider">
                IPM06
              </span>
              <span className="text-[10px] font-mono font-bold text-[#E6CA83]">
                {leaderboard.find((b) => b.batch.code === 'IPM06')?.totalPoints.toFixed(1) || '0.0'} PTS
              </span>
            </div>
          </div>
        </div>

        {/* Right Floating Mascot Artwork (IPM08) - Parallax Speed 0.85 */}
        <div
          className="absolute right-6 xl:right-14 top-20 pointer-events-auto transition-transform duration-100 will-change-transform"
          style={{
            transform: `perspective(1200px) translate3d(${mousePos.x * -32}px, ${mousePos.y * 24}px, 0) rotateY(${-14 + mousePos.x * 8}deg) rotateX(${-6 - mousePos.y * 6}deg)`,
          }}
        >
          <div
            onClick={() => {
              const entry = leaderboard.find((b) => b.batch.code === 'IPM08');
              if (entry && onSelectBatch) onSelectBatch(entry);
            }}
            className="group relative w-36 xl:w-44 p-3 rounded-2xl bg-gradient-to-b from-[#17140E]/90 via-[#120F0B]/90 to-[#0A0907]/95 border border-[#302719] hover:border-[#E6CA83]/70 backdrop-blur-md shadow-[0_15px_35px_rgba(0,0,0,0.8)] cursor-pointer transition-all duration-300 hover:scale-105"
          >
            <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black/60 border border-amber-800/40 p-1 mb-2">
              <img
                src="/assets/branding/ipm08_deer_layer.jpeg"
                alt="IPM08 Mascot"
                className="w-full h-full object-cover rounded-lg mix-blend-screen transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="flex items-center justify-between px-1">
              <span className="font-spartan font-black text-sm text-slate-200 tracking-wider">
                IPM08
              </span>
              <span className="text-[10px] font-mono font-bold text-[#E6CA83]">
                {leaderboard.find((b) => b.batch.code === 'IPM08')?.totalPoints.toFixed(1) || '0.0'} PTS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Central Hero Foreground Content (Perspective Tilt & Parallax 0.5) */}
      <div
        className="max-w-5xl mx-auto px-4 flex flex-col items-center justify-center relative z-10 space-y-4 will-change-transform"
        style={{
          transform: `perspective(1200px) translate3d(${mousePos.x * 12}px, ${mousePos.y * 10}px, 0) rotateX(${mousePos.y * -3}deg) rotateY(${mousePos.x * 3}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        {/* Official ATHLOS IPM Sports Club Crest (from user brand guidelines) */}
        <div className="relative w-18 h-18 sm:w-24 sm:h-24 flex items-center justify-center group mb-1">
          <div className="absolute inset-0 rounded-2xl bg-[#E6CA83]/20 blur-xl group-hover:blur-2xl transition-all" />
          <img
            src="/assets/branding/athlos_ipm_sports_club_crest.png"
            alt="Official ATHLOS IPM Sports Club Crest"
            className="w-full h-full object-contain filter drop-shadow-[0_6px_22px_rgba(230,202,131,0.5)] transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/branding/athlos_logo_primary.png';
            }}
          />
        </div>

        {/* Tournament Season Pill */}
        <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-[#17140E] border border-[#C6A45A]/40 text-[#E6CA83] text-[11px] sm:text-xs font-spartan font-black uppercase tracking-[0.3em] shadow-sm backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E6CA83] animate-pulse" />
          <span>2026 — 2027</span>
        </div>

        {/* Secondary Editorial Subtitle: The Seasons font */}
        <p className="font-seasons italic text-[#F5EBD4]/90 text-sm sm:text-lg md:text-xl tracking-wider max-w-xl">
          The Ultimate Inter-Batch Championship — The Battle for Glory
        </p>

        {/* Dominant Primary Title: ATHLOS in League Spartan Metallic Gold */}
        <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] font-spartan font-black uppercase tracking-wider gold-metallic-text leading-none drop-shadow-[0_12px_40px_rgba(0,0,0,0.85)]">
          ATHLOS
        </h1>

        {/* Sub-Headline: WAR OF BATCHES */}
        <h2 className="text-xl sm:text-3xl md:text-5xl font-spartan font-black tracking-[0.2em] sm:tracking-[0.28em] uppercase text-[#F5EBD4] drop-shadow-[0_2px_15px_rgba(230,202,131,0.3)]">
          WAR OF BATCHES
        </h2>

        {/* Interactive Magnetic Action Buttons */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 pt-2">
          {/* Watch Official Intro Video Button */}
          <MagneticButton
            onClick={() => setIsVideoModalOpen(true)}
            strength={0.25}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#1E1910] to-[#120F0A] border border-[#C6A45A]/60 hover:border-[#E6CA83] text-[#E6CA83] text-xs font-spartan font-bold uppercase tracking-wider transition-all duration-300 shadow-[0_4px_20px_rgba(230,202,131,0.18)] hover:shadow-[0_6px_25px_rgba(230,202,131,0.3)]"
          >
            <Play className="w-3.5 h-3.5 fill-[#E6CA83]" />
            <span>Watch Official Intro</span>
          </MagneticButton>

          {/* Quick Jump to Leaderboard Button */}
          <MagneticButton
            onClick={() => {
              const el = document.getElementById('leaderboard-section');
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
              } else if (rank1 && onSelectBatch) {
                onSelectBatch(rank1);
              }
            }}
            strength={0.25}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#120F0A] border border-[#302719] hover:border-[#C6A45A] text-[#F5EBD4]/90 text-xs font-spartan font-bold uppercase tracking-wider transition-all duration-300 hover:text-[#E6CA83]"
          >
            <Trophy className="w-3.5 h-3.5 text-[#C6A45A]" />
            <span>Official Standings</span>
          </MagneticButton>
        </div>

        {/* Mini Illustrative Podium Bar (Clickable with cinematic zoom into drawer) */}
        <div className="w-full max-w-2xl mt-5 pt-5 border-t border-[#302719]/60">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {[rank1, rank2, rank3].filter(Boolean).map((b) => (
              <button
                key={b.batch.id}
                type="button"
                onClick={() => onSelectBatch && onSelectBatch(b)}
                className="group relative p-3 sm:p-4 rounded-2xl bg-gradient-to-b from-[#17140E] to-[#0A0907] border border-[#302719] hover:border-[#E6CA83]/70 transition-all duration-300 hover:scale-[1.03] text-center shadow-lg"
              >
                {/* Rank Badge */}
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#C6A45A] block mb-1">
                  0{b.rank}
                </span>

                {/* Batch Code (Strictly NO animal mascot names) */}
                <span className="font-spartan font-black text-base sm:text-xl text-white block uppercase tracking-wider group-hover:text-[#E6CA83] transition-colors">
                  {b.batch.code}
                </span>

                {/* Verified Points */}
                <span className="font-spartan font-extrabold text-xs sm:text-sm text-[#E6CA83] block mt-0.5">
                  {b.totalPoints.toFixed(1)} <span className="text-[10px] font-mono text-[#C6A45A]">PTS</span>
                </span>

                <span className="text-[9px] font-mono uppercase text-slate-500 block mt-1">
                  Click to inspect
                </span>
              </button>
            ))}
          </div>

          {/* Championship Motto */}
          <div className="mt-4 text-[10px] sm:text-xs font-spartan font-bold tracking-[0.35em] text-[#C6A45A]/90 uppercase">
            COMPETE · CONQUER · BE REMEMBERED
          </div>
        </div>
      </div>

      {/* 5. Tournament Video Modal (Preserves the official intro experience on demand) */}
      {isVideoModalOpen && (
        <div
          role="dialog"
          aria-label="ATHLOS War of Batches Official Tournament Intro Video"
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fade-in p-4 sm:p-6"
        >
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden border border-[#C6A45A]/50 shadow-[0_0_50px_rgba(230,202,131,0.25)] flex items-center justify-center">
            {/* Top Close & Audio Controls */}
            <div className="absolute top-4 right-4 z-50 flex items-center space-x-2">
              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = !videoRef.current.muted;
                    setIsVideoMuted(videoRef.current.muted);
                  }
                }}
                className="p-2.5 rounded-full bg-black/70 hover:bg-black/90 border border-[#C6A45A]/40 text-[#E6CA83] backdrop-blur-md transition hover:scale-105"
                title={isVideoMuted ? 'Unmute' : 'Mute'}
              >
                {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-2.5 rounded-full bg-black/70 hover:bg-black/90 border border-[#C6A45A]/40 text-[#E6CA83] backdrop-blur-md transition hover:scale-105"
                title="Close Video"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Player */}
            <video
              ref={videoRef}
              src="/assets/videos/athlos_war_of_batches_intro_2026-27.mp4"
              autoPlay
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}

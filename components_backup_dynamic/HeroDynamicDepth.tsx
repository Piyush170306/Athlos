'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import ParticleField from './motion/ParticleField';

export default function HeroDynamicDepth() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Normalized mouse coordinates from -1 to 1
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring smoothing for buttery-smooth inertia
  const springConfig = { damping: 28, stiffness: 120, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Layer parallax transforms (controlled displacement in pixels)
  // Layer 1: Background geometric orbital rings (counter-displacement)
  const ringX = useTransform(smoothX, [-1, 1], [22, -22]);
  const ringY = useTransform(smoothY, [-1, 1], [18, -18]);

  // Layer 2: Flanking Mascot Artworks
  const mascotLeftX = useTransform(smoothX, [-1, 1], [-28, 28]);
  const mascotLeftY = useTransform(smoothY, [-1, 1], [-20, 20]);
  const mascotRightX = useTransform(smoothX, [-1, 1], [28, -28]);
  const mascotRightY = useTransform(smoothY, [-1, 1], [20, -20]);

  // Layer 3: Central Emblem / Crest
  const emblemY = useTransform(smoothY, [-1, 1], [-12, 12]);
  const emblemScale = useTransform(smoothY, [-1, 1], [0.98, 1.02]);

  // Layer 4: Primary Golden Typography (Subtle 3D perspective pitch)
  const titleRotateX = useTransform(smoothY, [-1, 1], [6, -6]);
  const titleRotateY = useTransform(smoothX, [-1, 1], [-7, 7]);
  const titleTranslateX = useTransform(smoothX, [-1, 1], [-10, 10]);
  const titleTranslateY = useTransform(smoothY, [-1, 1], [-8, 8]);

  // Spotlight position
  const [spotlightPos, setSpotlightPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    // Set normalized coords [-1, 1]
    mouseX.set((x - 0.5) * 2);
    mouseY.set((y - 0.5) * 2);

    // Spotlight percentage
    setSpotlightPos({ x: Math.round(x * 100), y: Math.round(y * 100) });
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setSpotlightPos({ x: 50, y: 50 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full min-h-[580px] sm:min-h-[640px] md:min-h-[720px] flex items-center justify-center overflow-hidden select-none bg-[#070a12] pt-6 pb-12"
      style={{ perspective: 1200 }}
    >
      {/* 1. Ambient Gold Particle Field Canvas */}
      <ParticleField />

      {/* 2. Interactive Cursor Radial Spotlight */}
      {isClient && !isMobile && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-[1]"
          style={{
            background: `radial-gradient(circle 500px at ${spotlightPos.x}% ${spotlightPos.y}%, rgba(229, 184, 66, 0.12) 0%, rgba(212, 175, 55, 0.04) 40%, transparent 75%)`,
          }}
        />
      )}

      {/* 3. Deep Cinematic Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[600px] md:w-[850px] h-[340px] sm:h-[450px] bg-gradient-to-r from-amber-600/15 via-yellow-500/20 to-amber-700/15 blur-[120px] rounded-full pointer-events-none z-[1]" />

      {/* 4. Rotating Geometric Championship Rings */}
      <motion.div
        style={{ x: ringX, y: ringY }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-[2]"
      >
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
          className="w-[340px] sm:w-[520px] md:w-[680px] h-[340px] sm:h-[520px] md:h-[680px] rounded-full border border-amber-500/15 border-dashed"
        />
        {/* Inner Ring with Tick marks */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[260px] sm:w-[400px] md:w-[520px] h-[260px] sm:h-[400px] md:h-[520px] rounded-full border border-amber-400/20"
          style={{
            backgroundImage:
              'radial-gradient(circle, transparent 96%, rgba(229, 184, 66, 0.08) 100%)',
          }}
        >
          {/* Subtle Cybercore compass nodes */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 rounded-full bg-amber-400/60" />
          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400/60" />
          <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
        </motion.div>
      </motion.div>

      {/* 5. Layered Mascot Compositions (Parallax depth behind & flanking typography) */}
      <div className="absolute inset-0 max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 md:px-12 pointer-events-none z-[3]">
        {/* Left Flank: IPM06 Mascot Artwork */}
        <motion.div
          style={{ x: mascotLeftX, y: mascotLeftY }}
          animate={isMobile ? { y: [0, -6, 0] } : undefined}
          transition={isMobile ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : undefined}
          className="hidden sm:flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity"
        >
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden bg-black/60 border border-slate-400/30 shadow-[0_0_30px_rgba(148,163,184,0.15)] p-1.5 backdrop-blur-md">
            <img
              src="/assets/branding/ipm06_dragon_layer.jpeg"
              alt="IPM06"
              className="w-full h-full object-cover rounded-xl mix-blend-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <span className="absolute bottom-1.5 left-0 right-0 text-center font-black text-[11px] tracking-widest text-slate-200">
              IPM06
            </span>
          </div>
          <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400 font-bold mt-2 px-2 py-0.5 rounded bg-black/60 border border-slate-700/50">
            Cohort
          </span>
        </motion.div>

        {/* Right Flank: IPM07 & IPM08 Mascot Artworks */}
        <motion.div
          style={{ x: mascotRightX, y: mascotRightY }}
          animate={isMobile ? { y: [0, 6, 0] } : undefined}
          transition={isMobile ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : undefined}
          className="hidden sm:flex flex-col items-center space-y-4 opacity-70 hover:opacity-100 transition-opacity"
        >
          {/* IPM07 */}
          <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden bg-black/60 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.18)] p-1.5 backdrop-blur-md">
            <img
              src="/assets/branding/ipm07_phoenix_layer.jpeg"
              alt="IPM07"
              className="w-full h-full object-cover rounded-xl mix-blend-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <span className="absolute bottom-1 left-0 right-0 text-center font-black text-[10px] md:text-[11px] tracking-widest text-amber-300">
              IPM07
            </span>
          </div>

          {/* IPM08 */}
          <div className="relative w-18 h-18 md:w-24 md:h-24 rounded-2xl overflow-hidden bg-black/60 border border-blue-500/30 shadow-[0_0_25px_rgba(59,130,246,0.15)] p-1 backdrop-blur-md">
            <img
              src="/assets/branding/ipm08_deer_layer.jpeg"
              alt="IPM08"
              className="w-full h-full object-cover rounded-xl mix-blend-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <span className="absolute bottom-1 left-0 right-0 text-center font-black text-[10px] tracking-widest text-blue-300">
              IPM08
            </span>
          </div>
        </motion.div>
      </div>

      {/* 6. Central Kinetic Golden Typography (The Hero Identity) */}
      <motion.div
        style={{
          rotateX: titleRotateX,
          rotateY: titleRotateY,
          x: titleTranslateX,
          y: titleTranslateY,
          transformStyle: 'preserve-3d',
        }}
        className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-4xl"
      >
        {/* ATHLOS Official Crest / Torch Shield */}
        <motion.div
          style={{ y: emblemY, scale: emblemScale }}
          className="mb-4 relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center group"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-amber-500/20 to-transparent blur-md group-hover:blur-lg transition-all" />
          <img
            src="/assets/branding/athlos_ipm_sports_club_crest.png"
            alt="ATHLOS Crest"
            className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(245,158,11,0.5)] transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              // Fallback to primary logo if crest fails
              (e.target as HTMLImageElement).src = '/assets/branding/athlos_logo_primary.png';
            }}
          />
        </motion.div>

        {/* Tournament Season Pill */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-950/70 border border-amber-500/50 text-amber-300 text-[10px] sm:text-xs font-black uppercase tracking-[0.25em] shadow-[0_0_15px_rgba(245,158,11,0.25)] mb-3 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span>2026–27 Championship</span>
        </div>

        {/* Dominant Headline: ATHLOS */}
        <h1
          className="text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] font-black uppercase tracking-wider bg-gradient-to-b from-[#FFFDF0] via-[#F5D87A] to-[#B38728] bg-clip-text text-transparent drop-shadow-[0_8px_45px_rgba(229,184,66,0.45)] leading-none"
          style={{
            textShadow: '0 0 80px rgba(229, 184, 66, 0.3)',
          }}
        >
          ATHLOS
        </h1>

        {/* Sub-Headline: WAR OF BATCHES */}
        <h2 className="text-xl sm:text-3xl md:text-5xl font-black tracking-[0.18em] sm:tracking-[0.25em] uppercase text-amber-100/90 drop-shadow-[0_2px_15px_rgba(229,184,66,0.35)] mt-1 sm:mt-2">
          WAR OF BATCHES
        </h2>

        {/* Mobile Batch Mascot Ribbon (Only shown on small viewports where side flanks are hidden) */}
        <div className="flex sm:hidden items-center justify-center space-x-4 mt-6 pt-4 border-t border-amber-500/20">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-slate-500/40">
            <img
              src="/assets/branding/ipm06_dragon_layer.jpeg"
              alt="IPM06"
              className="w-5 h-5 rounded object-cover"
            />
            <span className="font-bold text-[10px] text-slate-300">IPM06</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-amber-500/50">
            <img
              src="/assets/branding/ipm07_phoenix_layer.jpeg"
              alt="IPM07"
              className="w-5 h-5 rounded object-cover"
            />
            <span className="font-bold text-[10px] text-amber-300">IPM07</span>
          </div>
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-blue-500/40">
            <img
              src="/assets/branding/ipm08_deer_layer.jpeg"
              alt="IPM08"
              className="w-5 h-5 rounded object-cover"
            />
            <span className="font-bold text-[10px] text-blue-300">IPM08</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
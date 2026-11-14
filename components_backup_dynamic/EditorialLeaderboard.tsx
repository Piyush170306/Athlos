'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trophy, ShieldCheck, ArrowRight, Sparkles, Award } from 'lucide-react';
import TiltCard from './motion/TiltCard';
import MagneticWrapper from './motion/MagneticWrapper';
import { LeaderboardEntry } from '@/lib/db/public';

interface EditorialLeaderboardProps {
  leaderboard: LeaderboardEntry[];
}

export default function EditorialLeaderboard({ leaderboard }: EditorialLeaderboardProps) {
  const [hoveredBatch, setHoveredBatch] = useState<string | null>(null);

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-amber-500/20 mb-8 gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <span className="font-mono text-xs font-black uppercase tracking-[0.3em] text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-500/30">
              SEC. 01 / STANDINGS
            </span>
            <span className="text-slate-500 font-mono text-xs">• OFFICIAL AUTHORITY</span>
          </div>
          <div className="flex items-center space-x-3">
            <Trophy className="w-7 h-7 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-wider text-white">
              Official Leaderboard
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Synchronised directly with approved tournament Batch Scores Table (Row 89)</span>
          </p>
        </div>

        <MagneticWrapper strength={10}>
          <Link
            href="/leaderboard"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:from-amber-500/30 hover:to-yellow-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider transition shadow-[0_0_20px_rgba(245,158,11,0.15)] group"
          >
            <span>Full Standings & Matrix</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 text-amber-400" />
          </Link>
        </MagneticWrapper>
      </div>

      {/* Swiss Editorial 3D Tilt Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {leaderboard.map((entry) => {
          const isRank1 = entry.rank === 1;
          const isRank2 = entry.rank === 2;
          const isRank3 = entry.rank === 3;

          let cardBorder = 'border-slate-800/80';
          let cardBg = 'from-[#0d121f] via-[#090d16] to-[#05080f]';
          let rankColor = 'text-slate-500/60';
          let accentBorder = 'border-slate-700/40';
          let pointsGlow = 'text-white';
          let rankLabel = 'RUNNER UP';

          if (isRank1) {
            cardBorder = 'border-amber-400/50 shadow-[0_0_35px_rgba(245,158,11,0.22)]';
            cardBg = 'from-[#1e1708]/90 via-[#130f06]/95 to-[#070a12]';
            rankColor = 'text-amber-400/40';
            accentBorder = 'border-amber-500/50';
            pointsGlow = 'text-amber-300 drop-shadow-[0_0_18px_rgba(245,158,11,0.5)]';
            rankLabel = 'TOURNAMENT LEADER';
          } else if (isRank2) {
            cardBorder = 'border-slate-400/40 shadow-[0_0_25px_rgba(148,163,184,0.12)]';
            cardBg = 'from-[#141b2a]/90 via-[#0d1320]/95 to-[#05080f]';
            rankColor = 'text-slate-400/30';
            accentBorder = 'border-slate-400/40';
            pointsGlow = 'text-slate-100';
            rankLabel = 'SECOND PLACE';
          } else if (isRank3) {
            cardBorder = 'border-amber-800/40 shadow-[0_0_20px_rgba(180,83,9,0.1)]';
            cardBg = 'from-[#18120b]/90 via-[#0f0c07]/95 to-[#05080f]';
            rankColor = 'text-amber-700/30';
            accentBorder = 'border-amber-700/40';
            pointsGlow = 'text-amber-100/90';
            rankLabel = 'THIRD PLACE';
          }

          // Top sport contributors
          const sportsList = Object.entries(entry.breakdownBySport || {}).filter(
            ([_, pts]) => pts > 0
          );

          return (
            <TiltCard
              key={entry.batch.id}
              maxTilt={6}
              className={`rounded-3xl border ${cardBorder} bg-gradient-to-b ${cardBg} p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 overflow-hidden group`}
            >
              {/* Top Banner: Swiss Oversized Rank Number */}
              <div>
                <div className="flex items-start justify-between mb-6">
                  {/* Monolithic Swiss Rank Number */}
                  <div className="relative">
                    <span
                      className={`font-black text-6xl sm:text-7xl font-mono tracking-tighter select-none leading-none block ${rankColor} transition-colors group-hover:text-amber-400/80`}
                    >
                      0{entry.rank}
                    </span>
                    <span className="text-[10px] uppercase font-mono font-bold tracking-[0.2em] text-slate-400 block mt-1">
                      {rankLabel}
                    </span>
                  </div>

                  {/* Leader Badge */}
                  {isRank1 && (
                    <span className="flex items-center space-x-1.5 text-[10px] font-black uppercase tracking-widest text-amber-300 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/60 shadow-glow-gold animate-pulse">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Rank 1</span>
                    </span>
                  )}
                </div>

                {/* Mascot Artwork & Batch Code ONLY */}
                <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-surfaceBorder/60">
                  <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-black/80 border border-amber-500/30 flex-shrink-0 p-1 shadow-inner group-hover:border-amber-400/60 transition-colors">
                    <img
                      src={entry.batch.mascotImagePath}
                      alt={entry.batch.code}
                      className="w-full h-full object-cover rounded-xl mix-blend-screen transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                  </div>
                  <div>
                    <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-wider text-white">
                      {entry.batch.code}
                    </h3>
                    <p className="text-xs text-amber-400 font-bold tracking-wider uppercase mt-0.5">
                      Official Cohort
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Athlos Tournament 26–27
                    </span>
                  </div>
                </div>

                {/* Official Points & Wins Display */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-surfaceBorder/60">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-400 block mb-1">
                      Official Points
                    </span>
                    <span className={`text-3xl sm:text-4xl font-black tracking-tight ${pointsGlow}`}>
                      {entry.totalPoints.toFixed(1)}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-black/40 border border-surfaceBorder/60">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-slate-400 block mb-1">
                      Match Wins
                    </span>
                    <span className="text-3xl sm:text-4xl font-black tracking-tight text-slate-200">
                      {entry.wins}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sport-wise Points Breakdown */}
              {sportsList.length > 0 && (
                <div className="pt-4 border-t border-surfaceBorder/50">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2.5">
                    Verified Discipline Points
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {sportsList.slice(0, 6).map(([sport, pts]) => (
                      <span
                        key={sport}
                        className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-black/60 border border-surfaceBorder/70 text-slate-300"
                      >
                        {sport.replace(/-/g, ' ')}: <span className="text-amber-400">+{pts}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </TiltCard>
          );
        })}
      </div>
    </section>
  );
}
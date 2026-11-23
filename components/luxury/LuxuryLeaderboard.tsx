'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, ShieldCheck, ArrowRight, Sparkles, ExternalLink } from 'lucide-react';
import { LeaderboardEntry } from '@/lib/db/public';
import TiltCard from './TiltCard';

interface LuxuryLeaderboardProps {
  leaderboard: LeaderboardEntry[];
  onSelectBatch: (entry: LeaderboardEntry) => void;
}

export default function LuxuryLeaderboard({
  leaderboard,
  onSelectBatch,
}: LuxuryLeaderboardProps) {
  return (
    <section id="leaderboard-section" className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-10">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-5 border-b border-[#302719] mb-8 gap-3">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#C6A45A] mb-1">
            <span>SEC. 01 / STANDINGS</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">BATCH SCORES TABLE</span>
          </div>

          <div className="flex items-center space-x-3">
            <Trophy className="w-7 h-7 text-[#E6CA83] drop-shadow-[0_0_12px_rgba(230,202,131,0.5)]" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-spartan font-black uppercase tracking-wider text-white">
              Official Leaderboard
            </h2>
          </div>

          <p className="text-xs text-slate-400 mt-1.5 flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#E6CA83]" />
            <span>Authoritative totals from approved Batch Scores Table (Row 89)</span>
          </p>
        </div>

        <Link
          href="/leaderboard"
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#17140E] hover:bg-[#221c13] border border-[#302719] text-[#E6CA83] text-xs font-spartan font-bold uppercase tracking-wider transition group shadow-sm"
        >
          <span>Full Matrix & Standings</span>
          <ArrowRight className="w-4 h-4 text-[#C6A45A] group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 3D Luxury Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {leaderboard.map((entry) => {
          const isRank1 = entry.rank === 1;
          const isRank2 = entry.rank === 2;
          const isRank3 = entry.rank === 3;

          let cardBorder = 'border-[#302719]';
          let cardBg = 'from-[#14110C] via-[#0D0B08] to-[#080808]';
          let rankColor = 'text-slate-600/70';
          let pointsGlow = 'text-white';
          let statusLabel = 'RUNNER UP';

          if (isRank1) {
            cardBorder = 'border-[#E6CA83]/50 shadow-[0_0_35px_rgba(230,202,131,0.18)]';
            cardBg = 'from-[#221B0F] via-[#151108] to-[#080808]';
            rankColor = 'text-[#E6CA83]/50';
            pointsGlow = 'text-[#E6CA83] drop-shadow-[0_0_15px_rgba(230,202,131,0.4)]';
            statusLabel = 'TOURNAMENT LEADER';
          } else if (isRank2) {
            cardBorder = 'border-slate-500/40 shadow-[0_0_20px_rgba(148,163,184,0.1)]';
            cardBg = 'from-[#141822] via-[#0E1017] to-[#080808]';
            rankColor = 'text-slate-400/40';
            pointsGlow = 'text-slate-100';
            statusLabel = 'SECOND PLACE';
          } else if (isRank3) {
            cardBorder = 'border-[#3D2C1B]/60 shadow-[0_0_20px_rgba(180,83,9,0.1)]';
            cardBg = 'from-[#1C140C] via-[#100C07] to-[#080808]';
            rankColor = 'text-amber-800/40';
            pointsGlow = 'text-[#F5EBD4]/90';
            statusLabel = 'THIRD PLACE';
          }

          const sportsList = Object.entries(entry.breakdownBySport || {}).filter(
            ([_, pts]) => pts > 0
          );

          return (
            <TiltCard
              key={entry.batch.id}
              onClick={() => onSelectBatch(entry)}
              maxTilt={6}
              className={`group relative rounded-3xl border ${cardBorder} bg-gradient-to-b ${cardBg} p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 cursor-pointer hover:border-[#E6CA83]/70 hover:shadow-[0_12px_40px_rgba(230,202,131,0.22)]`}
            >
              <div>
                {/* Monolithic Rank Number + Leader Badge */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <span
                      className={`font-spartan font-black text-6xl sm:text-7xl tracking-tighter leading-none block ${rankColor} group-hover:text-[#E6CA83] transition-colors`}
                    >
                      0{entry.rank}
                    </span>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-slate-400 block mt-1">
                      {statusLabel}
                    </span>
                  </div>

                  {isRank1 ? (
                    <span className="flex items-center space-x-1.5 text-[10px] font-spartan font-black uppercase tracking-widest text-[#E6CA83] px-3 py-1 rounded-full bg-[#302719] border border-[#E6CA83]/60 shadow-glow-gold">
                      <Sparkles className="w-3.5 h-3.5 text-[#E6CA83]" />
                      <span>Rank 1</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider group-hover:text-[#E6CA83] flex items-center space-x-1">
                      <span>Inspect</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  )}
                </div>

                {/* Cohort Identity (Strictly Batch Codes & Accent Badges - No Mascots) */}
                <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-[#302719]/60">
                  <div
                    className={`relative w-16 h-16 rounded-2xl flex items-center justify-center font-spartan font-black text-xl tracking-wider border shadow-md ${
                      entry.batch.code === 'IPM07'
                        ? 'bg-red-950/40 border-red-500/40 text-red-200'
                        : entry.batch.code === 'IPM06'
                        ? 'bg-slate-900/60 border-slate-400/40 text-slate-200'
                        : 'bg-blue-950/40 border-blue-500/40 text-blue-200'
                    }`}
                  >
                    <span>{entry.batch.code.slice(3)}</span>
                  </div>
                  <div>
                    <h3 className="text-3xl sm:text-4xl font-spartan font-black uppercase tracking-wider text-white">
                      {entry.batch.code}
                    </h3>
                    <p className="text-xs font-seasons italic text-[#C6A45A] mt-0.5">
                      Official Tournament Cohort
                    </p>
                  </div>
                </div>

                {/* Score & Match Wins */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3.5 rounded-2xl bg-black/45 border border-[#302719]">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Official Points
                    </span>
                    <span className={`text-3xl sm:text-4xl font-spartan font-black tracking-tight ${pointsGlow}`}>
                      {entry.totalPoints.toFixed(1)}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-black/45 border border-[#302719]">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Match Wins
                    </span>
                    <span className="text-3xl sm:text-4xl font-spartan font-black tracking-tight text-slate-200">
                      {entry.wins}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sport-wise Breakdown Pills */}
              {sportsList.length > 0 && (
                <div className="pt-4 border-t border-[#302719]/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                      Discipline Contributions
                    </span>
                    <span className="text-[10px] font-mono text-[#C6A45A]">
                      Click for all
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sportsList.slice(0, 5).map(([sport, pts]) => (
                      <span
                        key={sport}
                        className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-[#13100B] border border-[#302719] text-slate-300"
                      >
                        {sport.replace(/-/g, ' ')}: <span className="text-[#E6CA83]">+{pts}</span>
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
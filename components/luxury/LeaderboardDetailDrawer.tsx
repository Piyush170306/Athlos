'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, Trophy, ShieldCheck, ArrowRight, Award, CheckCircle } from 'lucide-react';
import { LeaderboardEntry } from '@/lib/db/public';

interface LeaderboardDetailDrawerProps {
  entry: LeaderboardEntry | null;
  onClose: () => void;
}

export default function LeaderboardDetailDrawer({
  entry,
  onClose,
}: LeaderboardDetailDrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (entry) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [entry, onClose]);

  if (!entry) return null;

  const isRank1 = entry.rank === 1;
  const sportsList = Object.entries(entry.breakdownBySport || {}).sort((a, b) => b[1] - a[1]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md transition-all duration-300 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl border border-[#1D5E91]/60 bg-gradient-to-b from-[#0B1727] via-[#050B16] to-[#03060B] p-6 sm:p-8 shadow-[0_0_50px_rgba(121,201,242,0.25)] transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ice-Blue Reveal Accent Line */}
        <div className="absolute top-0 left-12 right-12 h-[2px] bg-gradient-to-r from-transparent via-[#79C9F2] to-transparent shadow-[0_0_15px_rgba(121,201,242,0.8)]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#0B1727] text-[#79C9F2] hover:text-white border border-[#1D5E91] transition"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header: Rank + Batch Identity (Clean Cohort Emblem - No Mascot Illustration) */}
        <div className="flex items-start space-x-5 mb-6 pb-6 border-b border-[#0B1727]">
          <div
            className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center font-spartan font-black text-2xl sm:text-3xl tracking-wider border shadow-inner flex-shrink-0 ${
              entry.batch.code === 'IPM07'
                ? 'bg-red-950/40 border-red-500/50 text-red-200'
                : entry.batch.code === 'IPM06'
                ? 'bg-slate-900/60 border-slate-400/50 text-slate-200'
                : 'bg-blue-950/40 border-blue-500/50 text-blue-200'
            }`}
          >
            <span>{entry.batch.code}</span>
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-widest text-[#79C9F2] mb-1">
              <span>RANK #{entry.rank}</span>
              {isRank1 && (
                <span className="px-2 py-0.5 rounded-full bg-[#0B1727] text-[#F2F7FC] border border-[#79C9F2]/70 font-black text-[10px]">
                  CHAMPIONSHIP LEADER
                </span>
              )}
            </div>
            <h2 className="text-3xl sm:text-4xl font-spartan font-black uppercase tracking-wider text-white">
              {entry.batch.code}
            </h2>
            <p className="text-xs font-seasons italic text-[#79C9F2] mt-0.5">
              Official Participating Tournament Cohort
            </p>
          </div>
        </div>

        {/* Score & Wins Overview Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-[#03060B]/70 border border-[#0B1727]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Authoritative Score
            </span>
            <span className="text-3xl sm:text-4xl font-spartan font-black tracking-tight text-[#F2F7FC] drop-shadow-[0_0_15px_rgba(121,201,242,0.4)]">
              {entry.totalPoints.toFixed(1)} <span className="text-xs font-mono text-[#79C9F2]">PTS</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#03060B]/70 border border-[#0B1727]">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Verified Match Wins
            </span>
            <span className="text-3xl sm:text-4xl font-spartan font-black tracking-tight text-slate-100">
              {entry.wins} <span className="text-xs font-mono text-slate-400">VICTORIES</span>
            </span>
          </div>
        </div>

        {/* Sport-by-Sport Points Breakdown */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-spartan font-bold uppercase tracking-wider text-[#F2F7FC]">
              Discipline Points Breakdown (Batch Scores Table)
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Row {entry.sourceRow || 89}
            </span>
          </div>

          {sportsList.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {sportsList.map(([sport, pts]) => (
                <div
                  key={sport}
                  className="p-2.5 rounded-xl bg-[#050B16] border border-[#0B1727] flex items-center justify-between text-xs"
                >
                  <span className="font-medium text-slate-300 uppercase tracking-wide truncate pr-2">
                    {sport.replace(/-/g, ' ')}
                  </span>
                  <span
                    className={`font-mono font-black ${
                      pts > 0 ? 'text-[#79C9F2]' : 'text-slate-500'
                    }`}
                  >
                    +{pts}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-500 italic p-3 text-center">
              No sport points recorded yet for this cohort.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-[#0B1727] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-1.5 text-emerald-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#79C9F2]" />
            <span>Official Approved Standings</span>
          </div>

          <Link
            href="/leaderboard"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#0B1727] via-[#1D5E91] to-[#79C9F2] text-white font-spartan font-black uppercase tracking-wider hover:opacity-90 transition shadow-[0_0_20px_rgba(121,201,242,0.3)]"
          >
            <span>View Full Leaderboard Matrix</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
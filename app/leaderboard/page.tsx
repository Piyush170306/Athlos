import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  ShieldCheck,
  AlertTriangle,
  Award,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { getActiveSeason, getOfficialLeaderboard } from '@/lib/db/public';
import { db } from '@/lib/db';

export const revalidate = 0;

export default function LeaderboardPage() {
  const activeSeason = getActiveSeason();
  const leaderboard = getOfficialLeaderboard(activeSeason.id);
  const sports = db.query('sports', (s) => s.seasonId === activeSeason.id && s.enabled);
  const allMatches = db.query('matches', (m) => m.seasonId === activeSeason.id);

  // Calculate match-derived wins for cross-reference
  const calculatedWins: Record<string, number> = {};
  for (const m of allMatches) {
    if (m.status === 'COMPLETED' && m.winnerBatchId && m.winnerBatchId !== 'DRAW') {
      calculatedWins[m.winnerBatchId] = (calculatedWins[m.winnerBatchId] || 0) + 1;
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="border-b border-[#0B1727] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#79C9F2] mb-1">
              <Trophy className="w-4 h-4 text-[#79C9F2]" />
              <span>Official Standings</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-spartan font-black uppercase text-white tracking-wider">
              Tournament Leaderboard
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-[#79C9F2]" />
              <span>Governing Authority: Approved Batch Scores Table (Row 89)</span>
            </p>
          </div>

          <div className="px-5 py-3 rounded-xl bg-[#050B16] border border-[#1D5E91]/40 text-right">
            <span className="text-[10px] uppercase font-bold text-[#79C9F2] block tracking-wider font-mono">
              Active Season
            </span>
            <span className="text-sm font-extrabold text-white font-spartan">
              {activeSeason.name}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Standings Table */}
      <div className="rounded-2xl overflow-hidden border border-amber-500/30 bg-[#0a0e18] shadow-2xl">
        <div className="p-4 sm:p-6 bg-[#0f1524] border-b border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-black uppercase text-white tracking-wider flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Overall Batch Standings</span>
          </h2>
          <span className="text-xs text-slate-400 font-medium">
            Tie-Break Rule: Equal ranks displayed until resolved by official review
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surfaceBorder bg-black/50 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-4 sm:px-6">Rank</th>
                <th className="py-4 px-4 sm:px-6">Batch Identity</th>
                <th className="py-4 px-4 text-center">Batch Code</th>
                <th className="py-4 px-4 text-center">Match Wins</th>
                <th className="py-4 px-6 text-right font-black text-amber-400">
                  Official Total Points
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surfaceBorder/60 text-sm">
              {leaderboard.map((entry) => {
                const isRank1 = entry.rank === 1;

                const badgeBg = isRank1
                  ? 'bg-amber-500 text-black border-amber-300 font-black shadow-glow-gold'
                  : 'bg-surfaceLight text-slate-300 border-surfaceBorder';

                return (
                  <tr
                    key={entry.batch.id}
                    className={`hover:bg-[#121829] transition duration-150 ${
                      isRank1 ? 'bg-amber-950/10' : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-5 px-4 sm:px-6 font-black text-base">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border font-black text-sm ${badgeBg}`}
                      >
                        #{entry.rank}
                      </span>
                    </td>

                    {/* Batch Identity (Logo + Batch Name Only) */}
                    <td className="py-5 px-4 sm:px-6">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/70 border border-amber-500/30 flex-shrink-0 flex items-center justify-center p-1">
                          <img
                            src={entry.batch.mascotImagePath}
                            alt={entry.batch.code}
                            className="w-full h-full object-cover mix-blend-screen"
                          />
                        </div>
                        <div>
                          <span className="font-black text-white block text-lg tracking-wider">
                            {entry.batch.code}
                          </span>
                          <span className="text-[11px] text-amber-400/80 font-bold uppercase tracking-wider">
                            Participating Batch
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Batch Code */}
                    <td className="py-5 px-4 text-center font-mono font-bold text-slate-200 text-base">
                      {entry.batch.code}
                    </td>

                    {/* Wins */}
                    <td className="py-5 px-4 text-center font-bold text-slate-200 text-base">
                      {entry.wins}
                    </td>

                    {/* Official Total Points */}
                    <td className="py-5 px-6 text-right">
                      <span className={`text-3xl font-black tracking-tight ${isRank1 ? 'text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'text-white'}`}>
                        {entry.totalPoints.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sport-by-Sport Points Breakdown Matrix */}
      <div className="rounded-2xl overflow-hidden border border-surfaceBorder bg-[#0a0e18]">
        <div className="p-4 sm:p-6 bg-[#0f1524] border-b border-surfaceBorder">
          <h2 className="text-lg font-black uppercase text-white tracking-wider flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Sport-Wise Points Distribution</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Breakdown of approved tournament points allocated across sports from the Batch Scores Table
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-surfaceBorder bg-black/50 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-5">Sport</th>
                <th className="py-3.5 px-4">Format Schema</th>
                {leaderboard.map((entry) => (
                  <th key={entry.batch.id} className="py-3.5 px-4 text-center font-black text-white text-xs">
                    {entry.batch.code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surfaceBorder/60">
              {sports.map((sport) => (
                <tr key={sport.id} className="hover:bg-[#121829] transition">
                  <td className="py-3.5 px-5 font-bold text-slate-200">
                    <Link
                      href={`/sports/${sport.slug}`}
                      className="hover:text-amber-400 transition flex items-center space-x-1"
                    >
                      <span className="text-sm font-semibold">{sport.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {sport.scoreFormatType}
                  </td>
                  {leaderboard.map((entry) => {
                    const pts = entry.breakdownBySport[sport.slug] || 0;
                    return (
                      <td
                        key={entry.batch.id}
                        className="py-3.5 px-4 text-center font-bold text-sm"
                      >
                        {pts > 0 ? (
                          <span className="text-amber-400 font-black">+{pts.toFixed(1)}</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-amber-500/60 bg-[#0f1524] font-black text-sm">
                <td className="py-4 px-5 uppercase tracking-wider text-amber-400" colSpan={2}>
                  Total Official Points (Row 89)
                </td>
                {leaderboard.map((entry) => (
                  <td
                    key={entry.batch.id}
                    className="py-4 px-4 text-center text-xl font-black text-white"
                  >
                    {entry.totalPoints.toFixed(1)}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

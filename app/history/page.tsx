import React from 'react';
import Link from 'next/link';
import { History, Trophy, Award, Lock, ShieldCheck, ChevronRight } from 'lucide-react';
import { getArchivedSeasonsSummary } from '@/lib/db/public';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HistoryPage() {
  const archives = getArchivedSeasonsSummary();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-surfaceBorder pb-6">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-athlos-gold mb-1">
          <History className="w-4 h-4" />
          <span>Tournament Archives</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
          Past Seasons & Legacy
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Official immutable results and champions from previous editions (2022–2026)
        </p>
      </div>

      {/* Read-Only Archive Notice */}
      <div className="p-4 rounded-xl bg-surfaceLight/80 border border-surfaceBorder text-xs text-slate-300 flex items-center space-x-3">
        <Lock className="w-4 h-4 text-athlos-gold flex-shrink-0" />
        <p>
          <strong>Archived Records:</strong> Previous seasons are preserved in read-only mode for historical
          reference. Data derives from verified historical workbook submissions.
        </p>
      </div>

      {/* Seasons Stack */}
      <div className="space-y-8">
        {archives.map(({ season, leaderboard, winner }) => (
          <div
            key={season.id}
            className="esports-card rounded-2xl overflow-hidden border border-surfaceBorder shadow-xl"
          >
            {/* Season Card Header */}
            <div className="p-6 bg-surfaceLight/60 border-b border-surfaceBorder flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-black/60 text-slate-400 border border-surfaceBorder">
                    Archived Edition
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {season.startDate} to {season.endDate}
                  </span>
                </div>
                <h2 className="text-2xl font-black uppercase text-white mt-1">
                  {season.name}
                </h2>
              </div>

              {winner && (
                <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-amber-950/40 border border-athlos-gold/30">
                  <Trophy className="w-6 h-6 text-athlos-gold" />
                  <div>
                    <span className="text-[10px] font-bold uppercase text-athlos-gold block">
                      Champion
                    </span>
                    <span className="text-sm font-black text-white">
                      {winner.batch?.code || winner.batchCode} ({winner.totalPoints} pts)
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Standings Table for Season */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-surfaceBorder bg-black/40 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-6">Final Rank</th>
                    <th className="py-3 px-6">Cohort</th>
                    <th className="py-3 px-6 text-center">Batch Code</th>
                    <th className="py-3 px-6 text-center">Match Wins</th>
                    <th className="py-3 px-6 text-right font-black text-athlos-gold">
                      Official Points
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surfaceBorder/60">
                  {leaderboard.map((entry, idx) => (
                    <tr key={entry.id} className="hover:bg-surfaceLight/30 transition">
                      <td className="py-3.5 px-6 font-bold text-slate-200">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-surfaceLight border border-surfaceBorder font-black">
                          #{idx + 1}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-extrabold text-slate-100 text-sm">
                        {entry.batch?.displayName || entry.batchCode}
                      </td>
                      <td className="py-3.5 px-6 text-center font-mono font-bold text-slate-300">
                        {entry.batchCode}
                      </td>
                      <td className="py-3.5 px-6 text-center font-bold text-slate-300">
                        {entry.wins}
                      </td>
                      <td className="py-3.5 px-6 text-right text-base font-black text-white">
                        {entry.totalPoints.toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

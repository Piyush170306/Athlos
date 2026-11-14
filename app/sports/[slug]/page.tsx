import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Flame, ArrowLeft, Trophy, Calendar, CheckCircle } from 'lucide-react';
import { getActiveSeason, getPublicMatches } from '@/lib/db/public';
import { db } from '@/lib/db';

export const revalidate = 0;

export default function SportDetailPage({ params }: { params: { slug: string } }) {
  const activeSeason = getActiveSeason();
  const sport = db.query('sports', (s) => s.slug === params.slug && s.seasonId === activeSeason.id)[0];

  if (!sport) {
    notFound();
  }

  const matches = getPublicMatches(activeSeason.id, { sportId: sport.id });
  const activeCategories = Array.from(new Set(matches.map((m) => m.category?.name || 'Boys')));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        href="/sports"
        className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Sports</span>
      </Link>

      {/* Header */}
      <div className="esports-card rounded-2xl p-6 sm:p-8 border-athlos-gold/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-athlos-gold mb-1">
              <Flame className="w-4 h-4" />
              <span>Official Tournament Discipline</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black uppercase text-white tracking-tight">
              {sport.name}
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
              {sport.description || `Official rules and fixtures for ${sport.name} in War of Batches 2026–27.`}
            </p>
          </div>

          <div className="px-5 py-3 rounded-xl bg-surfaceLight border border-surfaceBorder text-center sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Result Format
            </span>
            <span className="text-base font-extrabold font-mono text-athlos-cyan">
              {sport.scoreFormatType}
            </span>
          </div>
        </div>

        {/* Categories Bar */}
        {activeCategories.length > 0 && (
          <div className="mt-6 pt-6 border-t border-surfaceBorder/80">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
              Tournament Categories
            </span>
            <div className="flex flex-wrap gap-2">
              {activeCategories.map((cat) => (
                <span
                  key={cat}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-surfaceLight text-slate-200 border border-surfaceBorder"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sport Fixtures */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-surfaceBorder">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black uppercase tracking-wider text-white">
              {sport.name} Fixtures ({matches.length})
            </h2>
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="esports-card rounded-xl p-8 text-center text-slate-400 text-xs">
            No fixtures currently scheduled for {sport.name}. Check back soon or view upcoming calendar.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match) => (
              <div
                key={match.id}
                className="esports-card rounded-xl p-5 border-surfaceBorder flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-bold text-white">{match.category?.name || 'Boys'}</span>
                    <span className="font-mono">{match.scheduledDate || 'Date TBD'} • {match.timeSlot || 'Slot TBD'}</span>
                  </div>

                  <div className="bg-surfaceLight/80 rounded-lg p-3 border border-surfaceBorder my-3 flex items-center justify-between">
                    <span className="text-base font-black text-slate-100">{match.batchA?.code || 'TBD'}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase">VS</span>
                    <span className="text-base font-black text-slate-100">{match.batchB?.code || 'TBD'}</span>
                  </div>

                  {match.rawScore && (
                    <div className="text-center font-mono font-bold text-emerald-400 text-sm">
                      Score: {match.rawScore}
                    </div>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-surfaceBorder/60 flex items-center justify-between text-xs">
                  <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-surfaceLight text-slate-300 border border-surfaceBorder">
                    {match.status}
                  </span>
                  {match.winnerBatch && (
                    <span className="text-emerald-400 font-bold text-[11px]">
                      Winner: {match.winnerBatch.code}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

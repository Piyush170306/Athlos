import React from 'react';
import Link from 'next/link';
import { Flame, Trophy, ChevronRight, Layers, HelpCircle } from 'lucide-react';
import { getActiveSeason } from '@/lib/db/public';
import { db } from '@/lib/db';

export const revalidate = 0;

export default function SportsPage() {
  const activeSeason = getActiveSeason();
  const sports = db.query('sports', (s) => s.seasonId === activeSeason.id && s.enabled);
  const categories = db.query('categories', (c) => c.seasonId === activeSeason.id && c.enabled);
  const matches = db.query('matches', (m) => m.seasonId === activeSeason.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-surfaceBorder pb-6">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-athlos-gold mb-1">
          <Flame className="w-4 h-4" />
          <span>Tournament Disciplines</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
          Sports & Result Formats
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          15 dynamic sporting events with configurable categories, scoring structures, and official rules
        </p>
      </div>

      {/* Grid of Sports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sports.map((sport) => {
          const sportMatches = matches.filter((m) => m.sportId === sport.id);
          const completedCount = sportMatches.filter((m) => m.status === 'COMPLETED').length;
          const sportMatchCats = Array.from(new Set(sportMatches.map((m) => m.categoryId === 'cat-girls' ? 'Girls' : 'Boys')));

          return (
            <div
              key={sport.id}
              className="esports-card rounded-xl p-6 flex flex-col justify-between hover:border-athlos-gold/50 transition group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-surfaceLight border border-surfaceBorder flex items-center justify-center text-athlos-gold group-hover:scale-105 transition">
                    <Flame className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-surfaceLight text-slate-400 border border-surfaceBorder">
                    Format: {sport.scoreFormatType}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white group-hover:text-athlos-gold transition">
                  {sport.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
                  {sport.description || `Official ${sport.name} matches and events for War of Batches 2026–27.`}
                </p>

                {/* Categories Pills */}
                {sportMatchCats.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Categories ({sportMatchCats.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {sportMatchCats.map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-0.5 rounded text-[11px] font-semibold bg-surfaceLight/80 text-slate-300 border border-surfaceBorder"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-surfaceBorder/60 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  <strong className="text-white">{sportMatches.length}</strong> fixtures
                  {completedCount > 0 && ` (${completedCount} completed)`}
                </span>
                <Link
                  href={`/sports/${sport.slug}`}
                  className="inline-flex items-center space-x-1 font-bold text-athlos-gold hover:text-white transition"
                >
                  <span>Rules & Fixtures</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

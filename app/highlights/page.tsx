import React from 'react';
import Link from 'next/link';
import { Award, Flame, Calendar, Pin, ArrowRight } from 'lucide-react';
import { getActiveSeason, getPublicHighlights } from '@/lib/db/public';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HighlightsPage() {
  const activeSeason = getActiveSeason();
  const highlights = getPublicHighlights(activeSeason.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-surfaceBorder pb-6">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-athlos-gold mb-1">
          <Award className="w-4 h-4" />
          <span>Tournament Stories</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
          Today's Highlights & Moments
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Key moments, match breakdowns, dramatic finishes, and cohort achievements
        </p>
      </div>

      {highlights.length === 0 ? (
        <div className="esports-card rounded-xl p-12 text-center text-slate-400 text-xs">
          No highlights published yet. Highlights will appear here once official tournament matches begin!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {highlights.map((hl) => (
            <div
              key={hl.id}
              className={`esports-card rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                hl.isPinned ? 'border-athlos-gold/50 shadow-glow-gold' : 'border-surfaceBorder hover:border-slate-500'
              }`}
            >
              <div>
                {/* Meta row */}
                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <div className="flex items-center space-x-2">
                    {hl.isPinned && (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-800 font-extrabold uppercase text-[10px]">
                        <Pin className="w-3 h-3" />
                        <span>Pinned</span>
                      </span>
                    )}
                    <span className="font-mono text-[11px]">
                      {new Date(hl.publishedAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold">By {hl.author}</span>
                </div>

                {/* Optional Media */}
                {hl.mediaUrl && (
                  <div className="mb-4 rounded-xl overflow-hidden max-h-56 bg-black/40 border border-surfaceBorder">
                    <img
                      src={hl.mediaUrl}
                      alt={hl.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <h3 className="text-xl font-bold text-white mb-2 leading-snug">
                  {hl.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {hl.content}
                </p>
              </div>

              {hl.matchId && (
                <div className="pt-4 mt-4 border-t border-surfaceBorder/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Referenced Match Fixture</span>
                  <Link
                    href={`/matches?highlight=${hl.matchId}`}
                    className="inline-flex items-center space-x-1 font-bold text-athlos-gold hover:text-white"
                  >
                    <span>View Match Sheet</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

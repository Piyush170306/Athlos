import React from 'react';
import Link from 'next/link';
import { BookOpen, FileText, ExternalLink, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { getActiveSeason } from '@/lib/db/public';
import { db } from '@/lib/db';

export const revalidate = 0;

export default function SportsRulesPage() {
  const activeSeason = getActiveSeason();
  const sports = db.query('sports', (s) => s.seasonId === activeSeason.id && s.enabled);
  const categories = db.query('categories', (c) => c.seasonId === activeSeason.id && c.enabled);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#0B1727] pb-6">
        <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#79C9F2] mb-1.5">
          <BookOpen className="w-4 h-4 text-[#79C9F2]" />
          <span>Official Tournament Guidelines</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-spartan font-black uppercase text-white tracking-wider">
          Rules & Regulations
        </h1>
        <p className="text-sm text-slate-400 mt-2 max-w-3xl leading-relaxed">
          Official competition rulebooks, scoring criteria, and category regulations for all 15 sports disciplines in ATHLOS War of Batches 2026–27.
        </p>
      </div>

      {/* Grid of Sports Rules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sports.map((sport) => {
          const sportCats = categories
            .filter((c) => c.sportId === sport.id)
            .map((c) => c.name);
          const hasRulebook = Boolean(sport.rulebookUrl && sport.rulebookPublished);

          return (
            <div
              key={sport.id}
              className="group rounded-2xl p-6 flex flex-col justify-between border border-[#1D5E91]/40 bg-gradient-to-b from-[#0B1727] to-[#050B16] hover:border-[#79C9F2]/70 hover:shadow-[0_8px_30px_rgba(121,201,242,0.2)] transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#050B16] border border-[#1D5E91]/60 flex items-center justify-center text-[#79C9F2] group-hover:scale-105 transition">
                    <FileText className="w-5 h-5 text-[#79C9F2]" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-[#050B16] text-[#79C9F2] border border-[#1D5E91]/50">
                    {sport.scoreFormatType}
                  </span>
                </div>

                <h3 className="text-2xl font-spartan font-black uppercase tracking-wider text-white group-hover:text-[#79C9F2] transition">
                  {sport.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed font-manrope">
                  {sport.description || `Official competition rules and format guidelines for ${sport.name}.`}
                </p>

                {/* Categories */}
                {sportCats.length > 0 && (
                  <div className="space-y-1.5 mb-4">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                      Categories ({sportCats.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {sportCats.map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase bg-[#03060B] text-slate-300 border border-[#0B1727]"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Rulebook Download / View Link */}
              <div className="pt-4 border-t border-[#0B1727] flex items-center justify-between text-xs">
                {hasRulebook ? (
                  <a
                    href={sport.rulebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0B1727] border border-[#1D5E91] text-[#F2F7FC] hover:text-[#79C9F2] font-spartan font-bold uppercase tracking-wider transition text-[11px]"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Rule Book (PDF)</span>
                    <ExternalLink className="w-3 h-3 text-[#79C9F2]" />
                  </a>
                ) : (
                  <span className="text-[10px] font-mono text-slate-500 uppercase flex items-center space-x-1">
                    <span>PDF Coming Soon</span>
                  </span>
                )}

                <Link
                  href={`/sports/${sport.slug}`}
                  className="inline-flex items-center space-x-1 font-spartan font-bold text-xs uppercase tracking-wider text-slate-400 hover:text-[#E6CA83] transition"
                >
                  <span>Rules</span>
                  <ChevronRight className="w-3.5 h-3.5 text-[#C6A45A]" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

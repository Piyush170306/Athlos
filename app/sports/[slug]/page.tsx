import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { getActiveSeason } from '@/lib/db/public';
import { db } from '@/lib/db';
import RulebookViewer from '@/components/RulebookViewer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function SportRulesDetailPage({ params }: { params: { slug: string } }) {
  const activeSeason = getActiveSeason();
  const sport = db.query('sports', (s) => s.slug === params.slug && s.seasonId === activeSeason.id)[0];

  if (!sport) {
    notFound();
  }

  const categories = db.query('categories', (c) => c.sportId === sport.id && c.seasonId === activeSeason.id);
  const hasRulebook = Boolean(sport.rulebookUrl && sport.rulebookPublished);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <Link
        href="/sports"
        className="inline-flex items-center space-x-1.5 text-xs font-spartan font-bold uppercase tracking-wider text-slate-400 hover:text-[#79C9F2] transition"
      >
        <ArrowLeft className="w-4 h-4 text-[#79C9F2]" />
        <span>Back to All Rules</span>
      </Link>

      {/* Header */}
      <div className="rounded-3xl p-6 sm:p-8 border border-[#1D5E91]/40 bg-gradient-to-b from-[#0B1727] to-[#050B16] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#79C9F2] mb-1">
              <BookOpen className="w-4 h-4 text-[#79C9F2]" />
              <span>Official Tournament Rulebook</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-spartan font-black uppercase text-white tracking-wider">
              {sport.name}
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed font-manrope">
              {sport.description || `Official tournament guidelines, scoring regulations, and category formats for ${sport.name} in War of Batches 2026–27.`}
            </p>
          </div>

          <div className="px-5 py-3 rounded-2xl bg-black/60 border border-[#0B1727] text-center sm:text-right">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Result Format
            </span>
            <span className="text-base font-spartan font-black text-[#79C9F2] tracking-wider">
              {sport.scoreFormatType}
            </span>
          </div>
        </div>

        {/* Categories Bar */}
        {categories.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[#0B1727]">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Sanctioned Categories
            </span>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase bg-[#03060B] text-[#F2F7FC] border border-[#0B1727]"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Official Rulebook Section */}
      <RulebookViewer
        sportName={sport.name}
        sportSlug={sport.slug}
        rulebookUrl={sport.rulebookUrl}
        rulebookOriginalName={sport.rulebookOriginalName}
        rulebookUploadedAt={sport.rulebookUploadedAt}
        rulebookSize={sport.rulebookSize}
        rulebookBoysUrl={sport.rulebookBoysUrl}
        rulebookBoysOriginalName={sport.rulebookBoysOriginalName}
        rulebookBoysUploadedAt={sport.rulebookBoysUploadedAt}
        rulebookBoysSize={sport.rulebookBoysSize}
        rulebookGirlsUrl={sport.rulebookGirlsUrl}
        rulebookGirlsOriginalName={sport.rulebookGirlsOriginalName}
        rulebookGirlsUploadedAt={sport.rulebookGirlsUploadedAt}
        rulebookGirlsSize={sport.rulebookGirlsSize}
        rulebookPublished={sport.rulebookPublished}
      />

      {/* Link to Fixtures */}
      <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
        <span>To view live match schedules and scorecards:</span>
        <Link
          href={`/matches?sport=${sport.slug}`}
          className="text-[#E6CA83] hover:text-white font-spartan font-bold uppercase tracking-wider transition"
        >
          View Tournament Fixtures →
        </Link>
      </div>
    </div>
  );
}

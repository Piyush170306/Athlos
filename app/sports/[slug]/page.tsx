import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookOpen, ArrowLeft, FileText, ExternalLink, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { getActiveSeason } from '@/lib/db/public';
import { db } from '@/lib/db';

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
        className="inline-flex items-center space-x-1.5 text-xs font-spartan font-bold uppercase tracking-wider text-slate-400 hover:text-[#E6CA83] transition"
      >
        <ArrowLeft className="w-4 h-4 text-[#C6A45A]" />
        <span>Back to All Rules</span>
      </Link>

      {/* Header */}
      <div className="rounded-3xl p-6 sm:p-8 border border-[#302719] bg-gradient-to-b from-[#17140E] to-[#0A0907] shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#C6A45A] mb-1">
              <BookOpen className="w-4 h-4 text-[#E6CA83]" />
              <span>Official Tournament Rulebook</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-spartan font-black uppercase text-white tracking-wider">
              {sport.name}
            </h1>
            <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed font-manrope">
              {sport.description || `Official tournament guidelines, scoring regulations, and category formats for ${sport.name} in War of Batches 2026–27.`}
            </p>
          </div>

          <div className="px-5 py-3 rounded-2xl bg-black/60 border border-[#302719] text-center sm:text-right">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
              Result Format
            </span>
            <span className="text-base font-spartan font-black text-[#E6CA83] tracking-wider">
              {sport.scoreFormatType}
            </span>
          </div>
        </div>

        {/* Categories Bar */}
        {categories.length > 0 && (
          <div className="mt-6 pt-6 border-t border-[#302719]/60">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Sanctioned Categories
            </span>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <span
                  key={cat.id}
                  className="px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase bg-[#14110C] text-[#F5EBD4] border border-[#302719]"
                >
                  {cat.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Official Rulebook Section */}
      <div className="rounded-3xl p-6 sm:p-8 border border-[#302719] bg-gradient-to-b from-[#14110C] to-[#080808] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#302719] gap-3">
          <div className="flex items-center space-x-2.5">
            <FileText className="w-5 h-5 text-[#E6CA83]" />
            <h2 className="text-xl sm:text-2xl font-spartan font-black uppercase tracking-wider text-white">
              Official Rulebook Document
            </h2>
          </div>

          {hasRulebook && (
            <a
              href={sport.rulebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#1e1910] hover:bg-[#282115] border border-[#C6A45A]/60 text-[#E6CA83] text-xs font-spartan font-bold uppercase tracking-wider transition shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Open Fullscreen PDF</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#C6A45A]" />
            </a>
          )}
        </div>

        {hasRulebook ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>File: {sport.rulebookOriginalName || `${sport.slug}-rulebook.pdf`}</span>
              {sport.rulebookUploadedAt && (
                <span>Published: {new Date(sport.rulebookUploadedAt).toLocaleDateString('en-GB')}</span>
              )}
            </div>

            {/* Embedded PDF Viewer */}
            <div className="w-full h-[650px] sm:h-[800px] rounded-2xl overflow-hidden border border-[#302719] bg-black">
              <iframe
                src={`${sport.rulebookUrl}#toolbar=1`}
                title={`${sport.name} Official Rulebook PDF`}
                className="w-full h-full border-none"
              />
            </div>
          </div>
        ) : (
          <div className="p-10 rounded-2xl border border-dashed border-[#302719] bg-black/40 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-spartan font-bold text-slate-300 uppercase tracking-wider">
              Rulebook In Preparation
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto font-manrope">
              The official PDF rulebook for {sport.name} will be uploaded by tournament administration prior to the opening ceremony. Please check back soon or consult sports committee convenors.
            </p>
          </div>
        )}
      </div>

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

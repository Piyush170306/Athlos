'use client';

import React, { useState } from 'react';
import { FileText, ExternalLink, Download, Layers } from 'lucide-react';

interface RulebookViewerProps {
  sportName: string;
  sportSlug: string;
  rulebookUrl?: string;
  rulebookOriginalName?: string;
  rulebookUploadedAt?: string;
  rulebookSize?: number;
  rulebookBoysUrl?: string;
  rulebookBoysOriginalName?: string;
  rulebookBoysUploadedAt?: string;
  rulebookBoysSize?: number;
  rulebookGirlsUrl?: string;
  rulebookGirlsOriginalName?: string;
  rulebookGirlsUploadedAt?: string;
  rulebookGirlsSize?: number;
  rulebookPublished?: boolean;
}

export default function RulebookViewer({
  sportName,
  sportSlug,
  rulebookUrl,
  rulebookOriginalName,
  rulebookUploadedAt,
  rulebookSize,
  rulebookBoysUrl,
  rulebookBoysOriginalName,
  rulebookBoysUploadedAt,
  rulebookBoysSize,
  rulebookGirlsUrl,
  rulebookGirlsOriginalName,
  rulebookGirlsUploadedAt,
  rulebookGirlsSize,
  rulebookPublished = true,
}: RulebookViewerProps) {
  const hasBoys = Boolean(rulebookBoysUrl && rulebookPublished);
  const hasGirls = Boolean(rulebookGirlsUrl && rulebookPublished);
  const hasCommon = Boolean(rulebookUrl && rulebookPublished);
  const isDual = hasBoys || hasGirls;

  const [activeCategory, setActiveCategory] = useState<'boys' | 'girls' | 'common'>(() => {
    if (hasBoys) return 'boys';
    if (hasGirls) return 'girls';
    return 'common';
  });

  // Determine current active document metadata
  let activeUrl = rulebookUrl;
  let activeName = rulebookOriginalName || `${sportSlug}-rulebook.pdf`;
  let activeDate = rulebookUploadedAt;
  let activeSize = rulebookSize;

  if (activeCategory === 'boys' && hasBoys) {
    activeUrl = rulebookBoysUrl;
    activeName = rulebookBoysOriginalName || `${sportSlug}-boys-rulebook.pdf`;
    activeDate = rulebookBoysUploadedAt;
    activeSize = rulebookBoysSize;
  } else if (activeCategory === 'girls' && hasGirls) {
    activeUrl = rulebookGirlsUrl;
    activeName = rulebookGirlsOriginalName || `${sportSlug}-girls-rulebook.pdf`;
    activeDate = rulebookGirlsUploadedAt;
    activeSize = rulebookGirlsSize;
  }

  const hasAnyDoc = Boolean(activeUrl);

  return (
    <div className="rounded-3xl p-6 sm:p-8 border border-[#1D5E91]/40 bg-gradient-to-b from-[#0B1727] to-[#050B16] space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#0B1727] gap-3">
        <div className="flex items-center space-x-2.5">
          <FileText className="w-5 h-5 text-[#79C9F2]" />
          <h2 className="text-xl sm:text-2xl font-spartan font-black uppercase tracking-wider text-white">
            Official Rulebook Document
          </h2>
        </div>

        {/* Dual Tab Switcher if sport has category-specific rulebooks */}
        {isDual && (
          <div className="flex items-center bg-[#050B16] p-1 rounded-xl border border-[#1D5E91]/50">
            {hasBoys && (
              <button
                type="button"
                onClick={() => setActiveCategory('boys')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-spartan font-bold uppercase tracking-wider transition ${
                  activeCategory === 'boys'
                    ? 'bg-[#1D5E91] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Boys Rulebook
              </button>
            )}
            {hasGirls && (
              <button
                type="button"
                onClick={() => setActiveCategory('girls')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-spartan font-bold uppercase tracking-wider transition ${
                  activeCategory === 'girls'
                    ? 'bg-[#1D5E91] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Girls Rulebook
              </button>
            )}
          </div>
        )}

        {/* Direct Action Link */}
        {hasAnyDoc && (
          <div className="flex items-center gap-2">
            <a
              href={activeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#050B16] hover:bg-[#0B1727] border border-[#1D5E91] text-[#F2F7FC] text-xs font-spartan font-bold uppercase tracking-wider transition shadow-sm"
            >
              <FileText className="w-4 h-4 text-[#79C9F2]" />
              <span>Open Fullscreen PDF</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#79C9F2]" />
            </a>
          </div>
        )}
      </div>

      {hasAnyDoc ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono gap-2">
            <span>
              File: <strong className="text-slate-200">{activeName}</strong>
              {activeSize ? ` (${(activeSize / 1024).toFixed(0)} KB)` : ''}
            </span>
            {activeDate && (
              <span>Published: {new Date(activeDate).toLocaleDateString('en-GB')}</span>
            )}
          </div>

          {/* Embedded PDF Viewer */}
          <div className="w-full h-[650px] sm:h-[800px] rounded-2xl overflow-hidden border border-[#0B1727] bg-black">
            <iframe
              src={`${activeUrl}#toolbar=1`}
              title={`${sportName} ${isDual ? (activeCategory === 'boys' ? 'Boys' : 'Girls') : ''} Official Rulebook PDF`}
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
            The official PDF rulebook for {sportName} will be uploaded by tournament administration prior to the opening ceremony. Please check back soon or consult sports committee convenors.
          </p>
        </div>
      )}
    </div>
  );
}

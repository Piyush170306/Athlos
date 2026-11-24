'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export interface HeadlineItem {
  id: string;
  badge?: string;
  text: string;
  highlight?: boolean;
  link?: string;
}

interface LuxuryHeadlineTickerProps {
  items: HeadlineItem[];
  speedSeconds?: number;
}

export default function LuxuryHeadlineTicker({
  items,
  speedSeconds = 38,
}: LuxuryHeadlineTickerProps) {
  const [isPaused, setIsPaused] = useState(false);

  // Fallback items if none provided
  const displayItems: HeadlineItem[] =
    items && items.length > 0
      ? items
      : [
          { id: '1', text: 'ATHLOS WAR OF BATCHES 2026–27', highlight: true, badge: 'CHAMPIONSHIP' },
          { id: '2', text: 'IPM06 • IPM07 • IPM08', badge: 'COHORTS' },
          { id: '3', text: 'OFFICIAL STANDINGS: IPM07 LEADING WITH 36.0 PTS', highlight: true },
        ];

  // Double buffer for 100% gapless continuous marquee
  const looped = [...displayItems, ...displayItems];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      title="Hover or touch to pause stream"
      className="relative w-full overflow-hidden border-y border-[#0B1727] bg-[#050B16] py-3 select-none backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.8)] cursor-grab active:cursor-grabbing"
    >
      {/* Edge gradient fade masks for high-end cinematic feel */}
      <div className="absolute left-0 top-0 bottom-0 w-10 sm:w-20 bg-gradient-to-r from-[#050B16] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-10 sm:w-20 bg-gradient-to-l from-[#050B16] to-transparent z-10 pointer-events-none" />

      {/* Marquee Track */}
      <div
        className="flex items-center whitespace-nowrap will-change-transform"
        style={{
          width: 'max-content',
          animation: `luxuryMarquee ${speedSeconds}s linear infinite`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {looped.map((item, idx) => {
          const content = (
            <div
              key={`${item.id}-${idx}`}
              className="inline-flex items-center space-x-3 px-5 sm:px-7 font-spartan text-xs sm:text-sm uppercase tracking-wider transition-colors hover:text-[#79C9F2]"
            >
              {item.badge && (
                <span className="text-[10px] font-black tracking-widest px-2 py-0.5 rounded-full bg-[#0B1727] text-[#79C9F2] border border-[#1D5E91]/50 shadow-sm">
                  {item.badge}
                </span>
              )}

              <span
                className={`${
                  item.highlight
                    ? 'cosmic-silver-text font-black text-sm sm:text-base drop-shadow-[0_0_12px_rgba(121,201,242,0.3)]'
                    : 'text-[#F2F7FC]/90 font-bold'
                }`}
              >
                {item.text}
              </span>

              {/* Cosmic Diamond Separator */}
              <span className="text-[#79C9F2]/60 font-light text-xs pl-3">✦</span>
            </div>
          );

          if (item.link) {
            return (
              <Link key={`${item.id}-${idx}`} href={item.link} className="cursor-pointer">
                {content}
              </Link>
            );
          }

          return content;
        })}
      </div>
    </div>
  );
}
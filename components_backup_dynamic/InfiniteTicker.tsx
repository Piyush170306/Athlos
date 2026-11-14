'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export interface TickerItem {
  id: string;
  type: 'brand' | 'leader' | 'match' | 'announcement';
  text: string;
  badge?: string;
  highlight?: boolean;
  link?: string;
}

interface InfiniteTickerProps {
  items: TickerItem[];
  speedSeconds?: number;
  direction?: 'left' | 'right';
  className?: string;
}

export default function InfiniteTicker({
  items,
  speedSeconds = 35,
  direction = 'left',
  className = '',
}: InfiniteTickerProps) {
  const [isPaused, setIsPaused] = useState(false);

  // Fallback default items if none provided
  const displayItems: TickerItem[] =
    items.length > 0
      ? items
      : [
          { id: '1', type: 'brand', text: 'ATHLOS WAR OF BATCHES 2026–27', badge: 'CHAMPIONSHIP' },
          { id: '2', type: 'leader', text: 'OFFICIAL STANDINGS: IPM07 LEADING', badge: 'LEADER' },
          { id: '3', type: 'brand', text: 'THREE COHORTS: IPM06 • IPM07 • IPM08', badge: 'COHORTS' },
        ];

  // Double items for seamless infinite wrap
  const loopedItems = [...displayItems, ...displayItems];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
      className={`relative w-full overflow-hidden border-y border-amber-500/30 bg-[#090d18] py-2.5 sm:py-3 select-none backdrop-blur-md shadow-[0_0_20px_rgba(0,0,0,0.5)] ${className}`}
    >
      {/* Subtle edge fade masks for high-end luxury look */}
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-[#090d18] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-[#090d18] to-transparent z-10 pointer-events-none" />

      {/* Ticker Track */}
      <div
        className="flex items-center whitespace-nowrap will-change-transform"
        style={{
          width: 'max-content',
          animation: `athlosMarquee ${speedSeconds}s linear infinite ${direction === 'right' ? 'reverse' : 'normal'}`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {loopedItems.map((item, index) => {
          const content = (
            <div
              key={`${item.id}-${index}`}
              className="inline-flex items-center space-x-3 px-4 sm:px-6 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200 transition-colors hover:text-amber-300"
            >
              {/* Type Badge */}
              {item.badge && (
                <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-glow-gold">
                  {item.badge}
                </span>
              )}

              {/* Text */}
              <span
                className={`${
                  item.highlight
                    ? 'bg-gradient-to-r from-amber-300 via-yellow-100 to-amber-400 bg-clip-text text-transparent font-black'
                    : 'text-slate-300'
                }`}
              >
                {item.text}
              </span>

              {/* Luxury Separator Icon */}
              <span className="text-amber-500/60 font-light text-xs pl-2">✦</span>
            </div>
          );

          if (item.link) {
            return (
              <Link key={`${item.id}-${index}`} href={item.link} className="cursor-pointer">
                {content}
              </Link>
            );
          }

          return content;
        })}
      </div>

      <style jsx global>{`
        @keyframes athlosMarquee {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
      `}</style>
    </div>
  );
}
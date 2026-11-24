'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Trophy, TrendingUp, Sparkles, Activity } from 'lucide-react';
import { PointsProgressionData, PointsHistoryPoint, BatchSeriesMeta } from '@/lib/db/pointsHistory';

interface BattleForLeadGraphProps {
  initialData: PointsProgressionData;
}

export default function BattleForLeadGraph({ initialData }: BattleForLeadGraphProps) {
  const [data, setData] = useState<PointsProgressionData>(initialData);
  const [hoveredPoint, setHoveredPoint] = useState<{
    point: PointsHistoryPoint;
    batchCode: string;
    points: number;
    delta: number;
    x: number;
    y: number;
  } | null>(null);

  const [activeBatchFilter, setActiveBatchFilter] = useState<string>('ALL');
  const [isAnimated, setIsAnimated] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Trigger smooth entry animation on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  // SVG Chart Layout Metrics
  const chartWidth = 900;
  const chartHeight = 380;
  const padding = { top: 45, right: 95, bottom: 50, left: 55 };

  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  // Max score on Y axis (rounded up to nearest multiple of 10)
  const maxScore = useMemo(() => {
    const highest = Math.max(initialData.maxPoints, 40);
    return Math.ceil(highest / 10) * 10;
  }, [initialData.maxPoints]);

  const yTicks = useMemo(() => {
    const ticks = [];
    const step = maxScore <= 40 ? 10 : Math.ceil(maxScore / 4 / 5) * 5;
    for (let i = 0; i <= maxScore; i += step) {
      ticks.push(i);
    }
    return ticks;
  }, [maxScore]);

  const xPointsCount = data.points.length;

  const getX = (index: number) => {
    if (xPointsCount <= 1) return padding.left + innerWidth / 2;
    return padding.left + (index / (xPointsCount - 1)) * innerWidth;
  };

  const getY = (score: number) => {
    const normalized = Math.max(0, Math.min(score, maxScore)) / maxScore;
    return padding.top + innerHeight - normalized * innerHeight;
  };

  // Generate smooth cubic bezier SVG path string
  const generateSmoothPath = (pointsCoords: Array<{ x: number; y: number }>) => {
    if (pointsCoords.length === 0) return '';
    if (pointsCoords.length === 1) return `M ${pointsCoords[0].x} ${pointsCoords[0].y}`;

    let path = `M ${pointsCoords[0].x} ${pointsCoords[0].y}`;

    for (let i = 0; i < pointsCoords.length - 1; i++) {
      const p0 = pointsCoords[i === 0 ? 0 : i - 1];
      const p1 = pointsCoords[i];
      const p2 = pointsCoords[i + 1];
      const p3 = pointsCoords[i + 2 < pointsCoords.length ? i + 2 : i + 1];

      // Catmull-Rom to Cubic Bezier conversion
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    return path;
  };

  // Compute coordinate series for each batch
  const seriesPaths = useMemo(() => {
    return data.batches.map((batch) => {
      const coords = data.points.map((pt, idx) => ({
        x: getX(idx),
        y: getY(pt.scores[batch.code] || 0),
        score: pt.scores[batch.code] || 0,
        delta: pt.deltas[batch.code] || 0,
        point: pt,
      }));

      const lastCoord = coords[coords.length - 1] || { x: getX(0), y: getY(0) };
      const pathD = generateSmoothPath(coords);

      return {
        batch,
        coords,
        lastCoord,
        pathD,
      };
    });
  }, [data, maxScore, innerWidth, innerHeight]);

  return (
    <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 select-none">
      <div className="relative rounded-3xl border border-[#1D5E91]/40 bg-[#050B16]/85 backdrop-blur-xl p-5 sm:p-8 shadow-[0_12px_45px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Subtle Cosmic Background Glow Accent */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_rgba(29,94,145,0.18)_0%,_transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[radial-gradient(ellipse_at_center,_rgba(121,201,242,0.10)_0%,_transparent_70%)] pointer-events-none" />

        {/* 1. Header & Controls */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-[#0B1727] gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#79C9F2] mb-1.5">
              <Activity className="w-4 h-4 text-[#79C9F2]" />
              <span>OFFICIAL TOURNAMENT PROGRESSION</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-spartan font-black uppercase tracking-wider text-white">
              BATTLE FOR THE LEAD
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 font-seasons italic mt-1 text-[#C7D3DF]">
              Points progression throughout ATHLOS 2026-27
            </p>
          </div>

          {/* Interactive Cohort Filter / Legend */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => setActiveBatchFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-spartan font-bold uppercase tracking-wider transition ${
                activeBatchFilter === 'ALL'
                  ? 'bg-[#0B1727] text-white border border-[#1D5E91] shadow-sm'
                  : 'bg-[#03060B]/60 text-slate-400 hover:text-white border border-[#0B1727]'
              }`}
            >
              All Cohorts
            </button>

            {data.batches.map((b) => (
              <button
                key={b.code}
                onClick={() => setActiveBatchFilter(activeBatchFilter === b.code ? 'ALL' : b.code)}
                className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-spartan font-bold uppercase tracking-wider transition border ${
                  activeBatchFilter === b.code
                    ? 'border-white text-white shadow-md'
                    : 'border-[#0B1727] text-slate-300 hover:text-white bg-[#03060B]/60'
                }`}
                style={{
                  borderColor: activeBatchFilter === b.code ? b.color : undefined,
                  backgroundColor: activeBatchFilter === b.code ? `${b.color}22` : undefined,
                }}
              >
                {/* Mascot Icon Pointer thumbnail */}
                <span
                  className="w-4 h-4 rounded-full overflow-hidden border inline-block flex-shrink-0"
                  style={{ borderColor: b.color }}
                >
                  <img
                    src={b.mascotImagePath}
                    alt={b.code}
                    className="w-full h-full object-cover"
                  />
                </span>
                <span>{b.code}</span>
                <span className="text-[10px] font-mono opacity-80" style={{ color: b.color }}>
                  {b.currentPoints.toFixed(1)} PTS
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Main Graph Visualization */}
        <div
          ref={containerRef}
          className="relative w-full mt-6 overflow-x-auto touch-pan-x"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <div className="min-w-[640px] md:min-w-full">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-auto overflow-visible select-none"
              style={{ maxHeight: '420px' }}
            >
              <defs>
                {/* Linear Gradients for line glowing strokes */}
                {data.batches.map((b) => (
                  <linearGradient
                    key={`grad-${b.code}`}
                    id={`line-grad-${b.code}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor={b.gradientFrom} stopOpacity={0.7} />
                    <stop offset="100%" stopColor={b.color} stopOpacity={1} />
                  </linearGradient>
                ))}

                {/* Filter for subtle line glow */}
                <filter id="cosmic-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* A. Grid Lines: Horizontal */}
              {yTicks.map((tick) => {
                const y = getY(tick);
                return (
                  <g key={`y-tick-${tick}`}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={chartWidth - padding.right}
                      y2={y}
                      stroke="rgba(29, 94, 145, 0.22)"
                      strokeWidth="1"
                      strokeDasharray={tick === 0 ? '0' : '4 4'}
                    />
                    <text
                      x={padding.left - 12}
                      y={y + 4}
                      textAnchor="end"
                      fill="#79C9F2"
                      className="font-mono text-[10px] font-semibold opacity-75"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {/* B. Grid Lines: Vertical Dates */}
              {data.points.map((pt, idx) => {
                const x = getX(idx);
                return (
                  <g key={`x-tick-${pt.date}-${idx}`}>
                    <line
                      x1={x}
                      y1={padding.top}
                      x2={x}
                      y2={padding.top + innerHeight}
                      stroke="rgba(29, 94, 145, 0.12)"
                      strokeWidth="1"
                    />
                    <text
                      x={x}
                      y={padding.top + innerHeight + 22}
                      textAnchor="middle"
                      fill="#C7D3DF"
                      className="font-mono text-[11px] font-bold opacity-80"
                    >
                      {pt.displayDate}
                    </text>
                  </g>
                );
              })}

              {/* C. Animated Curved Lines for each Cohort */}
              {seriesPaths.map(({ batch, pathD }) => {
                const isDimmed = activeBatchFilter !== 'ALL' && activeBatchFilter !== batch.code;
                const opacity = isDimmed ? 0.2 : 1;

                return (
                  <g key={`path-${batch.code}`} style={{ opacity, transition: 'opacity 0.3s' }}>
                    {/* Glowing outer shadow line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={batch.color}
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity={0.35}
                      filter="url(#cosmic-glow)"
                      className="transition-all duration-700 ease-out"
                    />

                    {/* Main crisp line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={`url(#line-grad-${batch.code})`}
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-all duration-700 ease-out"
                    />
                  </g>
                );
              })}

              {/* D. Data Point Markers (Hoverable circles) */}
              {seriesPaths.map(({ batch, coords }) => {
                const isDimmed = activeBatchFilter !== 'ALL' && activeBatchFilter !== batch.code;
                if (isDimmed) return null;

                return (
                  <g key={`dots-${batch.code}`}>
                    {coords.map((c, i) => (
                      <g
                        key={`dot-${batch.code}-${i}`}
                        className="cursor-pointer group"
                        onMouseEnter={() =>
                          setHoveredPoint({
                            point: c.point,
                            batchCode: batch.code,
                            points: c.score,
                            delta: c.delta,
                            x: c.x,
                            y: c.y,
                          })
                        }
                      >
                        {/* Larger transparent touch/hover catchment */}
                        <circle cx={c.x} cy={c.y} r="14" fill="transparent" />

                        {/* Visible node circle */}
                        <circle
                          cx={c.x}
                          cy={c.y}
                          r={i === coords.length - 1 ? '4' : '3'}
                          fill="#050B16"
                          stroke={batch.color}
                          strokeWidth="2"
                          className="transition-transform duration-200 group-hover:scale-150"
                        />
                      </g>
                    ))}
                  </g>
                );
              })}

              {/* E. PART 7 — MASCOT LOGOS AS GRAPH POINTERS (At Line Termini) */}
              {seriesPaths.map(({ batch, lastCoord }) => {
                const isDimmed = activeBatchFilter !== 'ALL' && activeBatchFilter !== batch.code;
                if (isDimmed) return null;

                // Position the mascot pointer right at the end of the line
                const pointerSize = 28;
                const px = lastCoord.x;
                const py = lastCoord.y;

                return (
                  <g
                    key={`mascot-pointer-${batch.code}`}
                    className="transition-all duration-700 ease-out pointer-events-none"
                    transform={`translate(${px}, ${py})`}
                  >
                    {/* Outer radiant pulse glow */}
                    <circle
                      cx={0}
                      cy={0}
                      r={pointerSize / 2 + 5}
                      fill="none"
                      stroke={batch.color}
                      strokeWidth="1.5"
                      opacity={0.6}
                      className="animate-pulse"
                    />

                    {/* Circular Mascot Badge clipping mask */}
                    <clipPath id={`clip-${batch.code}`}>
                      <circle cx={0} cy={0} r={pointerSize / 2} />
                    </clipPath>

                    {/* Mascot Image asset inside circular badge */}
                    <image
                      href={batch.mascotImagePath}
                      x={-pointerSize / 2}
                      y={-pointerSize / 2}
                      width={pointerSize}
                      height={pointerSize}
                      clipPath={`url(#clip-${batch.code})`}
                      preserveAspectRatio="xMidYMid slice"
                    />

                    {/* Glowing circular border ring around the mascot */}
                    <circle
                      cx={0}
                      cy={0}
                      r={pointerSize / 2}
                      fill="none"
                      stroke={batch.color}
                      strokeWidth="2.2"
                    />

                    {/* Current Score Pill directly adjacent to mascot pointer */}
                    <g transform={`translate(${pointerSize / 2 + 8}, 0)`}>
                      <rect
                        x="-2"
                        y="-10"
                        width="54"
                        height="20"
                        rx="6"
                        fill="#050B16"
                        stroke={batch.color}
                        strokeWidth="1.2"
                        opacity={0.92}
                      />
                      <text
                        x="25"
                        y="4"
                        textAnchor="middle"
                        fill="#F2F7FC"
                        className="font-spartan font-black text-[11px] tracking-tight"
                      >
                        {batch.currentPoints.toFixed(1)}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>

            {/* F. PART 8 — Interactive Tooltip Overlay */}
            {hoveredPoint && (
              <div
                className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3.5 py-2.5 rounded-2xl bg-[#03060B]/95 border border-[#1D5E91] shadow-[0_8px_25px_rgba(0,0,0,0.9)] backdrop-blur-md min-w-[130px] transition-all duration-150"
                style={{
                  left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                  top: `${(hoveredPoint.y / chartHeight) * 100}%`,
                }}
              >
                <div className="flex items-center justify-between space-x-2 pb-1 mb-1 border-b border-[#0B1727]">
                  <span className="font-spartan font-black text-sm tracking-wider text-white">
                    {hoveredPoint.batchCode}
                  </span>
                  <span className="font-mono text-[10px] text-slate-400">
                    {hoveredPoint.point.displayDate}
                  </span>
                </div>

                <div className="flex items-baseline justify-between text-xs font-mono">
                  <span className="text-slate-400 text-[10px] uppercase">Total:</span>
                  <span className="font-bold text-white font-spartan text-sm">
                    {hoveredPoint.points.toFixed(1)} PTS
                  </span>
                </div>

                {hoveredPoint.delta > 0 && (
                  <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 pt-0.5">
                    <span className="text-[10px] text-slate-400">Delta:</span>
                    <span className="font-bold">+{hoveredPoint.delta.toFixed(1)} PTS</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 3. Footer Audit & Data Integrity Note */}
        <div className="mt-4 pt-4 border-t border-[#0B1727] flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 font-mono gap-2">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Excel-Synchronized: Live authoritative scores verified via approved Row 89 table</span>
          </div>

          <div className="flex items-center space-x-3 text-slate-500">
            <span>Dynamic Bezier Interpolation</span>
            <span>•</span>
            <span>Mascot Indicator Tracking</span>
          </div>
        </div>
      </div>
    </section>
  );
}

import { db } from '@/lib/db';
import { Batch, Match, OfficialBatchScore } from '@/lib/types';

export interface PointsHistoryPoint {
  date: string; // YYYY-MM-DD
  displayDate: string; // e.g. "01 Nov"
  scores: Record<string, number>; // { IPM06: number, IPM07: number, IPM08: number }
  deltas: Record<string, number>; // { IPM06: number, IPM07: number, IPM08: number }
  completedMatchCount: number;
}

export interface BatchSeriesMeta {
  code: string;
  displayName: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  glowColor: string;
  mascotImagePath: string;
  currentPoints: number;
  rank: number;
}

export interface PointsProgressionData {
  seasonId: string;
  seasonName: string;
  dates: string[];
  points: PointsHistoryPoint[];
  batches: BatchSeriesMeta[];
  maxPoints: number;
  lastUpdated: string;
}

/**
 * Derives and returns the authoritative points progression timeline for a season.
 * Connects directly to approved match results and official Row 89 batch scores.
 * Guarantees zero duplicate entries and strict chronological ordering.
 */
export function getPointsProgression(seasonId: string): PointsProgressionData {
  const season = db.findById('seasons', seasonId) || db.query('seasons', (s) => s.status === 'active')[0];
  const batches = db.query('batches', (b) => b.seasonId === seasonId && b.enabled);
  const officialScores = db.query('official_batch_scores', (s) => s.seasonId === seasonId);

  // Default batch metadata mapping
  const batchMetaMap: Record<string, { color: string; from: string; to: string; glow: string }> = {
    IPM06: {
      color: '#C7D3DF', // Metallic Silver
      from: '#E2E8F0',
      to: '#94A3B8',
      glow: 'rgba(199, 211, 223, 0.45)',
    },
    IPM07: {
      color: '#EF4444', // Crimson / Red
      from: '#F87171',
      to: '#DC2626',
      glow: 'rgba(239, 68, 68, 0.45)',
    },
    IPM08: {
      color: '#79C9F2', // Ice Blue / Royal Blue
      from: '#BAE6FD',
      to: '#0284C7',
      glow: 'rgba(121, 201, 242, 0.45)',
    },
  };

  // Build batch metadata list
  const batchSeries: BatchSeriesMeta[] = batches.map((b) => {
    const scoreRec = officialScores.find((s) => s.batchId === b.id || s.batchCode === b.code);
    const meta = batchMetaMap[b.code] || {
      color: b.primaryColor || '#79C9F2',
      from: b.primaryColor || '#79C9F2',
      to: b.secondaryColor || '#1D5E91',
      glow: 'rgba(121, 201, 242, 0.4)',
    };

    return {
      code: b.code,
      displayName: b.displayName || b.code,
      color: meta.color,
      gradientFrom: meta.from,
      gradientTo: meta.to,
      glowColor: meta.glow,
      mascotImagePath: b.mascotImagePath || '/assets/branding/athlos_logo_primary.png',
      currentPoints: scoreRec ? scoreRec.totalPoints : 0,
      rank: scoreRec ? scoreRec.rank : 1,
    };
  });

  // Sort series according to official rank
  batchSeries.sort((a, b) => a.rank - b.rank);

  // Retrieve all completed matches with a scheduled date
  const completedMatches = db.query(
    'matches',
    (m) => m.seasonId === seasonId && m.status === 'COMPLETED' && Boolean(m.scheduledDate)
  );

  // Group matches strictly by date (unique calendar dates, sorted chronologically)
  const dateMap: Record<string, Match[]> = {};
  for (const m of completedMatches) {
    if (!m.scheduledDate) continue;
    if (!dateMap[m.scheduledDate]) {
      dateMap[m.scheduledDate] = [];
    }
    dateMap[m.scheduledDate].push(m);
  }

  const sortedDates = Object.keys(dateMap).sort();

  // Helper to format date string (e.g. "2026-11-01" -> "01 Nov")
  const formatDisplayDate = (dStr: string) => {
    const parts = dStr.split('-');
    if (parts.length === 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = parseInt(parts[1], 10) - 1;
      return `${parts[2]} ${months[monthIdx] || parts[1]}`;
    }
    return dStr;
  };

  const points: PointsHistoryPoint[] = [];

  // 1. Kickoff / Baseline Point
  const initialScores: Record<string, number> = {};
  const initialDeltas: Record<string, number> = {};
  for (const b of batches) {
    initialScores[b.code] = 0;
    initialDeltas[b.code] = 0;
  }

  points.push({
    date: 'Kickoff',
    displayDate: 'Kickoff',
    scores: { ...initialScores },
    deltas: { ...initialDeltas },
    completedMatchCount: 0,
  });

  // 2. Chronological progression
  const cumulativeScores: Record<string, number> = { ...initialScores };
  let matchCountCumulative = 0;

  for (const date of sortedDates) {
    const dayMatches = dateMap[date];
    const deltas: Record<string, number> = {};
    for (const b of batches) {
      deltas[b.code] = 0;
    }

    for (const m of dayMatches) {
      if (m.winnerBatchId && m.winnerBatchId !== 'DRAW') {
        const winner = batches.find((b) => b.id === m.winnerBatchId || b.code === m.winnerBatchId);
        if (winner) {
          // Standard match point award (2 points per completed match win)
          deltas[winner.code] = (deltas[winner.code] || 0) + 2.0;
          cumulativeScores[winner.code] = (cumulativeScores[winner.code] || 0) + 2.0;
        }
      }
    }

    matchCountCumulative += dayMatches.length;

    points.push({
      date,
      displayDate: formatDisplayDate(date),
      scores: { ...cumulativeScores },
      deltas: { ...deltas },
      completedMatchCount: matchCountCumulative,
    });
  }

  // Ensure latest point exactly reflects approved official batch scores table (Row 89 authority)
  const lastPoint = points[points.length - 1];
  if (lastPoint && officialScores.length > 0) {
    for (const score of officialScores) {
      if (lastPoint.scores[score.batchCode] !== undefined) {
        lastPoint.scores[score.batchCode] = score.totalPoints;
      }
    }
  }

  const allPointValues = points.flatMap((p) => Object.values(p.scores));
  const maxPoints = Math.max(40, ...allPointValues);

  return {
    seasonId,
    seasonName: season ? season.name : 'ATHLOS War of Batches 2026–27',
    dates: points.map((p) => p.displayDate),
    points,
    batches: batchSeries,
    maxPoints,
    lastUpdated: new Date().toISOString(),
  };
}

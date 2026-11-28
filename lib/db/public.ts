import { db } from '@/lib/db';
import { Season, Batch, Sport, Match, OfficialBatchScore, Highlight, Announcement, Poll } from '@/lib/types';

export function getActiveSeason(): Season {
  const active = db.query('seasons', (s) => s.status === 'active')[0];
  if (active) return active;
  // Fallback to latest
  return db.getTable('seasons')[0];
}

export function getBatchesForSeason(seasonId: string): Batch[] {
  return db.query('batches', (b) => b.seasonId === seasonId && b.enabled);
}

export interface LeaderboardEntry {
  batch: Batch;
  totalPoints: number;
  wins: number;
  rank: number;
  tieBroken: boolean;
  breakdownBySport: Record<string, number>;
  sourceRow: number;
}

export function getOfficialLeaderboard(seasonId: string): LeaderboardEntry[] {
  const batches = getBatchesForSeason(seasonId);
  const officialScores = db.query('official_batch_scores', (obs) => obs.seasonId === seasonId);

  const entries: LeaderboardEntry[] = batches.map((batch) => {
    const scoreRecord = officialScores.find((s) => s.batchId === batch.id || s.batchCode === batch.code);
    return {
      batch,
      totalPoints: scoreRecord ? scoreRecord.totalPoints : 0,
      wins: scoreRecord ? scoreRecord.wins : 0,
      rank: scoreRecord ? scoreRecord.rank : 1,
      tieBroken: scoreRecord ? scoreRecord.tieBroken : false,
      breakdownBySport: scoreRecord ? scoreRecord.breakdownBySport : {},
      sourceRow: scoreRecord ? scoreRecord.sourceRow : 79,
    };
  });

  // Sort by official total points descending
  entries.sort((a, b) => b.totalPoints - a.totalPoints);

  // Apply tie rankings if tied
  let currentRank = 1;
  for (let i = 0; i < entries.length; i++) {
    if (i > 0 && entries[i].totalPoints === entries[i - 1].totalPoints) {
      entries[i].rank = entries[i - 1].rank;
    } else {
      entries[i].rank = currentRank;
    }
    currentRank++;
  }

  return entries;
}

export function getPublicMatches(seasonId: string, options?: { sportId?: string; status?: string; batchId?: string }) {
  const allMatches = db.query('matches', (m) => m.seasonId === seasonId);
  const sports = db.getTable('sports');
  const batches = db.getTable('batches');
  const categories = db.getTable('categories');

  let filtered = allMatches;
  if (options?.sportId) {
    filtered = filtered.filter((m) => m.sportId === options.sportId);
  }
  if (options?.status) {
    filtered = filtered.filter((m) => m.status === options.status);
  }
  if (options?.batchId) {
    filtered = filtered.filter((m) => m.batchAId === options.batchId || m.batchBId === options.batchId);
  }

  return filtered.map((match) => {
    let cat = categories.find((c) => c.id === match.categoryId);
    if (!cat) {
      cat = {
        id: 'cat-boys',
        seasonId,
        sportId: match.sportId,
        name: 'Boys',
        sortOrder: 1,
        enabled: true,
      };
    }
    return {
      ...match,
      sport: sports.find((s) => s.id === match.sportId),
      category: cat,
      batchA: batches.find((b) => b.id === match.batchAId),
      batchB: batches.find((b) => b.id === match.batchBId),
      winnerBatch: match.winnerBatchId ? batches.find((b) => b.id === match.winnerBatchId) : null,
    };
  });
}

export function getPublicHighlights(seasonId: string, limit?: number) {
  const list = db.query('highlights', (h) => h.seasonId === seasonId);
  list.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
  return limit ? list.slice(0, limit) : list;
}

export function getPublicAnnouncements(seasonId: string) {
  return db.query('announcements', (a) => a.seasonId === seasonId);
}

export function getPublicPolls(seasonId: string, options?: { todayOnly?: boolean }) {
  const polls = db.query('polls', (p) => p.seasonId === seasonId);
  const votes = db.getTable('poll_votes');
  const batches = db.getTable('batches');
  const matches = db.getTable('matches');
  const sports = db.getTable('sports');
  const now = new Date();

  let results = polls.map((poll) => {
    const pollVotes = votes.filter((v) => v.pollId === poll.id);
    const totalVotes = pollVotes.length;

    const match = matches.find((m) => m.id === poll.matchId);
    const sport = match ? sports.find((s) => s.id === match.sportId) : null;

    // Check deadline closure
    let isClosed = poll.status === 'CLOSED';
    if (!isClosed && match && (match.status === 'COMPLETED' || match.status === 'CANCELLED')) {
      isClosed = true;
    }
    if (!isClosed && poll.closesAt) {
      if (now >= new Date(poll.closesAt)) {
        isClosed = true;
      }
    }

    const batchOptions = poll.eligibleBatches.map((batchId) => {
      const batch = batches.find((b) => b.id === batchId);
      const voteCount = pollVotes.filter((v) => v.batchId === batchId).length;
      const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
      return {
        batchId,
        batch,
        voteCount,
        percentage,
      };
    });

    return {
      ...poll,
      status: (isClosed ? 'CLOSED' : 'OPEN') as 'OPEN' | 'CLOSED',
      match,
      sport,
      totalVotes,
      options: batchOptions,
    };
  });

  // Sort: upcoming open matches first by scheduledDate ASC, then timeSlot (Morning first)
  results.sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'OPEN' ? -1 : 1;
    }
    const dateA = a.match?.scheduledDate || a.matchDate || '9999-99-99';
    const dateB = b.match?.scheduledDate || b.matchDate || '9999-99-99';
    if (dateA !== dateB) return dateA.localeCompare(dateB);

    const slotA = (a.match?.timeSlot || a.session || '').toLowerCase().includes('morning') ? 0 : 1;
    const slotB = (b.match?.timeSlot || b.session || '').toLowerCase().includes('morning') ? 0 : 1;
    return slotA - slotB;
  });

  if (options?.todayOnly) {
    const today = new Date().toISOString().split('T')[0];
    const todayMatches = results.filter((p) => p.status === 'OPEN' && p.match && p.match.status === 'UPCOMING' && p.match.scheduledDate === today);
    if (todayMatches.length > 0) {
      results = todayMatches;
    } else {
      results = results.filter((p) => p.status === 'OPEN' && (!p.match || p.match.status === 'UPCOMING'));
    }
  }

  return results;
}

export function getArchivedSeasonsSummary() {
  const archived = db.query('seasons', (s) => s.status === 'archived');
  const allScores = db.getTable('official_batch_scores');
  const allBatches = db.getTable('batches');

  return archived.map((season) => {
    const seasonScores = allScores.filter((s) => s.seasonId === season.id);
    const leaderboard = seasonScores
      .map((score) => ({
        ...score,
        batch: allBatches.find((b) => b.id === score.batchId || b.code === score.batchCode),
      }))
      .sort((a, b) => b.totalPoints - a.totalPoints);

    const winner = leaderboard[0];

    return {
      season,
      leaderboard,
      winner,
    };
  });
}

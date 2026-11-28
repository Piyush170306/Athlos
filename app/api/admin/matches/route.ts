import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { verifyAdminSessionToken } from '@/lib/auth';
import { getActiveSeason } from '@/lib/db/public';
import { syncHighlightsFromMatches, syncPollsFromMatches } from '@/lib/importer/approval';
import { revalidatePath } from 'next/cache';

function checkAuth(req: NextRequest) {
  const token = req.cookies.get('athlos_admin_session')?.value;
  if (!token) return null;
  const verified = verifyAdminSessionToken(token);
  return verified.valid ? verified.user : null;
}

export async function GET(req: NextRequest) {
  const user = checkAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const activeSeason = getActiveSeason();
  const matches = db.query('matches', (m) => m.seasonId === activeSeason.id);
  const sports = db.query('sports', (s) => s.seasonId === activeSeason.id);
  const categories = db.query('categories', (c) => c.seasonId === activeSeason.id);
  const batches = db.query('batches', (b) => b.seasonId === activeSeason.id);

  return NextResponse.json({ matches, sports, categories, batches });
}

export async function POST(req: NextRequest) {
  const user = checkAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const {
      sportId,
      categoryId,
      batchAId,
      batchBId,
      scheduledDate,
      timeSlot,
      status,
      rawScore,
      winnerBatchId,
      margin,
    } = await req.json();

    const activeSeason = getActiveSeason();
    const now = new Date().toISOString();

    const newMatch = {
      id: `match-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      seasonId: activeSeason.id,
      sportId,
      categoryId,
      batchAId,
      batchBId,
      scheduledDate,
      timeSlot,
      status: status || 'UPCOMING',
      rawScore,
      winnerBatchId,
      margin,
      createdAt: now,
      updatedAt: now,
    };

    db.insert('matches', newMatch);
    db.logAudit(user.email, 'MATCH_CREATED', 'MATCH', newMatch.id, {
      sportId,
      batchAId,
      batchBId,
    });

    return NextResponse.json({ success: true, match: newMatch });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = checkAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { matchId, status, rawScore, winnerBatchId, margin, isFlagged, discrepancyNote } =
      await req.json();

    await db.syncFromRemote();
    const existing = db.findById('matches', matchId);
    if (!existing) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const updated = db.update('matches', matchId, {
      status,
      rawScore: rawScore || undefined,
      winnerBatchId: winnerBatchId || undefined,
      margin,
      isFlagged,
      discrepancyNote,
      updatedAt: new Date().toISOString(),
    });

    // Recalculate Batch Scores Table and Leaderboard points for season
    const seasonId = existing.seasonId;
    const completedMatches = db.query(
      'matches',
      (m) => m.seasonId === seasonId && m.status === 'COMPLETED'
    );
    const sports = db.query('sports', (s) => s.seasonId === seasonId);
    const batches = db.query('batches', (b) => b.seasonId === seasonId);
    const sportsMap = Object.fromEntries(sports.map((s) => [s.id, s.slug]));

    const winsMap: Record<string, number> = {};
    const pointsMap: Record<string, number> = {};
    const breakdowns: Record<string, Record<string, number>> = {};

    batches.forEach((b) => {
      winsMap[b.id] = 0;
      pointsMap[b.id] = 0;
      breakdowns[b.id] = {};
    });

    for (const m of completedMatches) {
      if (m.winnerBatchId && m.winnerBatchId !== 'DRAW' && pointsMap[m.winnerBatchId] !== undefined) {
        winsMap[m.winnerBatchId] = (winsMap[m.winnerBatchId] || 0) + 1;
        pointsMap[m.winnerBatchId] = (pointsMap[m.winnerBatchId] || 0) + 2;
        const sSlug = sportsMap[m.sportId] || 'general';
        breakdowns[m.winnerBatchId][sSlug] = (breakdowns[m.winnerBatchId][sSlug] || 0) + 2;
      }
    }

    const existingScores = db.query('official_batch_scores', (s) => s.seasonId === seasonId);
    for (const b of batches) {
      const scoreRec = existingScores.find((s) => s.batchId === b.id || s.batchCode === b.code);
      const bPoints = pointsMap[b.id] || 0;
      const bWins = winsMap[b.id] || 0;
      const bBreakdown = breakdowns[b.id] || {};

      if (scoreRec) {
        db.update('official_batch_scores', scoreRec.id, {
          totalPoints: bPoints,
          wins: bWins,
          breakdownBySport: bBreakdown,
          lastApprovedAt: new Date().toISOString(),
          lastApprovedBy: `admin_match_update:${user.email}`,
        });
      } else {
        db.insert('official_batch_scores', {
          id: `obs-${seasonId}-${b.code.toLowerCase()}`,
          seasonId,
          batchId: b.id,
          batchCode: b.code,
          totalPoints: bPoints,
          wins: bWins,
          rank: 1,
          tieBroken: false,
          breakdownBySport: bBreakdown,
          sourceSheet: '2026-27',
          sourceRow: 87,
          lastApprovedAt: new Date().toISOString(),
          lastApprovedBy: `admin_match_update:${user.email}`,
        });
      }
    }

    // Rank recalculation
    const seasonScores = db.query('official_batch_scores', (s) => s.seasonId === seasonId);
    const sorted = [...seasonScores].sort((a, b) => b.totalPoints - a.totalPoints);
    sorted.forEach((score, idx) => {
      db.update('official_batch_scores', score.id, { rank: idx + 1 });
    });

    // Sync highlights and prediction polls
    syncHighlightsFromMatches(seasonId);
    syncPollsFromMatches(seasonId);

    // Commit to Upstash Redis shared database
    await db.saveToRemote();

    // Revalidate public views
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/leaderboard');
      revalidatePath('/matches');
      revalidatePath('/highlights');
      revalidatePath('/polls');
    } catch {}

    db.logAudit(user.email, 'MATCH_UPDATED', 'MATCH', matchId, {
      before: { status: existing.status, rawScore: existing.rawScore, winner: existing.winnerBatchId },
      after: { status, rawScore, winnerBatchId },
    });

    return NextResponse.json({ success: true, match: updated });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

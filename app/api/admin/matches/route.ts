import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { verifyAdminSessionToken } from '@/lib/auth';
import { getActiveSeason } from '@/lib/db/public';

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

    const existing = db.findById('matches', matchId);
    if (!existing) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const updated = db.update('matches', matchId, {
      status,
      rawScore,
      winnerBatchId,
      margin,
      isFlagged,
      discrepancyNote,
    });

    db.logAudit(user.email, 'MATCH_UPDATED', 'MATCH', matchId, {
      before: { status: existing.status, rawScore: existing.rawScore, winner: existing.winnerBatchId },
      after: { status, rawScore, winnerBatchId },
    });

    return NextResponse.json({ success: true, match: updated });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

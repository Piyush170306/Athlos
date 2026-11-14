import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { verifyAdminSessionToken } from '@/lib/auth';
import { getActiveSeason, getPublicPolls } from '@/lib/db/public';

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
  const polls = getPublicPolls(activeSeason.id);
  const matches = db.query('matches', (m) => m.seasonId === activeSeason.id);
  const batches = db.query('batches', (b) => b.seasonId === activeSeason.id);

  return NextResponse.json({ polls, matches, batches });
}

export async function POST(req: NextRequest) {
  const user = checkAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { matchId, title, eligibleBatches } = await req.json();
    if (!title || !eligibleBatches || eligibleBatches.length < 2) {
      return NextResponse.json({ error: 'Title and at least 2 eligible batches are required' }, { status: 400 });
    }

    const activeSeason = getActiveSeason();
    const newPoll = {
      id: `poll-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      matchId: matchId || 'general',
      seasonId: activeSeason.id,
      title,
      status: 'OPEN' as const,
      eligibleBatches,
      openedAt: new Date().toISOString(),
    };

    db.insert('polls', newPoll);
    db.logAudit(user.email, 'POLL_CREATED', 'POLL', newPoll.id, { title });

    return NextResponse.json({ success: true, poll: newPoll });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = checkAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { pollId, status } = await req.json();
    const poll = db.findById('polls', pollId);
    if (!poll) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    const updates: any = { status };
    if (status === 'CLOSED') {
      updates.closedAt = new Date().toISOString();
    } else {
      updates.openedAt = new Date().toISOString();
      updates.closedAt = undefined;
    }

    const updated = db.update('polls', pollId, updates);
    db.logAudit(user.email, 'POLL_STATUS_TOGGLED', 'POLL', pollId, { status });

    return NextResponse.json({ success: true, poll: updated });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

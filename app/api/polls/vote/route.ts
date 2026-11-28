import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { checkRateLimit } from '@/lib/auth';
import { isPollClosed } from '@/lib/polls/deadlines';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`vote-${ip}`, 20, 60000); // 20 votes per min max
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: 'Voting rate limit exceeded. Please wait.' }, { status: 429 });
    }

    const body = await req.json().catch(() => ({}));
    const { pollId, batchId, deviceToken } = body;

    if (!pollId || !batchId) {
      return NextResponse.json({ error: 'Poll ID and Batch ID are required.' }, { status: 400 });
    }

    await db.syncFromRemote();
    const poll = db.findById('polls', pollId);
    if (!poll) {
      return NextResponse.json({ error: 'Poll not found.' }, { status: 404 });
    }

    // Check if the poll deadline has elapsed or match is completed
    const match = poll.matchId ? db.findById('matches', poll.matchId) : undefined;
    if (isPollClosed({ ...poll, match })) {
      if (poll.status !== 'CLOSED') {
        db.update('polls', poll.id, { status: 'CLOSED', closedAt: new Date().toISOString() });
        await db.saveToRemote().catch(() => {});
      }
      return NextResponse.json(
        {
          error: `Prediction deadline has passed. Predictions for this match closed at ${
            poll.closingDisplay || 'the designated deadline'
          }.`,
        },
        { status: 400 }
      );
    }

    if (!poll.eligibleBatches.includes(batchId)) {
      return NextResponse.json({ error: 'Invalid batch selection for this poll.' }, { status: 400 });
    }

    // Privacy-preserving hash of device token + IP
    const rawDevice = deviceToken || ip;
    const deviceTokenHash = crypto.createHash('sha256').update(rawDevice).digest('hex');

    // Check if token already voted in this poll
    const existingVote = db.query(
      'poll_votes',
      (v) => v.pollId === pollId && v.deviceTokenHash === deviceTokenHash
    )[0];

    if (existingVote) {
      return NextResponse.json({ error: 'A vote has already been recorded from this device.' }, { status: 409 });
    }

    // Record vote
    db.insert('poll_votes', {
      id: `vote-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      pollId,
      batchId,
      deviceTokenHash,
      createdAt: new Date().toISOString(),
    });

    await db.saveToRemote().catch(() => {});

    return NextResponse.json({ success: true, message: 'Vote registered successfully' });
  } catch (err: any) {
    console.error('Vote error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

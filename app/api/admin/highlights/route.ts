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
  const highlights = db.query('highlights', (h) => h.seasonId === activeSeason.id);
  const matches = db.query('matches', (m) => m.seasonId === activeSeason.id);

  return NextResponse.json({ highlights, matches });
}

export async function POST(req: NextRequest) {
  const user = checkAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { title, content, matchId, mediaUrl, isPinned } = await req.json();
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const activeSeason = getActiveSeason();
    const newHl = {
      id: `hl-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      seasonId: activeSeason.id,
      title,
      content,
      matchId: matchId || undefined,
      mediaUrl: mediaUrl || undefined,
      isPinned: !!isPinned,
      sortOrder: 1,
      publishedAt: new Date().toISOString(),
      author: user.email,
    };

    db.insert('highlights', newHl);
    db.logAudit(user.email, 'HIGHLIGHT_CREATED', 'HIGHLIGHT', newHl.id, { title });

    return NextResponse.json({ success: true, highlight: newHl });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = checkAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await req.json();
    db.delete('highlights', id);
    db.logAudit(user.email, 'HIGHLIGHT_DELETED', 'HIGHLIGHT', id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

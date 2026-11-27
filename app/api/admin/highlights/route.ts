import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { verifyAdminSessionToken } from '@/lib/auth';
import { getActiveSeason } from '@/lib/db/public';

export const dynamic = 'force-dynamic';

function checkAuth(req: NextRequest) {
  const token = req.cookies.get('athlos_admin_session')?.value;
  if (!token) return null;
  const verified = verifyAdminSessionToken(token);
  return verified.valid ? verified.user : null;
}

function revalidatePublicHighlights() {
  try {
    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/highlights');
  } catch (err) {
    console.warn('Revalidation notice:', err);
  }
}

export async function GET(req: NextRequest) {
  const user = checkAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await db.syncFromRemote();

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

    await db.syncFromRemote();

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
    await db.saveToRemote();
    revalidatePublicHighlights();

    db.logAudit(user.email, 'HIGHLIGHT_CREATED', 'HIGHLIGHT', newHl.id, { title });

    return NextResponse.json({ success: true, highlight: newHl });
  } catch (err: any) {
    console.error('Highlight create error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = checkAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, title, content, matchId, mediaUrl, isPinned } = await req.json();
    if (!id || !title || !content) {
      return NextResponse.json({ error: 'Highlight ID, title, and content are required' }, { status: 400 });
    }

    await db.syncFromRemote();

    const updated = db.update('highlights', id, {
      title,
      content,
      matchId: matchId || undefined,
      mediaUrl: mediaUrl || undefined,
      isPinned: !!isPinned,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Highlight not found' }, { status: 404 });
    }

    await db.saveToRemote();
    revalidatePublicHighlights();

    db.logAudit(user.email, 'HIGHLIGHT_UPDATED', 'HIGHLIGHT', id, { title });

    return NextResponse.json({ success: true, highlight: updated });
  } catch (err: any) {
    console.error('Highlight update error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = checkAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    let id: string | undefined;
    try {
      const body = await req.json();
      id = body?.id;
    } catch {}

    if (!id) {
      const url = new URL(req.url);
      id = url.searchParams.get('id') || undefined;
    }

    if (!id) {
      return NextResponse.json({ error: 'Highlight ID is required' }, { status: 400 });
    }

    await db.syncFromRemote();

    db.delete('highlights', id);
    await db.saveToRemote();
    revalidatePublicHighlights();

    db.logAudit(user.email, 'HIGHLIGHT_DELETED', 'HIGHLIGHT', id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Highlight delete error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

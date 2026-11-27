import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { verifyAdminSessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('athlos_admin_session')?.value;
  const verified = verifyAdminSessionToken(token || '');
  if (!verified.valid || !verified.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const payload = body.data || body;

    if (!payload.seasons || !payload.batches || !payload.sports || !payload.matches || !payload.official_batch_scores) {
      return NextResponse.json(
        { error: 'Invalid master database payload: missing required tables' },
        { status: 400 }
      );
    }

    db.replaceAll(payload);
    const remoteSaved = await db.saveToRemote();

    // Revalidate public routes
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/leaderboard');
      revalidatePath('/matches');
      revalidatePath('/sports');
      revalidatePath('/highlights');
      revalidatePath('/polls');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }

    db.logAudit(verified.user.email, 'DATABASE_RESTORED', 'DATABASE', undefined, {
      seasonsCount: payload.seasons.length,
      matchesCount: payload.matches.length,
      remoteSaved,
    });

    return NextResponse.json({
      success: true,
      remoteSaved,
      message: 'Master database successfully restored and synced to shared production storage.',
    });
  } catch (err: any) {
    console.error('Database restore error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

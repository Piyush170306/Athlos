import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminSessionToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('athlos_admin_session')?.value;
  const verified = verifyAdminSessionToken(token || '');
  if (!verified.valid || !verified.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { seasonId, confirmPhrase } = await req.json();

    if (confirmPhrase !== 'ACTIVATE') {
      return NextResponse.json(
        { error: 'Confirmation phrase "ACTIVATE" is required to confirm activation.' },
        { status: 400 }
      );
    }

    const targetSeason = db.findById('seasons', seasonId);
    if (!targetSeason) {
      return NextResponse.json({ error: 'Season not found' }, { status: 404 });
    }

    const now = new Date().toISOString();

    // 1. Mark all existing active seasons as archived
    const currentActives = db.query('seasons', (s) => s.status === 'active');
    for (const s of currentActives) {
      db.update('seasons', s.id, {
        status: 'archived',
        updatedAt: now,
      });
      db.logAudit(
        verified.user.email,
        'SEASON_ARCHIVED',
        'SEASON',
        s.id,
        { reason: `Superseded by activation of ${targetSeason.name}` }
      );
    }

    // 2. Activate target season
    db.update('seasons', targetSeason.id, {
      status: 'active',
      activatedAt: now,
      activatedBy: verified.user.email,
      updatedAt: now,
    });

    db.logAudit(
      verified.user.email,
      'SEASON_ACTIVATED',
      'SEASON',
      targetSeason.id,
      { seasonName: targetSeason.name, slug: targetSeason.slug }
    );

    return NextResponse.json({
      success: true,
      message: `Season "${targetSeason.name}" is now the sole active tournament season.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

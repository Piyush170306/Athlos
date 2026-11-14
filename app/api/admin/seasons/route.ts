import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { verifyAdminSessionToken } from '@/lib/auth';

function checkAuth(req: NextRequest) {
  const token = req.cookies.get('athlos_admin_session')?.value;
  if (!token) return null;
  const verified = verifyAdminSessionToken(token);
  return verified.valid ? verified.user : null;
}

export async function GET(req: NextRequest) {
  const user = checkAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const seasons = db.getTable('seasons');
  return NextResponse.json({ seasons });
}

export async function POST(req: NextRequest) {
  const user = checkAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, slug, startDate, endDate } = await req.json();
    if (!name || !slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }

    const existing = db.query('seasons', (s) => s.slug === slug)[0];
    if (existing) {
      return NextResponse.json({ error: 'A season with this slug already exists' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const newSeason = {
      id: `season-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      name,
      slug,
      status: 'draft' as const, // Always created in draft!
      startDate,
      endDate,
      createdAt: now,
      updatedAt: now,
    };

    db.insert('seasons', newSeason);
    db.logAudit(user.email, 'SEASON_CREATED', 'SEASON', newSeason.id, { name, slug });

    return NextResponse.json({ success: true, season: newSeason });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

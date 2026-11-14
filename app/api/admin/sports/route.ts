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
  const sports = db.query('sports', (s) => s.seasonId === activeSeason.id);
  const categories = db.query('categories', (c) => c.seasonId === activeSeason.id);

  return NextResponse.json({ sports, categories, season: activeSeason });
}

export async function POST(req: NextRequest) {
  const user = checkAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, slug, description, scoreFormatType, categories } = await req.json();
    if (!name || !slug) {
      return NextResponse.json({ error: 'Sport name and slug are required' }, { status: 400 });
    }

    const activeSeason = getActiveSeason();
    const newSport = {
      id: `sport-${slug.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      seasonId: activeSeason.id,
      name,
      slug: slug.toLowerCase(),
      description,
      scoreFormatType: scoreFormatType || 'SCORE',
      enabled: true,
    };

    db.insert('sports', newSport);

    // Insert associated categories if provided
    if (Array.isArray(categories)) {
      categories.forEach((catName: string, idx: number) => {
        db.insert('categories', {
          id: `cat-${newSport.id}-${idx}`,
          seasonId: activeSeason.id,
          sportId: newSport.id,
          name: catName,
          sortOrder: idx + 1,
          enabled: true,
        });
      });
    }

    db.logAudit(user.email, 'SPORT_CREATED', 'SPORT', newSport.id, { name, scoreFormatType });

    return NextResponse.json({ success: true, sport: newSport });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

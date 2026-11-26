import { NextRequest, NextResponse } from 'next/server';
import { getActiveSeason, getPublicMatches, getBatchesForSeason } from '@/lib/db/public';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    await db.syncFromRemote();
    const season = getActiveSeason();
    const matches = getPublicMatches(season.id);
    const sports = db.query('sports', (s) => s.seasonId === season.id && s.enabled);
    const batches = getBatchesForSeason(season.id);

    return NextResponse.json(
      {
        season,
        matches,
        sports,
        batches,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'CDN-Cache-Control': 'no-store',
          'Vercel-CDN-Cache-Control': 'no-store',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}

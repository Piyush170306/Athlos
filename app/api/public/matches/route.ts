import { NextRequest, NextResponse } from 'next/server';
import { getActiveSeason, getPublicMatches, getBatchesForSeason } from '@/lib/db/public';
import { db } from '@/lib/db';

export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const season = getActiveSeason();
    const matches = getPublicMatches(season.id);
    const sports = db.query('sports', (s) => s.seasonId === season.id && s.enabled);
    const batches = getBatchesForSeason(season.id);

    return NextResponse.json({
      season,
      matches,
      sports,
      batches,
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getActiveSeason } from '@/lib/db/public';
import { getPointsProgression } from '@/lib/db/pointsHistory';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const seasonId = searchParams.get('seasonId') || getActiveSeason().id;
    const progression = getPointsProgression(seasonId);

    return NextResponse.json(progression);
  } catch (err: any) {
    console.error('Error fetching points progression:', err);
    return NextResponse.json({ error: 'Failed to load points progression' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { syncGoogleSheet } from '@/lib/sheets/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const secretParam = req.nextUrl.searchParams.get('secret');

  const configuredSecret = process.env.CRON_SECRET || 'athlos-cron-sync-secret-2026';

  const isAuthorized =
    authHeader === `Bearer ${configuredSecret}` || secretParam === configuredSecret;

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized: Invalid cron secret' }, { status: 401 });
  }

  const result = await syncGoogleSheet('cron:scheduled-job');
  return NextResponse.json(result);
}

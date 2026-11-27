import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSessionToken } from '@/lib/auth';
import { syncGoogleSheet } from '@/lib/sheets/client';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('athlos_admin_session')?.value;
  const verified = verifyAdminSessionToken(token || '');
  if (!verified.valid || !verified.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await db.syncFromRemote();
  const config = db.getTable('google_sheets_config')[0];

  // Calculate next scheduled sync time (every 5 minutes)
  const lastSyncTime = config?.lastAttemptAt ? new Date(config.lastAttemptAt).getTime() : Date.now();
  const nextSyncTime = new Date(lastSyncTime + 5 * 60 * 1000).toISOString();

  return NextResponse.json({
    config,
    nextScheduledSyncAt: nextSyncTime,
  });
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get('athlos_admin_session')?.value;
  const verified = verifyAdminSessionToken(token || '');
  if (!verified.valid || !verified.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let force = false;
  try {
    const body = await req.json();
    force = Boolean(body?.force);
  } catch {}

  const result = await syncGoogleSheet(`admin:${verified.user.email}`, { force });

  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: 500 });
  }

  return NextResponse.json(result);
}

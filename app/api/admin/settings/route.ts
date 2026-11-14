import { NextRequest, NextResponse } from 'next/server';
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

  const gSheetsConfig = db.getTable('google_sheets_config')[0] || {
    spreadsheetId: '',
    sheetName: '2026-27',
    syncFrequencyMinutes: 5,
    isActive: false,
  };

  return NextResponse.json({
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'ATHLOS War of Batches 2026–27',
    timezone: process.env.TOURNAMENT_TIMEZONE || 'Asia/Kolkata',
    allowedEmails: (process.env.ADMIN_ALLOWED_EMAILS || 'admin@athlos.edu,sports@athlos.edu').split(','),
    googleSheets: gSheetsConfig,
  });
}

export async function POST(req: NextRequest) {
  const user = checkAuth(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { spreadsheetId, sheetName, syncFrequencyMinutes } = await req.json();

    const existing = db.getTable('google_sheets_config')[0];
    if (existing) {
      db.update('google_sheets_config', existing.id, {
        spreadsheetId,
        sheetName,
        syncFrequencyMinutes: Number(syncFrequencyMinutes) || 5,
      });
    }

    db.logAudit(user.email, 'SETTINGS_UPDATED', 'SETTINGS', undefined, {
      spreadsheetId,
      sheetName,
    });

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

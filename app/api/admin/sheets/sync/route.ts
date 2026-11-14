import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSessionToken } from '@/lib/auth';
import { syncGoogleSheet } from '@/lib/sheets/client';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('athlos_admin_session')?.value;
  const verified = verifyAdminSessionToken(token || '');
  if (!verified.valid || !verified.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await syncGoogleSheet(`admin:${verified.user.email}`);

  if (!result.success) {
    return NextResponse.json({ error: result.message }, { status: 500 });
  }

  return NextResponse.json(result);
}

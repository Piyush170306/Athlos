import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminSessionToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('athlos_admin_session')?.value;
  const verified = verifyAdminSessionToken(token || '');
  if (!verified.valid || !verified.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const logs = [...db.getTable('audit_logs')].reverse();
  return NextResponse.json({ logs });
}

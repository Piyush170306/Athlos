import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSessionToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const cookie = req.cookies.get('athlos_admin_session')?.value;
  if (cookie) {
    const verified = verifyAdminSessionToken(cookie);
    if (verified.valid && verified.user) {
      db.logAudit(verified.user.email, 'LOGOUT', 'AUTH', verified.user.userId);
    }
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  const isHttps = req.headers.get('x-forwarded-proto') === 'https' || req.nextUrl.protocol === 'https:';
  response.cookies.set('athlos_admin_session', '', {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}

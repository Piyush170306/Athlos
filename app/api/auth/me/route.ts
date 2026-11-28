import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSessionToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('athlos_admin_session')?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const verified = verifyAdminSessionToken(token);
  if (!verified.valid || !verified.user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  await db.syncFromRemote();
  const user =
    db.findById('admin_users', verified.user.userId) ||
    db.getTable('admin_users').find((u) => u.email.toLowerCase() === verified.user!.email.toLowerCase());

  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Invalidate older session tokens if credential rotation or password reset took place
  if (user.tokenVersion && verified.user.tokenVersion !== user.tokenVersion) {
    return NextResponse.json(
      { authenticated: false, error: 'Session invalidated due to password rotation. Please log in again.' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      mustChangePassword: Boolean(user.mustChangePassword),
    },
  });
}

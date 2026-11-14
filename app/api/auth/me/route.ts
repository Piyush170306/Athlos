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

  const user = db.findById('admin_users', verified.user.userId);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
}

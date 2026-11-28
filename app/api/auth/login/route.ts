import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, createAdminSessionToken, checkRateLimit } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`login-${ip}`, 5, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many login attempts. Please retry in ${rateCheck.retryAfterSec} seconds.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    await db.syncFromRemote();
    const authResult = await authenticateAdmin(email, password);
    if (!authResult.success || !authResult.user) {
      db.logAudit(email || 'anonymous', 'LOGIN_FAILED', 'AUTH', undefined, { ip }, undefined, ip);
      return NextResponse.json({ error: authResult.error || 'Invalid credentials.' }, { status: 401 });
    }

    const token = createAdminSessionToken(authResult.user);
    db.logAudit(authResult.user.email, 'LOGIN_SUCCESS', 'AUTH', authResult.user.id, { ip }, undefined, ip);

    const response = NextResponse.json({
      success: true,
      user: {
        id: authResult.user.id,
        email: authResult.user.email,
        role: authResult.user.role,
      },
    });

    const isHttps = req.headers.get('x-forwarded-proto') === 'https' || req.nextUrl.protocol === 'https:';
    response.cookies.set('athlos_admin_session', token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 12 * 60 * 60, // 12 hours persistent session
    });

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

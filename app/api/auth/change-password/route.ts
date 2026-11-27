import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { verifyAdminSessionToken, createAdminSessionToken } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('athlos_admin_session')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No active admin session found.' }, { status: 401 });
    }

    const verified = verifyAdminSessionToken(token);
    if (!verified.valid || !verified.user) {
      return NextResponse.json({ error: 'Unauthorized: Session is invalid or expired.' }, { status: 401 });
    }

    await db.syncFromRemote();
    const user = db.findById('admin_users', verified.user.userId);
    if (!user) {
      return NextResponse.json({ error: 'Admin account not found.' }, { status: 404 });
    }

    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields (current password, new password, and confirmation) are required.' },
        { status: 400 }
      );
    }

    // 1. Verify current password
    const matchesCurrent = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!matchesCurrent) {
      return NextResponse.json({ error: 'Incorrect current password.' }, { status: 400 });
    }

    // 2. Validate confirmation
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'New password and confirmation do not match.' }, { status: 400 });
    }

    // 3. Prevent reusing the temporary password
    if (newPassword === 'Athlos@2026' || newPassword === currentPassword) {
      return NextResponse.json(
        { error: 'Please choose a new, unique password distinct from the initial credential.' },
        { status: 400 }
      );
    }

    // 4. Validate password complexity
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long.' },
        { status: 400 }
      );
    }
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasDigit = /[0-9]/.test(newPassword);
    if (!hasUpper || !hasLower || !hasDigit) {
      return NextResponse.json(
        { error: 'Password must include uppercase, lowercase, and numeric characters.' },
        { status: 400 }
      );
    }

    // 5. Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    const nextTokenVersion = (user.tokenVersion || 1) + 1;
    const now = new Date().toISOString();

    db.update('admin_users', user.id, {
      passwordHash: newPasswordHash,
      mustChangePassword: false,
      tokenVersion: nextTokenVersion,
      updatedAt: now,
    });

    db.logAudit(user.email, 'PASSWORD_ROTATED', 'ADMIN_USER', user.id, {
      message: 'Admin updated credentials to a unique personal password.',
      timestamp: now,
    });

    await db.saveToRemote();

    // 6. Issue fresh session cookie for the updated user
    const updatedUser = {
      ...user,
      passwordHash: newPasswordHash,
      mustChangePassword: false,
      tokenVersion: nextTokenVersion,
    };
    const newToken = createAdminSessionToken(updatedUser);

    const response = NextResponse.json({
      success: true,
      message: 'Password successfully updated! Your secure session has been refreshed.',
    });

    const isHttps = req.headers.get('x-forwarded-proto') === 'https' || req.nextUrl.protocol === 'https:';
    response.cookies.set('athlos_admin_session', newToken, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error('Password change error:', err);
    return NextResponse.json({ error: 'Failed to update password.' }, { status: 500 });
  }
}

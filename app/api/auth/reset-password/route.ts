import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordWithToken, checkRateLimit } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`reset-pw-${ip}`, 5, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many attempts. Please retry in ${rateCheck.retryAfterSec} seconds.` },
        { status: 429 }
      );
    }

    const { token, newPassword } = await req.json();
    if (!token || !newPassword) {
      return NextResponse.json({ error: 'Token and new password are required' }, { status: 400 });
    }

    const result = await resetPasswordWithToken(token, newPassword);
    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to reset password' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Password has been successfully updated.' });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

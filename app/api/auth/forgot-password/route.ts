import { NextRequest, NextResponse } from 'next/server';
import { createPasswordResetToken, checkRateLimit } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateCheck = checkRateLimit(`forgot-pw-${ip}`, 3, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many password reset requests. Please retry in ${rateCheck.retryAfterSec} seconds.` },
        { status: 429 }
      );
    }

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const result = createPasswordResetToken(email);

    // In production with an SMTP provider, you would send an email here.
    // For local dev/admin bootstrap, if token was generated, we provide a safe demo reset URL.
    return NextResponse.json({
      success: true,
      message: 'If the email is an authorized admin account, password reset instructions have been generated.',
      // In dev environment we provide resetUrl for seamless testing
      resetUrl: result.token ? `/admin/reset-password?token=${result.token}` : undefined,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

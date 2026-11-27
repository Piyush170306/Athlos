import { NextRequest, NextResponse } from 'next/server';
import { syncGoogleSheet } from '@/lib/sheets/client';

export const dynamic = 'force-dynamic';

function isAuthorizedCron(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  const secretParam = req.nextUrl.searchParams.get('secret');
  const userAgent = req.headers.get('user-agent') || '';

  const configuredSecret = process.env.CRON_SECRET || 'athlos_cron_sync_secret_2026';

  // 1. Bearer Token check
  if (authHeader && authHeader === `Bearer ${configuredSecret}`) {
    return true;
  }

  // 2. Secret query parameter check
  if (secretParam && secretParam === configuredSecret) {
    return true;
  }

  // 3. Vercel Cron native invocation check (Vercel automatically sets CRON_SECRET or specific signature)
  if (userAgent.toLowerCase().includes('vercel-cron')) {
    // If CRON_SECRET is configured in Vercel, authHeader will match. If not set, allow native Vercel Cron agent.
    return true;
  }

  return false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid cron authentication token or secret parameter.' },
      { status: 401 }
    );
  }

  const force = req.nextUrl.searchParams.get('force') === 'true';
  const result = await syncGoogleSheet('cron:automated-scheduler', { force });
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  if (!isAuthorizedCron(req)) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid cron authentication token or secret parameter.' },
      { status: 401 }
    );
  }

  let force = false;
  try {
    const body = await req.json();
    force = Boolean(body?.force);
  } catch {}

  const result = await syncGoogleSheet('cron:automated-scheduler', { force });
  return NextResponse.json(result);
}

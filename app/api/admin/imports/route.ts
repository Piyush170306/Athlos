import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyAdminSessionToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  const token = req.cookies.get('athlos_admin_session')?.value;
  const verified = verifyAdminSessionToken(token || '');
  if (!verified.valid || !verified.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const importBatches = [...db.getTable('import_batches')].reverse();
  const importRows = db.getTable('import_rows');

  return NextResponse.json(
    { importBatches, importRows },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      },
    }
  );
}

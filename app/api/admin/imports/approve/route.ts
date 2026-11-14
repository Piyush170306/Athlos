import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminSessionToken } from '@/lib/auth';
import { approveImportBatch } from '@/lib/importer/approval';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('athlos_admin_session')?.value;
  const verified = verifyAdminSessionToken(token || '');
  if (!verified.valid || !verified.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { importBatchId } = await req.json();
    if (!importBatchId) {
      return NextResponse.json({ error: 'Import Batch ID is required' }, { status: 400 });
    }

    const result = approveImportBatch(importBatchId, verified.user.email);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Invalidate and revalidate all public routes so latest data reflects immediately
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/leaderboard');
      revalidatePath('/matches');
      revalidatePath('/sports');
      revalidatePath('/highlights');
      revalidatePath('/polls');
    } catch (e) {
      // Revalidation warning logged if any
    }

    return NextResponse.json({ success: true, message: 'Spreadsheet import batch approved and published!' });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

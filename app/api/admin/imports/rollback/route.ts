import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminSessionToken } from '@/lib/auth';
import { rollbackImportBatch } from '@/lib/importer/approval';

export const dynamic = 'force-dynamic';

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

    const result = rollbackImportBatch(importBatchId, verified.user.email);
    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
          conflictingRecords: result.conflictingRecords,
        },
        { status: 400 }
      );
    }

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

    return NextResponse.json({
      success: true,
      message: 'Import successfully rolled back to pre-import state without altering subsequent edits.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

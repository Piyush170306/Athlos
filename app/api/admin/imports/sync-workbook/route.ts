import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { revalidatePath } from 'next/cache';
import { verifyAdminSessionToken } from '@/lib/auth';
import { getActiveSeason } from '@/lib/db/public';
import { parseExcelWorkbook } from '@/lib/importer/excel';
import { stageWorkbookDiff } from '@/lib/importer/diff';
import { approveImportBatch } from '@/lib/importer/approval';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('athlos_admin_session')?.value;
  const verified = verifyAdminSessionToken(token || '');
  if (!verified.valid || !verified.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const filePath = path.join(process.cwd(), 'wob_2026-27_official_workbook_v1.xlsx');
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Official tournament workbook "wob_2026-27_official_workbook_v1.xlsx" not found on server.' },
        { status: 404 }
      );
    }

    const buffer = fs.readFileSync(filePath);
    const activeSeason = getActiveSeason();

    // 1. Parse workbook
    const parsed = parseExcelWorkbook(buffer, activeSeason.slug);

    // 2. Stage Diff
    const staged = stageWorkbookDiff(
      activeSeason.id,
      'wob_2026-27_official_workbook_v1.xlsx',
      'EXCEL',
      parsed,
      verified.user.email
    );

    // 3. Approve and publish directly
    const approveResult = approveImportBatch(staged.importBatch.id, verified.user.email);
    if (!approveResult.success) {
      return NextResponse.json({ error: approveResult.error }, { status: 400 });
    }

    // Persist to remote shared store (Vercel KV / Upstash Redis)
    await db.saveToRemote();

    // 4. Invalidate all public routes
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/leaderboard');
      revalidatePath('/matches');
      revalidatePath('/sports');
      revalidatePath('/highlights');
      revalidatePath('/polls');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }

    const latestBatch = db.findById('import_batches', staged.importBatch.id) || staged.importBatch;

    return NextResponse.json({
      success: true,
      importBatch: latestBatch,
      summary: {
        totalRows: staged.importBatch.totalRows,
        addedCount: staged.importBatch.addedCount,
        updatedCount: staged.importBatch.updatedCount,
        conflictCount: staged.importBatch.conflictCount,
        missingCount: staged.importBatch.missingCount,
        invalidCount: staged.importBatch.invalidCount || 0,
        officialScores: parsed.officialScores,
        status: 'APPROVED',
      },
      message: 'Official tournament workbook successfully synced and published to live dashboard!',
    });
  } catch (err: any) {
    console.error('Sync workbook error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

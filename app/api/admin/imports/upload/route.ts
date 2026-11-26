import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminSessionToken } from '@/lib/auth';
import { getActiveSeason } from '@/lib/db/public';
import { parseExcelWorkbook } from '@/lib/importer/excel';
import { stageWorkbookDiff } from '@/lib/importer/diff';
import { approveImportBatch } from '@/lib/importer/approval';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const token = req.cookies.get('athlos_admin_session')?.value;
  const verified = verifyAdminSessionToken(token || '');
  if (!verified.valid || !verified.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const targetSheet = (formData.get('sheetName') as string) || undefined;
    const autoApprove = formData.get('autoApprove') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No Excel file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const activeSeason = getActiveSeason();

    // 1. Parse workbook
    const parsed = parseExcelWorkbook(buffer, targetSheet || activeSeason.slug);

    // 2. Stage Diff
    const staged = stageWorkbookDiff(
      activeSeason.id,
      file.name,
      'EXCEL',
      parsed,
      verified.user.email
    );

    let isApproved = false;
    let approvalError: string | undefined = undefined;

    // 3. Optional Immediate Auto-Approval (prevents serverless cross-container loss)
    if (autoApprove) {
      const approveResult = approveImportBatch(staged.importBatch.id, verified.user.email);
      if (approveResult.success) {
        isApproved = true;
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
      } else {
        approvalError = approveResult.error;
      }
    }

    const latestBatch = db.findById('import_batches', staged.importBatch.id) || staged.importBatch;

    return NextResponse.json({
      success: true,
      autoApproved: isApproved,
      approvalError,
      importBatch: latestBatch,
      summary: {
        totalRows: staged.importBatch.totalRows,
        addedCount: staged.importBatch.addedCount,
        updatedCount: staged.importBatch.updatedCount,
        conflictCount: staged.importBatch.conflictCount,
        missingCount: staged.importBatch.missingCount,
        invalidCount: staged.importBatch.invalidCount || 0,
        officialScores: parsed.officialScores,
        status: latestBatch.status,
      },
      warnings: parsed.warnings,
      message: isApproved
        ? `Workbook "${file.name}" uploaded, validated, and published directly to live dashboard!`
        : `Workbook "${file.name}" successfully parsed and staged for review.`,
    });
  } catch (err: any) {
    console.error('Import upload error:', err);
    return NextResponse.json({ error: err.message || 'Failed to process spreadsheet' }, { status: 500 });
  }
}

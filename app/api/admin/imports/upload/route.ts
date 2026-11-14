import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSessionToken } from '@/lib/auth';
import { getActiveSeason } from '@/lib/db/public';
import { parseExcelWorkbook } from '@/lib/importer/excel';
import { stageWorkbookDiff } from '@/lib/importer/diff';

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

    return NextResponse.json({
      success: true,
      importBatch: staged.importBatch,
      summary: {
        totalRows: staged.importBatch.totalRows,
        addedCount: staged.importBatch.addedCount,
        updatedCount: staged.importBatch.updatedCount,
        conflictCount: staged.importBatch.conflictCount,
        missingCount: staged.importBatch.missingCount,
      },
      warnings: parsed.warnings,
    });
  } catch (err: any) {
    console.error('Import upload error:', err);
    return NextResponse.json({ error: err.message || 'Failed to process spreadsheet' }, { status: 500 });
  }
}

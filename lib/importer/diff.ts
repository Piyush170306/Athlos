import crypto from 'crypto';
import { db } from '@/lib/db';
import { ParsedWorkbookResult, ParsedRawRow } from '@/lib/importer/excel';
import { ImportBatch, ImportRow, Match, OfficialBatchScore } from '@/lib/types';

export interface StagedDiffResult {
  importBatch: ImportBatch;
  importRows: ImportRow[];
}

export function stageWorkbookDiff(
  seasonId: string,
  fileName: string,
  fileType: 'EXCEL' | 'GOOGLE_SHEETS',
  parsed: ParsedWorkbookResult,
  actor: string
): StagedDiffResult {
  const existingMatches = db.query('matches', (m) => m.seasonId === seasonId);
  const existingOfficialScores = db.query('official_batch_scores', (s) => s.seasonId === seasonId);
  const batches = db.query('batches', (b) => b.seasonId === seasonId);
  const sports = db.query('sports', (s) => s.seasonId === seasonId);

  const additions: any[] = [];
  const updates: any[] = [];
  const conflicts: any[] = [];
  const missing: any[] = [];
  const invalids: any[] = [];
  const importRows: ImportRow[] = [];

  const batchIdMap: Record<string, string> = {}; // code -> id
  batches.forEach((b) => {
    batchIdMap[b.code] = b.id;
  });

  const matchedExistingIds = new Set<string>();

  // Process each parsed raw match row
  for (const row of parsed.matches) {
    if (!row.batchACode || (!row.batchBCode && !row.contendersRaw.includes('Athletics'))) {
      invalids.push({
        rowNumber: row.rowNumber,
        reason: 'Unable to resolve batch participants from contenders string: ' + row.contendersRaw,
        rawData: row,
      });
      continue;
    }

    const bAId = batchIdMap[row.batchACode] || row.batchACode;
    const bBId = row.batchBCode ? (batchIdMap[row.batchBCode] || row.batchBCode) : undefined;

    // Resolve sport
    const sportSlug = row.sportName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const sport = sports.find(
      (s) => s.slug === sportSlug || s.name.toLowerCase() === row.sportName.toLowerCase()
    );

    // Resolve category (Boys or Girls only)
    const targetCatId =
      row.formatName && row.formatName.toLowerCase().includes('girl')
        ? 'cat-girls'
        : 'cat-boys';

    // Disambiguate and find existing match
    const existing = existingMatches.find((m) => {
      if (matchedExistingIds.has(m.id)) return false;

      // 1. Exact sourceRowKey match
      if (m.sourceRowKey && m.sourceRowKey === row.sourceKey) return true;

      const sameSport = sport && m.sportId === sport.id;
      const sameCat = m.categoryId === targetCatId;
      const sameBatches =
        (m.batchAId === bAId && m.batchBId === bBId) ||
        (m.batchAId === bBId && m.batchBId === bAId);

      // 2. Sport + Category + Batches
      if (sameSport && sameCat && sameBatches) return true;

      // 3. Sport + Batches + Date
      if (sameSport && sameBatches && row.dateStr && m.scheduledDate === row.dateStr) return true;

      return false;
    });

    if (!existing) {
      // NEW RECORD -> INSERT
      const addData = {
        rowNumber: row.rowNumber,
        sportName: row.sportName,
        formatName: row.formatName,
        contendersRaw: row.contendersRaw,
        batchACode: row.batchACode,
        batchBCode: row.batchBCode,
        rawScore: row.rawScore,
        winnerCode: row.winnerCode,
        dateStr: row.dateStr,
        timeSlot: row.timeSlot,
        status: row.status,
      };
      additions.push(addData);

      importRows.push({
        id: `ir-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        importBatchId: '',
        sheetName: parsed.sheetName,
        rowNumber: row.rowNumber,
        entityType: 'MATCH',
        rawData: row as any,
        normalizedData: addData,
        operation: 'INSERT',
        status: 'PENDING',
      });
    } else {
      matchedExistingIds.add(existing.id);

      const targetWinnerId = row.winnerCode ? (batchIdMap[row.winnerCode] || row.winnerCode) : undefined;
      const scoreChanged = (row.rawScore || '') !== (existing.rawScore || '');
      const winnerChanged = (targetWinnerId || '') !== (existing.winnerBatchId || '');
      const statusChanged = row.status !== existing.status;
      const dateChanged = Boolean(row.dateStr && row.dateStr !== existing.scheduledDate);
      const slotChanged = Boolean(row.timeSlot && row.timeSlot !== existing.timeSlot);
      const catChanged = targetCatId !== existing.categoryId;

      const hasChanged = scoreChanged || winnerChanged || statusChanged || dateChanged || slotChanged || catChanged;

      if (hasChanged) {
        const afterData = {
          matchId: existing.id,
          rawScore: row.rawScore,
          winnerBatchId: targetWinnerId,
          status: row.status,
          scheduledDate: row.dateStr || existing.scheduledDate,
          timeSlot: row.timeSlot || existing.timeSlot,
          categoryId: targetCatId,
          sportName: row.sportName,
          formatName: row.formatName,
        };

        const isConflict = Boolean(existing.status === 'COMPLETED' && existing.winnerBatchId && winnerChanged);

        const updateData = {
          matchId: existing.id,
          rowNumber: row.rowNumber,
          before: {
            rawScore: existing.rawScore,
            winnerBatchId: existing.winnerBatchId,
            status: existing.status,
            scheduledDate: existing.scheduledDate,
            timeSlot: existing.timeSlot,
            categoryId: existing.categoryId,
          },
          after: afterData,
          conflictReason: isConflict
            ? 'Workbook winner conflicts with previously recorded completed match winner.'
            : undefined,
        };

        if (isConflict) {
          conflicts.push(updateData);
          importRows.push({
            id: `ir-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
            importBatchId: '',
            sheetName: parsed.sheetName,
            rowNumber: row.rowNumber,
            entityType: 'MATCH',
            rawData: row as any,
            normalizedData: afterData,
            operation: 'CONFLICT',
            conflictDetails: updateData,
            status: 'PENDING',
          });
        } else {
          updates.push(updateData);
          importRows.push({
            id: `ir-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
            importBatchId: '',
            sheetName: parsed.sheetName,
            rowNumber: row.rowNumber,
            entityType: 'MATCH',
            rawData: row as any,
            normalizedData: afterData,
            operation: 'UPDATE',
            status: 'PENDING',
          });
        }
      }
    }
  }

  // Check for MISSING rows (Mandate: Preserve missing records and flag them; never auto-delete!)
  for (const existing of existingMatches) {
    if (!matchedExistingIds.has(existing.id) && existing.sourceRowKey) {
      missing.push({
        matchId: existing.id,
        sourceRowKey: existing.sourceRowKey,
        sportId: existing.sportId,
        warning: 'Record existed in previous import but was not present in this spreadsheet.',
      });

      importRows.push({
        id: `ir-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        importBatchId: '',
        sheetName: parsed.sheetName,
        rowNumber: 0,
        entityType: 'MATCH',
        rawData: existing as any,
        normalizedData: { matchId: existing.id, isFlagged: true, discrepancyNote: 'Missing from latest spreadsheet source' },
        operation: 'MISSING_FROM_SOURCE',
        status: 'PENDING',
      });
    }
  }

  // Official Scores snapshot: Before vs After (Row 89 Batch Scores Table)
  const scoresBefore: Record<string, number> = {};
  existingOfficialScores.forEach((s) => {
    scoresBefore[s.batchCode] = s.totalPoints;
  });

  const batchId = `import-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

  const importBatch: ImportBatch = {
    id: batchId,
    seasonId,
    fileName,
    fileType,
    status: 'STAGED',
    totalRows: parsed.matches.length,
    addedCount: additions.length,
    updatedCount: updates.length,
    conflictCount: conflicts.length,
    missingCount: missing.length,
    invalidCount: invalids.length,
    diffSummary: {
      additions,
      updates,
      conflicts,
      missing,
      invalids,
      officialScoresBefore: scoresBefore,
      officialScoresAfter: parsed.officialScores,
      sportBreakdowns: parsed.sportBreakdowns,
    },
    createdAt: new Date().toISOString(),
    createdBy: actor,
  };

  // Associate batch ID with rows
  importRows.forEach((r) => {
    r.importBatchId = batchId;
  });

  // Store staged batch in DB
  db.insert('import_batches', importBatch);
  importRows.forEach((r) => db.insert('import_rows', r));

  db.logAudit(actor, 'IMPORT_STAGED', 'IMPORT_BATCH', batchId, {
    fileName,
    additions: additions.length,
    updates: updates.length,
    conflicts: conflicts.length,
    missing: missing.length,
  });

  return { importBatch, importRows };
}

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { db } from '@/lib/db';
import { getActiveSeason } from '@/lib/db/public';
import { parseExcelWorkbook } from '@/lib/importer/excel';
import { syncHighlightsFromMatches, syncPollsFromMatches } from '@/lib/importer/approval';
import { revalidatePath } from 'next/cache';
import { Match, OfficialBatchScore } from '@/lib/types';

let isSyncRunning = false;

export interface SyncResult {
  success: boolean;
  message: string;
  isUnchanged?: boolean;
  addedCount?: number;
  updatedCount?: number;
  unchangedCount?: number;
  skippedCount?: number;
  errors?: string[];
  officialScores?: Record<string, number>;
  lastAttemptAt: string;
  lastSuccessAt?: string;
  error?: string;
}

const DEFAULT_SPREADSHEET_ID = '1C7RNiyTwUwb5b6kQ7DRJFZDLqivcqthvUDmvGrGt6TE';
const DEFAULT_SPREADSHEET_URL =
  'https://docs.google.com/spreadsheets/d/1C7RNiyTwUwb5b6kQ7DRJFZDLqivcqthvUDmvGrGt6TE/edit?usp=sharing';
const DEFAULT_SPREADSHEET_NAME = 'ATHLOS War of Batches 2026–27 Master Schedule';

export async function syncGoogleSheet(
  actor: string = 'system_cron',
  options?: { force?: boolean }
): Promise<SyncResult> {
  const startedAt = new Date().toISOString();

  // Prevent overlapping synchronization jobs
  if (isSyncRunning) {
    return {
      success: false,
      message: 'A Google Sheets synchronization job is already running.',
      lastAttemptAt: startedAt,
    };
  }

  isSyncRunning = true;

  try {
    await db.syncFromRemote();
    const activeSeason = getActiveSeason();

    let config = db.getTable('google_sheets_config')[0];
    if (!config) {
      config = db.insert('google_sheets_config', {
        id: 'gs-config-default',
        seasonId: activeSeason.id,
        spreadsheetId: DEFAULT_SPREADSHEET_ID,
        spreadsheetName: DEFAULT_SPREADSHEET_NAME,
        spreadsheetUrl: DEFAULT_SPREADSHEET_URL,
        sheetName: '2026-27',
        syncFrequencyMinutes: 5,
        isActive: true,
      });
    } else {
      // Ensure spreadsheet ID and name are current
      if (!config.spreadsheetId) {
        db.update('google_sheets_config', config.id, {
          spreadsheetId: DEFAULT_SPREADSHEET_ID,
          spreadsheetName: DEFAULT_SPREADSHEET_NAME,
          spreadsheetUrl: DEFAULT_SPREADSHEET_URL,
        });
      }
    }

    db.update('google_sheets_config', config.id, {
      lastAttemptAt: startedAt,
    });

    const spreadsheetId = config.spreadsheetId || DEFAULT_SPREADSHEET_ID;
    const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=xlsx`;

    let buffer: Buffer | null = null;
    let fetchSource = 'GOOGLE_SHEETS_EXPORT';

    // 1. Fetch live workbook from Google Sheets
    try {
      const res = await fetch(exportUrl, {
        headers: {
          'User-Agent': 'ATHLOS-Sync-Engine/2.0',
        },
        cache: 'no-store',
        redirect: 'follow',
      });

      if (res.ok) {
        const arrayBuf = await res.arrayBuffer();
        buffer = Buffer.from(arrayBuf);
      } else {
        console.warn(`Direct Google export returned ${res.status}, falling back to local master`);
      }
    } catch (netErr: any) {
      console.warn('Network error while querying Google Sheets export:', netErr?.message);
    }

    // Fallback to local master workbook if external network is unavailable
    if (!buffer || buffer.length === 0) {
      const localPath = path.join(process.cwd(), 'wob_2026-27_official_workbook_v1.xlsx');
      if (fs.existsSync(localPath)) {
        buffer = fs.readFileSync(localPath);
        fetchSource = 'LOCAL_MASTER_FALLBACK';
      } else {
        throw new Error('Unable to connect to Google Sheets and local master workbook is missing.');
      }
    }

    // 2. Compute SHA256 content hash for change detection
    const currentHash = crypto.createHash('sha256').update(buffer).digest('hex');
    const isContentUnchanged = config.lastContentHash === currentHash;

    if (isContentUnchanged && !options?.force) {
      const completedAt = new Date().toISOString();
      db.update('google_sheets_config', config.id, {
        lastSuccessAt: completedAt,
        lastError: undefined,
      });

      return {
        success: true,
        isUnchanged: true,
        message: 'Google Sheets content is unchanged. No modifications detected.',
        lastAttemptAt: startedAt,
        lastSuccessAt: completedAt,
        addedCount: 0,
        updatedCount: 0,
        unchangedCount: config.lastSummary?.unchangedCount || 72,
        skippedCount: 0,
        errors: [],
        officialScores: config.lastSummary?.officialScores || {},
      };
    }

    // 3. Parse entire workbook
    const wb = XLSX.read(buffer, { type: 'buffer', cellDates: true, cellFormula: true });
    const detectedSheets = wb.SheetNames;

    // 4. Parse 2026–27 Current Season
    const currentSheetName = detectedSheets.includes('2026-27') ? '2026-27' : detectedSheets[0];
    const parsedCurrent = parseExcelWorkbook(buffer, currentSheetName);

    let addedCount = 0;
    let updatedCount = 0;
    let unchangedCount = 0;
    let skippedCount = 0;
    const errors: string[] = [...parsedCurrent.warnings];

    const batches = db.query('batches', (b) => b.seasonId === activeSeason.id);
    const sports = db.query('sports', (s) => s.seasonId === activeSeason.id);
    const existingMatches = db.query('matches', (m) => m.seasonId === activeSeason.id);

    const batchIdMap: Record<string, string> = {};
    batches.forEach((b) => (batchIdMap[b.code] = b.id));

    const sportsMap: Record<string, string> = {};
    sports.forEach((s) => {
      sportsMap[s.slug] = s.id;
      sportsMap[s.name.toLowerCase()] = s.id;
    });

    const now = new Date().toISOString();
    const processedMatchIds = new Set<string>();

    // Reconcile matches for season-2026-27
    for (const row of parsedCurrent.matches) {
      if (!row.batchACode || (!row.batchBCode && !row.contendersRaw.includes('Athletics'))) {
        skippedCount++;
        errors.push(`Row ${row.rowNumber}: Unable to parse contenders "${row.contendersRaw}"`);
        continue;
      }

      const bAId = batchIdMap[row.batchACode] || row.batchACode;
      const bBId = row.batchBCode ? (batchIdMap[row.batchBCode] || row.batchBCode) : undefined;

      const sportSlug = row.sportName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const sportId = sportsMap[sportSlug] || sportsMap[row.sportName.toLowerCase()] || `sport-${sportSlug}`;
      const categoryId = row.formatName && row.formatName.toLowerCase().includes('girl') ? 'cat-girls' : 'cat-boys';

      const targetId = `match-${activeSeason.id}-${row.rowNumber}`;
      const targetRowKey = `row-${row.rowNumber}-${row.sportName}-${row.contendersRaw}`.toLowerCase().replace(/\s+/g, '-');

      // Find existing match by ID, sourceRowKey, or sport+category+batches
      let existing = existingMatches.find((m) => {
        if (m.id === targetId) return true;
        if (m.sourceRowKey && m.sourceRowKey === targetRowKey) return true;
        const sameSport = m.sportId === sportId;
        const sameCat = m.categoryId === categoryId;
        const sameBatches =
          (m.batchAId === bAId && m.batchBId === bBId) ||
          (m.batchAId === bBId && m.batchBId === bAId);
        return sameSport && sameCat && sameBatches;
      });

      const winnerBatchId = row.winnerCode && batchIdMap[row.winnerCode] ? batchIdMap[row.winnerCode] : undefined;

      if (!existing) {
        // Insert new match with deterministic ID
        const newMatch: Match = {
          id: targetId,
          seasonId: activeSeason.id,
          sportId,
          categoryId,
          batchAId: bAId,
          batchBId: bBId,
          scheduledDate: row.dateStr,
          timeSlot: row.timeSlot || 'Morning',
          status: row.status,
          rawScore: row.rawScore,
          winnerBatchId,
          sourceRowKey: targetRowKey,
          createdAt: now,
          updatedAt: now,
        };
        db.insert('matches', newMatch);
        processedMatchIds.add(newMatch.id);
        addedCount++;
      } else {
        processedMatchIds.add(existing.id);

        // Check for field changes
        const dateChanged = Boolean(row.dateStr && row.dateStr !== existing.scheduledDate);
        const slotChanged = Boolean(row.timeSlot && row.timeSlot !== existing.timeSlot);
        const scoreChanged = (row.rawScore || '') !== (existing.rawScore || '');
        const winnerChanged = (winnerBatchId || '') !== (existing.winnerBatchId || '');
        const statusChanged = row.status !== existing.status;

        if (dateChanged || slotChanged || scoreChanged || winnerChanged || statusChanged) {
          db.update('matches', existing.id, {
            scheduledDate: row.dateStr || existing.scheduledDate,
            timeSlot: row.timeSlot || existing.timeSlot,
            rawScore: row.rawScore !== undefined ? row.rawScore : existing.rawScore,
            winnerBatchId: winnerBatchId !== undefined ? winnerBatchId : existing.winnerBatchId,
            status: row.status,
            sourceRowKey: targetRowKey,
            updatedAt: now,
          });
          updatedCount++;
        } else {
          unchangedCount++;
        }
      }
    }

    // Safe Deletion Policy:
    // If a previously existing match is missing from the spreadsheet, DO NOT permanently delete it.
    // Mark as flagged and retained with discrepancy note.
    for (const m of existingMatches) {
      if (!processedMatchIds.has(m.id)) {
        if (!m.isFlagged) {
          db.update('matches', m.id, {
            isFlagged: true,
            discrepancyNote: 'Retained: missing from latest Google Spreadsheet synchronization.',
            updatedAt: now,
          });
        }
        skippedCount++;
      }
    }

    // 5. Update Official Batch Scores (Batch Scores Table Authority)
    for (const [code, pts] of Object.entries(parsedCurrent.officialScores)) {
      const existingScore = db.query(
        'official_batch_scores',
        (s) => s.seasonId === activeSeason.id && s.batchCode === code
      )[0];

      const breakdown = parsedCurrent.sportBreakdowns[code] || existingScore?.breakdownBySport || {};

      if (existingScore) {
        db.update('official_batch_scores', existingScore.id, {
          totalPoints: pts,
          breakdownBySport: breakdown,
          lastApprovedAt: now,
          lastApprovedBy: `sheets_sync:${actor}`,
        });
      }
    }

    // Recalculate official leaderboard ranks descending by totalPoints
    const seasonScores = db.query('official_batch_scores', (s) => s.seasonId === activeSeason.id);
    const sorted = [...seasonScores].sort((a, b) => b.totalPoints - a.totalPoints);
    sorted.forEach((score, idx) => {
      db.update('official_batch_scores', score.id, { rank: idx + 1 });
    });

    // 6. Update Highlights and Polls from reconciled match results
    syncHighlightsFromMatches(activeSeason.id);
    syncPollsFromMatches(activeSeason.id);

    // 7. Synchronize Historical Seasons if present in the Google Spreadsheet
    const historicalSheetConfigs: Array<{ sheet: string; seasonSlug: string; seasonId: string; totalRowHint: number }> = [
      { sheet: '2025-26', seasonSlug: '2025-26', seasonId: 'season-2025-26', totalRowHint: 79 },
      { sheet: '2024-25', seasonSlug: '2024-25', seasonId: 'season-2024-25', totalRowHint: 76 },
      { sheet: '2023-24', seasonSlug: '2023-24', seasonId: 'season-2023-24', totalRowHint: 45 },
      { sheet: '2022-23', seasonSlug: '2022-23', seasonId: 'season-2022-23', totalRowHint: 40 },
    ];

    for (const hConfig of historicalSheetConfigs) {
      if (detectedSheets.includes(hConfig.sheet)) {
        try {
          const parsedHistorical = parseExcelWorkbook(buffer, hConfig.sheet);
          for (const [code, pts] of Object.entries(parsedHistorical.officialScores)) {
            const hScore = db.query(
              'official_batch_scores',
              (s) => s.seasonId === hConfig.seasonId && s.batchCode === code
            )[0];
            if (hScore && hScore.totalPoints !== pts) {
              db.update('official_batch_scores', hScore.id, {
                totalPoints: pts,
                lastApprovedAt: now,
                lastApprovedBy: `sheets_sync:${actor}`,
              });
            }
          }
        } catch (hErr: any) {
          console.warn(`Historical sync note for ${hConfig.sheet}:`, hErr?.message);
        }
      }
    }

    const completedAt = new Date().toISOString();

    const summary = {
      addedCount,
      updatedCount,
      unchangedCount,
      skippedCount,
      errors,
      officialScores: parsedCurrent.officialScores,
    };

    const historyItem = {
      id: `sync-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      startedAt,
      completedAt,
      status: 'SUCCESS' as const,
      actor,
      addedCount,
      updatedCount,
      unchangedCount,
      skippedCount,
      errors,
      message: `Synchronized ${addedCount} added, ${updatedCount} updated, ${unchangedCount} unchanged fixtures via ${fetchSource}.`,
    };

    const existingHistory = config.syncHistory || [];
    const updatedHistory = [historyItem, ...existingHistory].slice(0, 20);

    db.update('google_sheets_config', config.id, {
      lastAttemptAt: startedAt,
      lastSuccessAt: completedAt,
      lastError: undefined,
      lastContentHash: currentHash,
      lastSummary: summary,
      syncHistory: updatedHistory,
      isActive: true,
    });

    db.logAudit(actor, 'GOOGLE_SHEETS_LIVE_SYNC', 'SYNC', spreadsheetId, {
      source: fetchSource,
      added: addedCount,
      updated: updatedCount,
      unchanged: unchangedCount,
      skipped: skippedCount,
      officialScores: parsedCurrent.officialScores,
    });

    // 8. Commit to Upstash Redis shared production store
    await db.saveToRemote();

    // 9. Revalidate Next.js edge cache so public website reflects changes immediately
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/');
      revalidatePath('/matches');
      revalidatePath('/leaderboard');
      revalidatePath('/highlights');
      revalidatePath('/polls');
      revalidatePath('/history');
      revalidatePath('/sports/[slug]', 'page');
    } catch {}

    return {
      success: true,
      message: `Google Sheets live sync complete: ${addedCount} additions, ${updatedCount} updates, ${unchangedCount} unchanged, ${skippedCount} retained.`,
      addedCount,
      updatedCount,
      unchangedCount,
      skippedCount,
      errors,
      officialScores: parsedCurrent.officialScores,
      lastAttemptAt: startedAt,
      lastSuccessAt: completedAt,
    };
  } catch (err: any) {
    console.error('Google Sheets live synchronization error:', err);
    const failedAt = new Date().toISOString();

    const config = db.getTable('google_sheets_config')[0];
    if (config) {
      const historyItem = {
        id: `sync-err-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
        startedAt,
        completedAt: failedAt,
        status: 'FAILED' as const,
        actor,
        addedCount: 0,
        updatedCount: 0,
        unchangedCount: 0,
        skippedCount: 0,
        errors: [err.message],
        message: `Sync failed: ${err.message}`,
      };
      const existingHistory = config.syncHistory || [];
      db.update('google_sheets_config', config.id, {
        lastAttemptAt: startedAt,
        lastError: err.message,
        syncHistory: [historyItem, ...existingHistory].slice(0, 20),
      });
      await db.saveToRemote().catch(() => {});
    }

    db.logAudit(actor, 'GOOGLE_SHEETS_SYNC_FAILED', 'SYNC', undefined, { error: err.message });

    return {
      success: false,
      message: `Synchronization failed: ${err.message}`,
      error: err.message,
      lastAttemptAt: startedAt,
    };
  } finally {
    isSyncRunning = false;
  }
}

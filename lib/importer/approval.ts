import { db } from '@/lib/db';
import { ImportBatch, RecordVersion, Match, OfficialBatchScore } from '@/lib/types';
import crypto from 'crypto';

export function syncHighlightsFromMatches(seasonId: string): void {
  const completedMatches = db.query(
    'matches',
    (m) => m.seasonId === seasonId && m.status === 'COMPLETED' && Boolean(m.winnerBatchId)
  );

  const batches = db.query('batches', (b) => b.seasonId === seasonId);
  const sports = db.query('sports', (s) => s.seasonId === seasonId);
  const existingHighlights = db.query('highlights', (h) => h.seasonId === seasonId);

  const completedMatchIds = new Set(completedMatches.map((m) => m.id));

  // 1. Remove highlights for matches that are no longer completed
  for (const hl of existingHighlights) {
    if (hl.matchId && !completedMatchIds.has(hl.matchId)) {
      db.delete('highlights', hl.id);
    }
  }

  // 2. Add or update highlights for each completed match
  let sortOrder = 1;
  for (const match of completedMatches) {
    const winner = batches.find((b) => b.id === match.winnerBatchId);
    const loser = batches.find(
      (b) => (b.id === match.batchAId || b.id === match.batchBId) && b.id !== match.winnerBatchId
    );
    const sport = sports.find((s) => s.id === match.sportId);
    const sportName = sport ? sport.name : 'Match';
    const catName = match.categoryId === 'cat-girls' ? 'Girls' : 'Boys';

    if (!winner) continue;

    let title = '';
    let content = '';

    if (loser) {
      if (match.rawScore) {
        title = `${winner.code} defeated ${loser.code} (${match.rawScore}) in ${sportName}`;
        content = `${winner.code} secured victory over ${loser.code} with a score of ${match.rawScore} in ${sportName} (${catName}).`;
      } else {
        title = `${winner.code} defeated ${loser.code} in ${sportName}`;
        content = `${winner.code} defeated ${loser.code} in the ${sportName} (${catName}) fixture.`;
      }
    } else {
      title = `${winner.code} won the ${sportName} event`;
      content = `${winner.code} emerged victorious in ${sportName} (${catName}).`;
    }

    const existingHl = existingHighlights.find((h) => h.matchId === match.id);
    const publishedAt = match.scheduledDate
      ? `${match.scheduledDate}T20:00:00.000Z`
      : new Date().toISOString();

    if (existingHl) {
      db.update('highlights', existingHl.id, {
        title,
        content,
        publishedAt,
      });
    } else {
      db.insert('highlights', {
        id: `hl-${match.id}`,
        seasonId,
        title,
        content,
        matchId: match.id,
        isPinned: sortOrder === 1,
        sortOrder: sortOrder++,
        publishedAt,
        author: 'ATHLOS Committee',
      });
    }
  }
}

export function syncPollsFromMatches(seasonId: string): void {
  const allMatches = db.query('matches', (m) => m.seasonId === seasonId);
  const allPolls = db.query('polls', (p) => p.seasonId === seasonId);

  // Close polls for matches that are now COMPLETED or CANCELLED
  for (const poll of allPolls) {
    if (poll.status === 'OPEN') {
      const match = allMatches.find((m) => m.id === poll.matchId);
      if (match && (match.status === 'COMPLETED' || match.status === 'CANCELLED')) {
        db.update('polls', poll.id, {
          status: 'CLOSED',
          closedAt: new Date().toISOString(),
        });
      }
    }
  }
}

export function approveImportBatch(
  importBatchId: string,
  approverEmail: string
): { success: boolean; error?: string } {
  const batch = db.findById('import_batches', importBatchId);
  if (!batch) {
    return { success: false, error: 'Import batch not found.' };
  }

  if (batch.status !== 'STAGED') {
    return { success: false, error: `Cannot approve batch in "${batch.status}" state.` };
  }

  const importRows = db.query('import_rows', (r) => r.importBatchId === importBatchId);
  const now = new Date().toISOString();
  const batches = db.query('batches', (b) => b.seasonId === batch.seasonId);
  const batchIdMap: Record<string, string> = {};
  batches.forEach((b) => (batchIdMap[b.code] = b.id));

  // 1. Process Insert rows
  for (const row of importRows.filter((r) => r.operation === 'INSERT')) {
    const data = row.normalizedData;
    const sportSlug = data.sportName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    let sport = db.query(
      'sports',
      (s) =>
        s.seasonId === batch.seasonId &&
        (s.slug === sportSlug || s.name.toLowerCase() === data.sportName.toLowerCase())
    )[0];

    if (!sport) {
      sport = db.insert('sports', {
        id: `sport-${sportSlug}`,
        seasonId: batch.seasonId,
        name: data.sportName,
        slug: sportSlug,
        description: `Official ${data.sportName} tournament fixtures for War of Batches`,
        scoreFormatType: 'SCORE',
        enabled: true,
      });
    }

    const normStatus =
      data.status ||
      (data.winnerCode || (data.rawScore && data.rawScore !== '0') ? 'COMPLETED' : 'UPCOMING');

    const targetCatId =
      data.formatName && data.formatName.toLowerCase().includes('girl')
        ? 'cat-girls'
        : 'cat-boys';

    const stableMatchId = row.rowNumber
      ? `match-${batch.seasonId}-${row.rowNumber}`
      : `match-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

    const newMatch: Match = {
      id: stableMatchId,
      seasonId: batch.seasonId,
      sportId: sport ? sport.id : 'sport-general',
      categoryId: targetCatId,
      batchAId: batchIdMap[data.batchACode] || data.batchACode,
      batchBId: data.batchBCode ? batchIdMap[data.batchBCode] || data.batchBCode : undefined,
      scheduledDate: data.dateStr,
      timeSlot: data.timeSlot,
      status: normStatus,
      rawScore: data.rawScore,
      winnerBatchId: data.winnerCode ? batchIdMap[data.winnerCode] : undefined,
      sourceRowKey: `row-${row.rowNumber}-${data.sportName}-${data.contendersRaw}`
        .toLowerCase()
        .replace(/\s+/g, '-'),
      createdAt: now,
      updatedAt: now,
    };

    db.insert('matches', newMatch);

    // Save record version snapshot for rollback
    db.insert('record_versions', {
      id: `rv-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
      entityType: 'MATCH',
      entityId: newMatch.id,
      importBatchId,
      beforeSnapshot: null,
      afterSnapshot: newMatch,
      createdAt: now,
      createdBy: approverEmail,
    });
  }

  // 2. Process Update and Conflict rows (Persist all updated scores, winners, and statuses)
  for (const row of importRows.filter((r) => r.operation === 'UPDATE' || r.operation === 'CONFLICT')) {
    const targetMatchId =
      row.normalizedData?.matchId ||
      row.conflictDetails?.matchId ||
      row.conflictDetails?.after?.matchId;

    if (targetMatchId) {
      const existing = db.findById('matches', targetMatchId);
      if (existing) {
        // Snapshot before state
        db.insert('record_versions', {
          id: `rv-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
          entityType: 'MATCH',
          entityId: existing.id,
          importBatchId,
          beforeSnapshot: existing,
          afterSnapshot: { ...existing, ...row.normalizedData },
          createdAt: now,
          createdBy: approverEmail,
        });

        const updates: Partial<Match> = {
          rawScore:
            row.normalizedData.rawScore !== undefined ? row.normalizedData.rawScore : existing.rawScore,
          winnerBatchId:
            row.normalizedData.winnerBatchId !== undefined
              ? row.normalizedData.winnerBatchId
              : existing.winnerBatchId,
          status:
            row.normalizedData.status ||
            (row.normalizedData.winnerBatchId || row.normalizedData.rawScore
              ? 'COMPLETED'
              : existing.status),
          scheduledDate: row.normalizedData.scheduledDate || existing.scheduledDate,
          timeSlot: row.normalizedData.timeSlot || existing.timeSlot,
          categoryId: row.normalizedData.categoryId || existing.categoryId,
          updatedAt: now,
        };

        db.update('matches', existing.id, updates);
      }
    }
  }

  // 3. Process Missing from source rows (Preserve and flag)
  for (const row of importRows.filter((r) => r.operation === 'MISSING_FROM_SOURCE')) {
    const targetMatchId = row.normalizedData.matchId;
    if (targetMatchId) {
      db.update('matches', targetMatchId, {
        isFlagged: true,
        discrepancyNote: 'Retained: missing from latest approved spreadsheet source.',
      });
    }
  }

  // 4. Update Official Batch Scores (Row 89 Batch Scores Table Authority)
  const afterScores = batch.diffSummary.officialScoresAfter || {};
  const sportBreakdowns = batch.diffSummary.sportBreakdowns || {};
  const existingScores = db.query('official_batch_scores', (s) => s.seasonId === batch.seasonId);

  // Snapshot before official scores
  db.insert('record_versions', {
    id: `rv-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    entityType: 'OFFICIAL_SCORE',
    entityId: `season-${batch.seasonId}-scores`,
    importBatchId,
    beforeSnapshot: batch.diffSummary.officialScoresBefore,
    afterSnapshot: afterScores,
    createdAt: now,
    createdBy: approverEmail,
  });

  // Calculate wins per batch from completed matches
  const completedMatches = db.query(
    'matches',
    (m) => m.seasonId === batch.seasonId && m.status === 'COMPLETED'
  );
  const winsMap: Record<string, number> = {};
  for (const m of completedMatches) {
    if (m.winnerBatchId && m.winnerBatchId !== 'DRAW') {
      winsMap[m.winnerBatchId] = (winsMap[m.winnerBatchId] || 0) + 1;
    }
  }

  for (const [code, pts] of Object.entries(afterScores)) {
    const existing = existingScores.find((s) => s.batchCode === code);
    if (existing) {
      const bWins = winsMap[existing.batchId] !== undefined ? winsMap[existing.batchId] : existing.wins;
      const bBreakdown = sportBreakdowns[code] || existing.breakdownBySport || {};
      db.update('official_batch_scores', existing.id, {
        totalPoints: pts,
        wins: bWins,
        breakdownBySport: bBreakdown,
        sourceRow: 89,
        lastApprovedAt: now,
        lastApprovedBy: approverEmail,
      });
    }
  }

  // Recalculate ranks based on totalPoints descending
  const seasonScores = db.query('official_batch_scores', (s) => s.seasonId === batch.seasonId);
  const sorted = [...seasonScores].sort((a, b) => b.totalPoints - a.totalPoints);
  sorted.forEach((score, idx) => {
    db.update('official_batch_scores', score.id, { rank: idx + 1 });
  });

  // 5. Synchronize Highlights and Polls from updated match results
  syncHighlightsFromMatches(batch.seasonId);
  syncPollsFromMatches(batch.seasonId);

  // 6. Update Import Batch record to APPROVED
  db.update('import_batches', importBatchId, {
    status: 'APPROVED',
    approvedAt: now,
    approvedBy: approverEmail,
  });

  // Mark all rows as APPROVED
  importRows.forEach((r) => {
    db.update('import_rows', r.id, { status: 'APPROVED' });
  });

  db.logAudit(approverEmail, 'IMPORT_APPROVED', 'IMPORT_BATCH', importBatchId, {
    fileName: batch.fileName,
    approvedAt: now,
  });

  return { success: true };
}

export function rejectImportBatch(
  importBatchId: string,
  rejecterEmail: string
): { success: boolean; error?: string } {
  const batch = db.findById('import_batches', importBatchId);
  if (!batch) {
    return { success: false, error: 'Import batch not found.' };
  }

  if (batch.status !== 'STAGED') {
    return { success: false, error: `Cannot reject batch in "${batch.status}" state.` };
  }

  db.update('import_batches', importBatchId, {
    status: 'REJECTED',
  });

  const importRows = db.query('import_rows', (r) => r.importBatchId === importBatchId);
  importRows.forEach((r) => {
    db.update('import_rows', r.id, { status: 'REJECTED' });
  });

  db.logAudit(rejecterEmail, 'IMPORT_REJECTED', 'IMPORT_BATCH', importBatchId, {
    fileName: batch.fileName,
  });

  return { success: true };
}

export function rollbackImportBatch(
  importBatchId: string,
  actorEmail: string
): { success: boolean; error?: string; conflictingRecords?: string[] } {
  const batch = db.findById('import_batches', importBatchId);
  if (!batch) {
    return { success: false, error: 'Import batch not found.' };
  }

  if (batch.status !== 'APPROVED') {
    return { success: false, error: `Can only rollback an APPROVED batch. Current status: ${batch.status}` };
  }

  const versions = db.query('record_versions', (v) => v.importBatchId === importBatchId);
  const now = new Date().toISOString();
  const conflictingRecords: string[] = [];

  // Check for conflicts: Has any match touched by this import been modified by a later event?
  for (const v of versions.filter((v) => v.entityType === 'MATCH')) {
    const current = db.findById('matches', v.entityId);
    if (current && v.afterSnapshot) {
      if (current.updatedAt > batch.approvedAt! && current.rawScore !== v.afterSnapshot.rawScore) {
        conflictingRecords.push(
          `Match ${current.id} was independently edited after this import (${current.rawScore}).`
        );
      }
    }
  }

  if (conflictingRecords.length > 0) {
    return {
      success: false,
      error: 'Rollback halted: subsequent manual edits detected on records affected by this import.',
      conflictingRecords,
    };
  }

  // Execute safe revert
  for (const v of versions) {
    if (v.entityType === 'MATCH') {
      if (v.beforeSnapshot === null) {
        // Record was INSERTED by this import -> Remove it
        db.delete('matches', v.entityId);
      } else {
        // Record was UPDATED -> Restore before snapshot
        db.update('matches', v.entityId, {
          rawScore: v.beforeSnapshot.rawScore,
          winnerBatchId: v.beforeSnapshot.winnerBatchId,
          status: v.beforeSnapshot.status,
          scheduledDate: v.beforeSnapshot.scheduledDate,
          timeSlot: v.beforeSnapshot.timeSlot,
          categoryId: v.beforeSnapshot.categoryId,
          updatedAt: now,
        });
      }
    } else if (v.entityType === 'OFFICIAL_SCORE') {
      const beforeScores = v.beforeSnapshot || {};
      const existingScores = db.query('official_batch_scores', (s) => s.seasonId === batch.seasonId);
      for (const [code, pts] of Object.entries(beforeScores)) {
        const existing = existingScores.find((s) => s.batchCode === code);
        if (existing) {
          db.update('official_batch_scores', existing.id, {
            totalPoints: pts as number,
            lastApprovedAt: now,
            lastApprovedBy: `${actorEmail} (rollback)`,
          });
        }
      }
    }
  }

  // Recalculate wins per batch
  const completedMatches = db.query(
    'matches',
    (m) => m.seasonId === batch.seasonId && m.status === 'COMPLETED'
  );
  const winsMap: Record<string, number> = {};
  for (const m of completedMatches) {
    if (m.winnerBatchId && m.winnerBatchId !== 'DRAW') {
      winsMap[m.winnerBatchId] = (winsMap[m.winnerBatchId] || 0) + 1;
    }
  }

  const existingScores = db.query('official_batch_scores', (s) => s.seasonId === batch.seasonId);
  for (const s of existingScores) {
    const bWins = winsMap[s.batchId] !== undefined ? winsMap[s.batchId] : 0;
    db.update('official_batch_scores', s.id, { wins: bWins });
  }

  // Recalculate ranks
  const sorted = [...existingScores].sort((a, b) => b.totalPoints - a.totalPoints);
  sorted.forEach((score, idx) => {
    db.update('official_batch_scores', score.id, { rank: idx + 1 });
  });

  // Re-sync highlights and polls
  syncHighlightsFromMatches(batch.seasonId);
  syncPollsFromMatches(batch.seasonId);

  db.update('import_batches', importBatchId, {
    status: 'ROLLED_BACK',
    rolledBackAt: now,
    rolledBackBy: actorEmail,
  });

  db.logAudit(actorEmail, 'IMPORT_ROLLED_BACK', 'IMPORT_BATCH', importBatchId, {
    fileName: batch.fileName,
    revertedRecordsCount: versions.length,
  });

  return { success: true };
}

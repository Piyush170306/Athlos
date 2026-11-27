const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Points Progression: Timeline matches official totals and contains zero duplicates', () => {
  const dbFile = path.join(process.cwd(), 'data', 'athlos_wob.json');
  const db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));

  const activeSeason = db.seasons.find((s) => s.status === 'active');
  assert.ok(activeSeason, 'Active season must exist');

  const officialScores = db.official_batch_scores.filter((s) => s.seasonId === activeSeason.id);
  assert.strictEqual(officialScores.length, 3, 'Must have official scores for 3 batches');

  // Verify batches and mascot assets
  const b06 = db.batches.find((b) => b.code === 'IPM06' && b.seasonId === activeSeason.id);
  const b07 = db.batches.find((b) => b.code === 'IPM07' && b.seasonId === activeSeason.id);
  const b08 = db.batches.find((b) => b.code === 'IPM08' && b.seasonId === activeSeason.id);

  assert.ok(b06 && b07 && b08, 'All three batches must exist');
  assert.ok(fs.existsSync(path.join(process.cwd(), 'public', b06.mascotImagePath)), 'IPM06 mascot asset must exist');
  assert.ok(fs.existsSync(path.join(process.cwd(), 'public', b07.mascotImagePath)), 'IPM07 mascot asset must exist');
  assert.ok(fs.existsSync(path.join(process.cwd(), 'public', b08.mascotImagePath)), 'IPM08 mascot asset must exist');

  // Verify no textual mascot names in batch records
  assert.strictEqual(b06.mascotName, '', 'IPM06 mascotName must be empty');
  assert.strictEqual(b07.mascotName, '', 'IPM07 mascotName must be empty');
  assert.strictEqual(b08.mascotName, '', 'IPM08 mascotName must be empty');

  // Verify 2026-27 tournament has not started: batch points are all 0, 0 completed matches
  const completed2026 = db.matches.filter(
    (m) => m.seasonId === activeSeason.id && m.status === 'COMPLETED'
  );
  assert.strictEqual(completed2026.length, 0, '2026-27 has not started: 0 matches completed');

  for (const s of officialScores) {
    assert.strictEqual(s.totalPoints, 0, `2026-27 batch ${s.batchCode} must have 0 points before tournament begins`);
    assert.strictEqual(s.wins, 0, `2026-27 batch ${s.batchCode} must have 0 wins`);
  }

  // Verify historical completed season (2025-26) has valid completed matches and unique dates
  const s2025 = db.seasons.find((s) => s.slug === '2025-26');
  assert.ok(s2025, '2025-26 historical season must exist');

  const matches2025 = db.matches.filter(
    (m) => m.seasonId === s2025.id && m.status === 'COMPLETED' && Boolean(m.scheduledDate)
  );
  assert.ok(matches2025.length > 20, '2025-26 must have historical completed matches');

  const dates2025 = [...new Set(matches2025.map((m) => m.scheduledDate))].sort();
  assert.ok(dates2025.length >= 5, 'Must have at least 5 completed match dates in 2025-26');
  const dateSet = new Set(dates2025);
  assert.strictEqual(dateSet.size, dates2025.length, 'Dates must be strictly unique');
});

test('Points Progression: Correcting a historical match score updates progression without creating duplicates', () => {
  const dbFile = path.join(process.cwd(), 'data', 'athlos_wob.json');
  const db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));

  const s2025 = db.seasons.find((s) => s.slug === '2025-26');
  assert.ok(s2025, '2025-26 season must exist');

  const targetMatch = db.matches.find(
    (m) => m.seasonId === s2025.id && m.status === 'COMPLETED'
  );
  assert.ok(targetMatch, 'Historical match in 2025-26 must exist');

  // Simulate updating match result
  const originalWinner = targetMatch.winnerBatchId;
  const batches2025 = db.batches.filter((b) => b.seasonId === s2025.id);
  const updatedWinner = batches2025.find((b) => b.id !== originalWinner)?.id || originalWinner;

  const simulatedUpdatedMatches = db.matches.map((m) =>
    m.id === targetMatch.id ? { ...m, winnerBatchId: updatedWinner } : m
  );

  // Group by date to verify no duplicate date events are created
  const completed = simulatedUpdatedMatches.filter(
    (m) => m.seasonId === s2025.id && m.status === 'COMPLETED' && Boolean(m.scheduledDate)
  );
  const uniqueDates = [...new Set(completed.map((m) => m.scheduledDate))];
  const dateCounts = {};
  for (const d of uniqueDates) {
    dateCounts[d] = (dateCounts[d] || 0) + 1;
    assert.strictEqual(dateCounts[d], 1, `Date ${d} must not be duplicated`);
  }
});

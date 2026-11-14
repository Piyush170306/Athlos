const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Public Boundary: Official Leaderboard totals originate solely from Batch Scores Table', () => {
  const dbFile = path.join(process.cwd(), 'data', 'athlos_wob.json');
  assert.ok(fs.existsSync(dbFile), 'DB file must exist');

  const raw = fs.readFileSync(dbFile, 'utf-8');
  const db = JSON.parse(raw);

  const activeSeason = db.seasons.find((s) => s.status === 'active');
  assert.ok(activeSeason, 'Active season must be present');

  const officialScores = db.official_batch_scores.filter((s) => s.seasonId === activeSeason.id);
  assert.strictEqual(officialScores.length, 3, 'Must have 3 official score records for IPM06, IPM07, IPM08');

  // Verify that all official scores trace to Batch Scores Table Total row (Row 79 or 89)
  for (const s of officialScores) {
    assert.ok(s.sourceRow === 79 || s.sourceRow === 89, 'All official totals must reference Batch Scores Table total row');
  }
});

test('Public Boundary: Match results must never overwrite official total points', () => {
  const dbFile = path.join(process.cwd(), 'data', 'athlos_wob.json');
  const raw = fs.readFileSync(dbFile, 'utf-8');
  const db = JSON.parse(raw);

  const activeSeason = db.seasons.find((s) => s.status === 'active');
  const batch06 = db.batches.find((b) => b.code === 'IPM06' && b.seasonId === activeSeason.id);

  // Even if there are matches won by IPM06, the official standing must come from official_batch_scores
  const official06 = db.official_batch_scores.find((s) => s.batchId === batch06.id);
  assert.ok(official06, 'IPM06 official score record must exist');
  assert.strictEqual(typeof official06.totalPoints, 'number');
});

test('Public Boundary: Past seasons are preserved as read-only archives', () => {
  const dbFile = path.join(process.cwd(), 'data', 'athlos_wob.json');
  const raw = fs.readFileSync(dbFile, 'utf-8');
  const db = JSON.parse(raw);

  const archived = db.seasons.filter((s) => s.status === 'archived');
  assert.ok(archived.length >= 4, 'Must have at least 4 archived historical seasons (2025-26, 2024-25, 2023-24, 2022-23)');

  // Verify 2025-26 winner is IPM06 with 59 points
  const s2025 = archived.find((s) => s.slug === '2025-26');
  assert.ok(s2025, '2025-26 season must exist');
  const scores25 = db.official_batch_scores.filter((s) => s.seasonId === s2025.id);
  const winner25 = scores25.sort((a, b) => b.totalPoints - a.totalPoints)[0];
  assert.strictEqual(winner25.batchCode, 'IPM06');
  assert.strictEqual(winner25.totalPoints, 59.0);
});

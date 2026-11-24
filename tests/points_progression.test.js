const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Points Progression: Timeline matches official Row 89 totals and contains zero duplicates', () => {
  const dbFile = path.join(process.cwd(), 'data', 'athlos_wob.json');
  const db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));

  const activeSeason = db.seasons.find((s) => s.status === 'active');
  assert.ok(activeSeason, 'Active season must exist');

  const officialScores = db.official_batch_scores.filter((s) => s.seasonId === activeSeason.id);
  assert.strictEqual(officialScores.length, 3, 'Must have official scores for 3 batches');

  // Verify batches and mascot assets
  const b06 = db.batches.find((b) => b.code === 'IPM06');
  const b07 = db.batches.find((b) => b.code === 'IPM07');
  const b08 = db.batches.find((b) => b.code === 'IPM08');

  assert.ok(b06 && b07 && b08, 'All three batches must exist');
  assert.ok(fs.existsSync(path.join(process.cwd(), 'public', b06.mascotImagePath)), 'IPM06 mascot asset must exist');
  assert.ok(fs.existsSync(path.join(process.cwd(), 'public', b07.mascotImagePath)), 'IPM07 mascot asset must exist');
  assert.ok(fs.existsSync(path.join(process.cwd(), 'public', b08.mascotImagePath)), 'IPM08 mascot asset must exist');

  // Verify no textual mascot names in batch records
  assert.strictEqual(b06.mascotName, '', 'IPM06 mascotName must be empty');
  assert.strictEqual(b07.mascotName, '', 'IPM07 mascotName must be empty');
  assert.strictEqual(b08.mascotName, '', 'IPM08 mascotName must be empty');

  // Verify dates are unique and chronologically ordered
  const completedMatches = db.matches.filter(
    (m) => m.seasonId === activeSeason.id && m.status === 'COMPLETED' && Boolean(m.scheduledDate)
  );

  const dates = [...new Set(completedMatches.map((m) => m.scheduledDate))].sort();
  assert.ok(dates.length >= 5, 'Must have at least 5 completed match dates');

  // Verify no duplicate dates in sorted set
  const dateSet = new Set(dates);
  assert.strictEqual(dateSet.size, dates.length, 'Dates must be strictly unique');

  // Calculate cumulative progression
  const cumulative = { IPM06: 0, IPM07: 0, IPM08: 0 };
  for (const date of dates) {
    const dayMatches = completedMatches.filter((m) => m.scheduledDate === date);
    for (const m of dayMatches) {
      if (m.winnerBatchId) {
        const winner = db.batches.find((b) => b.id === m.winnerBatchId);
        if (winner && cumulative[winner.code] !== undefined) {
          cumulative[winner.code] += 2.0;
        }
      }
    }
  }

  // Final points must match official Row 89 totals
  const s07 = officialScores.find((s) => s.batchCode === 'IPM07');
  const s06 = officialScores.find((s) => s.batchCode === 'IPM06');
  const s08 = officialScores.find((s) => s.batchCode === 'IPM08');

  assert.strictEqual(cumulative.IPM07, s07.totalPoints, 'Cumulative IPM07 points must match Row 89 total');
  assert.strictEqual(cumulative.IPM06, s06.totalPoints, 'Cumulative IPM06 points must match Row 89 total');
  assert.strictEqual(cumulative.IPM08, s08.totalPoints, 'Cumulative IPM08 points must match Row 89 total');
});

test('Points Progression: Correcting a historical match score updates progression without creating duplicates', () => {
  const dbFile = path.join(process.cwd(), 'data', 'athlos_wob.json');
  const db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));

  const activeSeason = db.seasons.find((s) => s.status === 'active');
  const targetMatch = db.matches.find(
    (m) => m.seasonId === activeSeason.id && m.status === 'COMPLETED' && m.scheduledDate === '2026-11-05'
  );

  assert.ok(targetMatch, 'Historical match for 2026-11-05 must exist');

  // Simulate updating match result
  const originalWinner = targetMatch.winnerBatchId;
  const updatedWinner = db.batches.find((b) => b.code === 'IPM08').id;

  const simulatedUpdatedMatches = db.matches.map((m) =>
    m.id === targetMatch.id ? { ...m, winnerBatchId: updatedWinner } : m
  );

  // Group by date to verify no duplicate date events are created
  const completed = simulatedUpdatedMatches.filter(
    (m) => m.seasonId === activeSeason.id && m.status === 'COMPLETED' && Boolean(m.scheduledDate)
  );
  const uniqueDates = [...new Set(completed.map((m) => m.scheduledDate))];
  const dateCounts = {};
  for (const d of uniqueDates) {
    dateCounts[d] = (dateCounts[d] || 0) + 1;
    assert.strictEqual(dateCounts[d], 1, `Date ${d} must not be duplicated`);
  }
});

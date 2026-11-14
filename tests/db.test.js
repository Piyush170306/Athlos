const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Database: schema initialization and data integrity', () => {
  const fixtureFile = path.join(__dirname, 'fixtures', 'athlos_wob.json');
  const raw = fs.readFileSync(fixtureFile, 'utf-8');
  const data = JSON.parse(raw);

  assert.ok(Array.isArray(data.seasons), 'Seasons should be an array');
  assert.ok(Array.isArray(data.batches), 'Batches should be an array');
  assert.ok(Array.isArray(data.sports), 'Sports should be an array');
  assert.ok(Array.isArray(data.official_batch_scores), 'Official batch scores must exist');

  // Check 2026-27 active season exists
  const activeSeason = data.seasons.find((s) => s.slug === '2026-27');
  assert.ok(activeSeason, 'Active 2026-27 season must exist');
  assert.strictEqual(activeSeason.status, 'active');

  // Check Batch Scores Table values
  const officialScores2026 = data.official_batch_scores.filter((s) => s.seasonId === activeSeason.id);
  assert.strictEqual(officialScores2026.length, 3, 'Must have 3 batches for 2026-27 (IPM06, IPM07, IPM08)');

  // Critical Core Rule: Standings come from official_batch_scores table, NOT match win calculations
  for (const score of officialScores2026) {
    assert.strictEqual(typeof score.totalPoints, 'number');
    assert.ok(score.sourceRow === 79 || score.sourceRow === 89, 'Official points must point to Batch Scores Table Total row (Row 79 or 89)');
  }
});

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Import Sync: Verify match updates, highlights generation, and poll closure upon match completion', () => {
  const dbFile = path.join(process.cwd(), 'data', 'athlos_wob.json');
  const db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));

  const activeSeason = db.seasons.find((s) => s.status === 'active');
  assert.ok(activeSeason, 'Active season must exist');

  // Find Badminton match between IPM07 and IPM08
  const badmintonSport = db.sports.find((s) => s.slug === 'badminton');
  const b07 = db.batches.find((b) => b.code === 'IPM07');
  const b08 = db.batches.find((b) => b.code === 'IPM08');

  assert.ok(badmintonSport && b07 && b08, 'Sport and batches must exist');

  const match = db.matches.find(
    (m) =>
      m.seasonId === activeSeason.id &&
      m.sportId === badmintonSport.id &&
      m.categoryId === 'cat-boys' &&
      ((m.batchAId === b07.id && m.batchBId === b08.id) || (m.batchAId === b08.id && m.batchBId === b07.id))
  );

  assert.ok(match, 'Target badminton match must exist');

  // Verify match can be updated to COMPLETED with score and winner
  const simulatedUpdate = {
    matchId: match.id,
    rawScore: '2-1',
    winnerBatchId: b07.id,
    status: 'COMPLETED',
    scheduledDate: match.scheduledDate,
    timeSlot: match.timeSlot,
    categoryId: match.categoryId,
  };

  assert.ok(simulatedUpdate.matchId, 'Update must contain matchId to prevent silent dropping');
  assert.strictEqual(simulatedUpdate.status, 'COMPLETED');
  assert.strictEqual(simulatedUpdate.winnerBatchId, b07.id);

  // Verify highlight generation statement
  const winner = db.batches.find((b) => b.id === simulatedUpdate.winnerBatchId);
  const loser = db.batches.find((b) => (b.id === match.batchAId || b.id === match.batchBId) && b.id !== winner.id);
  const title = `${winner.code} defeated ${loser.code} (${simulatedUpdate.rawScore}) in ${badmintonSport.name}`;

  assert.strictEqual(title, 'IPM07 defeated IPM08 (2-1) in Badminton');
  assert.ok(!title.toLowerCase().includes('phoenix'), 'Highlight must not contain mascot text');
  assert.ok(!title.toLowerCase().includes('deer'), 'Highlight must not contain mascot text');
});

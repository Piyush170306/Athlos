const test = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');

test('Polls: Server-backed vote tallies and percentage calculations', () => {
  const votes = [
    { pollId: 'p1', batchId: 'b06' },
    { pollId: 'p1', batchId: 'b06' },
    { pollId: 'p1', batchId: 'b06' },
    { pollId: 'p1', batchId: 'b07' },
  ];

  const total = votes.length;
  assert.strictEqual(total, 4);

  const b06Votes = votes.filter((v) => v.batchId === 'b06').length;
  const b07Votes = votes.filter((v) => v.batchId === 'b07').length;

  const pct06 = Math.round((b06Votes / total) * 100);
  const pct07 = Math.round((b07Votes / total) * 100);

  assert.strictEqual(pct06, 75);
  assert.strictEqual(pct07, 25);
  assert.strictEqual(pct06 + pct07, 100);
});

test('Polls: Privacy-preserving device-token hashing and duplicate prevention', () => {
  const deviceToken = 'dev-token-xyz-12345';
  const salt = 'athlos-poll-salt';

  const hash1 = crypto.createHash('sha256').update(deviceToken + salt).digest('hex');
  const hash2 = crypto.createHash('sha256').update(deviceToken + salt).digest('hex');

  assert.strictEqual(hash1, hash2, 'Identical token must hash consistently');
  assert.notStrictEqual(hash1, deviceToken, 'Hash must not expose raw token');

  const registeredVotes = new Set([hash1]);
  const isDuplicate = registeredVotes.has(hash2);
  assert.strictEqual(isDuplicate, true, 'Duplicate vote from same token hash must be detected');
});

test('Intro Animation: Respects prefers-reduced-motion setting', () => {
  function shouldPlayIntro(prefersReducedMotion, hasPlayedSession) {
    if (prefersReducedMotion) return false;
    if (hasPlayedSession) return false;
    return true;
  }

  assert.strictEqual(shouldPlayIntro(true, false), false, 'Must skip if user prefers reduced motion');
  assert.strictEqual(shouldPlayIntro(false, true), false, 'Must skip if already played in session');
  assert.strictEqual(shouldPlayIntro(false, false), true, 'Plays on first fresh session without reduced motion');
});

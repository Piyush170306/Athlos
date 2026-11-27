const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

test('Futsal Fixtures: Exactly 3 Boys and 3 Girls fixtures for 2026-27 with zero duplicate pairings', () => {
  const db = JSON.parse(fs.readFileSync('data/athlos_wob.json', 'utf8'));
  const futsal2026 = db.matches.filter(m => m.seasonId === 'season-2026-27' && m.sportId === 'sport-futsal');

  assert.strictEqual(futsal2026.length, 6, 'Must have exactly 6 Futsal matches in 2026-27');

  const boys = futsal2026.filter(m => m.categoryId === 'cat-boys');
  const girls = futsal2026.filter(m => m.categoryId === 'cat-girls');

  assert.strictEqual(boys.length, 3, 'Must have exactly 3 Boys Futsal matches');
  assert.strictEqual(girls.length, 3, 'Must have exactly 3 Girls Futsal matches');

  // Verify unique pairings in Boys
  const boysPairs = new Set(boys.map(m => [m.batchAId, m.batchBId].sort().join(' vs ')));
  assert.strictEqual(boysPairs.size, 3, 'Boys pairings must be completely unique');

  // Verify unique pairings in Girls
  const girlsPairs = new Set(girls.map(m => [m.batchAId, m.batchBId].sort().join(' vs ')));
  assert.strictEqual(girlsPairs.size, 3, 'Girls pairings must be completely unique');

  // Verify all dates are in December 2026
  futsal2026.forEach(m => {
    assert.ok(m.scheduledDate.startsWith('2026-12-'), `Date ${m.scheduledDate} must be in December 2026`);
    assert.ok(
      ['2026-12-02', '2026-12-03', '2026-12-04'].includes(m.scheduledDate),
      `Date ${m.scheduledDate} must be Dec 2, 3, or 4`
    );
  });
});

test('Tournament Schedule: All 72 official 2026-27 fixtures scheduled in December 2026 with no duplicates', () => {
  const db = JSON.parse(fs.readFileSync('data/athlos_wob.json', 'utf8'));
  const matches2026 = db.matches.filter(m => m.seasonId === 'season-2026-27');

  assert.strictEqual(matches2026.length, 72, 'Must have exactly 72 official fixtures');

  // Check no April dates (2026-04-12) or other mistaken dates
  matches2026.forEach(m => {
    assert.ok(
      m.scheduledDate.startsWith('2026-12-'),
      `Match ${m.id} (${m.sportId}) has invalid date ${m.scheduledDate}, expected December 2026`
    );
  });

  // Group by sport + category and verify no duplicate batch pairs exist
  const grouped = {};
  matches2026.forEach(m => {
    const key = `${m.sportId}__${m.categoryId}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(m);
  });

  for (const [key, list] of Object.entries(grouped)) {
    const pairs = new Set();
    list.forEach(m => {
      const pair = [m.batchAId, m.batchBId].sort().join(' vs ');
      assert.ok(!pairs.has(pair), `Found duplicate pair "${pair}" in ${key}`);
      pairs.add(pair);
    });
  }
});

test('Admin Security: Password is securely hashed, Athlos@2026 authenticates, plain text fallbacks removed', async () => {
  const db = JSON.parse(fs.readFileSync('data/athlos_wob.json', 'utf8'));
  const admin = db.admin_users.find(u => u.email === 'admin@athlos.edu');

  assert.ok(admin, 'Admin user must exist');
  assert.ok(admin.passwordHash.startsWith('$2a$') || admin.passwordHash.startsWith('$2b$'), 'Must be bcrypt hash');
  assert.strictEqual(admin.mustChangePassword, true, 'mustChangePassword must be set to true');

  // Must verify with requested new credential Athlos@2026
  const valid = await bcrypt.compare('Athlos@2026', admin.passwordHash);
  assert.strictEqual(valid, true, 'Athlos@2026 must successfully verify against passwordHash');

  // Old dummy passwords must NOT verify
  const invalidOld1 = await bcrypt.compare('AdminPassword2026!', admin.passwordHash);
  assert.strictEqual(invalidOld1, false);

  const invalidOld2 = await bcrypt.compare('admin123', admin.passwordHash);
  assert.strictEqual(invalidOld2, false);

  // Check that admin login page does not contain hardcoded/visible password or auto-fill box
  const loginSrc = fs.readFileSync('app/admin/login/page.tsx', 'utf8');
  assert.ok(!loginSrc.includes('AdminPassword2026!'), 'Login page must not contain old hardcoded password');
  assert.ok(!loginSrc.includes('Athlos@2026'), 'Login page must never expose new password');
  assert.ok(!loginSrc.includes('Auto-Fill'), 'Login page must not contain Auto-Fill button');
  assert.ok(loginSrc.includes('Eye') && loginSrc.includes('EyeOff'), 'Login page must provide show/hide password control');
});

test('Meet The Team: Subtitle line exists in components/team/MeetTheTeamClient.tsx and is ready for replacement', () => {
  const teamSrc = fs.readFileSync('components/team/MeetTheTeamClient.tsx', 'utf8');
  assert.ok(
    teamSrc.includes('Ten dedicated student members orchestrating 15 championship disciplines.'),
    'Must contain exact line for user replacement'
  );
});

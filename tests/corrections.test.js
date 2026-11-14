const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Corrections: Mascot textual names must NOT exist in public batches', () => {
  const dbFile = path.join(process.cwd(), 'data', 'athlos_wob.json');
  const db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));

  const activeSeason = db.seasons.find((s) => s.status === 'active');
  const batches2026 = db.batches.filter((b) => b.seasonId === activeSeason.id);

  assert.strictEqual(batches2026.length, 3, 'Must have 3 participating batches');

  const forbiddenMascotWords = ['dragon', 'phoenix', 'stag', 'deer', 'titans'];

  for (const b of batches2026) {
    // Check code is clean
    assert.ok(['IPM06', 'IPM07', 'IPM08'].includes(b.code), `Invalid batch code: ${b.code}`);
    // Check displayName does NOT contain mascot animal names
    for (const word of forbiddenMascotWords) {
      assert.ok(
        !b.displayName.toLowerCase().includes(word),
        `Batch ${b.code} displayName "${b.displayName}" must not contain mascot text "${word}"`
      );
    }
    // Check mascot image is present and official
    assert.ok(b.mascotImagePath, `Batch ${b.code} must preserve mascot artwork`);
    assert.ok(fs.existsSync(path.join(process.cwd(), 'public', b.mascotImagePath)), `Mascot image asset must exist on disk: ${b.mascotImagePath}`);
  }
});

test('Corrections: Category "Open" must NOT exist in database categories or matches', () => {
  const dbFile = path.join(process.cwd(), 'data', 'athlos_wob.json');
  const db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));

  // Verify categories table
  for (const cat of db.categories) {
    assert.notStrictEqual(cat.name.toLowerCase(), 'open', 'Category "Open" is forbidden');
    assert.ok(
      cat.name.toLowerCase().includes('boy') || cat.name.toLowerCase().includes('girl'),
      `Category ${cat.name} must be Boys or Girls only`
    );
  }

  // Verify matches table categories
  for (const match of db.matches) {
    if (match.categoryName) {
      assert.notStrictEqual(match.categoryName.toLowerCase(), 'open', 'Match category cannot be Open');
    }
  }
});

test('Corrections: Video intro asset must exist and be integrated in BrandedIntro', () => {
  const videoPath = path.join(process.cwd(), 'public', 'assets', 'videos', 'athlos_war_of_batches_intro_2026-27.mp4');
  assert.ok(fs.existsSync(videoPath), 'Video asset must exist at public/assets/videos/athlos_war_of_batches_intro_2026-27.mp4');
  const stat = fs.statSync(videoPath);
  assert.ok(stat.size > 1000000, `Video file must be non-empty (got ${stat.size} bytes)`);

  const introComponent = fs.readFileSync(path.join(process.cwd(), 'components', 'BrandedIntro.tsx'), 'utf-8');
  assert.ok(introComponent.includes('/assets/videos/athlos_war_of_batches_intro_2026-27.mp4'), 'BrandedIntro must reference the video file');
  assert.ok(introComponent.includes('prefers-reduced-motion'), 'Must respect prefers-reduced-motion');
  assert.ok(introComponent.includes('Skip Intro'), 'Must provide visible Skip Intro button');
});

test('Corrections: Public navigation must NOT contain Admin links', () => {
  const navbarSrc = fs.readFileSync(path.join(process.cwd(), 'components', 'Navbar.tsx'), 'utf-8');
  assert.ok(!navbarSrc.includes('href="/admin"'), 'Navbar must not contain links to /admin');
  assert.ok(!navbarSrc.includes('>Admin<'), 'Navbar must not contain Admin button text');

  const footerSrc = fs.readFileSync(path.join(process.cwd(), 'components', 'Footer.tsx'), 'utf-8');
  assert.ok(!footerSrc.includes('href="/admin"'), 'Footer must not contain links to /admin');
  assert.ok(!footerSrc.includes('Authorized Admin Dashboard'), 'Footer must not mention Authorized Admin Dashboard');
});

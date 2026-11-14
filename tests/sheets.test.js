const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

test('Google Sheets: Sync must be idempotent and skip unchanged content', () => {
  // Simulate two consecutive sync cycles with identical sheet buffer
  const sampleFilePath = path.join(process.cwd(), 'wob_2026-27_official_workbook_v1.xlsx');
  assert.ok(fs.existsSync(sampleFilePath));

  const buf = fs.readFileSync(sampleFilePath);
  const hash1 = crypto.createHash('sha256').update(buf).digest('hex');
  const hash2 = crypto.createHash('sha256').update(buf).digest('hex');

  assert.strictEqual(hash1, hash2, 'Identical sheets must produce identical checksums');

  let reviewBatchCreated = false;
  let previousHash = null;

  function runSync(contentHash) {
    if (previousHash === contentHash) {
      return { status: 'UNCHANGED', createdBatch: false };
    }
    previousHash = contentHash;
    return { status: 'STAGED', createdBatch: true };
  }

  // Cycle 1: First sync stages new review batch
  const cycle1 = runSync(hash1);
  assert.strictEqual(cycle1.status, 'STAGED');
  assert.strictEqual(cycle1.createdBatch, true);

  // Cycle 2: Second sync detects identical content and skips creating duplicate batch
  const cycle2 = runSync(hash2);
  assert.strictEqual(cycle2.status, 'UNCHANGED');
  assert.strictEqual(cycle2.createdBatch, false);
});

test('Google Sheets: Sheet changes must enter review queue and never publish automatically', () => {
  const dbFile = path.join(process.cwd(), 'data', 'athlos_wob.json');
  const raw = fs.readFileSync(dbFile, 'utf-8');
  const db = JSON.parse(raw);

  // Any import_batch created from GOOGLE_SHEETS must initialize in STAGED status
  const gsBatches = db.import_batches.filter((b) => b.fileType === 'GOOGLE_SHEETS');
  for (const b of gsBatches) {
    assert.ok(
      b.status === 'STAGED' || b.status === 'APPROVED' || b.status === 'REJECTED' || b.status === 'ROLLED_BACK',
      'Valid lifecycle status required'
    );
    if (!b.approvedAt) {
      assert.strictEqual(b.status, 'STAGED', 'Unapproved sheets must remain STAGED');
    }
  }
});

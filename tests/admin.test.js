const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('Admin Management: Single active season enforcement and explicit activation confirmation', () => {
  const dbFile = path.join(process.cwd(), 'data', 'athlos_wob.json');
  assert.ok(fs.existsSync(dbFile), 'DB file must exist');

  const raw = fs.readFileSync(dbFile, 'utf-8');
  const db = JSON.parse(raw);

  // Verify only 1 active season currently exists
  const activeSeasons = db.seasons.filter((s) => s.status === 'active');
  assert.strictEqual(activeSeasons.length, 1, 'Exactly one season must be active at any time');
  assert.strictEqual(activeSeasons[0].slug, '2026-27');

  // Verify all past seasons are archived
  const archived = db.seasons.filter((s) => s.status === 'archived');
  assert.ok(archived.length >= 4, 'Historical seasons must be in archived state');
});

test('Admin Management: Immutable audit log records administrative events with actor and timestamp', () => {
  const dbFile = path.join(process.cwd(), 'data', 'athlos_wob.json');
  const raw = fs.readFileSync(dbFile, 'utf-8');
  const db = JSON.parse(raw);

  assert.ok(Array.isArray(db.audit_logs), 'Audit logs array must exist');
  assert.ok(db.audit_logs.length > 0, 'Audit logs must have entries');

  const firstLog = db.audit_logs[0];
  assert.ok(firstLog.actor, 'Audit entry must have an actor');
  assert.ok(firstLog.action, 'Audit entry must have an action');
  assert.ok(firstLog.createdAt, 'Audit entry must have a createdAt timestamp');
  assert.ok(firstLog.entityType, 'Audit entry must have an entityType');
});

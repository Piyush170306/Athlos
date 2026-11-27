const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const SPREADSHEET_ID = '1C7RNiyTwUwb5b6kQ7DRJFZDLqivcqthvUDmvGrGt6TE';

test('Google Sheets: Spreadsheet ID and default config are correctly configured', () => {
  const db = JSON.parse(fs.readFileSync('data/athlos_wob.json', 'utf8'));
  const config = db.google_sheets_config[0];

  assert.ok(config, 'Google Sheets config must exist');
  assert.strictEqual(config.spreadsheetId, SPREADSHEET_ID);
  assert.strictEqual(config.sheetName, '2026-27');
  assert.strictEqual(config.syncFrequencyMinutes, 5);
  assert.strictEqual(config.isActive, true);
});

test('Google Sheets: Master workbook contains all 5 required season sheets with valid structures', () => {
  const localMaster = path.join(process.cwd(), 'wob_2026-27_official_workbook_v1.xlsx');
  assert.ok(fs.existsSync(localMaster), 'Local master workbook must exist');

  const buf = fs.readFileSync(localMaster);
  const wb = XLSX.read(buf, { type: 'buffer' });

  const requiredSheets = ['2026-27', '2025-26', '2024-25', '2023-24', '2022-23'];
  requiredSheets.forEach(sheetName => {
    assert.ok(wb.SheetNames.includes(sheetName), `Workbook must contain sheet "${sheetName}"`);
  });

  // Verify 2026-27 structure
  const s26 = wb.Sheets['2026-27'];
  const rows26 = XLSX.utils.sheet_to_json(s26, { header: 1, defval: '' });
  let foundTotal26 = false;
  for (let r = 2; r < rows26.length; r++) {
    for (let c = 6; c < 12; c++) {
      if (String(rows26[r][c] || '').trim().toLowerCase() === 'total') {
        foundTotal26 = true;
        break;
      }
    }
  }
  assert.ok(foundTotal26, '2026-27 sheet must have official Total row in Batch Scores Table');
});

test('Google Sheets: Vercel cron configuration defines 5-minute automated sync schedule', () => {
  const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
  assert.ok(fs.existsSync(vercelJsonPath), 'vercel.json must exist');

  const vercelConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
  assert.ok(Array.isArray(vercelConfig.crons), 'vercel.json must have crons array');

  const syncCron = vercelConfig.crons.find(c => c.path === '/api/cron/sheets-sync');
  assert.ok(syncCron, 'Must define cron job for /api/cron/sheets-sync');
  assert.strictEqual(syncCron.schedule, '*/5 * * * *', 'Schedule must be every 5 minutes');
});

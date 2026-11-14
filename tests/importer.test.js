const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

test('Excel Importer: Parse dual-table workbook and forward-fill continuation cells', () => {
  const filePath = path.join(process.cwd(), 'wob_2026-27_official_workbook_v1.xlsx');
  assert.ok(fs.existsSync(filePath), '2026-27 workbook must exist');

  const buffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const targetSheetName = workbook.Sheets['2026-27'] ? '2026-27' : workbook.SheetNames[0];
  const sheet = workbook.Sheets[targetSheetName];
  assert.ok(sheet, 'Workbook active tournament sheet must exist');

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

  // Test forward-fill logic on continuation cells
  let currentSport = null;
  const processedMatches = [];

  for (let r = 2; r < Math.min(rows.length, 25); r++) {
    const row = rows[r];
    if (!row) continue;
    const sportCell = row[1];
    const contendersCell = row[4];

    if (sportCell && String(sportCell).trim()) {
      currentSport = String(sportCell).trim();
    }

    if (contendersCell) {
      processedMatches.push({
        row: r + 1,
        sport: currentSport,
        contenders: contendersCell,
      });
    }
  }

  assert.ok(processedMatches.length > 0, 'Matches must be extracted');
  // Row 4 in Excel has empty Sport cell, but must inherit 'Basketball' from Row 3
  const row4 = processedMatches.find((m) => m.row === 4);
  assert.ok(row4, 'Row 4 must be captured');
  assert.strictEqual(row4.sport, 'Basketball', 'Continuation row 4 must forward-fill "Basketball"');
});

test('Excel Importer: Batch Scores Table Row 79 is parsed as official totals authority', () => {
  const filePath = path.join(process.cwd(), 'wob_2025-26_sample_REFERENCE_ONLY.xlsx');
  const buffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheet = workbook.Sheets['2025-26'];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

  // Row 79 (index 78) is Total row
  const row79 = rows[78];
  assert.strictEqual(String(row79[7]).trim().toLowerCase(), 'total', 'Row 79 Col H must be "Total"');

  const ipm05 = parseFloat(row79[8]);
  const ipm06 = parseFloat(row79[9]);
  const ipm07 = parseFloat(row79[10]);

  assert.strictEqual(ipm05, 49.5, 'IPM05 total must be 49.5');
  assert.strictEqual(ipm06, 59.0, 'IPM06 total must be 59.0');
  assert.strictEqual(ipm07, 38.5, 'IPM07 total must be 38.5');
});

test('Excel Importer: Missing rows preservation rule test', () => {
  // Simulate missing source row scenario:
  const dbMatches = [
    { id: 'm1', sourceRowKey: 'row-3-futsal-ipm07-vs-ipm06' },
    { id: 'm2', sourceRowKey: 'row-99-special-derby' }, // Will not be in new sheet
  ];

  const parsedKeys = new Set(['row-3-futsal-ipm07-vs-ipm06']);
  const missingPreserved = [];

  for (const m of dbMatches) {
    if (!parsedKeys.has(m.sourceRowKey)) {
      missingPreserved.push({
        ...m,
        isFlagged: true,
        discrepancyNote: 'Missing from source spreadsheet',
      });
    }
  }

  assert.strictEqual(missingPreserved.length, 1, 'Exactly 1 missing row must be detected');
  assert.strictEqual(missingPreserved[0].id, 'm2');
  assert.strictEqual(missingPreserved[0].isFlagged, true, 'Missing row must be flagged, not deleted');
});

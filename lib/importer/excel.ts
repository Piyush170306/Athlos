import * as XLSX from 'xlsx';

export interface ParsedRawRow {
  rowNumber: number;
  dateStr?: string;
  sportName: string;
  formatName?: string;
  timeSlot?: string;
  contendersRaw: string;
  batchACode?: string;
  batchBCode?: string;
  rawScore?: string;
  winnerCode?: string;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  sourceKey: string;
}

export interface ParsedBatchScore {
  sportName: string;
  pointsByBatch: Record<string, number>; // code -> points
  rowNumber: number;
}

export interface ParsedWorkbookResult {
  sheetName: string;
  matches: ParsedRawRow[];
  officialScores: Record<string, number>; // batchCode -> total points (Row 89 / Total Row)
  sportBreakdowns: Record<string, Record<string, number>>; // batchCode -> sportSlug -> points
  warnings: string[];
}

export function normalizeExcelDate(val: any): string | undefined {
  if (!val) return undefined;

  // Handle Date instances (e.g. from XLSX cellDates: true)
  if (val instanceof Date) {
    const year = val.getFullYear();
    const month = val.getMonth() + 1;
    const date = val.getDate();
    if (year === 2026) {
      if (month === 12) {
        return `2026-12-${String(date).padStart(2, '0')}`;
      }
      // If date was entered as D/12/26 and interpreted as Month D, Day 12 by US locale:
      if ((date === 11 || date === 12) && month >= 1 && month <= 12) {
        return `2026-12-${String(month).padStart(2, '0')}`;
      }
    }
    return val.toISOString().split('T')[0];
  }

  // Handle Excel numeric date serials
  if (typeof val === 'number') {
    const p = XLSX.SSF.parse_date_code(val);
    if (p && p.y === 2026) {
      if (p.m === 12) {
        return `2026-12-${String(p.d).padStart(2, '0')}`;
      }
      if (p.d === 12 && p.m >= 1 && p.m <= 12) {
        return `2026-12-${String(p.m).padStart(2, '0')}`;
      }
      return `${p.y}-${String(p.m).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`;
    }
    const d = new Date(Math.round((val - 25569) * 86400 * 1000));
    return d.toISOString().split('T')[0];
  }

  const s = String(val).trim();
  if (!s) return undefined;

  // Handle text dates e.g. "1/12/26", "04/12/26", "13/12/26", or "2026-12-04"
  const parts = s.split(/[\/\-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      // YYYY-MM-DD
      const y = parts[0];
      const m = parts[1];
      const d = parts[2];
      if (y === '2026' && d === '12' && parseInt(m, 10) >= 1 && parseInt(m, 10) <= 12) {
        return `2026-12-${m.padStart(2, '0')}`;
      }
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    const p1 = parseInt(parts[0], 10);
    const p2 = parseInt(parts[1], 10);
    const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];

    if (year === '2026') {
      // All official tournament fixtures take place in December 2026 (Month 12)
      if (p2 === 12 && p1 >= 1 && p1 <= 31) {
        return `2026-12-${String(p1).padStart(2, '0')}`;
      }
      if (p1 === 12 && p2 >= 1 && p2 <= 31) {
        return `2026-12-${String(p2).padStart(2, '0')}`;
      }
    }
    return `${year}-${String(p2).padStart(2, '0')}-${String(p1).padStart(2, '0')}`;
  }
  return s;
}

export function parseExcelWorkbook(fileBuffer: Buffer, targetSheetName?: string): ParsedWorkbookResult {
  const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: true, cellFormula: true });
  const sheetNames = workbook.SheetNames;

  let sheetName = targetSheetName;
  if (!sheetName || !sheetNames.includes(sheetName)) {
    // Prefer sheet with '2026', 'prom', or first sheet
    sheetName =
      sheetNames.find((s) => s.toLowerCase().includes('2026')) ||
      sheetNames.find((s) => s.toLowerCase().includes('prom')) ||
      sheetNames[0];
  }

  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found in workbook. Available sheets: ${sheetNames.join(', ')}`);
  }

  // Convert sheet to row array with raw values
  const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: false });
  const warnings: string[] = [];

  // 1. Detect Batch Scores Table columns (Row 2 has batch codes like IPM06, IPM07, IPM08)
  let batchColMap: Record<number, string> = {}; // colIndex -> batchCode (e.g. 8 -> IPM06)
  const headerRow2 = rows[1] || [];
  for (let c = 7; c < headerRow2.length; c++) {
    const val = String(headerRow2[c] || '').trim().toUpperCase();
    if (val.startsWith('IPM')) {
      batchColMap[c] = val;
    }
  }

  // 2. Initialise official scores and sport breakdown maps
  const officialScores: Record<string, number> = {};
  const sportBreakdowns: Record<string, Record<string, number>> = {};
  for (const code of Object.values(batchColMap)) {
    officialScores[code] = 0;
    sportBreakdowns[code] = {};
  }

  // 3. Parse Batch Scores Table and Raw Scores Table
  const matches: ParsedRawRow[] = [];
  let currentSport = '';
  let currentFormat = '';
  let currentTimeSlot = '';
  let currentDateStr = '';
  let foundTotalRow = false;

  for (let r = 2; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const rowNum = r + 1; // 1-based row number matching Excel

    // Check for "Total" row in Batch Scores Table (dynamic detection)
    let isTotalRow = false;
    for (let c = 6; c < Math.min(row.length, 12); c++) {
      const cellVal = String(row[c] || '').trim().toLowerCase();
      if (cellVal === 'total') {
        isTotalRow = true;
        foundTotalRow = true;
        break;
      }
    }

    if (isTotalRow) {
      for (const [colIdx, code] of Object.entries(batchColMap)) {
        const rawTotal = row[Number(colIdx)];
        const numTotal = parseFloat(rawTotal);
        if (!isNaN(numTotal)) {
          officialScores[code] = numTotal;
        }
      }
      continue;
    }

    // Check sport points row in Batch Scores Table (cols 7 to 11)
    const sportColVal = String(row[7] || '').trim();
    if (sportColVal && sportColVal.toLowerCase() !== 'total' && sportColVal.toLowerCase() !== 'winner') {
      const sportSlug = sportColVal.toLowerCase().replace(/[^a-z0-9]/g, '-');
      for (const [colIdx, code] of Object.entries(batchColMap)) {
        const rawPts = row[Number(colIdx)];
        const numPts = parseFloat(rawPts);
        if (!isNaN(numPts)) {
          if (!sportBreakdowns[code]) sportBreakdowns[code] = {};
          sportBreakdowns[code][sportSlug] = (sportBreakdowns[code][sportSlug] || 0) + numPts;
        }
      }
    }

    // --- Raw Scores Table parsing (Columns 0 to 6) ---
    const cellDate = row[0];
    const cellSport = row[1];
    const cellFormat = row[2];
    const cellSlot = row[3];
    const cellContenders = row[4];
    const cellScore = row[5];
    const cellWinner = row[6];

    // Continuation forward-fill
    if (cellSport && String(cellSport).trim()) {
      currentSport = String(cellSport).trim();
    }
    if (cellFormat && String(cellFormat).trim()) {
      const fmt = String(cellFormat).trim();
      currentFormat = fmt.toLowerCase().includes('girl') ? 'Girls' : 'Boys';
    }
    if (cellSlot && String(cellSlot).trim()) {
      currentTimeSlot = String(cellSlot).trim();
    }
    if (cellDate && String(cellDate).trim()) {
      const normDate = normalizeExcelDate(cellDate);
      if (normDate) currentDateStr = normDate;
    }

    // If there is no contenders/event cell, skip row
    if (!cellContenders || !String(cellContenders).trim()) {
      continue;
    }

    const contendersRaw = String(cellContenders).trim();

    // Parse batches from contenders (e.g. "IPM07 vs IPM06" or "IPM08 vs. IPM07")
    const matchBatches = contendersRaw.match(/IPM\d+/gi) || [];
    const batchACode = matchBatches[0] ? matchBatches[0].toUpperCase() : undefined;
    const batchBCode = matchBatches[1] ? matchBatches[1].toUpperCase() : undefined;

    // Normalise winner
    let winnerCode = cellWinner ? String(cellWinner).trim().toUpperCase() : undefined;
    if (winnerCode && !winnerCode.startsWith('IPM') && winnerCode !== 'DRAW') {
      const foundWinner = winnerCode.match(/IPM\d+/i);
      winnerCode = foundWinner ? foundWinner[0].toUpperCase() : winnerCode;
    }
    if (winnerCode && !winnerCode.startsWith('IPM') && winnerCode !== 'DRAW') {
      winnerCode = undefined;
    }

    let rawScore = cellScore ? String(cellScore).trim() : undefined;
    // Discard non-score note placeholders like "10 eve" or "12 eve"
    if (rawScore && /^\d+\s+eve$/i.test(rawScore)) {
      rawScore = undefined;
    }

    // Determine Status
    // A match is COMPLETED only if a valid winner or score is recorded
    let status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED' = 'UPCOMING';
    if (winnerCode || (rawScore && rawScore !== '0' && rawScore !== 'undefined')) {
      status = 'COMPLETED';
    }

    // Ensure formatName is strictly Boys or Girls (never Open)
    const finalFormat = currentFormat.toLowerCase().includes('girl') ? 'Girls' : 'Boys';

    matches.push({
      rowNumber: rowNum,
      dateStr: currentDateStr || undefined,
      sportName: currentSport || 'General',
      formatName: finalFormat,
      timeSlot: currentTimeSlot || undefined,
      contendersRaw,
      batchACode,
      batchBCode,
      rawScore,
      winnerCode,
      status,
      sourceKey: `row-${rowNum}-${currentSport}-${contendersRaw}`.toLowerCase().replace(/\s+/g, '-'),
    });
  }

  // Fallback: ONLY if Total row was not found in the sheet, sum the evaluated sport points
  if (!foundTotalRow) {
    for (const code of Object.values(batchColMap)) {
      if (officialScores[code] === 0 && sportBreakdowns[code]) {
        const sum = Object.values(sportBreakdowns[code]).reduce((acc, v) => acc + v, 0);
        if (sum > 0) {
          officialScores[code] = sum;
          warnings.push(`Evaluated sum for ${code}: ${sum} pts.`);
        }
      }
    }
  }

  return {
    sheetName,
    matches,
    officialScores,
    sportBreakdowns,
    warnings,
  };
}

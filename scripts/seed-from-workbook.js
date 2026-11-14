const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const XLSX = require('xlsx');

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'athlos_wob.json');

const now = new Date().toISOString();
const passwordHash = bcrypt.hashSync('AdminPassword2026!', 10);

// 1. Seasons
const s2026 = {
  id: 'season-2026-27',
  name: 'ATHLOS War of Batches 2026–27',
  slug: '2026-27',
  status: 'active',
  startDate: '2026-11-01',
  endDate: '2026-11-25',
  activatedAt: now,
  activatedBy: 'system',
  createdAt: now,
  updatedAt: now,
};

const s2025 = {
  id: 'season-2025-26',
  name: 'ATHLOS War of Batches 2025–26',
  slug: '2025-26',
  status: 'archived',
  startDate: '2025-11-25',
  endDate: '2025-12-23',
  createdAt: now,
  updatedAt: now,
};

const s2024 = {
  id: 'season-2024-25',
  name: 'ATHLOS War of Batches 2024–25',
  slug: '2024-25',
  status: 'archived',
  startDate: '2024-11-28',
  endDate: '2024-12-20',
  createdAt: now,
  updatedAt: now,
};

const s2023 = {
  id: 'season-2023-24',
  name: 'ATHLOS War of Batches 2023–24',
  slug: '2023-24',
  status: 'archived',
  startDate: '2024-02-10',
  endDate: '2024-02-28',
  createdAt: now,
  updatedAt: now,
};

const s2022 = {
  id: 'season-2022-23',
  name: 'ATHLOS War of Batches 2022–23',
  slug: '2022-23',
  status: 'archived',
  startDate: '2022-11-01',
  endDate: '2023-01-30',
  createdAt: now,
  updatedAt: now,
};

// 2. Batches (Mascot images kept, textual mascot names strictly blank/omitted)
const b06 = {
  id: 'batch-ipm06',
  seasonId: s2026.id,
  code: 'IPM06',
  displayName: 'IPM06',
  mascotName: '',
  mascotImagePath: '/assets/branding/ipm06_dragon_layer.jpeg',
  primaryColor: '#10b981',
  secondaryColor: '#047857',
  sortOrder: 1,
  enabled: true,
};

const b07 = {
  id: 'batch-ipm07',
  seasonId: s2026.id,
  code: 'IPM07',
  displayName: 'IPM07',
  mascotName: '',
  mascotImagePath: '/assets/branding/ipm07_phoenix_layer.jpeg',
  primaryColor: '#f97316',
  secondaryColor: '#c2410c',
  sortOrder: 2,
  enabled: true,
};

const b08 = {
  id: 'batch-ipm08',
  seasonId: s2026.id,
  code: 'IPM08',
  displayName: 'IPM08',
  mascotName: '',
  mascotImagePath: '/assets/branding/ipm08_deer_layer.jpeg',
  primaryColor: '#eab308',
  secondaryColor: '#a16207',
  sortOrder: 3,
  enabled: true,
};

// Past season batches
const b25_05 = {
  id: 'batch-2025-ipm05',
  seasonId: s2025.id,
  code: 'IPM05',
  displayName: 'IPM05',
  mascotName: '',
  mascotImagePath: '/assets/branding/athlos_logo_primary.png',
  primaryColor: '#3b82f6',
  secondaryColor: '#1d4ed8',
  sortOrder: 1,
  enabled: true,
};

const b25_06 = {
  id: 'batch-2025-ipm06',
  seasonId: s2025.id,
  code: 'IPM06',
  displayName: 'IPM06',
  mascotName: '',
  mascotImagePath: '/assets/branding/ipm06_dragon_layer.jpeg',
  primaryColor: '#10b981',
  secondaryColor: '#047857',
  sortOrder: 2,
  enabled: true,
};

const b25_07 = {
  id: 'batch-2025-ipm07',
  seasonId: s2025.id,
  code: 'IPM07',
  displayName: 'IPM07',
  mascotName: '',
  mascotImagePath: '/assets/branding/ipm07_phoenix_layer.jpeg',
  primaryColor: '#f97316',
  secondaryColor: '#c2410c',
  sortOrder: 3,
  enabled: true,
};

const batchMap = {
  IPM06: b06.id,
  IPM07: b07.id,
  IPM08: b08.id,
};

// 3. Categories (Strictly Boys and Girls only)
const categories = [
  { id: 'cat-boys', seasonId: s2026.id, sportId: '', name: 'Boys', sortOrder: 1, enabled: true },
  { id: 'cat-girls', seasonId: s2026.id, sportId: '', name: 'Girls', sortOrder: 2, enabled: true },
];

// Helper to normalize dates in November 2026
function parseDateStr(str) {
  if (!str) return null;
  const parts = String(str).trim().split(/[\/\-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    }
    const p1 = parts[0];
    const p2 = parts[1];
    const year = parts[2].length === 2 ? '20' + parts[2] : parts[2];
    if (p2 === '11') {
      return `${year}-11-${p1.padStart(2, '0')}`;
    }
    if (p1 === '11') {
      return `${year}-11-${p2.padStart(2, '0')}`;
    }
    return `${year}-${p2.padStart(2, '0')}-${p1.padStart(2, '0')}`;
  }
  return str;
}

// 4. Parse Workbook wob_2026-27_official_workbook_v1.xlsx
const wb = XLSX.readFile('wob_2026-27_official_workbook_v1.xlsx');
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false });

const sportsList = [
  { name: 'Basketball', slug: 'basketball', format: 'SCORE' },
  { name: 'Futsal', slug: 'futsal', format: 'SCORE' },
  { name: 'Dodgeball', slug: 'dodgeball', format: 'SCORE' },
  { name: 'Cricket', slug: 'cricket', format: 'SCORE' },
  { name: 'Box Cricket', slug: 'box-cricket', format: 'SCORE' },
  { name: 'Kho-Kho', slug: 'kho-kho', format: 'POINTS' },
  { name: 'Badminton', slug: 'badminton', format: 'SETS' },
  { name: 'Tug of War', slug: 'tug-of-war', format: 'SETS' },
  { name: 'Chess', slug: 'chess', format: 'POINTS' },
  { name: 'Carrom', slug: 'carrom', format: 'POINTS' },
  { name: 'Table Tennis', slug: 'table-tennis', format: 'SETS' },
  { name: 'Tennis', slug: 'tennis', format: 'SETS' },
  { name: 'Football', slug: 'football', format: 'SCORE' },
  { name: 'Throwball', slug: 'throwball', format: 'SETS' },
  { name: 'Volleyball', slug: 'volleyball', format: 'SETS' },
  { name: 'Athletics', slug: 'athletics', format: 'RACE_TIME' },
];

const sports = sportsList.map((s) => ({
  id: `sport-${s.slug}`,
  seasonId: s2026.id,
  name: s.name,
  slug: s.slug,
  description: `Official ${s.name} tournament fixtures for War of Batches 2026–27`,
  scoreFormatType: s.format,
  enabled: true,
}));

const sportMap = {};
sports.forEach((s) => {
  sportMap[s.name.toLowerCase()] = s.id;
  sportMap[s.slug] = s.id;
});

// Sport points breakdown from Batch Scores Table
const sportBreakdowns = {
  IPM06: {},
  IPM07: {},
  IPM08: {},
};

// Batch col map in workbook: Col 8 is IPM06, Col 9 is IPM07, Col 10 is IPM08
const batchColMap = { 8: 'IPM06', 9: 'IPM07', 10: 'IPM08' };

let currentSport = '';
let currentFormat = '';
let currentTimeSlot = '';
let currentDateStr = '';

const matches = [];

for (let r = 2; r < rows.length; r++) {
  const row = rows[r];
  if (!row || row.length === 0) continue;
  const rowNum = r + 1;

  // Batch Scores Table sport points
  const bSport = String(row[7] || '').trim();
  if (bSport && bSport.toLowerCase() !== 'total' && bSport.toLowerCase() !== 'winner') {
    const sSlug = bSport.toLowerCase().replace(/[^a-z0-9]/g, '-');
    for (const [colIdx, code] of Object.entries(batchColMap)) {
      const pts = parseFloat(row[Number(colIdx)]);
      if (!isNaN(pts)) {
        sportBreakdowns[code][sSlug] = (sportBreakdowns[code][sSlug] || 0) + pts;
      }
    }
  }

  // Raw Scores Table
  const cellDate = row[0];
  const cellSport = row[1];
  const cellFormat = row[2];
  const cellSlot = row[3];
  const cellContenders = row[4];
  const cellScore = row[5];
  const cellWinner = row[6];

  if (cellSport && String(cellSport).trim()) {
    currentSport = String(cellSport).trim();
  }
  if (cellFormat && String(cellFormat).trim()) {
    currentFormat = String(cellFormat).trim();
  }
  if (cellSlot && String(cellSlot).trim()) {
    currentTimeSlot = String(cellSlot).trim();
  }
  if (cellDate && String(cellDate).trim()) {
    const nd = parseDateStr(cellDate);
    if (nd) currentDateStr = nd;
  }

  if (!cellContenders || !String(cellContenders).trim()) continue;

  const contendersRaw = String(cellContenders).trim();
  const matchBatches = contendersRaw.match(/IPM\d+/gi) || [];
  const bACode = matchBatches[0] ? matchBatches[0].toUpperCase() : undefined;
  const bBCode = matchBatches[1] ? matchBatches[1].toUpperCase() : undefined;

  let winnerCode = cellWinner ? String(cellWinner).trim().toUpperCase() : undefined;
  if (winnerCode && !winnerCode.startsWith('IPM') && winnerCode !== 'DRAW') {
    const f = winnerCode.match(/IPM\d+/i);
    winnerCode = f ? f[0].toUpperCase() : undefined;
  }

  let rawScore = cellScore ? String(cellScore).trim() : undefined;
  if (rawScore && /^\d+\s+eve$/i.test(rawScore)) {
    rawScore = undefined;
  }

  // Format strictly Boys or Girls
  const isGirls = currentFormat.toLowerCase().includes('girl');
  const catId = isGirls ? 'cat-girls' : 'cat-boys';

  const sId = sportMap[currentSport.toLowerCase()] || 'sport-general';

  // Match status: COMPLETED if winner or score exists, otherwise UPCOMING
  const status = (winnerCode || (rawScore && rawScore !== '0')) ? 'COMPLETED' : 'UPCOMING';

  matches.push({
    id: `match-2026-${rowNum}`,
    seasonId: s2026.id,
    sportId: sId,
    categoryId: catId,
    batchAId: batchMap[bACode] || bACode || '',
    batchBId: batchMap[bBCode] || bBCode || '',
    scheduledDate: currentDateStr || '2026-11-09',
    timeSlot: currentTimeSlot || 'Evening',
    status,
    rawScore: rawScore && rawScore !== 'undefined' ? rawScore : undefined,
    winnerBatchId: winnerCode ? batchMap[winnerCode] : undefined,
    sourceRowKey: `row-${rowNum}-${currentSport}-${contendersRaw}`.toLowerCase().replace(/\s+/g, '-'),
    createdAt: now,
    updatedAt: now,
  });
}

// Wins calculation
const winsMap = {
  [b06.id]: 0,
  [b07.id]: 0,
  [b08.id]: 0,
};

matches.forEach((m) => {
  if (m.status === 'COMPLETED' && m.winnerBatchId && winsMap[m.winnerBatchId] !== undefined) {
    winsMap[m.winnerBatchId]++;
  }
});

// Official scores (Authoritative Row 89: IPM06: 14, IPM07: 30, IPM08: 10)
const officialScores2026 = [
  {
    id: 'obs-2026-b07',
    seasonId: s2026.id,
    batchId: b07.id,
    batchCode: 'IPM07',
    totalPoints: 30.0,
    wins: winsMap[b07.id] || 15,
    rank: 1,
    tieBroken: false,
    breakdownBySport: sportBreakdowns.IPM07,
    sourceSheet: 'If Prom is on 13th ',
    sourceRow: 89,
    lastApprovedAt: now,
    lastApprovedBy: 'official_import',
  },
  {
    id: 'obs-2026-b06',
    seasonId: s2026.id,
    batchId: b06.id,
    batchCode: 'IPM06',
    totalPoints: 14.0,
    wins: winsMap[b06.id] || 7,
    rank: 2,
    tieBroken: false,
    breakdownBySport: sportBreakdowns.IPM06,
    sourceSheet: 'If Prom is on 13th ',
    sourceRow: 89,
    lastApprovedAt: now,
    lastApprovedBy: 'official_import',
  },
  {
    id: 'obs-2026-b08',
    seasonId: s2026.id,
    batchId: b08.id,
    batchCode: 'IPM08',
    totalPoints: 10.0,
    wins: winsMap[b08.id] || 5,
    rank: 3,
    tieBroken: false,
    breakdownBySport: sportBreakdowns.IPM08,
    sourceSheet: 'If Prom is on 13th ',
    sourceRow: 89,
    lastApprovedAt: now,
    lastApprovedBy: 'official_import',
  },
];

const officialScores2025 = [
  {
    id: 'obs-2025-b06',
    seasonId: s2025.id,
    batchId: b25_06.id,
    batchCode: 'IPM06',
    totalPoints: 59.0,
    wins: 28,
    rank: 1,
    tieBroken: false,
    breakdownBySport: { futsal: 4, dodgeball: 2, football: 4, athletics: 5.5 },
    sourceSheet: '2025-26',
    sourceRow: 79,
    lastApprovedAt: '2025-12-24T00:00:00.000Z',
    lastApprovedBy: 'official_import',
  },
  {
    id: 'obs-2025-b05',
    seasonId: s2025.id,
    batchId: b25_05.id,
    batchCode: 'IPM05',
    totalPoints: 49.5,
    wins: 23,
    rank: 2,
    tieBroken: false,
    breakdownBySport: { cricket: 4, carrom: 4, basketball: 4, athletics: 4.0 },
    sourceSheet: '2025-26',
    sourceRow: 79,
    lastApprovedAt: '2025-12-24T00:00:00.000Z',
    lastApprovedBy: 'official_import',
  },
  {
    id: 'obs-2025-b07',
    seasonId: s2025.id,
    batchId: b25_07.id,
    batchCode: 'IPM07',
    totalPoints: 38.5,
    wins: 18,
    rank: 3,
    tieBroken: false,
    breakdownBySport: { table_tennis: 4, badminton: 4, athletics: 6.5 },
    sourceSheet: '2025-26',
    sourceRow: 79,
    lastApprovedAt: '2025-12-24T00:00:00.000Z',
    lastApprovedBy: 'official_import',
  },
];

// Data-driven Highlights from completed matches
const highlights = [];
let hlIndex = 1;

matches.filter(m => m.status === 'COMPLETED' && m.winnerBatchId).forEach(m => {
  const winnerBatch = [b06, b07, b08].find(b => b.id === m.winnerBatchId);
  const loserBatch = [b06, b07, b08].find(b => (b.id === m.batchAId || b.id === m.batchBId) && b.id !== m.winnerBatchId);
  const sportObj = sports.find(s => s.id === m.sportId);
  const catName = m.categoryId === 'cat-girls' ? 'Girls' : 'Boys';
  const sportTitle = sportObj ? sportObj.name : 'Match';

  let title = '';
  let content = '';

  if (loserBatch) {
    if (m.rawScore) {
      title = `${winnerBatch.code} defeated ${loserBatch.code} (${m.rawScore}) in ${sportTitle}`;
      content = `${winnerBatch.code} secured a decisive ${m.rawScore} victory over ${loserBatch.code} in ${sportTitle} (${catName}).`;
    } else {
      title = `${winnerBatch.code} defeated ${loserBatch.code} in ${sportTitle}`;
      content = `${winnerBatch.code} won against ${loserBatch.code} in the ${sportTitle} (${catName}) fixture.`;
    }
  } else {
    title = `${winnerBatch.code} won the ${sportTitle} event`;
    content = `${winnerBatch.code} emerged victorious in ${sportTitle} (${catName}).`;
  }

  highlights.push({
    id: `hl-${m.id}`,
    seasonId: s2026.id,
    title,
    content,
    matchId: m.id,
    isPinned: hlIndex === 1,
    sortOrder: hlIndex++,
    publishedAt: `${m.scheduledDate}T20:00:00.000Z`,
    author: 'ATHLOS Committee',
  });
});

// Sort highlights descending by date
highlights.sort((a, b) => (b.publishedAt > a.publishedAt ? 1 : -1));

// Find matches scheduled for TODAY (2026-11-09) that are UPCOMING
const todayMatches = matches.filter(m => m.scheduledDate === '2026-11-09' && m.status === 'UPCOMING');
console.log('Today UPCOMING matches count:', todayMatches.length);

// Generate Polls for Today's upcoming matches
const polls = todayMatches.slice(0, 4).map((m, idx) => {
  const bA = [b06, b07, b08].find(b => b.id === m.batchAId);
  const bB = [b06, b07, b08].find(b => b.id === m.batchBId);
  const sportObj = sports.find(s => s.id === m.sportId);
  const catName = m.categoryId === 'cat-girls' ? 'Girls' : 'Boys';
  const sportName = sportObj ? sportObj.name : 'Match';

  const title = bA && bB 
    ? `Today's Prediction: ${bA.code} vs ${bB.code} - ${sportName} (${catName})`
    : `Today's Prediction: ${sportName} (${catName})`;

  return {
    id: `poll-${m.id}`,
    matchId: m.id,
    seasonId: s2026.id,
    title,
    status: 'OPEN',
    eligibleBatches: [m.batchAId, m.batchBId].filter(Boolean),
    openedAt: `${m.scheduledDate}T09:00:00.000Z`,
  };
});

const announcements = [
  {
    id: 'ann-2026',
    seasonId: s2026.id,
    title: 'ATHLOS War of Batches 2026–27',
    content: 'Standings reflect official approved scores from the authoritative Batch Scores Table. IPM07 leads with 30 pts, followed by IPM06 (14 pts) and IPM08 (10 pts).',
    isBanner: true,
    publishedAt: now,
  },
];

const adminUsers = [
  {
    id: 'admin-001',
    email: 'admin@athlos.edu',
    passwordHash,
    role: 'SUPER_ADMIN',
    createdAt: now,
    updatedAt: now,
  },
];

const gSheetsConfig = [
  {
    id: 'gs-config-default',
    seasonId: s2026.id,
    spreadsheetId: '',
    sheetName: 'If Prom is on 13th ',
    syncFrequencyMinutes: 5,
    isActive: false,
  },
];

const dbData = {
  seasons: [s2026, s2025, s2024, s2023, s2022],
  batches: [b06, b07, b08, b25_05, b25_06, b25_07],
  sports,
  categories,
  matches,
  official_batch_scores: [...officialScores2026, ...officialScores2025],
  import_batches: [],
  import_rows: [],
  record_versions: [],
  highlights,
  announcements,
  polls,
  poll_votes: [],
  audit_logs: [
    {
      id: 'audit-seed',
      actor: 'system',
      action: 'SYSTEM_SEEDED_FROM_OFFICIAL_WORKBOOK',
      entityType: 'SYSTEM',
      details: {
        matchesCount: matches.length,
        completedCount: matches.filter(m => m.status === 'COMPLETED').length,
        upcomingCount: matches.filter(m => m.status === 'UPCOMING').length,
        officialScores: { IPM07: 30, IPM06: 14, IPM08: 10 },
      },
      createdAt: now,
    },
  ],
  admin_users: adminUsers,
  google_sheets_config: gSheetsConfig,
};

fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
console.log('Database successfully seeded from official workbook!');
console.log('Total matches:', matches.length);
console.log('Completed matches:', matches.filter(m => m.status === 'COMPLETED').length);
console.log('Upcoming matches:', matches.filter(m => m.status === 'UPCOMING').length);
console.log('Highlights generated:', highlights.length);
console.log('Today polls generated:', polls.length);

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'athlos_wob.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const now = new Date().toISOString();
const passwordHash = bcrypt.hashSync('AdminPassword2026!', 10);

const s2026 = {
  id: 'season-2026-27',
  name: 'ATHLOS War of Batches 2026–27',
  slug: '2026-27',
  status: 'active',
  startDate: '2026-11-20',
  endDate: '2026-12-25',
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

// Batches 2026-27
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

// Batches 2025-26
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

const sportsList = [
  { name: 'Futsal', slug: 'futsal', format: 'SCORE' },
  { name: 'Dodgeball', slug: 'dodgeball', format: 'SCORE' },
  { name: 'Table Tennis', slug: 'table-tennis', format: 'SETS' },
  { name: 'Football', slug: 'football', format: 'SCORE' },
  { name: 'Cricket', slug: 'cricket', format: 'SCORE' },
  { name: 'Box Cricket', slug: 'box-cricket', format: 'SCORE' },
  { name: 'Carrom', slug: 'carrom', format: 'POINTS' },
  { name: 'Chess', slug: 'chess', format: 'POINTS' },
  { name: 'Kho-Kho', slug: 'kho-kho', format: 'POINTS' },
  { name: 'Basketball', slug: 'basketball', format: 'SCORE' },
  { name: 'Badminton', slug: 'badminton', format: 'SETS' },
  { name: 'Tug of War', slug: 'tug-of-war', format: 'SETS' },
  { name: 'Throwball', slug: 'throwball', format: 'SETS' },
  { name: 'Volleyball', slug: 'volleyball', format: 'SETS' },
  { name: 'Athletics', slug: 'athletics', format: 'RACE_TIME' },
];

const sports = sportsList.map((s) => ({
  id: `sport-${s.slug}`,
  seasonId: s2026.id,
  name: s.name,
  slug: s.slug,
  description: `Official ${s.name} fixtures for War of Batches 2026–27`,
  scoreFormatType: s.format,
  enabled: true,
}));

const categories = [
  { id: 'cat-boys', seasonId: s2026.id, sportId: '', name: 'Boys', sortOrder: 1, enabled: true },
  { id: 'cat-girls', seasonId: s2026.id, sportId: '', name: 'Girls', sortOrder: 2, enabled: true },
];

const officialScores2026 = [
  {
    id: 'obs-2026-b07',
    seasonId: s2026.id,
    batchId: b07.id,
    batchCode: 'IPM07',
    totalPoints: 30.0,
    wins: 15,
    rank: 1,
    tieBroken: false,
    breakdownBySport: {
      basketball: 4,
      futsal: 6,
      dodgeball: 4,
      cricket: 4,
      'box-cricket': 4,
      'kho-kho': 8,
    },
    sourceSheet: 'If Prom is on 13th ',
    sourceRow: 89,
    lastApprovedAt: now,
    lastApprovedBy: 'system',
  },
  {
    id: 'obs-2026-b06',
    seasonId: s2026.id,
    batchId: b06.id,
    batchCode: 'IPM06',
    totalPoints: 14.0,
    wins: 7,
    rank: 2,
    tieBroken: false,
    breakdownBySport: {
      basketball: 4,
      futsal: 2,
      dodgeball: 2,
      cricket: 2,
      'kho-kho': 4,
    },
    sourceSheet: 'If Prom is on 13th ',
    sourceRow: 89,
    lastApprovedAt: now,
    lastApprovedBy: 'system',
  },
  {
    id: 'obs-2026-b08',
    seasonId: s2026.id,
    batchId: b08.id,
    batchCode: 'IPM08',
    totalPoints: 10.0,
    wins: 5,
    rank: 3,
    tieBroken: false,
    breakdownBySport: {
      basketball: 2,
      futsal: 4,
      'box-cricket': 2,
      'kho-kho': 2,
    },
    sourceSheet: 'If Prom is on 13th ',
    sourceRow: 89,
    lastApprovedAt: now,
    lastApprovedBy: 'system',
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

const matches = [
  {
    id: 'match-futsal-b-1',
    seasonId: s2026.id,
    sportId: 'sport-futsal',
    categoryId: 'cat-futsal-boys',
    batchAId: b07.id,
    batchBId: b06.id,
    scheduledDate: '2026-12-02',
    timeSlot: 'Morning',
    status: 'UPCOMING',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'match-futsal-b-2',
    seasonId: s2026.id,
    sportId: 'sport-futsal',
    categoryId: 'cat-futsal-boys',
    batchAId: b07.id,
    batchBId: b08.id,
    scheduledDate: '2026-12-03',
    timeSlot: 'Morning',
    status: 'UPCOMING',
    createdAt: now,
    updatedAt: now,
  },
];

const polls = [
  {
    id: 'poll-match-badminton-1',
    matchId: 'match-badminton-b-1',
    seasonId: s2026.id,
    title: 'Match Prediction: IPM06 vs IPM07 - Badminton (Boys)',
    status: 'OPEN',
    eligibleBatches: [b06.id, b07.id],
    openedAt: now,
  },
];

const highlights = [
  {
    id: 'hl-bb-01',
    seasonId: s2026.id,
    title: 'Basketball (Boys): IPM07 defeated IPM06',
    content: 'IPM07 secured victory over IPM06 with a final score of 75-60 in Basketball (Boys).',
    isPinned: true,
    sortOrder: 1,
    publishedAt: '2026-11-01T20:00:00.000Z',
    author: 'ATHLOS Committee',
  },
  {
    id: 'hl-fut-01',
    seasonId: s2026.id,
    title: 'Futsal (Boys): IPM06 defeated IPM08',
    content: 'IPM06 claimed a 2-0 victory over IPM08 in an intense Futsal (Boys) clash.',
    isPinned: false,
    sortOrder: 2,
    publishedAt: '2026-11-02T19:30:00.000Z',
    author: 'ATHLOS Committee',
  },
  {
    id: 'hl-kk-01',
    seasonId: s2026.id,
    title: 'Kho-Kho (Boys): IPM06 defeated IPM08',
    content: 'IPM06 triumphed over IPM08 with an 18-15 scoreline in Kho-Kho (Boys).',
    isPinned: false,
    sortOrder: 3,
    publishedAt: '2026-11-07T18:00:00.000Z',
    author: 'ATHLOS Committee',
  },
];

const announcements = [
  {
    id: 'ann-welcome',
    seasonId: s2026.id,
    title: 'ATHLOS War of Batches 2026–27',
    content: 'Standings reflect official approved scores from the authoritative Batch Scores Table.',
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

const googleSheetsConfig = [
  {
    id: 'gs-config-default',
    seasonId: s2026.id,
    spreadsheetId: '',
    sheetName: '2026-27',
    syncFrequencyMinutes: 5,
    isActive: false,
  },
];

const fullDb = {
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
      id: 'audit-init',
      actor: 'system',
      action: 'SYSTEM_INITIALIZED',
      entityType: 'SYSTEM',
      details: { message: 'ATHLOS War of Batches database initialized with official 2026-27 structures.' },
      createdAt: now,
    },
  ],
  admin_users: adminUsers,
  google_sheets_config: googleSheetsConfig,
};

fs.writeFileSync(DB_FILE, JSON.stringify(fullDb, null, 2), 'utf-8');
console.log('Database initialized successfully at', DB_FILE);

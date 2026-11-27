import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import {
  Season,
  Batch,
  Sport,
  Category,
  Match,
  OfficialBatchScore,
  ImportBatch,
  ImportRow,
  RecordVersion,
  Highlight,
  Announcement,
  Poll,
  PollVote,
  AuditLog,
  AdminUser,
  GoogleSheetsConfig,
} from '@/lib/types';

interface DatabaseSchema {
  seasons: Season[];
  batches: Batch[];
  sports: Sport[];
  categories: Category[];
  matches: Match[];
  official_batch_scores: OfficialBatchScore[];
  import_batches: ImportBatch[];
  import_rows: ImportRow[];
  record_versions: RecordVersion[];
  highlights: Highlight[];
  announcements: Announcement[];
  polls: Poll[];
  poll_votes: PollVote[];
  audit_logs: AuditLog[];
  admin_users: AdminUser[];
  google_sheets_config: GoogleSheetsConfig[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const BUNDLED_DB_FILE = path.join(DATA_DIR, 'athlos_wob.json');
const TMP_DB_FILE = path.join(os.tmpdir(), 'athlos_wob.json');

// Ensure data directory exists safely without failing on read-only serverless filesystems
try {
  if (!fs.existsSync(DATA_DIR) && !process.env.VERCEL) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch {
  // Read-only filesystem is expected in serverless environments
}

function getInitialData(): DatabaseSchema {
  const now = new Date().toISOString();
  const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Athlos@2026';
  const passwordHash = bcrypt.hashSync(initialAdminPassword, 10);

  // 1. Initial Seasons
  const s2026: Season = {
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

  const s2025: Season = {
    id: 'season-2025-26',
    name: 'ATHLOS War of Batches 2025–26',
    slug: '2025-26',
    status: 'archived',
    startDate: '2025-11-25',
    endDate: '2025-12-23',
    createdAt: now,
    updatedAt: now,
  };

  const s2024: Season = {
    id: 'season-2024-25',
    name: 'ATHLOS War of Batches 2024–25',
    slug: '2024-25',
    status: 'archived',
    startDate: '2024-11-28',
    endDate: '2024-12-20',
    createdAt: now,
    updatedAt: now,
  };

  const s2023: Season = {
    id: 'season-2023-24',
    name: 'ATHLOS War of Batches 2023–24',
    slug: '2023-24',
    status: 'archived',
    startDate: '2024-02-10',
    endDate: '2024-02-28',
    createdAt: now,
    updatedAt: now,
  };

  const s2022: Season = {
    id: 'season-2022-23',
    name: 'ATHLOS War of Batches 2022–23',
    slug: '2022-23',
    status: 'archived',
    startDate: '2022-11-01',
    endDate: '2023-01-30',
    createdAt: now,
    updatedAt: now,
  };

  // 2. Batches for 2026-27
  const b06: Batch = {
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

  const b07: Batch = {
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

  const b08: Batch = {
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

  // 3. Batches for 2025-26
  const b25_05: Batch = {
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

  const b25_06: Batch = {
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

  const b25_07: Batch = {
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

  // 4. Initial Sports for 2026-27 (From Official Workbook)
  const sportsList: Array<{ name: string; slug: string; format: any }> = [
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
    { name: 'Tennis', slug: 'tennis', format: 'SETS' },
  ];

  const sports: Sport[] = sportsList.map((s) => ({
    id: `sport-${s.slug}`,
    seasonId: s2026.id,
    name: s.name,
    slug: s.slug,
    description: `Official ${s.name} tournament fixtures for War of Batches 2026–27`,
    scoreFormatType: s.format,
    enabled: true,
  }));

  // 5. Initial Categories for 2026-27 (Strictly Boys and Girls only)
  const categories: Category[] = [
    { id: 'cat-boys', seasonId: s2026.id, sportId: '', name: 'Boys', sortOrder: 1, enabled: true },
    { id: 'cat-girls', seasonId: s2026.id, sportId: '', name: 'Girls', sortOrder: 2, enabled: true },
  ];

  // 6. Official Batch Scores (Authoritative Batch Scores Table Row 89)
  const officialScores2026: OfficialBatchScore[] = [
    {
      id: 'obs-2026-b07',
      seasonId: s2026.id,
      batchId: b07.id,
      batchCode: 'IPM07',
      totalPoints: 52.0,
      wins: 26,
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
      totalPoints: 38.0,
      wins: 19,
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
      totalPoints: 26.0,
      wins: 13,
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

  // Historical Official Scores for 2025-26 from wob_2025-26_sample_REFERENCE_ONLY.xlsx Row 79
  const officialScores2025: OfficialBatchScore[] = [
    {
      id: 'obs-2025-b06',
      seasonId: s2025.id,
      batchId: b25_06.id,
      batchCode: 'IPM06',
      totalPoints: 59.0, // Champion
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
      totalPoints: 49.5, // Runner Up
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

  // 7. Initial Matches for 2026-27 (Pre-seeded fixtures from official template)
  const matches: Match[] = [
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
    {
      id: 'match-futsal-b-3',
      seasonId: s2026.id,
      sportId: 'sport-futsal',
      categoryId: 'cat-futsal-boys',
      batchAId: b08.id,
      batchBId: b06.id,
      scheduledDate: '2026-12-04',
      timeSlot: 'Morning',
      status: 'UPCOMING',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'match-futsal-g-1',
      seasonId: s2026.id,
      sportId: 'sport-futsal',
      categoryId: 'cat-futsal-girls',
      batchAId: b06.id,
      batchBId: b07.id,
      scheduledDate: '2026-12-02',
      timeSlot: 'Morning',
      status: 'UPCOMING',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'match-cricket-b-1',
      seasonId: s2026.id,
      sportId: 'sport-cricket',
      categoryId: 'cat-cricket-boys',
      batchAId: b08.id,
      batchBId: b07.id,
      scheduledDate: '2026-12-07',
      timeSlot: 'Morning',
      status: 'UPCOMING',
      createdAt: now,
      updatedAt: now,
    },
  ];

  // 8. Initial Poll (Scheduled for Today, strictly batch names only)
  const initialPoll: Poll = {
    id: 'poll-match-badminton-1',
    matchId: 'match-badminton-b-1',
    seasonId: s2026.id,
    title: 'Match Prediction: IPM06 vs IPM07 - Badminton (Boys)',
    status: 'OPEN',
    eligibleBatches: [b06.id, b07.id],
    openedAt: now,
  };

  // 9. Initial Highlight & Announcement (Data-driven, strictly batch names only)
  const highlights: Highlight[] = [
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

  const announcements: Announcement[] = [
    {
      id: 'ann-welcome',
      seasonId: s2026.id,
      title: 'ATHLOS War of Batches 2026–27',
      content: 'Standings reflect official approved scores from the authoritative Batch Scores Table.',
      isBanner: true,
      publishedAt: now,
    },
  ];

  // 10. Initial Admin User
  const adminUsers: AdminUser[] = [
    {
      id: 'admin-001',
      email: process.env.INITIAL_ADMIN_EMAIL || 'admin@athlos.edu',
      passwordHash,
      role: 'SUPER_ADMIN',
      mustChangePassword: true,
      tokenVersion: 2,
      createdAt: now,
      updatedAt: now,
    },
  ];

  // 11. Google Sheets Config
  const gSheetsConfig: GoogleSheetsConfig[] = [
    {
      id: 'gs-config-default',
      seasonId: s2026.id,
      spreadsheetId: process.env.GOOGLE_DEFAULT_SPREADSHEET_ID || '',
      sheetName: '2026-27',
      syncFrequencyMinutes: 5,
      isActive: false,
    },
  ];

  return {
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
    polls: [initialPoll],
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
    google_sheets_config: gSheetsConfig,
  };
}

class Database {
  private inMemoryData: DatabaseSchema | null = null;

  private load(): DatabaseSchema {
    if (this.inMemoryData) {
      return this.inMemoryData;
    }

    // 1. Check if an updated writable copy exists in /tmp (handles serverless updates)
    if (fs.existsSync(TMP_DB_FILE)) {
      try {
        let preferBundled = false;
        if (fs.existsSync(BUNDLED_DB_FILE)) {
          const tmpMtime = fs.statSync(TMP_DB_FILE).mtimeMs;
          const bundledMtime = fs.statSync(BUNDLED_DB_FILE).mtimeMs;
          if (bundledMtime > tmpMtime) {
            preferBundled = true;
          }
        }
        if (!preferBundled) {
          const content = fs.readFileSync(TMP_DB_FILE, 'utf-8');
          this.inMemoryData = JSON.parse(content);
          return this.inMemoryData!;
        }
      } catch (err) {
        console.warn('Failed to parse /tmp database file, falling back to bundled data:', err);
      }
    }

    // 2. Check if the bundled official database file exists in project (data/athlos_wob.json)
    if (fs.existsSync(BUNDLED_DB_FILE)) {
      try {
        const content = fs.readFileSync(BUNDLED_DB_FILE, 'utf-8');
        this.inMemoryData = JSON.parse(content);
        return this.inMemoryData!;
      } catch (err) {
        console.error('Failed to read bundled database file:', err);
      }
    }

    // 3. Fallback to generated seed data
    const initial = getInitialData();
    this.inMemoryData = initial;
    try {
      this.save(initial);
    } catch {
      // Non-fatal if persistence fails in constrained environment
    }
    return initial;
  }

  private save(data: DatabaseSchema): void {
    this.inMemoryData = data;
    const jsonStr = JSON.stringify(data, null, 2);

    // Try saving to bundled location if writable (standard node / local dev)
    let savedToBundled = false;
    try {
      const tempFile = `${BUNDLED_DB_FILE}.tmp.${crypto.randomBytes(4).toString('hex')}`;
      fs.writeFileSync(tempFile, jsonStr, 'utf-8');
      fs.renameSync(tempFile, BUNDLED_DB_FILE);
      savedToBundled = true;
    } catch {
      // Expected on read-only serverless filesystems (e.g. Vercel)
    }

    // Always ensure /tmp copy is updated in serverless or fallback scenarios
    if (!savedToBundled || process.env.VERCEL) {
      try {
        const tempFile = `${TMP_DB_FILE}.tmp.${crypto.randomBytes(4).toString('hex')}`;
        fs.writeFileSync(tempFile, jsonStr, 'utf-8');
        fs.renameSync(tempFile, TMP_DB_FILE);
      } catch (err) {
        console.warn('Could not persist database to /tmp (in-memory state preserved):', err);
      }
    }

    // Trigger asynchronous remote KV persistence if configured
    this.saveToRemote().catch(() => {});
  }

  // Repository Methods
  public getTable<K extends keyof DatabaseSchema>(tableName: K): DatabaseSchema[K] {
    const data = this.load();
    return data[tableName];
  }

  public query<K extends keyof DatabaseSchema>(
    tableName: K,
    predicate?: (item: DatabaseSchema[K][number]) => boolean
  ): DatabaseSchema[K] {
    const table = this.getTable(tableName);
    if (!predicate) return [...table] as DatabaseSchema[K];
    return table.filter(predicate as any) as DatabaseSchema[K];
  }

  public findById<K extends keyof DatabaseSchema>(
    tableName: K,
    id: string
  ): DatabaseSchema[K][number] | undefined {
    const table = this.getTable(tableName);
    return (table as any[]).find((item) => item.id === id);
  }

  public insert<K extends keyof DatabaseSchema>(
    tableName: K,
    item: DatabaseSchema[K][number]
  ): DatabaseSchema[K][number] {
    const data = this.load();
    (data[tableName] as any[]).push(item);
    this.save(data);
    return item;
  }

  public update<K extends keyof DatabaseSchema>(
    tableName: K,
    id: string,
    updates: Partial<DatabaseSchema[K][number]>
  ): DatabaseSchema[K][number] | null {
    const data = this.load();
    const table = data[tableName] as any[];
    const index = table.findIndex((item) => item.id === id);
    if (index === -1) return null;

    table[index] = { ...table[index], ...updates, updatedAt: new Date().toISOString() };
    this.save(data);
    return table[index];
  }

  public delete<K extends keyof DatabaseSchema>(tableName: K, id: string): boolean {
    const data = this.load();
    const table = data[tableName] as any[];
    const index = table.findIndex((item) => item.id === id);
    if (index === -1) return false;

    table.splice(index, 1);
    this.save(data);
    return true;
  }

  public logAudit(
    actor: string,
    action: string,
    entityType: string,
    entityId?: string,
    details?: Record<string, any>,
    importBatchId?: string,
    ipAddress?: string
  ): AuditLog {
    const entry: AuditLog = {
      id: `audit-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
      actor,
      action,
      entityType,
      entityId,
      importBatchId,
      details,
      ipAddress,
      createdAt: new Date().toISOString(),
    };
    this.insert('audit_logs', entry);
    return entry;
  }

  // Force reseed (for tests or reset)
  public resetToDefault(): void {
    const initial = getInitialData();
    this.save(initial);
  }

  // Replace full database state with an approved master schema
  public replaceAll(data: DatabaseSchema): void {
    this.save(data);
  }

  // Universal Serverless Remote Persistence (Vercel KV / Upstash Redis / Remote Store)
  private lastRemoteSync: number = 0;

  public async syncFromRemote(force = false): Promise<void> {
    const now = Date.now();
    // Cache for 3 seconds to avoid redundant remote requests in the same execution cycle
    if (!force && this.inMemoryData && now - this.lastRemoteSync < 3000) {
      return;
    }

    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (kvUrl && kvToken) {
      try {
        const res = await fetch(`${kvUrl}/get/athlos_wob_db`, {
          headers: { Authorization: `Bearer ${kvToken}` },
          cache: 'no-store',
        });
        if (res.ok) {
          const body = await res.json();
          if (body && body.result) {
            const parsed = typeof body.result === 'string' ? JSON.parse(body.result) : body.result;
            if (parsed && Array.isArray(parsed.seasons) && Array.isArray(parsed.matches)) {
              // Check if bundled database exists and is newer than remote store
              let bundledDb: DatabaseSchema | null = null;
              if (fs.existsSync(BUNDLED_DB_FILE)) {
                try {
                  bundledDb = JSON.parse(fs.readFileSync(BUNDLED_DB_FILE, 'utf-8'));
                } catch {}
              }

              const getLatestTimestamp = (dbObj: any): number => {
                let maxTs = 0;
                if (dbObj?.import_batches?.[0]?.approvedAt) {
                  maxTs = Math.max(maxTs, new Date(dbObj.import_batches[0].approvedAt).getTime());
                }
                if (dbObj?.import_batches?.[0]?.uploadedAt) {
                  maxTs = Math.max(maxTs, new Date(dbObj.import_batches[0].uploadedAt).getTime());
                }
                if (dbObj?.audit_logs?.length) {
                  const lastAudit = dbObj.audit_logs[dbObj.audit_logs.length - 1];
                  const aTs = lastAudit?.timestamp || lastAudit?.createdAt;
                  if (aTs) {
                    maxTs = Math.max(maxTs, new Date(aTs).getTime());
                  }
                }
                return maxTs;
              };

              const remoteTs = getLatestTimestamp(parsed);
              const bundledTs = bundledDb ? getLatestTimestamp(bundledDb) : 0;

              if (bundledDb && bundledTs > remoteTs) {
                // Bundled database from fresh deployment is newer than remote store -> adopt and sync
                this.inMemoryData = bundledDb;
                this.lastRemoteSync = now;
                try {
                  fs.writeFileSync(TMP_DB_FILE, JSON.stringify(bundledDb, null, 2), 'utf-8');
                } catch {}
                this.saveToRemote().catch(() => {});
                return;
              }

              if (bundledDb?.admin_users?.length) {
                // Preserve authoritative admin credentials across remote sync
                (parsed as any).admin_users = bundledDb.admin_users;
              }

              this.inMemoryData = parsed as DatabaseSchema;
              this.lastRemoteSync = now;
              try {
                fs.writeFileSync(TMP_DB_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
              } catch {}
              return;
            }
          }
        }
      } catch (err) {
        console.warn('Could not sync database from remote KV, using local fallback:', err);
      }
    }

    // Fallback: load local filesystem state
    this.load();
  }

  public async saveToRemote(): Promise<boolean> {
    if (!this.inMemoryData) return false;

    const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (kvUrl && kvToken) {
      try {
        const jsonStr = JSON.stringify(this.inMemoryData);
        const res = await fetch(`${kvUrl}/set/athlos_wob_db`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${kvToken}`,
            'Content-Type': 'application/json',
          },
          body: jsonStr,
        });
        return res.ok;
      } catch (err) {
        console.error('Failed to persist database to remote KV store:', err);
        return false;
      }
    }
    return false;
  }

  public getStorageMode(): { isRemote: boolean; provider: string } {
    const hasKv = Boolean(
      (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) ||
      (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    );
    if (hasKv) {
      return { isRemote: true, provider: 'Vercel KV / Upstash Redis (Shared Cross-Container)' };
    }
    return { isRemote: false, provider: 'Serverless Local Storage (Ephemeral Container Mode)' };
  }
}

export const db = new Database();

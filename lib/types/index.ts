export type SeasonStatus = 'draft' | 'active' | 'archived';
export type MatchStatus = 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
export type ImportStatus = 'STAGED' | 'APPROVED' | 'REJECTED' | 'ROLLED_BACK';
export type ImportOperation = 'INSERT' | 'UPDATE' | 'CONFLICT' | 'MISSING_FROM_SOURCE' | 'INVALID';
export type PollStatus = 'OPEN' | 'CLOSED';

export interface Season {
  id: string;
  name: string;
  slug: string;
  status: SeasonStatus;
  startDate?: string;
  endDate?: string;
  activatedAt?: string;
  activatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  id: string;
  seasonId: string;
  code: string; // e.g. 'IPM06', 'IPM07', 'IPM08'
  displayName: string;
  mascotName: string;
  mascotImagePath: string;
  primaryColor: string;
  secondaryColor: string;
  sortOrder: number;
  enabled: boolean;
}

export interface Sport {
  id: string;
  seasonId: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  scoreFormatType: 'SCORE' | 'SETS' | 'RACE_TIME' | 'POINTS' | 'PENALTIES' | 'GENERIC';
  enabled: boolean;
  rulebookUrl?: string;
  rulebookOriginalName?: string;
  rulebookUploadedAt?: string;
  rulebookSize?: number;
  rulebookPublished?: boolean;
}

export interface Category {
  id: string;
  seasonId: string;
  sportId: string;
  name: string; // e.g. 'Boys', 'Girls', 'Mixed', '100M Boys'
  sortOrder: number;
  enabled: boolean;
}

export interface Match {
  id: string;
  seasonId: string;
  sportId: string;
  categoryId?: string;
  batchAId: string;
  batchBId?: string; // Optional for multi-participant events like Athletics
  scheduledDate?: string; // YYYY-MM-DD
  timeSlot?: string; // 'Morning', 'Evening', 'Afternoon'
  status: MatchStatus;
  rawScore?: string; // e.g. '1-0', 'Won by 9 wickets'
  structuredResult?: Record<string, any>;
  winnerBatchId?: string | 'DRAW';
  margin?: string;
  sourceRowKey?: string;
  approvedVersionId?: string;
  isFlagged?: boolean;
  discrepancyNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OfficialBatchScore {
  id: string;
  seasonId: string;
  batchId: string;
  batchCode: string;
  totalPoints: number; // Row 79 Batch Scores Table formula value
  wins: number;
  rank: number;
  tieBroken: boolean;
  breakdownBySport: Record<string, number>; // sportSlug -> points
  sourceSheet: string;
  sourceRow: number;
  lastApprovedAt: string;
  lastApprovedBy: string;
}

export interface ImportBatch {
  id: string;
  seasonId: string;
  fileName: string;
  fileType: 'EXCEL' | 'GOOGLE_SHEETS';
  status: ImportStatus;
  totalRows: number;
  addedCount: number;
  updatedCount: number;
  conflictCount: number;
  missingCount: number;
  invalidCount: number;
  diffSummary: {
    additions: any[];
    updates: any[];
    conflicts: any[];
    missing: any[];
    invalids: any[];
    officialScoresBefore: Record<string, number>;
    officialScoresAfter: Record<string, number>;
    sportBreakdowns?: Record<string, Record<string, number>>;
  };
  createdAt: string;
  createdBy: string;
  approvedAt?: string;
  approvedBy?: string;
  rolledBackAt?: string;
  rolledBackBy?: string;
}

export interface ImportRow {
  id: string;
  importBatchId: string;
  sheetName: string;
  rowNumber: number;
  entityType: 'MATCH' | 'BATCH_SCORE';
  rawData: Record<string, any>;
  normalizedData: Record<string, any>;
  operation: ImportOperation;
  conflictDetails?: Record<string, any>;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface RecordVersion {
  id: string;
  entityType: 'MATCH' | 'OFFICIAL_SCORE';
  entityId: string;
  importBatchId: string;
  beforeSnapshot: any;
  afterSnapshot: any;
  createdAt: string;
  createdBy: string;
}

export interface Highlight {
  id: string;
  seasonId: string;
  title: string;
  content: string;
  matchId?: string;
  mediaUrl?: string;
  isPinned: boolean;
  sortOrder: number;
  publishedAt: string;
  author: string;
}

export interface Announcement {
  id: string;
  seasonId: string;
  title: string;
  content: string;
  isBanner: boolean;
  publishedAt: string;
}

export interface Poll {
  id: string;
  matchId: string;
  seasonId: string;
  title: string;
  status: PollStatus;
  eligibleBatches: string[]; // batch IDs
  openedAt?: string;
  closedAt?: string;
}

export interface PollVote {
  id: string;
  pollId: string;
  batchId: string;
  deviceTokenHash: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  entityId?: string;
  importBatchId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  passwordHash: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
  resetToken?: string;
  resetTokenExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoogleSheetsConfig {
  id: string;
  seasonId: string;
  spreadsheetId: string;
  sheetName: string;
  syncFrequencyMinutes: number;
  lastAttemptAt?: string;
  lastSuccessAt?: string;
  lastError?: string;
  isActive: boolean;
}

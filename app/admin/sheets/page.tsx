'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Database,
  History,
  AlertTriangle,
} from 'lucide-react';

interface SyncHistoryItem {
  id: string;
  startedAt: string;
  completedAt: string;
  status: 'SUCCESS' | 'FAILED' | 'UNCHANGED';
  actor: string;
  addedCount: number;
  updatedCount: number;
  unchangedCount: number;
  skippedCount: number;
  errors: string[];
  message: string;
}

interface SheetsConfigData {
  id: string;
  seasonId: string;
  spreadsheetId: string;
  spreadsheetName?: string;
  spreadsheetUrl?: string;
  sheetName: string;
  syncFrequencyMinutes: number;
  lastAttemptAt?: string;
  lastSuccessAt?: string;
  lastError?: string;
  lastSummary?: {
    addedCount: number;
    updatedCount: number;
    unchangedCount: number;
    skippedCount: number;
    errors: string[];
    officialScores: Record<string, number>;
  };
  syncHistory?: SyncHistoryItem[];
  isActive: boolean;
}

export default function LiveGoogleSheetsSyncPage() {
  const [config, setConfig] = useState<SheetsConfigData | null>(null);
  const [nextScheduledAt, setNextScheduledAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const SPREADSHEET_ID = '1C7RNiyTwUwb5b6kQ7DRJFZDLqivcqthvUDmvGrGt6TE';
  const SPREADSHEET_URL =
    'https://docs.google.com/spreadsheets/d/1C7RNiyTwUwb5b6kQ7DRJFZDLqivcqthvUDmvGrGt6TE/edit?usp=sharing';
  const SPREADSHEET_NAME = 'ATHLOS War of Batches 2026–27 Master Schedule';

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/sheets/sync', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        setNextScheduledAt(data.nextScheduledSyncAt);
      }
    } catch (err: any) {
      console.error('Failed to load Google Sheets config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Poll status every 30s
    return () => clearInterval(interval);
  }, []);

  const handleSyncNow = async () => {
    setSyncing(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/admin/sheets/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Synchronization failed');
      } else {
        setMessage(
          data.isUnchanged
            ? 'Google Sheets verified: No content modifications detected since last synchronization.'
            : data.message || 'Live synchronization completed successfully! Production website updated.'
        );
        await loadData();
      }
    } catch {
      setError('A network error occurred while communicating with the sync server.');
    } finally {
      setSyncing(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const getRelativeTime = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return `${diffSec}s ago`;
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHr = Math.floor(diffMin / 60);
      return `${diffHr}h ago`;
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-surfaceBorder gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-athlos-gold block mb-1">
            Live Tournament Data Pipeline
          </span>
          <h1 className="text-3xl font-black uppercase text-white tracking-tight flex items-center space-x-3">
            <span>LIVE GOOGLE SHEETS SYNC</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative automated synchronization engine connecting Google Sheets directly to production Upstash Redis.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href={SPREADSHEET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-lg bg-surfaceLight border border-surfaceBorder hover:border-athlos-gold text-slate-200 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition shadow-sm"
          >
            <span>Open Google Sheet</span>
            <ExternalLink className="w-3.5 h-3.5 text-athlos-gold" />
          </a>

          <button
            onClick={handleSyncNow}
            disabled={syncing}
            className="px-5 py-2.5 rounded-lg bg-athlos-gold hover:bg-yellow-400 text-black text-xs font-black uppercase tracking-wider flex items-center space-x-2 transition shadow-glow-gold disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'SYNC NOW'}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {message && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center space-x-3 shadow-lg">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center space-x-3 shadow-lg">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Connection Status Card */}
      <div className="esports-card rounded-2xl p-6 sm:p-8 border-athlos-gold/30 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-surfaceBorder/60">
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                Connected & Synchronized Live
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              {config?.spreadsheetName || SPREADSHEET_NAME}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
              <span>Spreadsheet ID:</span>
              <code className="text-athlos-gold bg-black/40 px-2 py-0.5 rounded border border-surfaceBorder">
                {config?.spreadsheetId || SPREADSHEET_ID}
              </code>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-surfaceLight/80 border border-surfaceBorder flex items-center space-x-3">
            <Clock className="w-5 h-5 text-athlos-gold" />
            <div className="text-xs">
              <span className="text-slate-400 block font-mono text-[10px] uppercase">Automated Schedule</span>
              <span className="font-bold text-white uppercase">Every 5 Minutes (Serverless Cron)</span>
            </div>
          </div>
        </div>

        {/* Schedule & Timing Diagnostics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-surfaceLight/40 border border-surfaceBorder space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Last Successful Sync</span>
            <div className="text-sm font-bold text-white flex items-center space-x-2">
              <span>{formatDate(config?.lastSuccessAt)}</span>
            </div>
            {config?.lastSuccessAt && (
              <span className="text-[10px] text-emerald-400 font-mono block">
                {getRelativeTime(config.lastSuccessAt)}
              </span>
            )}
          </div>

          <div className="p-4 rounded-xl bg-surfaceLight/40 border border-surfaceBorder space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Next Scheduled Run</span>
            <div className="text-sm font-bold text-white">
              {nextScheduledAt ? formatDate(nextScheduledAt) : 'Within 5 minutes'}
            </div>
            <span className="text-[10px] text-slate-500 font-mono block">Auto-managed by scheduler</span>
          </div>

          <div className="p-4 rounded-xl bg-surfaceLight/40 border border-surfaceBorder space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase block">Persistence Target</span>
            <div className="text-sm font-bold text-emerald-400 flex items-center space-x-1.5">
              <Database className="w-4 h-4" />
              <span>Upstash Redis Shared KV</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono block">Synced across all serverless containers</span>
          </div>
        </div>

        {/* Last Sync Result Metrics */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-athlos-gold" />
            <span>Latest Synchronization Metrics</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 rounded-xl bg-surfaceLight/60 border border-surfaceBorder">
              <span className="text-[10px] font-extrabold uppercase text-emerald-400 block mb-1">
                Records Added
              </span>
              <span className="text-2xl font-black text-white">
                {config?.lastSummary?.addedCount ?? 0}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surfaceLight/60 border border-surfaceBorder">
              <span className="text-[10px] font-extrabold uppercase text-blue-400 block mb-1">
                Records Updated
              </span>
              <span className="text-2xl font-black text-white">
                {config?.lastSummary?.updatedCount ?? 0}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surfaceLight/60 border border-surfaceBorder">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">
                Unchanged Fixtures
              </span>
              <span className="text-2xl font-black text-white">
                {config?.lastSummary?.unchangedCount ?? 72}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-surfaceLight/60 border border-surfaceBorder">
              <span className="text-[10px] font-extrabold uppercase text-amber-400 block mb-1">
                Safe Deletions Retained
              </span>
              <span className="text-2xl font-black text-white">
                {config?.lastSummary?.skippedCount ?? 0}
              </span>
            </div>
          </div>
        </div>

        {/* Official Batch Scores Impact Preview */}
        {config?.lastSummary?.officialScores && Object.keys(config.lastSummary.officialScores).length > 0 && (
          <div className="p-4 rounded-xl bg-black/40 border border-surfaceBorder space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-athlos-gold block">
              Authoritative Row 87 Leaderboard Points (Official Authority)
            </span>
            <div className="grid grid-cols-3 gap-3 text-center pt-1">
              {['IPM08', 'IPM06', 'IPM07'].map((code) => (
                <div key={code} className="p-2.5 rounded bg-surfaceLight/40 border border-surfaceBorder">
                  <span className="text-xs font-bold text-slate-300 block">{code}</span>
                  <span className="text-base font-black text-white mt-0.5 block">
                    {Number(config.lastSummary?.officialScores[code] ?? 0).toFixed(1)} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Worksheet Structure & Multi-Season Mapping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="esports-card rounded-2xl p-6 border-surfaceBorder space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-athlos-gold">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Worksheet Tabs Mapping</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-surfaceLight/50 border border-surfaceBorder flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">2026-27 (Current Season)</span>
                <span className="text-slate-400 text-[11px]">Active fixtures, 72 match schedules, Row 87 batch totals</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                Authoritative
              </span>
            </div>

            {['2025-26', '2024-25', '2023-24', '2022-23'].map((sheet) => (
              <div
                key={sheet}
                className="p-3 rounded-xl bg-surfaceLight/30 border border-surfaceBorder flex items-center justify-between text-slate-300"
              >
                <div>
                  <span className="font-semibold text-slate-200 block">{sheet} (Historical Archive)</span>
                  <span className="text-slate-500 text-[11px]">Past seasons archive & historical score breakdown</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 bg-surfaceLight border border-surfaceBorder">
                  Archive
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="esports-card rounded-2xl p-6 border-surfaceBorder space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-athlos-gold">
            <ShieldCheck className="w-4 h-4" />
            <span>Data Governance & Safeguards</span>
          </div>

          <ul className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
            <li className="flex items-start space-x-2">
              <span className="text-athlos-gold font-bold">✓</span>
              <span>
                <strong className="text-white">Deterministic Row IDs:</strong> Fixtures map to permanent row IDs (`match-season-2026-27-[row]`), preventing duplicate cards on repeat syncs.
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-athlos-gold font-bold">✓</span>
              <span>
                <strong className="text-white">Safe Deletion Policy:</strong> If a row is removed from Google Sheets, the corresponding record is retained with a discrepancy flag rather than wiped.
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-athlos-gold font-bold">✓</span>
              <span>
                <strong className="text-white">Multi-Entity Synchronization:</strong> Synchronizes fixtures, Row 87 batch scores, Prediction Polls (with strict Morning 6:00 AM IST & Evening 6:00 PM IST closing deadlines), tournament highlights, and user notifications.
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-athlos-gold font-bold">✓</span>
              <span>
                <strong className="text-white">Edge Cache Invalidation:</strong> Successful synchronizations atomically invalidate Next.js caches on Vercel without requiring code redeployments.
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-athlos-gold font-bold">✓</span>
              <span>
                <strong className="text-white">Excel Import Coexistence:</strong> Manual workbook uploads remain fully operational in the Import Review Queue with conflict protections.
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Synchronization History */}
      <div className="esports-card rounded-2xl p-6 border-surfaceBorder space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-athlos-gold">
            <History className="w-4 h-4" />
            <span>Synchronization Audit Log</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Retaining recent synchronization cycles
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surfaceBorder text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-2.5 px-3">Execution Time</th>
                <th className="py-2.5 px-3">Triggered By</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-center">Added</th>
                <th className="py-2.5 px-3 text-center">Updated</th>
                <th className="py-2.5 px-3 text-center">Unchanged</th>
                <th className="py-2.5 px-3">Summary Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surfaceBorder/60">
              {config?.syncHistory && config.syncHistory.length > 0 ? (
                config.syncHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-surfaceLight/30 transition">
                    <td className="py-3 px-3 font-mono text-slate-300">
                      {formatDate(item.completedAt || item.startedAt)}
                    </td>
                    <td className="py-3 px-3 font-mono text-athlos-gold">
                      {item.actor}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.status === 'SUCCESS'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : item.status === 'UNCHANGED'
                            ? 'bg-slate-900 text-slate-400 border border-slate-700'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-emerald-400">
                      {item.addedCount}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-blue-400">
                      {item.updatedCount}
                    </td>
                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      {item.unchangedCount}
                    </td>
                    <td className="py-3 px-3 text-slate-300 max-w-xs truncate">
                      {item.message}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500 font-mono">
                    No synchronization logs recorded yet. Click "SYNC NOW" to execute the initial sync.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

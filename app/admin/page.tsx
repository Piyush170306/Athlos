import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  CalendarDays,
  FileSpreadsheet,
  BarChart3,
  Flame,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { getActiveSeason, getOfficialLeaderboard } from '@/lib/db/public';
import { db } from '@/lib/db';

export const revalidate = 0;

export default function AdminOverviewPage() {
  const activeSeason = getActiveSeason();
  const leaderboard = getOfficialLeaderboard(activeSeason.id);
  const matches = db.query('matches', (m) => m.seasonId === activeSeason.id);
  const sports = db.query('sports', (s) => s.seasonId === activeSeason.id && s.enabled);
  const pendingImports = db.query('import_batches', (b) => b.status === 'STAGED');
  const recentAudits = db.getTable('audit_logs').slice(-5).reverse();
  const activePoll = db.query('polls', (p) => p.status === 'OPEN')[0];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-surfaceBorder gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-athlos-gold block mb-1">
            Tournament Management Console
          </span>
          <h1 className="text-3xl font-black uppercase text-white tracking-tight">
            Admin Overview
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/imports"
            className="px-4 py-2 rounded-lg bg-athlos-gold text-black text-xs font-black uppercase tracking-wider hover:bg-yellow-400 transition shadow-glow-gold flex items-center space-x-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Import / Sync Workbook</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Season */}
        <div className="esports-card rounded-xl p-5 border-surfaceBorder">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold uppercase tracking-wider">Active Season</span>
            <CalendarDays className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{activeSeason.name}</div>
          <div className="text-[11px] text-emerald-400 font-semibold mt-1">
            Status: {activeSeason.status.toUpperCase()}
          </div>
        </div>

        {/* Pending Imports */}
        <div className="esports-card rounded-xl p-5 border-surfaceBorder">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold uppercase tracking-wider">Review Queue</span>
            <FileSpreadsheet className="w-4 h-4 text-athlos-gold" />
          </div>
          <div className="text-2xl font-black text-white">{pendingImports.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {pendingImports.length > 0 ? (
              <span className="text-amber-400 font-bold">Batches awaiting approval</span>
            ) : (
              'All spreadsheet imports reviewed'
            )}
          </div>
        </div>

        {/* Total Matches */}
        <div className="esports-card rounded-xl p-5 border-surfaceBorder">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold uppercase tracking-wider">Fixtures</span>
            <Flame className="w-4 h-4 text-athlos-cyan" />
          </div>
          <div className="text-2xl font-black text-white">{matches.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {matches.filter((m) => m.status === 'COMPLETED').length} Completed •{' '}
            {matches.filter((m) => m.status === 'UPCOMING').length} Upcoming
          </div>
        </div>

        {/* Live Polls */}
        <div className="esports-card rounded-xl p-5 border-surfaceBorder">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-bold uppercase tracking-wider">Live Fan Poll</span>
            <BarChart3 className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-white">
            {activePoll ? 'Active' : 'Closed'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            {activePoll ? activePoll.title : 'No active poll'}
          </div>
        </div>
      </div>

      {/* Official Standings Snapshot */}
      <div className="esports-card rounded-xl p-6 border-surfaceBorder">
        <div className="flex items-center justify-between pb-4 border-b border-surfaceBorder mb-4">
          <div>
            <h2 className="text-lg font-black uppercase text-white tracking-wider flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-athlos-gold" />
              <span>Official Standings (Batch Scores Table Row 89)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Authority: Never overridden silently from match results
            </p>
          </div>
          <Link
            href="/admin/matches"
            className="text-xs font-bold text-athlos-gold hover:underline uppercase tracking-wider"
          >
            Manage Scores →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leaderboard.map((entry) => (
            <div
              key={entry.batch.id}
              className="p-4 rounded-lg bg-surfaceLight border border-surfaceBorder flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                  #{entry.rank} {entry.batch.displayName}
                </span>
                <span className="text-2xl font-black text-white block mt-1">
                  {entry.totalPoints.toFixed(1)}{' '}
                  <span className="text-xs text-slate-400 font-normal">pts</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Wins</span>
                <span className="text-sm font-bold text-slate-200">{entry.wins}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Review Queue Alerts */}
        <div className="esports-card rounded-xl p-6 border-surfaceBorder space-y-4">
          <div className="flex items-center justify-between border-b border-surfaceBorder pb-3">
            <h3 className="font-bold text-base text-white uppercase tracking-wider flex items-center space-x-2">
              <FileSpreadsheet className="w-4 h-4 text-athlos-gold" />
              <span>Spreadsheet Review Queue</span>
            </h3>
            <Link
              href="/admin/imports"
              className="text-xs font-semibold text-athlos-gold hover:underline"
            >
              Open Importer
            </Link>
          </div>

          {pendingImports.length === 0 ? (
            <div className="p-4 rounded-lg bg-surfaceLight/50 text-xs text-slate-400 text-center">
              ✓ No pending spreadsheet imports. Upload an Excel workbook or trigger Google Sheets sync to stage changes.
            </div>
          ) : (
            <div className="space-y-2">
              {pendingImports.map((batch) => (
                <div
                  key={batch.id}
                  className="p-3 rounded-lg bg-amber-950/30 border border-amber-600/40 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white block">{batch.fileName}</span>
                    <span className="text-[11px] text-amber-300">
                      {batch.addedCount} additions, {batch.updatedCount} updates, {batch.conflictCount} conflicts
                    </span>
                  </div>
                  <Link
                    href={`/admin/imports?batchId=${batch.id}`}
                    className="px-3 py-1 rounded bg-athlos-gold text-black font-extrabold text-[11px] uppercase"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Audit Log Preview */}
        <div className="esports-card rounded-xl p-6 border-surfaceBorder space-y-4">
          <div className="flex items-center justify-between border-b border-surfaceBorder pb-3">
            <h3 className="font-bold text-base text-white uppercase tracking-wider flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Immutable Audit Trail</span>
            </h3>
            <Link
              href="/admin/audit"
              className="text-xs font-semibold text-emerald-400 hover:underline"
            >
              Full Log
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentAudits.map((audit) => (
              <div
                key={audit.id}
                className="p-2.5 rounded-lg bg-surfaceLight/60 border border-surfaceBorder/60 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-slate-200 block">
                    {audit.action}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    By {audit.actor} • {new Date(audit.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  {audit.entityType}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

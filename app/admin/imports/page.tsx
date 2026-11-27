'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Plus,
  RefreshCw,
  Download,
  Zap,
} from 'lucide-react';
import { ImportBatch } from '@/lib/types';

export default function AdminImportsPage() {
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<ImportBatch | null>(null);
  const [storageMode, setStorageMode] = useState<{ isRemote: boolean; provider: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [syncingOfficial, setSyncingOfficial] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastImportSummary, setLastImportSummary] = useState<any | null>(null);

  // Upload parameters
  const [file, setFile] = useState<File | null>(null);
  const [sheetName, setSheetName] = useState('2026-27');
  const [autoApprove, setAutoApprove] = useState(true);

  const loadBatches = async () => {
    try {
      const res = await fetch('/api/admin/imports');
      const data = await res.json();
      setBatches(data.importBatches || []);
      if (data.storageMode) {
        setStorageMode(data.storageMode);
      }
      if (data.importBatches?.length > 0 && !selectedBatch) {
        setSelectedBatch(data.importBatches[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setMessage(null);
    setError(null);
    setLastImportSummary(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sheetName', sheetName);
    formData.append('autoApprove', autoApprove ? 'true' : 'false');

    try {
      const res = await fetch('/api/admin/imports/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to process Excel workbook');
      } else {
        if (data.autoApproved) {
          setMessage(
            `Workbook "${file.name}" uploaded, validated, and PUBLISHED live! (${data.summary?.addedCount ?? 0} additions, ${data.summary?.updatedCount ?? 0} updates). Live leaderboard updated immediately.`
          );
        } else {
          setMessage(
            `Workbook "${file.name}" parsed and staged for review! (${data.summary?.addedCount ?? 0} additions, ${data.summary?.updatedCount ?? 0} updates). Approve below to publish.`
          );
        }
        setLastImportSummary(data.summary || null);
        setFile(null);
        await loadBatches();
        if (data.importBatch) {
          setSelectedBatch(data.importBatch);
        }
      }
    } catch (err) {
      setError('A network error occurred during file upload');
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async (batchId: string) => {
    if (!confirm('Approve this import batch and publish all scores immediately to the public live dashboard?')) {
      return;
    }
    setActionLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/admin/imports/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ importBatchId: batchId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setMessage('Import batch successfully approved! Live leaderboard and points progression updated.');
        await loadBatches();
        const updated = batches.find((b) => b.id === batchId);
        if (updated) setSelectedBatch({ ...updated, status: 'APPROVED' });
      }
    } catch (err) {
      setError('Failed to approve batch');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (batchId: string) => {
    if (!confirm('Reject this staged import batch? No changes will be published.')) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/imports/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ importBatchId: batchId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setMessage('Import batch rejected.');
        await loadBatches();
      }
    } catch (err) {
      setError('Failed to reject batch');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRollback = async (batchId: string) => {
    if (!confirm('Rollback this approved import? Only records affected by this import will be restored.')) {
      return;
    }
    setActionLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/admin/imports/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ importBatchId: batchId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
      } else {
        setMessage('Import batch successfully rolled back!');
        await loadBatches();
      }
    } catch (err) {
      setError('Failed to rollback batch');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncOfficialWorkbook = async () => {
    if (
      !confirm(
        'Re-sync the repository official tournament workbook (wob_2026-27_official_workbook_v1.xlsx) and instantly publish Row 89 scores to the live leaderboard?'
      )
    ) {
      return;
    }
    setSyncingOfficial(true);
    setMessage(null);
    setError(null);

    try {
      const res = await fetch('/api/admin/imports/sync-workbook', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to sync official workbook');
      } else {
        setMessage(
          `Official tournament workbook successfully synced! Row 89 totals (IPM07: 52, IPM06: 38, IPM08: 26) are published live.`
        );
        setLastImportSummary(data.summary || null);
        await loadBatches();
        if (data.importBatch) {
          setSelectedBatch(data.importBatch);
        }
      }
    } catch (err) {
      setError('Network error while syncing official workbook');
    } finally {
      setSyncingOfficial(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-surfaceBorder gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-athlos-gold block mb-1">
            Data Pipelines & Governance
          </span>
          <h1 className="text-3xl font-black uppercase text-white tracking-tight">
            Import Review & Live Publication
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Excel & Google Sheets pipeline with atomic auto-publication, Row 89 score validation, and rollback support.
          </p>
          <div className="flex items-center space-x-2 mt-2">
            <span className="text-[11px] text-slate-400">Persistence:</span>
            {storageMode?.isRemote ? (
              <span className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-300 border border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Shared Cloud KV (Synchronized Live)</span>
              </span>
            ) : (
              <span
                className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-800/80"
                title="Connect Vercel KV in Storage tab to automatically sync data across all serverless containers"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span>Serverless Local Mode (Connect Vercel KV for instant multi-container sync)</span>
              </span>
            )}
          </div>
        </div>

        {/* Global Pipeline Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSyncOfficialWorkbook}
            disabled={syncingOfficial}
            className="px-3.5 py-2 rounded-lg bg-surfaceLight border border-surfaceBorder hover:border-athlos-gold text-slate-200 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition shadow-sm"
            title="Parse and publish wob_2026-27_official_workbook_v1.xlsx directly into database"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-athlos-gold ${syncingOfficial ? 'animate-spin' : ''}`} />
            <span>{syncingOfficial ? 'Syncing...' : 'Re-sync Official Workbook'}</span>
          </button>
          <a
            href="/api/admin/backup/export"
            download="athlos_database_backup.json"
            className="px-3.5 py-2 rounded-lg bg-surfaceLight border border-surfaceBorder hover:border-slate-500 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-2 transition shadow-sm"
            title="Download full JSON export of the current database"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Download Database JSON</span>
          </a>
        </div>
      </div>

      {/* Prominent Pending Staged Banner */}
      {selectedBatch && selectedBatch.status === 'STAGED' && (
        <div className="p-4 rounded-xl bg-amber-950/70 border border-amber-600 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-200 shadow-glow-amber">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-extrabold text-amber-300 uppercase tracking-wide block">
                Pending Approval: {selectedBatch.fileName}
              </span>
              <span className="text-amber-200/80 text-[11px]">
                This workbook is parsed but NOT yet live on public dashboards. Click below to publish now.
              </span>
            </div>
          </div>
          <button
            onClick={() => handleApprove(selectedBatch.id)}
            disabled={actionLoading}
            className="px-4 py-2 rounded-lg bg-athlos-gold text-black font-black uppercase tracking-wider hover:bg-yellow-400 transition shadow-glow-gold whitespace-nowrap text-xs flex items-center space-x-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-black" />
            <span>{actionLoading ? 'Publishing...' : 'Approve & Publish Live Now'}</span>
          </button>
        </div>
      )}

      {/* Feedback Messages */}
      {message && (
        <div className="p-3.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-center space-x-2">
          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Rich Import Summary Card if available */}
      {lastImportSummary && (
        <div className="p-4 rounded-xl bg-surfaceLight/80 border border-athlos-gold/50 space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-surfaceBorder">
            <span className="font-black uppercase tracking-wider text-athlos-gold flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Import Execution Summary</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                lastImportSummary.status === 'APPROVED'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border-amber-800'
              }`}
            >
              {lastImportSummary.status || 'PROCESSED'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
            <div className="p-2.5 rounded bg-black/40 border border-surfaceBorder">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Total Rows</span>
              <span className="text-base font-black text-white">{lastImportSummary.totalRows ?? '-'}</span>
            </div>
            <div className="p-2.5 rounded bg-black/40 border border-surfaceBorder">
              <span className="text-[10px] font-bold text-emerald-400 uppercase block">New Matches</span>
              <span className="text-base font-black text-white">{lastImportSummary.addedCount ?? 0}</span>
            </div>
            <div className="p-2.5 rounded bg-black/40 border border-surfaceBorder">
              <span className="text-[10px] font-bold text-blue-400 uppercase block">Updated</span>
              <span className="text-base font-black text-white">{lastImportSummary.updatedCount ?? 0}</span>
            </div>
            <div className="p-2.5 rounded bg-black/40 border border-surfaceBorder">
              <span className="text-[10px] font-bold text-amber-400 uppercase block">Conflicts</span>
              <span className="text-base font-black text-white">{lastImportSummary.conflictCount ?? 0}</span>
            </div>
          </div>

          {lastImportSummary.officialScores && (
            <div className="pt-2 border-t border-surfaceBorder/60">
              <div className="text-[11px] font-bold text-slate-400 uppercase mb-1.5">
                Official Row 89 Tournament Leaderboard Totals Parsed:
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {Object.entries(lastImportSummary.officialScores).map(([batch, score]: [string, any]) => (
                  <div key={batch} className="p-1.5 rounded bg-surfaceLight border border-surfaceBorder text-xs">
                    <span className="font-bold text-slate-300 block">{batch}</span>
                    <span className="font-black text-athlos-gold">{Number(score).toFixed(1)} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upload Zone & Google Sync Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Excel */}
        <div className="lg:col-span-2 esports-card rounded-2xl p-6 border-surfaceBorder space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center space-x-2">
              <Upload className="w-5 h-5 text-athlos-gold" />
              <span>Upload Excel Workbook</span>
            </h2>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
              Atomic Publish Supported
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Upload <strong>wob_2026-27_official_workbook_v1.xlsx</strong>. Server parses dual-tables, forward-fills
            merged continuation cells, verifies Row 89 totals, and automatically updates the live leaderboard.
          </p>

          <form onSubmit={handleUpload} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-400 mb-1">Select .xlsx File</label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  required
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-slate-300 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:font-bold file:bg-athlos-gold file:text-black hover:file:bg-yellow-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Sheet Tab</label>
                <input
                  type="text"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  placeholder="2026-27"
                  className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-white font-mono"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={uploading || !file}
                  className="w-full py-2.5 rounded bg-athlos-gold hover:bg-yellow-400 disabled:opacity-40 text-black font-black uppercase tracking-wider shadow-glow-gold transition flex items-center justify-center space-x-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploading ? 'Processing...' : autoApprove ? 'Upload & Publish' : 'Stage Diff'}</span>
                </button>
              </div>
            </div>

            {/* Atomic Auto-Approve Toggle */}
            <div className="pt-2 border-t border-surfaceBorder/60 flex items-start space-x-2.5">
              <input
                type="checkbox"
                id="autoApproveToggle"
                checked={autoApprove}
                onChange={(e) => setAutoApprove(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded bg-surfaceLight border-surfaceBorder text-athlos-gold focus:ring-athlos-gold accent-amber-400 cursor-pointer"
              />
              <label htmlFor="autoApproveToggle" className="cursor-pointer select-none">
                <span className="font-bold text-white block">
                  Auto-approve and publish immediately to live dashboard{' '}
                  <span className="text-athlos-gold font-normal">(Recommended)</span>
                </span>
                <span className="text-slate-400 text-[11px] block leading-relaxed">
                  Executes upload, diff validation, approval, and live edge cache invalidation atomically in a single
                  request. Avoids multi-container serverless storage delays.
                </span>
              </label>
            </div>
          </form>
        </div>

        {/* Google Sheets Sync Card */}
        <div className="esports-card rounded-2xl p-6 border-surfaceBorder flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold uppercase tracking-wider text-athlos-cyan flex items-center space-x-1.5">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Live Google Sheets Sync</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>5-Min Automated</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Direct connection to the official Google Spreadsheet. Changes are synchronized automatically to production Upstash Redis every 5 minutes.
            </p>
          </div>

          <div className="pt-2 border-t border-surfaceBorder/60 space-y-2">
            <button
              onClick={async () => {
                setActionLoading(true);
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
                    setError(data.error);
                  } else {
                    setMessage(data.message || 'Google Sheets live sync complete!');
                    await loadBatches();
                  }
                } catch {
                  setError('Failed to trigger live Google Sheets sync');
                } finally {
                  setActionLoading(false);
                }
              }}
              disabled={actionLoading}
              className="w-full py-2 px-3 rounded bg-athlos-cyan hover:bg-cyan-400 text-black text-xs font-black uppercase tracking-wider transition shadow-glow-cyan flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
              <span>{actionLoading ? 'Syncing...' : 'SYNC GOOGLE SHEETS NOW'}</span>
            </button>
            <div className="flex items-center justify-between text-[11px] pt-1">
              <Link
                href="/admin/sheets"
                className="text-athlos-gold hover:underline font-bold flex items-center space-x-1"
              >
                <span>Live Sync Dashboard →</span>
              </Link>
              <a
                href="https://docs.google.com/spreadsheets/d/1C7RNiyTwUwb5b6kQ7DRJFZDLqivcqthvUDmvGrGt6TE/edit?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white flex items-center space-x-1"
              >
                <span>Open Sheet ↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Import Batches Split-View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Batches List Sidebar */}
        <div className="esports-card rounded-xl p-4 border-surfaceBorder space-y-3">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 pb-2 border-b border-surfaceBorder flex items-center justify-between">
            <span>Staged & Processed Batches</span>
            <span className="font-mono text-athlos-gold">({batches.length})</span>
          </h3>

          {batches.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-500">
              No imports recorded yet. Upload a workbook above to start.
            </div>
          ) : (
            <div className="space-y-2">
              {batches.map((batch) => {
                const isSelected = selectedBatch?.id === batch.id;
                const isStaged = batch.status === 'STAGED';
                const isApproved = batch.status === 'APPROVED';
                const isRejected = batch.status === 'REJECTED';
                const isRolledBack = batch.status === 'ROLLED_BACK';

                return (
                  <div
                    key={batch.id}
                    onClick={() => setSelectedBatch(batch)}
                    className={`p-3 rounded-lg cursor-pointer border transition ${
                      isSelected
                        ? 'bg-surfaceLight border-athlos-gold shadow-glow-gold'
                        : 'bg-surfaceLight/40 border-surfaceBorder hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-white truncate max-w-[150px]">
                        {batch.fileName}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase border ${
                          isStaged
                            ? 'bg-amber-950/80 text-amber-400 border-amber-800'
                            : isApproved
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
                            : isRejected
                            ? 'bg-rose-950/80 text-rose-400 border-rose-800'
                            : 'bg-blue-950/80 text-blue-400 border-blue-800'
                        }`}
                      >
                        {batch.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>{(batch.addedCount ?? (batch as any).summary?.addedCount) ?? 0} new • {(batch.updatedCount ?? (batch as any).summary?.updatedCount) ?? 0} upd</span>
                      <span className="font-mono">{new Date(batch.createdAt || (batch as any).uploadedAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Batch Preview & Diff View */}
        <div className="lg:col-span-2 space-y-6">
          {selectedBatch ? (
            <div className="esports-card rounded-2xl p-6 border-surfaceBorder space-y-6">
              {/* Batch Meta Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surfaceBorder gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs text-slate-500">{selectedBatch.id}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                        selectedBatch.status === 'STAGED'
                          ? 'bg-amber-950 text-amber-400 border-amber-800'
                          : selectedBatch.status === 'APPROVED'
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          : selectedBatch.status === 'ROLLED_BACK'
                          ? 'bg-blue-950 text-blue-400 border-blue-800'
                          : 'bg-rose-950 text-rose-400 border-rose-800'
                      }`}
                    >
                      {selectedBatch.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-1">
                    {selectedBatch.fileName}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Uploaded by {selectedBatch.createdBy || (selectedBatch as any).uploadedBy || 'admin@athlos.edu'} on{' '}
                    {new Date(selectedBatch.createdAt || (selectedBatch as any).uploadedAt || Date.now()).toLocaleString('en-GB')}
                  </p>
                </div>

                {/* Whole-Batch Action Controls */}
                <div className="flex items-center space-x-2">
                  {selectedBatch.status === 'STAGED' && (
                    <>
                      <button
                        onClick={() => handleReject(selectedBatch.id)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg bg-surfaceLight border border-rose-800/80 text-rose-400 hover:bg-rose-950/40 text-xs font-bold uppercase transition"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(selectedBatch.id)}
                        disabled={actionLoading}
                        className="px-4 py-1.5 rounded-lg bg-athlos-gold text-black text-xs font-black uppercase tracking-wider hover:bg-yellow-400 transition shadow-glow-gold flex items-center space-x-1"
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>Publish Whole Batch</span>
                      </button>
                    </>
                  )}

                  {selectedBatch.status === 'APPROVED' && (
                    <button
                      onClick={() => handleRollback(selectedBatch.id)}
                      disabled={actionLoading}
                      className="px-3 py-1.5 rounded-lg bg-surfaceLight border border-blue-800 text-blue-400 hover:bg-blue-950/40 text-xs font-bold uppercase flex items-center space-x-1.5 transition"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Scoped Rollback</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Diff Metric Counter Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-lg bg-surfaceLight/60 border border-surfaceBorder">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-400 block">
                    Additions
                  </span>
                  <span className="text-xl font-black text-white">
                    {selectedBatch.addedCount ?? (selectedBatch as any).summary?.addedCount ?? 0}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surfaceLight/60 border border-surfaceBorder">
                  <span className="text-[10px] font-extrabold uppercase text-blue-400 block">
                    Updates
                  </span>
                  <span className="text-xl font-black text-white">
                    {selectedBatch.updatedCount ?? (selectedBatch as any).summary?.updatedCount ?? 0}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surfaceLight/60 border border-surfaceBorder">
                  <span className="text-[10px] font-extrabold uppercase text-amber-400 block">
                    Conflicts
                  </span>
                  <span className="text-xl font-black text-white">
                    {selectedBatch.conflictCount ?? (selectedBatch as any).summary?.conflictCount ?? 0}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surfaceLight/60 border border-surfaceBorder">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                    Missing Preserved
                  </span>
                  <span className="text-xl font-black text-white">
                    {selectedBatch.missingCount ?? (selectedBatch as any).summary?.missingCount ?? 0}
                  </span>
                </div>
              </div>

              {/* Official Points Row 89 / Total Row Diff Preview */}
              <div className="p-4 rounded-xl bg-surfaceLight/40 border border-surfaceBorder space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-athlos-gold flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Batch Scores Table Impact (Official Leaderboard Authority)</span>
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center pt-2">
                  {['IPM08', 'IPM06', 'IPM07'].map((code) => {
                    const before = selectedBatch.diffSummary?.officialScoresBefore?.[code] ?? 0;
                    const after =
                      selectedBatch.diffSummary?.officialScoresAfter?.[code] ??
                      (selectedBatch as any).summary?.batchScores?.[code] ??
                      0;

                    return (
                      <div key={code} className="p-2.5 rounded bg-black/40 border border-surfaceBorder">
                        <span className="text-xs font-bold text-slate-300 block">{code}</span>
                        <div className="text-sm font-black mt-1 flex items-center justify-center space-x-1">
                          <span className="text-slate-400">{Number(before).toFixed(1)}</span>
                          <span className="text-athlos-gold">→</span>
                          <span className="text-white">{Number(after).toFixed(1)} pts</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Conflict Warnings if any */}
              {selectedBatch.diffSummary?.conflicts && selectedBatch.diffSummary.conflicts.length > 0 && (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-600 text-xs text-amber-200 space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Ambiguous / Conflict Matches Detected</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {selectedBatch.diffSummary.conflicts.map((c: any, i: number) => (
                      <li key={i}>
                        Row {c.rowNumber}: {c.conflictReason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missing rows preservation note */}
              {selectedBatch.diffSummary?.missing && selectedBatch.diffSummary.missing.length > 0 && (
                <div className="p-4 rounded-xl bg-surfaceLight border border-surfaceBorder text-xs text-slate-300 space-y-1">
                  <div className="font-bold text-white">Missing Source Rows Preserved:</div>
                  <p className="text-slate-400 text-[11px]">
                    {selectedBatch.diffSummary.missing.length} records present in the database were
                    absent from this workbook. Per non-negotiable rules, they will be retained and
                    flagged rather than deleted.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="esports-card rounded-xl p-12 text-center text-slate-500 text-xs">
              Select an import batch from the left to view the staged diff and approval controls.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

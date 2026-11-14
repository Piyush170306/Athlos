'use client';

import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import { ImportBatch } from '@/lib/types';

export default function AdminImportsPage() {
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<ImportBatch | null>(null);
  const [uploading, setUploading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Upload parameters
  const [file, setFile] = useState<File | null>(null);
  const [sheetName, setSheetName] = useState('If Prom is on 13th ');

  const loadBatches = async () => {
    try {
      const res = await fetch('/api/admin/imports');
      const data = await res.json();
      setBatches(data.importBatches || []);
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

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sheetName', sheetName);

    try {
      const res = await fetch('/api/admin/imports/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to process Excel workbook');
      } else {
        setMessage(
          `Workbook "${file.name}" parsed and staged! ${data.summary.addedCount} additions, ${data.summary.updatedCount} updates, ${data.summary.conflictCount} conflicts.`
        );
        setFile(null);
        await loadBatches();
        setSelectedBatch(data.importBatch);
      }
    } catch (err) {
      setError('A network error occurred during file upload');
    } finally {
      setUploading(false);
    }
  };

  const handleApprove = async (batchId: string) => {
    if (!confirm('Approve this entire import batch and publish all changes to the public leaderboard?')) {
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
        setMessage('Import batch successfully approved and published!');
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-surfaceBorder gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-athlos-gold block mb-1">
            Data Pipelines & Governance
          </span>
          <h1 className="text-3xl font-black uppercase text-white tracking-tight">
            Import Review & Approval Queue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Excel & Google Sheets staging pipeline. Unapproved changes remain strictly private until confirmed.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-3.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300">
          ✓ {message}
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
          ✕ {error}
        </div>
      )}

      {/* Upload Zone & Google Sync Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Excel */}
        <div className="lg:col-span-2 esports-card rounded-2xl p-6 border-surfaceBorder space-y-4">
          <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center space-x-2">
            <Upload className="w-5 h-5 text-athlos-gold" />
            <span>Stage Excel Workbook</span>
          </h2>
          <p className="text-xs text-slate-400">
            Upload <strong>wob_2026-27_official_workbook_v1.xlsx</strong>. Server parses dual-tables, forward-fills
            continuation cells, and stages diffs.
          </p>

          <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end text-xs">
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
                className="w-full py-2.5 rounded bg-athlos-gold hover:bg-yellow-400 disabled:opacity-40 text-black font-black uppercase tracking-wider shadow-glow-gold transition"
              >
                {uploading ? 'Parsing...' : 'Stage Diff'}
              </button>
            </div>
          </form>
        </div>

        {/* Google Sheets Sync Card */}
        <div className="esports-card rounded-2xl p-6 border-surfaceBorder flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold uppercase tracking-wider text-athlos-cyan flex items-center space-x-1.5">
                <FileSpreadsheet className="w-4 h-4" />
                <span>Google Sheets Sync</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-1.5 py-0.5 rounded">
                Target: ~5 min
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Triggers server-side synchronization. All detected changes enter this staging review queue;
              zero automatic publication.
            </p>
          </div>

          <div className="pt-2 border-t border-surfaceBorder/60 space-y-2">
            <button
              onClick={async () => {
                setActionLoading(true);
                setMessage(null);
                setError(null);
                try {
                  const res = await fetch('/api/admin/sheets/sync', { method: 'POST' });
                  const data = await res.json();
                  if (!res.ok) {
                    setError(data.error);
                  } else {
                    setMessage(data.message);
                    await loadBatches();
                  }
                } catch (err) {
                  setError('Failed to trigger sync');
                } finally {
                  setActionLoading(false);
                }
              }}
              disabled={actionLoading}
              className="w-full py-2 px-3 rounded bg-athlos-cyan hover:bg-cyan-400 text-black text-xs font-black uppercase tracking-wider transition shadow-glow-cyan flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? 'animate-spin' : ''}`} />
              <span>{actionLoading ? 'Syncing Sheet...' : 'Sync Google Sheets Now'}</span>
            </button>
            <span className="text-[10px] text-slate-500 text-center block">
              Vercel Hobby: 24h cron limit • Pro/Daemon: 5m cron supported
            </span>
          </div>
        </div>
      </div>

      {/* Main Import Batches Split-View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Batches List Sidebar */}
        <div className="esports-card rounded-xl p-4 border-surfaceBorder space-y-3">
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 pb-2 border-b border-surfaceBorder">
            Staged & Processed Batches ({batches.length})
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
                      <span>{batch.addedCount} new • {batch.updatedCount} upd</span>
                      <span className="font-mono">{new Date(batch.createdAt).toLocaleDateString()}</span>
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
                    Uploaded by {selectedBatch.createdBy} on{' '}
                    {new Date(selectedBatch.createdAt).toLocaleString('en-GB')}
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
                        className="px-4 py-1.5 rounded-lg bg-athlos-gold text-black text-xs font-black uppercase tracking-wider hover:bg-yellow-400 transition shadow-glow-gold"
                      >
                        Approve & Publish Whole Batch
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
                    {selectedBatch.addedCount}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surfaceLight/60 border border-surfaceBorder">
                  <span className="text-[10px] font-extrabold uppercase text-blue-400 block">
                    Updates
                  </span>
                  <span className="text-xl font-black text-white">
                    {selectedBatch.updatedCount}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surfaceLight/60 border border-surfaceBorder">
                  <span className="text-[10px] font-extrabold uppercase text-amber-400 block">
                    Conflicts
                  </span>
                  <span className="text-xl font-black text-white">
                    {selectedBatch.conflictCount}
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-surfaceLight/60 border border-surfaceBorder">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                    Missing Preserved
                  </span>
                  <span className="text-xl font-black text-white">
                    {selectedBatch.missingCount}
                  </span>
                </div>
              </div>

              {/* Official Points Row 79 Diff Preview */}
              <div className="p-4 rounded-xl bg-surfaceLight/40 border border-surfaceBorder space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-athlos-gold flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Batch Scores Table Impact (Row 79 Official Totals)</span>
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center pt-2">
                  {['IPM08', 'IPM06', 'IPM07'].map((code) => {
                    const before = selectedBatch.diffSummary.officialScoresBefore?.[code] ?? 0;
                    const after = selectedBatch.diffSummary.officialScoresAfter?.[code] ?? 0;

                    return (
                      <div key={code} className="p-2.5 rounded bg-black/40 border border-surfaceBorder">
                        <span className="text-xs font-bold text-slate-300 block">{code}</span>
                        <div className="text-sm font-black mt-1 flex items-center justify-center space-x-1">
                          <span className="text-slate-400">{before.toFixed(1)}</span>
                          <span className="text-athlos-gold">→</span>
                          <span className="text-white">{after.toFixed(1)} pts</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Conflict Warnings if any */}
              {selectedBatch.diffSummary.conflicts?.length > 0 && (
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
              {selectedBatch.diffSummary.missing?.length > 0 && (
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

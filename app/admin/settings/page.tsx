'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  ShieldCheck,
  Clock,
  FileSpreadsheet,
  Download,
  Database,
  Cloud,
  AlertCircle,
  CheckCircle2,
  Server,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [appName, setAppName] = useState('');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [allowedEmails, setAllowedEmails] = useState<string[]>([]);
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sheetName, setSheetName] = useState('2026-27');
  const [syncFreq, setSyncFreq] = useState(5);
  const [storageMode, setStorageMode] = useState<{ isRemote: boolean; provider: string } | null>(null);
  const [storageEnvKeys, setStorageEnvKeys] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/settings');
        const data = await res.json();
        setAppName(data.appName || 'ATHLOS War of Batches 2026–27');
        setTimezone(data.timezone || 'Asia/Kolkata');
        setAllowedEmails(data.allowedEmails || []);
        if (data.storageMode) {
          setStorageMode(data.storageMode);
        }
        if (data.storageEnvKeys) {
          setStorageEnvKeys(data.storageEnvKeys);
        }
        if (data.googleSheets) {
          setSpreadsheetId(data.googleSheets.spreadsheetId || '');
          setSheetName(data.googleSheets.sheetName || '2026-27');
          setSyncFreq(data.googleSheets.syncFrequencyMinutes || 5);
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spreadsheetId,
          sheetName,
          syncFrequencyMinutes: syncFreq,
        }),
      });
      if (res.ok) {
        setMessage('Settings updated successfully!');
      }
    } catch (err) {
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleExportBackup = () => {
    window.open('/api/admin/backup/export', '_blank');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-surfaceBorder gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-athlos-gold block mb-1">
            System Configuration
          </span>
          <h1 className="text-3xl font-black uppercase text-white tracking-tight">
            Tournament Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tournament identity, timezone defaults, Google Sheets connections, and database backups
          </p>
        </div>

        <button
          onClick={handleExportBackup}
          className="px-4 py-2 rounded-lg bg-surfaceLight border border-surfaceBorder text-slate-300 hover:text-white text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 transition"
        >
          <Download className="w-4 h-4 text-athlos-gold" />
          <span>Export Database Snapshot</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-lg bg-surfaceLight border border-athlos-gold text-xs text-athlos-gold">
          {message}
        </div>
      )}

      {/* Cloud Persistence & Live Multi-Container Sync Diagnostics */}
      <div className="esports-card rounded-xl p-6 border-surfaceBorder space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center space-x-2">
            <Database className="w-4 h-4 text-athlos-gold" />
            <span>Serverless Storage & Live Sync Status</span>
          </h2>
          {storageMode?.isRemote ? (
            <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-[11px] font-black uppercase tracking-wider flex items-center space-x-1.5 shadow-glow-emerald">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Shared Cloud KV Active</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded bg-amber-950 border border-amber-500/50 text-amber-300 text-[11px] font-black uppercase tracking-wider flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Serverless Local Mode</span>
            </span>
          )}
        </div>

        <div className="p-4 rounded-lg bg-black/40 border border-surfaceBorder space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-slate-400 font-semibold block">Active Persistence Engine</span>
              <span className="font-mono text-white text-sm">
                {storageMode?.provider || 'Initializing status...'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleExportBackup}
              className="px-3 py-1.5 rounded bg-surfaceLight border border-surfaceBorder text-slate-200 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5 text-athlos-gold" />
              <span>Download JSON Database</span>
            </button>
          </div>

          {storageMode?.isRemote ? (
            <div className="p-3 rounded bg-emerald-950/40 border border-emerald-800/60 text-emerald-200/90 text-xs">
              <strong>Multi-Container Synchronization Enabled:</strong> Every Excel workbook upload and approval is automatically synchronized across all Vercel serverless microVMs and public visitors in real-time without requiring code redeployments.
            </div>
          ) : (
            <div className="p-3.5 rounded bg-amber-950/40 border border-amber-800/60 text-amber-200/90 text-xs space-y-2">
              <div className="flex items-center space-x-1.5 font-bold text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Zero-Redeploy Live Cross-Container Sync Setup</span>
              </div>
              <p className="text-[11px] leading-relaxed text-amber-100/80">
                Vercel runs routes in isolated serverless containers. When you upload a workbook without a shared remote store, the container handling the upload stores the new data, while other lambda containers serve from initial bundled data.
              </p>
              <div className="pt-1 text-[11px] font-mono text-amber-200/90">
                <strong>To activate instant live sync across all public pages:</strong>
                <ol className="list-decimal list-inside mt-1 space-y-0.5 text-slate-300">
                  <li>Open your Vercel Project Dashboard → navigate to the <strong>Storage</strong> tab.</li>
                  <li>Click <strong>Create Database</strong> → select <strong>KV</strong> (free tier).</li>
                  <li>Click <strong>Connect to Project</strong> → Vercel injects <code className="text-amber-300">KV_REST_API_URL</code> and <code className="text-amber-300">KV_REST_API_TOKEN</code>.</li>
                  <li>All future Excel workbook uploads will instantly update across all public visitors!</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Tournament Parameters */}
        <div className="esports-card rounded-xl p-6 border-surfaceBorder space-y-4">
          <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center space-x-2">
            <Clock className="w-4 h-4 text-athlos-gold" />
            <span>Tournament Parameters</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-400 mb-1">Application Title</label>
              <input
                type="text"
                disabled
                value={appName}
                className="w-full px-3 py-2 bg-surfaceLight/50 border border-surfaceBorder rounded text-slate-400"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Configured via NEXT_PUBLIC_APP_NAME
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">Official Timezone</label>
              <input
                type="text"
                disabled
                value={timezone}
                className="w-full px-3 py-2 bg-surfaceLight/50 border border-surfaceBorder rounded text-slate-400"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Asia/Kolkata (IST, UTC+5:30) per TRD
              </span>
            </div>
          </div>
        </div>

        {/* Authorized Admin Emails */}
        <div className="esports-card rounded-xl p-6 border-surfaceBorder space-y-3">
          <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Authorized Administrator Accounts</span>
          </h2>
          <p className="text-xs text-slate-400">
            Only accounts matching these designated email addresses can access the administrative portal
            or receive password reset links:
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            {allowedEmails.map((em, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded bg-surfaceLight border border-surfaceBorder text-slate-200 text-xs font-mono"
              >
                {em.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Google Sheets Sync Settings */}
        <div className="esports-card rounded-xl p-6 border-surfaceBorder space-y-4">
          <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4 text-athlos-cyan" />
            <span>Google Sheets Sync Configuration</span>
          </h2>
          <p className="text-xs text-slate-400">
            Target authorized Google Sheet for synchronization. All sheet changes enter the staging review
            queue prior to approval.
          </p>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-400 mb-1">Spreadsheet ID</label>
              <input
                type="text"
                value={spreadsheetId}
                onChange={(e) => setSpreadsheetId(e.target.value)}
                placeholder="e.g. 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-white font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Target Worksheet Tab</label>
                <input
                  type="text"
                  value={sheetName}
                  onChange={(e) => setSheetName(e.target.value)}
                  placeholder="2026-27"
                  className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">
                  Target Sync Cadence (Minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={syncFreq}
                  onChange={(e) => setSyncFreq(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-white"
                />
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-athlos-gold text-black text-xs font-black uppercase tracking-wider hover:bg-yellow-400 transition shadow-glow-gold flex items-center space-x-1.5"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
        </button>
      </form>
    </div>
  );
}

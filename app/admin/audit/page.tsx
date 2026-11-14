'use client';

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Search, Filter, ShieldCheck, Download } from 'lucide-react';
import { AuditLog } from '@/lib/types';

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch('/api/admin/audit');
        const data = await res.json();
        setLogs(data.logs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.actor.toLowerCase().includes(q) ||
      log.entityType.toLowerCase().includes(q) ||
      (log.entityId && log.entityId.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-surfaceBorder gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
            Governance & Compliance
          </span>
          <h1 className="text-3xl font-black uppercase text-white tracking-tight">
            Immutable Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident chronological log of all administrative actions, imports, and approvals
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search action, actor, entity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surfaceLight border border-surfaceBorder rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
        </div>
      </div>

      {/* Audit Table */}
      <div className="esports-card rounded-xl overflow-hidden border border-surfaceBorder shadow-xl">
        <div className="p-4 sm:p-5 bg-surfaceLight/60 border-b border-surfaceBorder flex items-center justify-between">
          <h2 className="text-sm font-black uppercase text-white tracking-wider flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Audit Entries ({filteredLogs.length})</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">
            Zero secrets or credentials recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-surfaceBorder bg-black/40 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Entity Type</th>
                <th className="py-3 px-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surfaceBorder/60 font-mono text-[11px]">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-surfaceLight/30 transition">
                  <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('en-GB')}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-emerald-400">{log.action}</td>
                  <td className="py-3.5 px-4 text-slate-300 font-sans">{log.actor}</td>
                  <td className="py-3.5 px-4 text-slate-400">{log.entityType}</td>
                  <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                    {log.details ? JSON.stringify(log.details) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

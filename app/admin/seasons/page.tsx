'use client';

import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Radio,
  Clock,
} from 'lucide-react';
import { Season } from '@/lib/types';

export default function AdminSeasonsPage() {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activatingSeason, setActivatingSeason] = useState<Season | null>(null);
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New season form
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadSeasons = async () => {
    try {
      const res = await fetch('/api/admin/seasons');
      const data = await res.json();
      setSeasons(data.seasons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSeasons();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      const res = await fetch('/api/admin/seasons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, startDate, endDate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error);
      } else {
        setShowCreateModal(false);
        setName('');
        setSlug('');
        setStartDate('');
        setEndDate('');
        setActionSuccess('New season drafted successfully!');
        loadSeasons();
      }
    } catch (err) {
      setActionError('Failed to create season');
    }
  };

  const handleActivate = async () => {
    if (!activatingSeason) return;
    setActionError(null);
    try {
      const res = await fetch('/api/admin/seasons/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seasonId: activatingSeason.id,
          confirmPhrase,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error);
      } else {
        setActivatingSeason(null);
        setConfirmPhrase('');
        setActionSuccess(data.message);
        loadSeasons();
      }
    } catch (err) {
      setActionError('Failed to activate season');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-surfaceBorder gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-athlos-gold block mb-1">
            Tournament Architecture
          </span>
          <h1 className="text-3xl font-black uppercase text-white tracking-tight">
            Seasons & Activation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure editions. Explicit admin confirmation required to switch the active season.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-lg bg-surfaceLight border border-athlos-gold/40 text-athlos-gold hover:bg-surfaceLight/80 text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Draft New Season</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300">
          ✓ {actionSuccess}
        </div>
      )}

      {actionError && (
        <div className="p-3.5 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
          ✕ {actionError}
        </div>
      )}

      {/* Seasons Table */}
      <div className="esports-card rounded-xl overflow-hidden border border-surfaceBorder shadow-xl">
        <div className="p-4 sm:p-5 bg-surfaceLight/60 border-b border-surfaceBorder">
          <h2 className="text-sm font-black uppercase text-white tracking-wider flex items-center space-x-2">
            <CalendarDays className="w-4 h-4 text-athlos-gold" />
            <span>Tournament Editions ({seasons.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-surfaceBorder bg-black/40 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Season Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Dates</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surfaceBorder/60">
              {seasons.map((s) => {
                const isActive = s.status === 'active';
                const isArchived = s.status === 'archived';

                return (
                  <tr key={s.id} className="hover:bg-surfaceLight/30 transition">
                    <td className="py-4 px-4 font-bold text-white text-sm">
                      {s.name}
                    </td>
                    <td className="py-4 px-4 font-mono text-slate-400">{s.slug}</td>
                    <td className="py-4 px-4 text-slate-400">
                      {s.startDate || 'TBD'} to {s.endDate || 'TBD'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                          isActive
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800 animate-pulse'
                            : isArchived
                            ? 'bg-surfaceLight text-slate-400 border-surfaceBorder'
                            : 'bg-amber-950/60 text-amber-400 border-amber-800'
                        }`}
                      >
                        {isActive && <Radio className="w-3 h-3 mr-1" />}
                        {s.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {isActive ? (
                        <span className="text-[11px] text-emerald-400 font-bold">
                          Active Public Target
                        </span>
                      ) : (
                        <button
                          onClick={() => setActivatingSeason(s)}
                          className="px-3 py-1 rounded bg-surfaceLight border border-surfaceBorder hover:border-athlos-gold text-slate-300 hover:text-athlos-gold text-[11px] font-bold uppercase transition"
                        >
                          Activate Season...
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal for Season Activation (PRD Mandate) */}
      {activatingSeason && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="esports-card bg-surface w-full max-w-md rounded-2xl p-6 border-amber-500/50 space-y-4 shadow-2xl">
            <div className="flex items-center space-x-2 text-amber-400">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h3 className="text-base font-black uppercase tracking-wider text-white">
                Confirm Season Activation
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              You are about to switch the active tournament season to{' '}
              <strong className="text-white">{activatingSeason.name}</strong>.
            </p>

            <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-800 text-[11px] text-amber-300 space-y-1">
              <p>• Only <strong>one season</strong> can be active at any time.</p>
              <p>• The currently active season will be transitioned to <strong>Archived (Read-Only)</strong>.</p>
              <p>• Public homepage and leaderboards will immediately switch to this edition.</p>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                Type <strong>ACTIVATE</strong> to confirm:
              </label>
              <input
                type="text"
                value={confirmPhrase}
                onChange={(e) => setConfirmPhrase(e.target.value)}
                placeholder="ACTIVATE"
                className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 font-mono font-bold"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setActivatingSeason(null);
                  setConfirmPhrase('');
                }}
                className="px-3 py-1.5 rounded-lg bg-surfaceLight text-slate-400 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleActivate}
                disabled={confirmPhrase !== 'ACTIVATE'}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black text-xs font-black uppercase tracking-wider"
              >
                Confirm & Activate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Season Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="esports-card bg-surface w-full max-w-md rounded-2xl p-6 border-athlos-gold/50 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-surfaceBorder pb-3">
              <h3 className="text-base font-black uppercase text-white">Draft New Season</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Season Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ATHLOS War of Batches 2027–28"
                  className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Season Slug</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="2027-28"
                  className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2 py-1.5 bg-surfaceLight border border-surfaceBorder rounded text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2 py-1.5 bg-surfaceLight border border-surfaceBorder rounded text-white"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 rounded bg-surfaceLight text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-athlos-gold text-black font-black uppercase tracking-wider"
                >
                  Save Draft Season
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

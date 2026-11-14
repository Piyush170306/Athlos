'use client';

import React, { useState, useEffect } from 'react';
import { Swords, Plus, Edit2, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { Match, Sport, Category, Batch } from '@/lib/types';

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // New match state
  const [sportId, setSportId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [batchAId, setBatchAId] = useState('');
  const [batchBId, setBatchBId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('Morning');

  // Edit match state
  const [editStatus, setEditStatus] = useState<any>('UPCOMING');
  const [editRawScore, setEditRawScore] = useState('');
  const [editWinnerId, setEditWinnerId] = useState('');
  const [editMargin, setEditMargin] = useState('');

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/matches');
      const data = await res.json();
      setMatches(data.matches || []);
      setSports(data.sports || []);
      setCategories(data.categories || []);
      setBatches(data.batches || []);
      if (data.sports?.length > 0 && !sportId) {
        setSportId(data.sports[0].id);
      }
      if (data.batches?.length >= 2 && !batchAId) {
        setBatchAId(data.batches[0].id);
        setBatchBId(data.batches[1].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sportId,
          categoryId,
          batchAId,
          batchBId,
          scheduledDate,
          timeSlot,
          status: 'UPCOMING',
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setMessage('Match fixture added successfully!');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingMatch) return;
    try {
      const res = await fetch('/api/admin/matches', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: editingMatch.id,
          status: editStatus,
          rawScore: editRawScore,
          winnerBatchId: editWinnerId,
          margin: editMargin,
        }),
      });
      if (res.ok) {
        setEditingMatch(null);
        setMessage('Match result updated and audited!');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-surfaceBorder gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-athlos-gold block mb-1">
            Competition Console
          </span>
          <h1 className="text-3xl font-black uppercase text-white tracking-tight">
            Matches & Score Verification
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manual fixture creation, score corrections, and completed result auditing
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg bg-surfaceLight border border-athlos-gold/40 text-athlos-gold hover:bg-surfaceLight/80 text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Match Fixture</span>
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-surfaceLight border border-athlos-gold text-xs text-athlos-gold">
          {message}
        </div>
      )}

      {/* Matches Table */}
      <div className="esports-card rounded-xl overflow-hidden border border-surfaceBorder shadow-xl">
        <div className="p-4 sm:p-5 bg-surfaceLight/60 border-b border-surfaceBorder">
          <h2 className="text-sm font-black uppercase text-white tracking-wider flex items-center space-x-2">
            <Swords className="w-4 h-4 text-athlos-gold" />
            <span>Fixtures List ({matches.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-surfaceBorder bg-black/40 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Sport / Category</th>
                <th className="py-3 px-4">Contenders</th>
                <th className="py-3 px-4">Date & Slot</th>
                <th className="py-3 px-4 text-center">Score</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surfaceBorder/60">
              {matches.map((m) => {
                const sport = sports.find((s) => s.id === m.sportId);
                const cat = categories.find((c) => c.id === m.categoryId);
                const bA = batches.find((b) => b.id === m.batchAId);
                const bB = batches.find((b) => b.id === m.batchBId);

                return (
                  <tr key={m.id} className="hover:bg-surfaceLight/30 transition">
                    <td className="py-3.5 px-4 font-bold text-white">
                      <div>{sport?.name || 'Sport'}</div>
                      <span className="text-[10px] text-slate-400 font-normal">
                        {cat?.name || 'Open'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      <span className="text-slate-200">{bA?.code || 'TBD'}</span>
                      <span className="text-slate-500 mx-1 font-mono text-[11px]">vs</span>
                      <span className="text-slate-200">{bB?.code || 'TBD'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                      {m.scheduledDate || 'TBD'} • {m.timeSlot || 'Slot TBD'}
                    </td>
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-emerald-400">
                      {m.rawScore || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                          m.status === 'COMPLETED'
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                            : m.status === 'CANCELLED'
                            ? 'bg-rose-950/60 text-rose-400 border-rose-800'
                            : 'bg-blue-950/60 text-blue-400 border-blue-800'
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setEditingMatch(m);
                          setEditStatus(m.status);
                          setEditRawScore(m.rawScore || '');
                          setEditWinnerId(m.winnerBatchId || '');
                          setEditMargin(m.margin || '');
                        }}
                        className="p-1 rounded hover:bg-surfaceLight text-slate-400 hover:text-white"
                        title="Edit Score / Result"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Match Score Modal */}
      {editingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="esports-card bg-surface w-full max-w-md rounded-2xl p-6 border-athlos-gold/50 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-surfaceBorder pb-3">
              <h3 className="text-base font-black uppercase text-white">Record Official Result</h3>
              <button onClick={() => setEditingMatch(null)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-white font-medium"
                >
                  <option value="UPCOMING">Upcoming</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Raw Score Display</label>
                <input
                  type="text"
                  value={editRawScore}
                  onChange={(e) => setEditRawScore(e.target.value)}
                  placeholder="e.g. 2-1 (Penalties 4-3), Won by 6 runs, 21-18, 21-15"
                  className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Declared Winner</label>
                <select
                  value={editWinnerId}
                  onChange={(e) => setEditWinnerId(e.target.value)}
                  className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-white font-medium"
                >
                  <option value="">No Winner / Draw</option>
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.code} ({b.displayName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingMatch(null)}
                  className="px-3 py-1.5 rounded bg-surfaceLight text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-4 py-1.5 rounded bg-athlos-gold text-black font-black uppercase tracking-wider"
                >
                  Save Result
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Match Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="esports-card bg-surface w-full max-w-md rounded-2xl p-6 border-athlos-gold/50 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-surfaceBorder pb-3">
              <h3 className="text-base font-black uppercase text-white">Add Fixture</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Sport</label>
                <select
                  value={sportId}
                  onChange={(e) => setSportId(e.target.value)}
                  className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-white"
                >
                  {sports.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-white"
                >
                  <option value="">General</option>
                  {categories
                    .filter((c) => c.sportId === sportId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Batch A</label>
                  <select
                    value={batchAId}
                    onChange={(e) => setBatchAId(e.target.value)}
                    className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-white"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Batch B</label>
                  <select
                    value={batchBId}
                    onChange={(e) => setBatchBId(e.target.value)}
                    className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-white"
                  >
                    {batches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.code}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-400 mb-1">Slot</label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-white"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded bg-surfaceLight text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-athlos-gold text-black font-black uppercase tracking-wider"
                >
                  Save Fixture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

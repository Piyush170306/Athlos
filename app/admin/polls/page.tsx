'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, Plus, Power, CheckCircle, Clock } from 'lucide-react';
import { Batch, Match } from '@/lib/types';

export default function AdminPollsPage() {
  const [polls, setPolls] = useState<any[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [matchId, setMatchId] = useState('');
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/polls');
      const data = await res.json();
      setPolls(data.polls || []);
      setMatches(data.matches || []);
      setBatches(data.batches || []);
      if (data.batches && selectedBatches.length === 0) {
        setSelectedBatches(data.batches.slice(0, 2).map((b: any) => b.id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (pollId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'OPEN' ? 'CLOSED' : 'OPEN';
    try {
      const res = await fetch('/api/admin/polls', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pollId, status: newStatus }),
      });
      if (res.ok) {
        setMessage(`Poll marked as ${newStatus}`);
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/polls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          matchId: matchId || matches[0]?.id || 'derby-01',
          eligibleBatches: selectedBatches,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setTitle('');
        setMessage('Poll created and opened for voting!');
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
            Community Engagement
          </span>
          <h1 className="text-3xl font-black uppercase text-white tracking-tight">
            Prediction Polls Console
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create match prediction polls and manually open or close voting windows
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg bg-surfaceLight border border-athlos-gold/40 text-athlos-gold hover:bg-surfaceLight/80 text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Poll</span>
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-surfaceLight border border-athlos-gold text-xs text-athlos-gold">
          {message}
        </div>
      )}

      {/* Polls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {polls.map((poll) => {
          const isOpen = poll.status === 'OPEN';

          return (
            <div
              key={poll.id}
              className={`esports-card rounded-2xl p-6 border flex flex-col justify-between ${
                isOpen ? 'border-orange-500/40 shadow-glow-orange' : 'border-surfaceBorder opacity-80'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                      isOpen
                        ? 'bg-orange-950/60 text-orange-400 border-orange-800'
                        : 'bg-surfaceLight text-slate-400 border-surfaceBorder'
                    }`}
                  >
                    {poll.status}
                  </span>
                  <span className="font-semibold text-white">
                    {poll.totalVotes} Total Verified Votes
                  </span>
                </div>

                <h3 className="font-bold text-base text-white mb-4 leading-snug">
                  {poll.title}
                </h3>

                {/* Vote Percentages Breakdown */}
                <div className="space-y-3 mb-6">
                  {poll.options.map((opt: any) => (
                    <div key={opt.batchId} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">
                          {opt.batch?.displayName || opt.batchId}
                        </span>
                        <span className="text-white font-bold">
                          {opt.percentage}% ({opt.voteCount} votes)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded bg-surfaceLight overflow-hidden border border-surfaceBorder">
                        <div
                          className="h-full bg-athlos-gold rounded transition-all duration-300"
                          style={{ width: `${opt.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 border-t border-surfaceBorder/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  Match: {poll.matchId}
                </span>
                <button
                  onClick={() => handleToggleStatus(poll.id, poll.status)}
                  className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center space-x-1 transition ${
                    isOpen
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800 hover:bg-rose-900'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800 hover:bg-emerald-900'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{isOpen ? 'Close Poll' : 'Re-open Poll'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Poll Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="esports-card bg-surface w-full max-w-md rounded-2xl p-6 border-athlos-gold/50 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-surfaceBorder pb-3">
              <h3 className="text-base font-black uppercase text-white">Create Prediction Poll</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Poll Title / Question</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Who wins the IPM06 vs IPM07 Cricket Clash?"
                  className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Associated Match</label>
                <select
                  value={matchId}
                  onChange={(e) => setMatchId(e.target.value)}
                  className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-white"
                >
                  {matches.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.scheduledDate || 'Date TBD'}: {m.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Eligible Cohorts</label>
                <div className="space-y-1.5 pt-1">
                  {batches.map((b) => (
                    <label key={b.id} className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBatches.includes(b.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBatches([...selectedBatches, b.id]);
                          } else {
                            setSelectedBatches(selectedBatches.filter((id) => id !== b.id));
                          }
                        }}
                        className="rounded border-surfaceBorder text-athlos-gold focus:ring-athlos-gold"
                      />
                      <span>{b.code} ({b.displayName})</span>
                    </label>
                  ))}
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
                  disabled={selectedBatches.length < 2}
                  className="px-4 py-1.5 rounded bg-athlos-gold text-black font-black uppercase tracking-wider disabled:opacity-40"
                >
                  Launch Poll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

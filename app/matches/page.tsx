'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Search,
  ChevronRight,
  Trophy,
} from 'lucide-react';

interface MatchItem {
  id: string;
  seasonId: string;
  sportId: string;
  categoryId?: string;
  batchAId: string;
  batchBId?: string;
  scheduledDate?: string;
  timeSlot?: string;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  rawScore?: string;
  winnerBatchId?: string | 'DRAW';
  margin?: string;
  sport?: { name: string; slug: string };
  category?: { name: string };
  batchA?: { code: string; displayName: string };
  batchB?: { code: string; displayName: string };
  winnerBatch?: { code: string; displayName: string } | null;
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [sports, setSports] = useState<Array<{ id: string; name: string }>>([]);
  const [batches, setBatches] = useState<Array<{ id: string; code: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedSport, setSelectedSport] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMatchModal, setSelectedMatchModal] = useState<MatchItem | null>(null);

  React.useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/public/matches');
        const data = await res.json();
        setMatches(data.matches || []);
        setSports(data.sports || []);
        setBatches(data.batches || []);
      } catch (err) {
        console.error('Failed to load matches:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredMatches = useMemo(() => {
    return matches.filter((m) => {
      if (selectedSport !== 'ALL' && m.sportId !== selectedSport) return false;
      if (selectedCategory !== 'ALL' && m.category?.name !== selectedCategory) return false;
      if (
        selectedBatch !== 'ALL' &&
        m.batchAId !== selectedBatch &&
        m.batchBId !== selectedBatch
      ) {
        return false;
      }
      if (selectedStatus !== 'ALL' && m.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const sportName = m.sport?.name.toLowerCase() || '';
        const catName = m.category?.name.toLowerCase() || '';
        const bA = m.batchA?.code.toLowerCase() || '';
        const bB = m.batchB?.code.toLowerCase() || '';
        if (
          !sportName.includes(q) &&
          !catName.includes(q) &&
          !bA.includes(q) &&
          !bB.includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [matches, selectedSport, selectedCategory, selectedBatch, selectedStatus, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b border-[#0B1727] pb-6">
        <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#79C9F2] mb-1">
          <Calendar className="w-4 h-4 text-[#79C9F2]" />
          <span>Tournament Fixtures</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-spartan font-black uppercase text-white tracking-wider">
          Matches & Schedule
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Verified match schedule, timings, and approved scores (Asia/Kolkata timezone)
        </p>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl p-4 sm:p-5 border border-surfaceBorder bg-[#0a0e18] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search sport, batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#0e1322] border border-surfaceBorder rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Sport Filter */}
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="w-full px-3 py-2 bg-[#0e1322] border border-surfaceBorder rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-medium"
          >
            <option value="ALL">All Sports</option>
            {sports.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Category Filter (Strictly Boys / Girls only) */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-[#0e1322] border border-surfaceBorder rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="Boys">Boys</option>
            <option value="Girls">Girls</option>
          </select>

          {/* Batch Filter */}
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full px-3 py-2 bg-[#0e1322] border border-surfaceBorder rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-medium"
          >
            <option value="ALL">All Batches (IPM06, 07, 08)</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.code}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-[#0e1322] border border-surfaceBorder rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-400 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Filter Stats */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-surfaceBorder/60">
          <span>
            Showing <strong className="text-white">{filteredMatches.length}</strong> of{' '}
            {matches.length} fixtures
          </span>
          {(selectedSport !== 'ALL' ||
            selectedCategory !== 'ALL' ||
            selectedBatch !== 'ALL' ||
            selectedStatus !== 'ALL' ||
            searchQuery) && (
            <button
              onClick={() => {
                setSelectedSport('ALL');
                setSelectedCategory('ALL');
                setSelectedBatch('ALL');
                setSelectedStatus('ALL');
                setSearchQuery('');
              }}
              className="text-amber-400 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Matches Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          Loading verified fixtures...
        </div>
      ) : filteredMatches.length === 0 ? (
        <div className="rounded-2xl p-12 text-center text-slate-400 space-y-2 border border-surfaceBorder bg-[#0a0e18]">
          <Calendar className="w-8 h-8 mx-auto text-slate-500" />
          <h3 className="font-bold text-white text-base">No matches found</h3>
          <p className="text-xs">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMatches.map((m) => {
            const isCompleted = m.status === 'COMPLETED';
            const isCancelled = m.status === 'CANCELLED';

            return (
              <div
                key={m.id}
                onClick={() => setSelectedMatchModal(m)}
                className="rounded-2xl p-5 cursor-pointer hover:border-amber-400/50 transition flex flex-col justify-between group border border-surfaceBorder bg-[#0b0f1a]"
              >
                <div>
                  {/* Header: Sport & Slot */}
                  <div className="flex items-center justify-between text-xs font-bold mb-2">
                    <span className="text-amber-400 uppercase tracking-wider">
                      {m.sport?.name}
                    </span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {m.scheduledDate || 'Date TBD'} • {m.timeSlot || 'Slot TBD'}
                    </span>
                  </div>

                  {/* Category (Strictly Boys or Girls) */}
                  <div className="text-xs text-slate-400 font-semibold mb-3">
                    {m.category?.name || 'Boys'}
                  </div>

                  {/* Versus Box */}
                  <div className="bg-[#0e1424] rounded-xl p-3 border border-surfaceBorder/80 flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-lg font-black text-white">
                        {m.batchA?.code || 'TBD'}
                      </span>
                    </div>

                    <div className="text-center px-2">
                      {isCompleted ? (
                        <div className="font-mono font-black text-sm text-amber-300">
                          {m.rawScore || 'Final'}
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-slate-500 uppercase px-2 py-0.5 rounded bg-black/40">VS</span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-black text-white">
                        {m.batchB?.code || 'TBD'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Status */}
                <div className="pt-4 mt-4 border-t border-surfaceBorder/60 flex items-center justify-between text-xs">
                  <span
                    className={`px-2.5 py-0.5 rounded font-black uppercase text-[10px] tracking-wider border ${
                      isCompleted
                        ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
                        : isCancelled
                        ? 'bg-rose-950/70 text-rose-300 border-rose-800'
                        : 'bg-blue-950/70 text-blue-300 border-blue-800'
                    }`}
                  >
                    {m.status}
                  </span>

                  <span className="text-slate-400 group-hover:text-amber-300 font-medium text-[11px] transition flex items-center space-x-1">
                    <span>View Match</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Match Detail Modal */}
      {selectedMatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#0b0f1a] w-full max-w-lg rounded-2xl p-6 border border-amber-500/40 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-surfaceBorder pb-3">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                  {selectedMatchModal.sport?.name}
                </span>
                <h3 className="text-lg font-black text-white">
                  {selectedMatchModal.category?.name || 'Boys'} Event
                </h3>
              </div>
              <button
                onClick={() => setSelectedMatchModal(null)}
                className="p-1 rounded-lg hover:bg-surfaceLight text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#0e1424] p-4 rounded-xl border border-surfaceBorder text-center space-y-2">
              <div className="flex items-center justify-around">
                <span className="text-2xl font-black text-white">
                  {selectedMatchModal.batchA?.code || 'TBD'}
                </span>
                <span className="text-xs font-black text-amber-400/80 uppercase px-2 py-0.5 rounded bg-black/40">VS</span>
                <span className="text-2xl font-black text-white">
                  {selectedMatchModal.batchB?.code || 'TBD'}
                </span>
              </div>
              {selectedMatchModal.rawScore && (
                <div className="pt-2 border-t border-surfaceBorder text-amber-300 font-mono font-black text-base">
                  Approved Score: {selectedMatchModal.rawScore}
                </div>
              )}
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between py-1.5 border-b border-surfaceBorder/60">
                <span className="text-slate-400 font-medium">Scheduled Date:</span>
                <span className="font-semibold text-white">
                  {selectedMatchModal.scheduledDate || 'To be announced'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-surfaceBorder/60">
                <span className="text-slate-400 font-medium">Time Slot:</span>
                <span className="font-semibold text-white">
                  {selectedMatchModal.timeSlot || 'Slot TBD'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-surfaceBorder/60">
                <span className="text-slate-400 font-medium">Match Status:</span>
                <span className="font-black uppercase text-amber-400">
                  {selectedMatchModal.status}
                </span>
              </div>
              {selectedMatchModal.winnerBatch && (
                <div className="flex justify-between py-1.5 border-b border-surfaceBorder/60">
                  <span className="text-slate-400 font-medium">Approved Winner:</span>
                  <span className="font-black text-emerald-400 text-sm">
                    {selectedMatchModal.winnerBatch.code}
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedMatchModal(null)}
                className="px-4 py-2 rounded-lg bg-surfaceLight text-slate-200 hover:text-white text-xs font-bold uppercase tracking-wider border border-surfaceBorder hover:border-slate-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

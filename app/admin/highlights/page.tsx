'use client';

import React, { useState, useEffect } from 'react';
import { Award, Plus, Trash2, Pin, CheckCircle } from 'lucide-react';
import { Highlight, Match } from '@/lib/types';

export default function AdminHighlightsPage() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [matchId, setMatchId] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/highlights');
      const data = await res.json();
      setHighlights(data.highlights || []);
      setMatches(data.matches || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/highlights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, matchId, mediaUrl, isPinned }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setTitle('');
        setContent('');
        setMatchId('');
        setMediaUrl('');
        setIsPinned(false);
        setMessage('Highlight published successfully!');
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this highlight?')) return;
    try {
      const res = await fetch('/api/admin/highlights', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setMessage('Highlight deleted');
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
            Media & Communications
          </span>
          <h1 className="text-3xl font-black uppercase text-white tracking-tight">
            Tournament Highlights
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish recap stories, pin standout moments, and attach match references
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg bg-surfaceLight border border-athlos-gold/40 text-athlos-gold hover:bg-surfaceLight/80 text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Highlight</span>
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-surfaceLight border border-athlos-gold text-xs text-athlos-gold">
          {message}
        </div>
      )}

      {/* Highlights List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {highlights.map((hl) => (
          <div
            key={hl.id}
            className={`esports-card rounded-xl p-5 border flex flex-col justify-between ${
              hl.isPinned ? 'border-athlos-gold/50' : 'border-surfaceBorder'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span className="font-mono text-[11px]">
                  {new Date(hl.publishedAt).toLocaleDateString()} • {hl.author}
                </span>
                {hl.isPinned && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-amber-950 text-amber-400 text-[10px] font-bold uppercase">
                    <Pin className="w-3 h-3" />
                    <span>Pinned</span>
                  </span>
                )}
              </div>
              <h3 className="font-bold text-base text-white mb-2">{hl.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">{hl.content}</p>
            </div>

            <div className="pt-3 border-t border-surfaceBorder/60 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-500 font-mono">
                {hl.matchId ? `Linked to Match: ${hl.matchId}` : 'Standalone Announcement'}
              </span>
              <button
                onClick={() => handleDelete(hl.id)}
                className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition"
                title="Delete highlight"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Highlight Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="esports-card bg-surface w-full max-w-md rounded-2xl p-6 border-athlos-gold/50 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-surfaceBorder pb-3">
              <h3 className="text-base font-black uppercase text-white">Publish Highlight</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dramatic Derby Decider in Final Minute"
                  className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Content / Story</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Detailed breakdown of the match, standout performances, and scoring margins..."
                  className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">
                  Attach Match Fixture (Optional)
                </label>
                <select
                  value={matchId}
                  onChange={(e) => setMatchId(e.target.value)}
                  className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-white"
                >
                  <option value="">No Match Attached</option>
                  {matches.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.scheduledDate || 'Date TBD'}: {m.id}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="pinCheck"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-surfaceBorder text-athlos-gold focus:ring-athlos-gold"
                />
                <label htmlFor="pinCheck" className="text-slate-300 font-semibold cursor-pointer">
                  Pin to top of public homepage and highlights reel
                </label>
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
                  Publish Story
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

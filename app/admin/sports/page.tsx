'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Plus, CheckCircle, Tag, Layers } from 'lucide-react';
import { Sport, Category } from '@/lib/types';

export default function AdminSportsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New sport form
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [scoreFormatType, setScoreFormatType] = useState('SCORE');
  const [categoriesInput, setCategoriesInput] = useState('Boys, Girls');
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/sports');
      const data = await res.json();
      setSports(data.sports || []);
      setCategories(data.categories || []);
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
    setMessage(null);

    const cats = categoriesInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/admin/sports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          description,
          scoreFormatType,
          categories: cats,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error);
      } else {
        setShowAddModal(false);
        setName('');
        setSlug('');
        setDescription('');
        setMessage('Sport created successfully!');
        loadData();
      }
    } catch (err) {
      setMessage('Failed to create sport');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-surfaceBorder gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-athlos-gold block mb-1">
            Tournament Management
          </span>
          <h1 className="text-3xl font-black uppercase text-white tracking-tight">
            Sports & Result Schemas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure sports disciplines, custom categories (beyond just Boys/Girls), and result formats
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-lg bg-surfaceLight border border-athlos-gold/40 text-athlos-gold hover:bg-surfaceLight/80 text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Sport Discipline</span>
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-surfaceLight border border-athlos-gold text-xs text-athlos-gold">
          {message}
        </div>
      )}

      {/* Sports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sports.map((sport) => {
          const cats = categories.filter((c) => c.sportId === sport.id);

          return (
            <div
              key={sport.id}
              className="esports-card rounded-xl p-5 border-surfaceBorder flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-athlos-gold">
                    {sport.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surfaceLight text-slate-300 border border-surfaceBorder">
                    Format: {sport.scoreFormatType}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4">{sport.description}</p>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Configured Categories ({cats.length})
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {cats.map((c) => (
                      <span
                        key={c.id}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surfaceLight text-slate-300 border border-surfaceBorder"
                      >
                        {c.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 mt-4 border-t border-surfaceBorder/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span>Slug: {sport.slug}</span>
                <span className="text-emerald-400 font-bold">Enabled</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Sport Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="esports-card bg-surface w-full max-w-md rounded-2xl p-6 border-athlos-gold/50 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-surfaceBorder pb-3">
              <h3 className="text-base font-black uppercase text-white">Add Sport Discipline</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Sport Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }}
                  placeholder="e.g. Lawn Tennis"
                  className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Slug</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. lawn-tennis"
                  className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">
                  Result Format Schema
                </label>
                <select
                  value={scoreFormatType}
                  onChange={(e) => setScoreFormatType(e.target.value)}
                  className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-white font-medium"
                >
                  <option value="SCORE">Standard Score (Goals, Runs, etc.)</option>
                  <option value="SETS">Sets / Games (Table Tennis, Badminton, Volleyball)</option>
                  <option value="POINTS">Points Table (Carrom, Chess, Kho-Kho)</option>
                  <option value="RACE_TIME">Timed Race / Athletics</option>
                  <option value="PENALTIES">Penalty Shootout</option>
                  <option value="GENERIC">Custom Result Format</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">
                  Categories (Comma-separated)
                </label>
                <input
                  type="text"
                  value={categoriesInput}
                  onChange={(e) => setCategoriesInput(e.target.value)}
                  placeholder="Boys, Girls, Mixed, Under-21, 100M"
                  className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded text-white"
                />
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
                  Save Sport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

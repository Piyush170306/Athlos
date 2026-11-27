'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Flame, Plus, CheckCircle, Tag, Layers, FileText, Upload, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import { Sport, Category } from '@/lib/types';

export default function AdminSportsPage() {
  const [sports, setSports] = useState<Sport[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploadingSportId, setUploadingSportId] = useState<string | null>(null);

  // New sport form
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [scoreFormatType, setScoreFormatType] = useState('SCORE');
  const [categoriesInput, setCategoriesInput] = useState('Boys, Girls');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeTargetSportId, setActiveTargetSportId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'boys' | 'girls' | 'common'>('common');

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
        setMessage({ text: data.error, type: 'error' });
      } else {
        setShowAddModal(false);
        setName('');
        setSlug('');
        setDescription('');
        setMessage({ text: 'Sport discipline created successfully!', type: 'success' });
        loadData();
      }
    } catch (err) {
      setMessage({ text: 'Failed to create sport', type: 'error' });
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeTargetSportId) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setMessage({ text: 'Validation Error: Only PDF documents are allowed', type: 'error' });
      return;
    }

    setUploadingSportId(activeTargetSportId);
    setMessage(null);

    const formData = new FormData();
    formData.append('sportId', activeTargetSportId);
    formData.append('file', file);
    formData.append('category', activeCategory);

    try {
      const res = await fetch('/api/admin/sports/rulebook', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage({ text: data.error || 'Upload failed', type: 'error' });
      } else {
        setMessage({ text: data.message || 'Rulebook published successfully!', type: 'success' });
        loadData();
      }
    } catch (err: any) {
      setMessage({ text: 'Upload failed due to network error', type: 'error' });
    } finally {
      setUploadingSportId(null);
      setActiveTargetSportId(null);
      setActiveCategory('common');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUnpublish = async (sportId: string, sportName: string, category: 'boys' | 'girls' | 'common' = 'common') => {
    const label = category === 'boys' ? 'Boys ' : category === 'girls' ? 'Girls ' : '';
    if (!confirm(`Are you sure you want to unpublish the official ${label}rulebook for ${sportName}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/sports/rulebook?sportId=${sportId}&category=${category}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ text: data.error || 'Failed to unpublish', type: 'error' });
      } else {
        setMessage({ text: `${label}Rulebook for ${sportName} unpublished`, type: 'success' });
        loadData();
      }
    } catch (err) {
      setMessage({ text: 'Failed to unpublish rulebook', type: 'error' });
    }
  };

  const triggerUpload = (sportId: string, category: 'boys' | 'girls' | 'common' = 'common') => {
    setActiveTargetSportId(sportId);
    setActiveCategory(category);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-8">
      {/* Hidden File Input for Rulebook Uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="application/pdf,.pdf"
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-surfaceBorder gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-athlos-gold block mb-1">
            Tournament Management
          </span>
          <h1 className="text-3xl font-black uppercase text-white tracking-tight">
            Sports & Official Rulebooks
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure sports disciplines, result formats, and upload official PDF rulebooks
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
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center space-x-2 ${
            message.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : 'bg-red-950/40 border-red-500/50 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Sports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sports.map((sport) => {
          const cats = categories.filter((c) => c.sportId === sport.id);
          const isDual = sport.slug === 'basketball' || sport.slug === 'futsal' || Boolean(sport.rulebookBoysUrl || sport.rulebookGirlsUrl);
          const hasCommon = Boolean(sport.rulebookUrl && sport.rulebookPublished);
          const hasBoys = Boolean(sport.rulebookBoysUrl && sport.rulebookPublished);
          const hasGirls = Boolean(sport.rulebookGirlsUrl && sport.rulebookPublished);
          const isUploading = uploadingSportId === sport.id;

          return (
            <div
              key={sport.id}
              className="esports-card rounded-xl p-5 border-surfaceBorder flex flex-col justify-between hover:border-athlos-gold/40 transition bg-[#0d1017]"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-base font-black uppercase tracking-wider text-white">
                    {sport.name}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surfaceLight text-slate-300 border border-surfaceBorder">
                    {sport.scoreFormatType}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4 line-clamp-2">
                  {sport.description || `Official tournament discipline for War of Batches 2026–27.`}
                </p>

                {/* Categories */}
                <div className="space-y-1.5 mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Categories ({cats.length}):
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

                {/* Rulebook Status Cards */}
                {isDual ? (
                  <div className="space-y-2.5 my-3">
                    {/* Boys Rulebook */}
                    <div className="p-3 rounded-lg bg-black/60 border border-surfaceBorder space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                          <FileText className="w-3.5 h-3.5 text-athlos-gold" />
                          <span>Boys Rulebook</span>
                        </span>
                        {hasBoys ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                            Published PDF
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                            No Document
                          </span>
                        )}
                      </div>

                      {hasBoys ? (
                        <div className="space-y-1.5">
                          <div className="text-[11px] text-slate-300 font-mono truncate">
                            {sport.rulebookBoysOriginalName || 'boys_rulebook.pdf'}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>
                              {sport.rulebookBoysUploadedAt
                                ? new Date(sport.rulebookBoysUploadedAt).toLocaleDateString('en-GB')
                                : 'Uploaded'}
                            </span>
                            {sport.rulebookBoysSize && (
                              <span>{(sport.rulebookBoysSize / 1024).toFixed(0)} KB</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 pt-1 border-t border-surfaceBorder/60">
                            <a
                              href={sport.rulebookBoysUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-1 px-2 rounded bg-surfaceLight hover:bg-surfaceLight/80 text-athlos-gold text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1 transition"
                            >
                              <span>View</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                            <button
                              onClick={() => triggerUpload(sport.id, 'boys')}
                              disabled={isUploading}
                              className="py-1 px-2 rounded bg-surfaceLight hover:bg-surfaceLight/80 text-slate-300 text-[10px] font-bold uppercase tracking-wider transition"
                            >
                              Replace
                            </button>
                            <button
                              onClick={() => handleUnpublish(sport.id, sport.name, 'boys')}
                              className="p-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 transition"
                              title="Unpublish Boys Rulebook"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => triggerUpload(sport.id, 'boys')}
                          disabled={isUploading}
                          className="w-full py-1.5 px-2 rounded bg-surfaceLight hover:bg-surfaceLight/80 border border-athlos-gold/30 text-athlos-gold text-[10px] font-black uppercase tracking-wider flex items-center justify-center space-x-1.5 transition"
                        >
                          <Upload className="w-3 h-3" />
                          <span>{isUploading ? 'Uploading...' : 'Upload Boys PDF'}</span>
                        </button>
                      )}
                    </div>

                    {/* Girls Rulebook */}
                    <div className="p-3 rounded-lg bg-black/60 border border-surfaceBorder space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 flex items-center space-x-1.5">
                          <FileText className="w-3.5 h-3.5 text-athlos-gold" />
                          <span>Girls Rulebook</span>
                        </span>
                        {hasGirls ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                            Published PDF
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                            No Document
                          </span>
                        )}
                      </div>

                      {hasGirls ? (
                        <div className="space-y-1.5">
                          <div className="text-[11px] text-slate-300 font-mono truncate">
                            {sport.rulebookGirlsOriginalName || 'girls_rulebook.pdf'}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-500">
                            <span>
                              {sport.rulebookGirlsUploadedAt
                                ? new Date(sport.rulebookGirlsUploadedAt).toLocaleDateString('en-GB')
                                : 'Uploaded'}
                            </span>
                            {sport.rulebookGirlsSize && (
                              <span>{(sport.rulebookGirlsSize / 1024).toFixed(0)} KB</span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 pt-1 border-t border-surfaceBorder/60">
                            <a
                              href={sport.rulebookGirlsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-1 px-2 rounded bg-surfaceLight hover:bg-surfaceLight/80 text-athlos-gold text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1 transition"
                            >
                              <span>View</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                            <button
                              onClick={() => triggerUpload(sport.id, 'girls')}
                              disabled={isUploading}
                              className="py-1 px-2 rounded bg-surfaceLight hover:bg-surfaceLight/80 text-slate-300 text-[10px] font-bold uppercase tracking-wider transition"
                            >
                              Replace
                            </button>
                            <button
                              onClick={() => handleUnpublish(sport.id, sport.name, 'girls')}
                              className="p-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 transition"
                              title="Unpublish Girls Rulebook"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => triggerUpload(sport.id, 'girls')}
                          disabled={isUploading}
                          className="w-full py-1.5 px-2 rounded bg-surfaceLight hover:bg-surfaceLight/80 border border-athlos-gold/30 text-athlos-gold text-[10px] font-black uppercase tracking-wider flex items-center justify-center space-x-1.5 transition"
                        >
                          <Upload className="w-3 h-3" />
                          <span>{isUploading ? 'Uploading...' : 'Upload Girls PDF'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-lg bg-black/60 border border-surfaceBorder space-y-2.5 my-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                        <FileText className="w-3.5 h-3.5 text-athlos-gold" />
                        <span>Official Rulebook</span>
                      </span>
                      {hasCommon ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                          Published PDF
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                          No Document
                        </span>
                      )}
                    </div>

                    {hasCommon ? (
                      <div className="space-y-2">
                        <div className="text-[11px] text-slate-300 font-mono truncate">
                          {sport.rulebookOriginalName || 'official_rulebook.pdf'}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>
                            {sport.rulebookUploadedAt
                              ? new Date(sport.rulebookUploadedAt).toLocaleDateString('en-GB')
                              : 'Uploaded'}
                          </span>
                          {sport.rulebookSize && (
                            <span>{(sport.rulebookSize / 1024).toFixed(0)} KB</span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 pt-1 border-t border-surfaceBorder/60">
                          <a
                            href={sport.rulebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-1.5 px-2 rounded bg-surfaceLight hover:bg-surfaceLight/80 text-athlos-gold text-[10px] font-bold uppercase tracking-wider flex items-center justify-center space-x-1 transition"
                          >
                            <span>View PDF</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                          <button
                            onClick={() => triggerUpload(sport.id, 'common')}
                            disabled={isUploading}
                            className="py-1.5 px-2 rounded bg-surfaceLight hover:bg-surfaceLight/80 text-slate-300 text-[10px] font-bold uppercase tracking-wider transition"
                          >
                            Replace
                          </button>
                          <button
                            onClick={() => handleUnpublish(sport.id, sport.name, 'common')}
                            className="p-1.5 rounded bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/30 transition"
                            title="Unpublish Rulebook"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <button
                          onClick={() => triggerUpload(sport.id, 'common')}
                          disabled={isUploading}
                          className="w-full py-2 px-3 rounded-lg bg-surfaceLight hover:bg-surfaceLight/80 border border-athlos-gold/30 text-athlos-gold text-[11px] font-black uppercase tracking-wider flex items-center justify-center space-x-1.5 transition"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>{isUploading ? 'Uploading...' : 'Upload Rulebook PDF'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-surfaceBorder/60 flex items-center justify-between text-[11px] text-slate-500 font-mono">
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
                  placeholder="Boys, Girls, Mixed"
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

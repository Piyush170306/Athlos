'use client';

import React, { useState, useEffect } from 'react';

interface PollVoteButtonProps {
  pollId: string;
  options: Array<{
    batchId: string;
    batch?: any;
    voteCount: number;
    percentage: number;
  }>;
}

export default function PollVoteButton({ pollId, options }: PollVoteButtonProps) {
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if device token already voted for this poll
    const votedPolls = JSON.parse(localStorage.getItem('athlos_voted_polls') || '{}');
    if (votedPolls[pollId]) {
      setHasVoted(true);
      setSelectedBatch(votedPolls[pollId]);
    }
  }, [pollId]);

  const handleVote = async () => {
    if (!selectedBatch || isSubmitting || hasVoted) return;

    setIsSubmitting(true);
    setMessage(null);

    // Generate or fetch anonymous client device token
    let deviceToken = localStorage.getItem('athlos_device_token');
    if (!deviceToken) {
      deviceToken = 'dev-' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem('athlos_device_token', deviceToken);
    }

    try {
      const res = await fetch('/api/polls/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pollId,
          batchId: selectedBatch,
          deviceToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Failed to submit prediction');
      } else {
        setHasVoted(true);
        const votedPolls = JSON.parse(localStorage.getItem('athlos_voted_polls') || '{}');
        votedPolls[pollId] = selectedBatch;
        localStorage.setItem('athlos_voted_polls', JSON.stringify(votedPolls));
        setMessage('Prediction recorded! Results update automatically.');
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasVoted) {
    return (
      <div className="text-center py-2 px-3 rounded-lg bg-emerald-950/40 border border-emerald-800 text-emerald-400 text-xs font-semibold">
        ✓ Your prediction has been registered on this device.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.batchId}
            onClick={() => setSelectedBatch(opt.batchId)}
            className={`flex-1 py-1.5 px-3 rounded text-xs font-bold uppercase tracking-wider border transition ${
              selectedBatch === opt.batchId
                ? 'bg-athlos-gold text-black border-athlos-gold shadow-glow-gold'
                : 'bg-surfaceLight/80 text-slate-300 border-surfaceBorder hover:border-slate-400'
            }`}
          >
            Vote {opt.batch?.code || 'Batch'}
          </button>
        ))}
      </div>

      <button
        onClick={handleVote}
        disabled={!selectedBatch || isSubmitting}
        className="w-full py-2 rounded text-xs font-black uppercase tracking-wider bg-orange-600 hover:bg-orange-500 disabled:opacity-40 disabled:hover:bg-orange-600 text-white transition shadow-glow-orange"
      >
        {isSubmitting ? 'Recording Vote...' : 'Submit Prediction'}
      </button>

      {message && (
        <p className="text-[11px] text-center text-amber-400 font-medium">{message}</p>
      )}
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { BarChart2, Flame, CheckCircle, Clock, ShieldAlert } from 'lucide-react';
import { getActiveSeason, getPublicPolls } from '@/lib/db/public';
import PollVoteButton from '@/components/PollVoteButton';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PollsPage() {
  const activeSeason = getActiveSeason();
  const allPolls = getPublicPolls(activeSeason.id);
  const openPolls = allPolls.filter((p) => p.status === 'OPEN' && p.match && p.match.status === 'UPCOMING' && p.match.scheduledDate === '2026-11-09');
  const closedPolls = allPolls.filter((p) => p.status === 'CLOSED' || (p.match && p.match.status === 'COMPLETED'));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-surfaceBorder pb-6">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-orange-400 mb-1">
          <Flame className="w-4 h-4" />
          <span>Community Predictions</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black uppercase text-white tracking-tight">
          Match Prediction Polls
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Predict winners for marquee derby matches. Real-time server-backed tallies with device deterrence.
        </p>
      </div>

      {/* Transparency Disclaimer (Mandated by PRD Section 4) */}
      <div className="p-4 rounded-xl bg-surfaceLight/80 border border-surfaceBorder text-xs text-slate-400 flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-athlos-gold flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-white">Polling Governance Notice:</strong> No public user login is required
          to vote. Device tokens and IP rate limiting deter duplicate predictions from the same device,
          though this does not strictly guarantee one vote per person. Poll tallies are independent fan
          predictions and do not alter official tournament standings.
        </p>
      </div>

      {/* Open Polls Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-black uppercase tracking-wider text-white flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Open Prediction Polls ({openPolls.length})</span>
        </h2>

        {openPolls.length === 0 ? (
          <div className="esports-card rounded-xl p-8 text-center text-slate-400 text-xs">
            There are no prediction polls currently active. Check back when the next round of fixtures begins!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {openPolls.map((poll) => (
              <div
                key={poll.id}
                className="esports-card rounded-2xl p-6 border-orange-500/40 shadow-glow-orange flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-bold text-orange-400 uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-orange-950/60 border border-orange-800">
                      Live Community Poll
                    </span>
                    <span className="font-semibold">{poll.totalVotes} Total Votes</span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-4 leading-snug">
                    {poll.title}
                  </h3>

                  {/* Percentage Bars */}
                  <div className="space-y-3 mb-6">
                    {poll.options.map((opt) => (
                      <div key={opt.batchId} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-white font-bold">
                            {opt.batch?.code}
                          </span>
                          <span className="text-slate-200 font-bold">
                            {opt.percentage}% ({opt.voteCount} votes)
                          </span>
                        </div>
                        <div className="w-full h-2.5 rounded-full bg-surfaceLight overflow-hidden border border-surfaceBorder">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              opt.batch?.code === 'IPM06'
                                ? 'bg-emerald-500'
                                : opt.batch?.code === 'IPM07'
                                ? 'bg-orange-500'
                                : 'bg-yellow-500'
                            }`}
                            style={{ width: `${opt.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vote CTA */}
                <div className="pt-4 border-t border-surfaceBorder/80">
                  <PollVoteButton pollId={poll.id} options={poll.options} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Closed Polls History */}
      {closedPolls.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-surfaceBorder">
          <h2 className="text-xl font-black uppercase tracking-wider text-slate-300 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-slate-500" />
            <span>Closed Prediction Archives ({closedPolls.length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {closedPolls.map((poll) => (
              <div
                key={poll.id}
                className="esports-card rounded-xl p-5 border-surfaceBorder opacity-80"
              >
                <div className="flex justify-between text-xs text-slate-500 mb-2 font-mono">
                  <span>POLL CLOSED</span>
                  <span>{poll.totalVotes} Total Votes</span>
                </div>
                <h4 className="font-bold text-sm text-slate-200 mb-3">{poll.title}</h4>
                <div className="space-y-2">
                  {poll.options.map((opt) => (
                    <div key={opt.batchId} className="flex justify-between text-xs text-slate-400">
                      <span>{opt.batch?.code}</span>
                      <span className="font-bold text-slate-300">
                        {opt.percentage}% ({opt.voteCount})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

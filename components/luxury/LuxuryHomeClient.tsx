'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Flame,
  Award,
  ArrowRight,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { LeaderboardEntry } from '@/lib/db/public';
import PollVoteButton from '@/components/PollVoteButton';
import LuxuryHero from './LuxuryHero';
import LuxuryHeadlineTicker, { HeadlineItem } from './LuxuryHeadlineTicker';
import LuxuryLeaderboard from './LuxuryLeaderboard';
import LeaderboardDetailDrawer from './LeaderboardDetailDrawer';
import TiltCard from './TiltCard';

interface LuxuryHomeClientProps {
  leaderboard: LeaderboardEntry[];
  upcomingMatches: any[];
  completedMatches: any[];
  highlights: any[];
  announcements: any[];
  activePoll: any;
  headlineItems: HeadlineItem[];
}

export default function LuxuryHomeClient({
  leaderboard,
  upcomingMatches,
  completedMatches,
  highlights,
  announcements,
  activePoll,
  headlineItems,
}: LuxuryHomeClientProps) {
  const [selectedBatch, setSelectedBatch] = useState<LeaderboardEntry | null>(null);

  const bannerAnnouncement = announcements.find((a: any) => a.isBanner);

  return (
    <div className="w-full overflow-x-hidden space-y-10 sm:space-y-14 pb-24">
      {/* 1. Official Bulletin Banner if active */}
      {bannerAnnouncement && (
        <div className="bg-gradient-to-r from-[#17140E] via-[#241E14] to-[#17140E] border-b border-[#302719] px-4 py-2 text-center text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 flex-wrap">
            <span className="font-spartan font-black text-[#E6CA83] uppercase tracking-widest text-[10px] px-2 py-0.5 rounded bg-black/60 border border-[#C6A45A]/40">
              Bulletin
            </span>
            <span className="font-bold text-[#F5EBD4]">{bannerAnnouncement.title}:</span>
            <span className="text-slate-300 hidden sm:inline">{bannerAnnouncement.content}</span>
          </div>
        </div>
      )}

      {/* 2. Black & Gold Luxury Championship Hero */}
      <LuxuryHero leaderboard={leaderboard} onSelectBatch={setSelectedBatch} />

      {/* 3. Infinite Continuous Moving Headline Strip */}
      <LuxuryHeadlineTicker items={headlineItems} speedSeconds={38} />

      {/* 4. Dynamic Black & Gold Leaderboard with Click-Through Zoom */}
      <LuxuryLeaderboard leaderboard={leaderboard} onSelectBatch={setSelectedBatch} />

      {/* 5. Scoreboard & Upcoming Fixtures */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 border-b border-[#302719] mb-6 gap-3">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#C6A45A] mb-1">
              <span>SEC. 02 / SCHEDULE</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Calendar className="w-6 h-6 text-[#E6CA83]" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-spartan font-black uppercase tracking-wider text-white">
                Upcoming Tournament Fixtures
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Synchronised tournament schedule reflecting approved spreadsheet entries (Asia/Kolkata)
            </p>
          </div>

          <Link
            href="/matches"
            className="inline-flex items-center space-x-1.5 text-xs font-spartan font-bold uppercase tracking-wider text-[#E6CA83] hover:text-white px-3.5 py-2 rounded-xl bg-[#17140E] border border-[#302719] transition"
          >
            <span>Full Schedule & History</span>
            <ChevronRight className="w-4 h-4 text-[#C6A45A]" />
          </Link>
        </div>

        {upcomingMatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingMatches.map((match) => (
              <TiltCard
                key={match.id}
                maxTilt={5}
                className="group rounded-2xl p-4 flex flex-col justify-between border border-[#302719] bg-gradient-to-b from-[#14110C] to-[#080808] hover:border-[#E6CA83]/60 hover:shadow-[0_8px_30px_rgba(230,202,131,0.15)] transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                    <span className="text-[#E6CA83] font-spartan font-bold uppercase tracking-wider">
                      {match.sport?.name}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/60 border border-[#302719] text-slate-300">
                      {match.timeSlot || 'Slot TBD'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 mb-3 font-medium flex items-center space-x-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-[#1e1910] text-[#E6CA83] text-[10px] font-mono font-bold uppercase border border-[#302719]">
                      {match.category?.name || 'Boys'}
                    </span>
                    <span>• {match.scheduledDate || 'Date TBD'}</span>
                  </div>

                  {/* Match Up Scoreboard (Strictly Batch Codes) */}
                  <div className="bg-black/60 rounded-xl p-3 flex items-center justify-between my-2 border border-[#302719]">
                    <span className="font-spartan font-black text-white text-base tracking-wider">
                      {match.batchA?.code || 'TBD'}
                    </span>
                    <span className="text-[10px] font-mono font-black text-[#C6A45A] uppercase px-2 py-0.5 rounded bg-[#1e1910] border border-[#302719]">
                      VS
                    </span>
                    <span className="font-spartan font-black text-white text-base tracking-wider">
                      {match.batchB?.code || 'TBD'}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#302719] flex items-center justify-between text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-[#17140E] text-[#E6CA83] border border-[#C6A45A]/40 font-mono font-bold uppercase text-[10px]">
                    {match.status}
                  </span>
                  <Link
                    href={`/matches?highlight=${match.id}`}
                    className="text-slate-400 hover:text-[#E6CA83] font-bold transition flex items-center space-x-1"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </TiltCard>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-[#302719] bg-black/40 text-center text-slate-400 text-sm">
            All currently scheduled fixtures have concluded. Check the Completed Matches archive!
          </div>
        )}
      </section>

      {/* 6. Live Prediction Polls & Data-Driven Tournament Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Prediction Poll */}
        <div className="lg:col-span-1">
          <div className="flex items-center space-x-2 pb-3 border-b border-[#302719] mb-4">
            <Flame className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-spartan font-black uppercase tracking-wider text-white">
              Today's Match Prediction
            </h3>
          </div>

          {activePoll ? (
            <div className="rounded-2xl p-5 border border-[#302719] bg-gradient-to-b from-[#17140E] to-[#0A0907] shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-spartan font-black uppercase tracking-widest text-[#E6CA83] px-2.5 py-0.5 rounded-full bg-[#302719] border border-[#C6A45A]/50">
                  Open For Today
                </span>
                <span className="text-[11px] font-mono text-slate-400 font-semibold">
                  {activePoll.totalVotes} votes
                </span>
              </div>
              <h4 className="font-bold text-sm text-[#F5EBD4] mb-4 leading-snug">
                {activePoll.title}
              </h4>

              <div className="space-y-3">
                {activePoll.options.map((opt: any) => (
                  <div key={opt.batchId} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-white font-spartan font-bold tracking-wider">{opt.batch?.code}</span>
                      <span className="text-slate-300 font-mono font-bold">
                        {opt.percentage}% ({opt.voteCount})
                      </span>
                    </div>
                    {/* Progress Bar with Luxury Gold Finish */}
                    <div className="w-full h-2 rounded-full bg-black/70 overflow-hidden border border-[#302719]">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[#C6A45A] to-[#E6CA83]"
                        style={{ width: `${opt.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-[#302719]">
                <PollVoteButton pollId={activePoll.id} options={activePoll.options} />
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-6 text-center text-slate-400 text-xs border border-[#302719] bg-[#0c0a07]">
              No active prediction polls open for today's schedule. Check back tomorrow!
            </div>
          )}
        </div>

        {/* Data-Driven Verified Highlights Feed */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-[#302719] mb-4">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-[#E6CA83]" />
              <h3 className="text-lg font-spartan font-black uppercase tracking-wider text-white">
                Tournament Highlights
              </h3>
            </div>
            <Link
              href="/highlights"
              className="text-xs font-spartan font-bold uppercase tracking-wider text-[#E6CA83] hover:text-white transition"
            >
              All Highlights →
            </Link>
          </div>

          <div className="space-y-3.5">
            {highlights.map((hl: any) => (
              <div
                key={hl.id}
                className="rounded-2xl p-4.5 border border-[#302719] hover:border-[#E6CA83]/50 transition-all bg-gradient-to-b from-[#14110C] to-[#080808] flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 mb-1.5">
                    {hl.isPinned && (
                      <span className="px-2 py-0.5 rounded bg-[#302719] text-[#E6CA83] border border-[#C6A45A]/40 font-mono font-bold uppercase text-[10px]">
                        Pinned
                      </span>
                    )}
                    <span className="text-[#C6A45A] font-mono font-semibold">
                      {new Date(hl.publishedAt).toLocaleDateString('en-GB')}
                    </span>
                    <span>• {hl.author}</span>
                  </div>
                  <h4 className="text-base font-spartan font-bold text-white mb-1">{hl.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-manrope">{hl.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Click-Through Detailed Performance Drawer */}
      <LeaderboardDetailDrawer
        entry={selectedBatch}
        onClose={() => setSelectedBatch(null)}
      />
    </div>
  );
}
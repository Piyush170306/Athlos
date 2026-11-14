import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Calendar,
  Flame,
  Award,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  getActiveSeason,
  getOfficialLeaderboard,
  getPublicMatches,
  getPublicHighlights,
  getPublicAnnouncements,
  getPublicPolls,
} from '@/lib/db/public';
import PollVoteButton from '@/components/PollVoteButton';

export const revalidate = 0; // Dynamic server rendering for live accuracy

export default function HomePage() {
  const activeSeason = getActiveSeason();
  const leaderboard = getOfficialLeaderboard(activeSeason.id);
  const matches = getPublicMatches(activeSeason.id);
  const upcomingMatches = matches.filter((m) => m.status === 'UPCOMING').slice(0, 4);
  const highlights = getPublicHighlights(activeSeason.id, 4);
  const announcements = getPublicAnnouncements(activeSeason.id);
  const bannerAnnouncement = announcements.find((a) => a.isBanner);
  const polls = getPublicPolls(activeSeason.id, { todayOnly: true });
  const activePoll = polls[0] || null;

  return (
    <div className="w-full overflow-x-hidden space-y-12 pb-20">
      {/* 1. Announcements Banner */}
      {bannerAnnouncement && (
        <div className="bg-gradient-to-r from-amber-950/80 via-yellow-950/60 to-amber-950/80 border-b border-amber-500/30 px-4 py-2.5 text-center text-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-center space-x-2 flex-wrap">
            <span className="font-black text-amber-300 uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-black/50 border border-amber-500/40">
              Official Bulletin
            </span>
            <span className="font-semibold text-slate-200">{bannerAnnouncement.title}:</span>
            <span className="text-slate-300 hidden sm:inline">{bannerAnnouncement.content}</span>
          </div>
        </div>
      )}

      {/* 2. Hero Section: Exclusively ATHLOS & WAR OF BATCHES */}
      <section className="relative overflow-hidden pt-12 pb-6 text-center">
        {/* Subtle cinematic golden ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[650px] h-[320px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 flex flex-col items-center justify-center space-y-3 relative z-10">
          <h1 className="text-5xl sm:text-8xl md:text-9xl font-black tracking-wider sm:tracking-widest uppercase bg-gradient-to-b from-[#FFF5B8] via-[#E5B842] to-[#996515] bg-clip-text text-transparent drop-shadow-[0_4px_35px_rgba(229,184,66,0.4)]">
            ATHLOS
          </h1>
          <h2 className="text-xl sm:text-3xl md:text-5xl font-black tracking-widest sm:tracking-[0.25em] uppercase text-amber-100/90 drop-shadow-[0_2px_15px_rgba(229,184,66,0.3)]">
            WAR OF BATCHES
          </h2>
        </div>
      </section>

      {/* 3. Official Tournament Leaderboard (Immediately After Hero) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-amber-500/20 mb-6 gap-2">
          <div>
            <div className="flex items-center space-x-2.5">
              <Trophy className="w-6 h-6 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
                Official Leaderboard
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Authoritative Standings from Approved Batch Scores Table (Row 89)</span>
            </p>
          </div>
          <Link
            href="/leaderboard"
            className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-200 transition"
          >
            <span>Full Standings & Matrix</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Leaderboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leaderboard.map((entry) => {
            const isRank1 = entry.rank === 1;
            const isRank2 = entry.rank === 2;
            const isRank3 = entry.rank === 3;

            let borderStyle = 'border-surfaceBorder';
            let bgGradient = 'from-[#0d1322] to-[#070b14]';
            let rankBadgeBg = 'bg-surfaceLight border-surfaceBorder text-slate-300';
            let pointsGlow = 'text-white';

            if (isRank1) {
              borderStyle = 'border-amber-400/60 shadow-[0_0_25px_rgba(245,158,11,0.18)]';
              bgGradient = 'from-[#1c1608]/90 via-[#120f06]/80 to-[#070b14]';
              rankBadgeBg = 'bg-amber-500 text-black border-amber-300 font-black shadow-glow-gold';
              pointsGlow = 'text-amber-300 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]';
            } else if (isRank2) {
              borderStyle = 'border-slate-400/40';
              bgGradient = 'from-[#141a29]/90 to-[#070b14]';
              rankBadgeBg = 'bg-slate-300 text-black border-slate-200 font-black';
            } else if (isRank3) {
              borderStyle = 'border-amber-700/40';
              bgGradient = 'from-[#15110a]/90 to-[#070b14]';
              rankBadgeBg = 'bg-amber-800 text-amber-100 border-amber-600 font-black';
            }

            // Sport breakdown list
            const sportsList = Object.entries(entry.breakdownBySport || {}).filter(([_, pts]) => pts > 0);

            return (
              <div
                key={entry.batch.id}
                className={`relative rounded-2xl p-6 transition-all duration-300 border bg-gradient-to-b ${bgGradient} ${borderStyle} hover:scale-[1.01]`}
              >
                {/* Rank Badge */}
                <div className="flex items-center justify-between mb-5">
                  <span
                    className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-base tracking-wider uppercase border ${rankBadgeBg}`}
                  >
                    #{entry.rank}
                  </span>
                  {isRank1 && (
                    <span className="flex items-center space-x-1 text-[10px] font-black uppercase tracking-widest text-amber-300 px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/50">
                      <Sparkles className="w-3 h-3" />
                      <span>Leader</span>
                    </span>
                  )}
                </div>

                {/* Mascot Artwork & Batch Name Only */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-black/70 border border-amber-500/30 flex-shrink-0 flex items-center justify-center p-1">
                    <img
                      src={entry.batch.mascotImagePath}
                      alt={entry.batch.code}
                      className="w-full h-full object-cover mix-blend-screen"
                    />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-wider uppercase text-white">
                      {entry.batch.code}
                    </h3>
                    <p className="text-xs text-amber-400/80 font-semibold tracking-wider uppercase">
                      Official Cohort
                    </p>
                  </div>
                </div>

                {/* Points & Wins */}
                <div className="pt-4 border-t border-surfaceBorder/60 flex items-end justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Official Points
                    </span>
                    <span className={`text-4xl font-black tracking-tight ${pointsGlow}`}>
                      {entry.totalPoints.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Match Wins
                    </span>
                    <span className="text-2xl font-bold text-slate-200">
                      {entry.wins}
                    </span>
                  </div>
                </div>

                {/* Sport-wise Breakdown Pills */}
                {sportsList.length > 0 && (
                  <div className="pt-3 border-t border-surfaceBorder/40">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                      Key Sport Points
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {sportsList.slice(0, 5).map(([sport, pts]) => (
                        <span
                          key={sport}
                          className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-black/40 border border-surfaceBorder/70 text-slate-300"
                        >
                          {sport.replace(/-/g, ' ')}: <span className="text-amber-400">+{pts}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Upcoming Fixtures (Verified Match Status) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between pb-4 border-b border-surfaceBorder mb-6">
          <div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white">
                Upcoming Fixtures
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Live tournament schedule reflecting approved spreadsheet data (Asia/Kolkata)
            </p>
          </div>
          <Link
            href="/matches"
            className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-white transition"
          >
            <span>View All Matches</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcomingMatches.map((match) => (
            <div
              key={match.id}
              className="esports-card rounded-xl p-4 flex flex-col justify-between hover:border-amber-400/40 transition bg-[#0b0f1a]/80"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                  <span className="text-amber-400 font-bold uppercase">
                    {match.sport?.name}
                  </span>
                  <span>{match.timeSlot || 'Slot TBD'}</span>
                </div>
                <div className="text-xs text-slate-400 mb-3 font-medium">
                  {match.category?.name || 'Boys'} • {match.scheduledDate || 'Date TBD'}
                </div>

                {/* Match Up (Strictly Batch Codes) */}
                <div className="bg-surfaceLight/60 rounded-lg p-3 flex items-center justify-between text-sm font-black my-2 border border-surfaceBorder/80">
                  <span className="text-white text-base">
                    {match.batchA?.code || 'TBD'}
                  </span>
                  <span className="text-[10px] text-amber-400/80 font-black uppercase px-2 py-0.5 rounded bg-black/40">
                    VS
                  </span>
                  <span className="text-white text-base">
                    {match.batchB?.code || 'TBD'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-surfaceBorder/60 flex items-center justify-between text-[11px]">
                <span className="px-2 py-0.5 rounded bg-blue-950/70 text-blue-300 border border-blue-800 font-bold uppercase text-[10px]">
                  {match.status}
                </span>
                <Link
                  href={`/matches?highlight=${match.id}`}
                  className="text-slate-400 hover:text-amber-300 font-semibold"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Live Predictions (Today Only) & Data-Driven Tournament Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Prediction Poll: Matches Scheduled for Today */}
        <div className="lg:col-span-1">
          <div className="flex items-center space-x-2 pb-3 border-b border-surfaceBorder mb-4">
            <Flame className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-black uppercase tracking-wider text-white">
              Today's Match Prediction
            </h3>
          </div>

          {activePoll ? (
            <div className="esports-card rounded-2xl p-5 border-amber-500/40 bg-[#0d111c]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/50">
                  Open For Today
                </span>
                <span className="text-[11px] text-slate-400 font-semibold">
                  {activePoll.totalVotes} votes
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-100 mb-4 leading-snug">
                {activePoll.title}
              </h4>

              <div className="space-y-3">
                {activePoll.options.map((opt) => (
                  <div key={opt.batchId} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-white font-bold">
                        {opt.batch?.code}
                      </span>
                      <span className="text-slate-300 font-bold">{opt.percentage}% ({opt.voteCount})</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden border border-surfaceBorder">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-500 to-yellow-400"
                        style={{ width: `${opt.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-4 border-t border-surfaceBorder">
                <PollVoteButton pollId={activePoll.id} options={activePoll.options} />
              </div>
            </div>
          ) : (
            <div className="esports-card rounded-2xl p-6 text-center text-slate-400 text-xs bg-[#0b0f1a]">
              No active prediction polls open for today's schedule. Check back tomorrow!
            </div>
          )}
        </div>

        {/* Data-Driven Highlights Feed (Verified Match Results) */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between pb-3 border-b border-surfaceBorder mb-4">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-black uppercase tracking-wider text-white">
                Tournament Highlights
              </h3>
            </div>
            <Link
              href="/highlights"
              className="text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-white"
            >
              All Highlights →
            </Link>
          </div>

          <div className="space-y-3.5">
            {highlights.map((hl) => (
              <div
                key={hl.id}
                className="esports-card rounded-xl p-4 hover:border-amber-400/40 transition bg-[#0b0f1a]/90 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2 text-[11px] text-slate-400 mb-1.5">
                    {hl.isPinned && (
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold uppercase text-[10px]">
                        Pinned
                      </span>
                    )}
                    <span className="text-amber-400/90 font-semibold">{new Date(hl.publishedAt).toLocaleDateString('en-GB')}</span>
                    <span>• {hl.author}</span>
                  </div>
                  <h4 className="text-base font-bold text-white mb-1">{hl.title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{hl.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
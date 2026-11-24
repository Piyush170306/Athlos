import React from 'react';
import {
  getActiveSeason,
  getOfficialLeaderboard,
  getPublicMatches,
  getPublicHighlights,
  getPublicAnnouncements,
  getPublicPolls,
} from '@/lib/db/public';
import { getPointsProgression } from '@/lib/db/pointsHistory';
import LuxuryHomeClient from '@/components/luxury/LuxuryHomeClient';
import { HeadlineItem } from '@/components/luxury/LuxuryHeadlineTicker';

export const revalidate = 0; // Dynamic server rendering for live accuracy

export default function HomePage() {
  const activeSeason = getActiveSeason();
  const leaderboard = getOfficialLeaderboard(activeSeason.id);
  const pointsProgression = getPointsProgression(activeSeason.id);
  const matches = getPublicMatches(activeSeason.id);
  const upcomingMatches = matches.filter((m) => m.status === 'UPCOMING').slice(0, 4);
  const completedMatches = matches.filter((m) => m.status === 'COMPLETED').slice(0, 4);
  const highlights = getPublicHighlights(activeSeason.id, 4);
  const announcements = getPublicAnnouncements(activeSeason.id);
  const polls = getPublicPolls(activeSeason.id, { todayOnly: true });
  const activePoll = polls[0] || null;

  // Build dynamic continuous headline ticker items from verified database
  const headlineItems: HeadlineItem[] = [
    {
      id: 'brand-1',
      badge: 'CHAMPIONSHIP',
      text: 'ATHLOS WAR OF BATCHES 2026–27',
      highlight: true,
    },
    {
      id: 'batches-1',
      badge: 'COHORTS',
      text: 'IPM06 • IPM07 • IPM08',
    },
    ...leaderboard.map((lb) => ({
      id: `lead-${lb.batch.id}`,
      badge: `RANK #${lb.rank}`,
      text: `${lb.batch.code}: ${lb.totalPoints.toFixed(1)} PTS (${lb.wins} WINS)`,
      highlight: lb.rank === 1,
      link: '/leaderboard',
    })),
    ...upcomingMatches.slice(0, 3).map((m) => ({
      id: `up-${m.id}`,
      badge: 'UPCOMING FIXTURE',
      text: `${m.sport?.name} (${m.category?.name}): ${m.batchA?.code} VS ${m.batchB?.code} • ${m.scheduledDate}`,
      link: `/matches?highlight=${m.id}`,
    })),
    ...completedMatches.slice(0, 2).map((m) => ({
      id: `res-${m.id}`,
      badge: 'VERIFIED RESULT',
      text: `${m.sport?.name}: ${m.winnerBatch?.code || 'CONCLUDED'} WON${m.rawScore ? ` (${m.rawScore})` : ''}`,
      link: `/matches?highlight=${m.id}`,
    })),
  ];

  return (
    <LuxuryHomeClient
      leaderboard={leaderboard}
      pointsProgression={pointsProgression}
      upcomingMatches={upcomingMatches}
      completedMatches={completedMatches}
      highlights={highlights}
      announcements={announcements}
      activePoll={activePoll}
      headlineItems={headlineItems}
    />
  );
}
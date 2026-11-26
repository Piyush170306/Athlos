import React from 'react';
import { Metadata } from 'next';
import { getTeamData } from '@/lib/team';
import MeetTheTeamClient from '@/components/team/MeetTheTeamClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0; // Dynamic server rendering to reflect newly uploaded/renamed team photos instantly


export const metadata: Metadata = {
  title: 'Meet the Team | ATHLOS War of Batches 2026–27',
  description: 'Meet the student coordinators and organizing committee behind ATHLOS War of Batches 2026–27.',
};

export default function TeamPage() {
  const teamData = getTeamData();

  return <MeetTheTeamClient initialData={teamData} />;
}

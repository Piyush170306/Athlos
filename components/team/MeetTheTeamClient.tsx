'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Shield,
  Award,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Camera,
} from 'lucide-react';
import { TeamData, TeamMember } from '@/lib/team';
import TeamMemberCard from './TeamMemberCard';
import TeamProfileModal from './TeamProfileModal';

interface MeetTheTeamClientProps {
  initialData: TeamData;
}

export default function MeetTheTeamClient({ initialData }: MeetTheTeamClientProps) {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const { fullTeamPhoto, seniorTeam, juniorTeam, ambiguities } = initialData;

  return (
    <div className="w-full min-h-screen bg-[#03060B] text-white selection:bg-[#79C9F2]/30 selection:text-white pb-28">
      {/* 1. Header Section */}
      <section className="relative overflow-hidden pt-12 pb-14 border-b border-[#0B1727]">
        {/* Ambient Cosmic Lights */}
        <div className="absolute top-0 right-1/3 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_rgba(29,94,145,0.22)_0%,_transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-[radial-gradient(ellipse_at_center,_rgba(121,201,242,0.12)_0%,_transparent_70%)] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-[0.25em] text-[#79C9F2] mb-2">
                <Users className="w-4 h-4 text-[#79C9F2]" />
                <span>ATHLOS 2026–27 ORGANIZING COMMITTEE</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-spartan font-black uppercase tracking-tight text-white drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">
                MEET THE TEAM
              </h1>
            </div>

            {/* Structure Summary Pill */}
            <div className="flex items-center space-x-3 px-4 py-2.5 rounded-2xl bg-[#050B16] border border-[#1D5E91]/40 text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Composition</span>
                <span className="font-bold text-[#F2F7FC]">
                  {seniorTeam.length} Senior • {juniorTeam.length} Junior Members
                </span>
              </div>
            </div>
          </div>

          {/* Ambiguity / Formatting Alert Notice (Rule 10: Flag ambiguities for correction instead of guessing) */}
          {ambiguities.length > 0 && (
            <div className="mt-8 rounded-2xl p-4 sm:p-5 bg-amber-950/30 border border-amber-500/50 backdrop-blur-md">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-spartan font-bold text-sm text-amber-300 uppercase tracking-wider">
                    Filename Validation & Ordering Notice
                  </h4>
                  <ul className="text-xs text-amber-200/90 font-mono list-disc list-inside space-y-1">
                    {ambiguities.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-amber-400/80 pt-1">
                    All valid members are displayed below in numerical sequence. Please rename ambiguous files in the team folder to resolve duplicate indices.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-16">
        {/* 2. Full Team Photograph Showcase */}
        {fullTeamPhoto && (
          <section className="relative rounded-3xl overflow-hidden border border-[#1D5E91]/40 bg-[#050B16] shadow-[0_16px_50px_rgba(0,0,0,0.85)] p-4 sm:p-6">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#0B1727]">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-[#79C9F2]" />
                <h2 className="font-spartan font-black text-lg sm:text-xl uppercase tracking-wider text-white">
                  The Full ATHLOS Committee
                </h2>
              </div>
              <span className="text-[11px] font-mono text-[#79C9F2] px-2.5 py-1 rounded-lg bg-[#0B1727] border border-[#1D5E91]/40 uppercase tracking-wider">
                Official Group Photo
              </span>
            </div>

            <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-black/70 border border-[#1D5E91]/30">
              <img
                src={fullTeamPhoto}
                alt="ATHLOS War of Batches Full Organizing Team"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#03060B]/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-10">
                <span className="font-spartan font-black text-base sm:text-2xl text-white uppercase tracking-wider drop-shadow-md block">
                  War of Batches 2026–27
                </span>
                <span className="text-xs sm:text-sm text-[#C7D3DF] font-mono">
                  Ten dedicated student members orchestrating 15 championship disciplines.
                </span>
              </div>
            </div>
          </section>
        )}

        {/* 3. Senior Team Section (Fixed at 4 members) */}
        <section>
          <div className="flex items-center justify-between pb-3 border-b border-[#0B1727] mb-6">
            <div className="flex items-center space-x-2.5">
              <Shield className="w-5 h-5 text-[#79C9F2]" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-spartan font-black uppercase tracking-wider text-white">
                Senior Team
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400 px-3 py-1 rounded-xl bg-[#050B16] border border-[#1D5E91]/40">
              {seniorTeam.length} / 4 Members Loaded
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {seniorTeam.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                onSelect={(m) => setSelectedMember(m)}
              />
            ))}
          </div>
        </section>

        {/* 4. Junior Team Section (Fixed at 6 members) */}
        <section>
          <div className="flex items-center justify-between pb-3 border-b border-[#0B1727] mb-6">
            <div className="flex items-center space-x-2.5">
              <Award className="w-5 h-5 text-[#79C9F2]" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-spartan font-black uppercase tracking-wider text-white">
                Junior Team
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400 px-3 py-1 rounded-xl bg-[#050B16] border border-[#1D5E91]/40">
              {juniorTeam.length} / 6 Members Loaded
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {juniorTeam.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                onSelect={(m) => setSelectedMember(m)}
              />
            ))}
          </div>
        </section>
      </div>

      {/* 5. Animated Profile Modal */}
      <TeamProfileModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </div>
  );
}

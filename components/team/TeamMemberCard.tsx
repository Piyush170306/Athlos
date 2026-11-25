'use client';

import React from 'react';
import { AlertCircle, ExternalLink } from 'lucide-react';
import { TeamMember } from '@/lib/team';

interface TeamMemberCardProps {
  member: TeamMember;
  onSelect: (member: TeamMember) => void;
}

export default function TeamMemberCard({ member, onSelect }: TeamMemberCardProps) {
  const isSenior = member.team === 'Senior Team';
  const orderString = String(member.order).padStart(2, '0');

  return (
    <div
      onClick={() => onSelect(member)}
      className="group relative rounded-2xl p-3 sm:p-4 bg-gradient-to-b from-[#0B1727]/90 via-[#070F1B]/90 to-[#03060B]/90 border border-[#1D5E91]/35 hover:border-[#79C9F2]/70 shadow-[0_8px_30px_rgba(0,0,0,0.7)] hover:shadow-[0_12px_40px_rgba(121,201,242,0.22)] transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      {/* Photo Frame Container */}
      <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-black/60 border border-[#1D5E91]/25 group-hover:border-[#79C9F2]/50 transition-colors duration-300">
        <img
          src={member.imageSrc}
          alt={member.name}
          className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/branding/athlos_ipm_sports_club_crest.png';
          }}
        />

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#03060B] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Numerical Order Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#03060B]/85 backdrop-blur-md border border-[#1D5E91]/40 text-[#79C9F2] text-[11px] font-mono font-bold tracking-wider shadow-sm">
          <span>#{orderString}</span>
        </div>

        {/* Ambiguity Flag Badge if duplicate index detected */}
        {member.isAmbiguous && (
          <div
            title={member.ambiguityReason}
            className="absolute top-2.5 right-2.5 flex items-center space-x-1 px-2 py-1 rounded-lg bg-amber-500/90 text-black text-[10px] font-mono font-black uppercase tracking-wider shadow-md animate-pulse"
          >
            <AlertCircle className="w-3 h-3 text-black" />
            <span>Duplicate #{orderString}</span>
          </div>
        )}

        {/* View Profile Hover Hint */}
        <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-lg bg-[#0B1727]/90 text-[#79C9F2] border border-[#79C9F2]/40 backdrop-blur-sm">
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Member Details Below Photograph (Strictly Extracted Name and Designation) */}
      <div className="pt-3.5 pb-1 text-center">
        <h3 className="font-spartan font-black text-base sm:text-lg text-white uppercase tracking-wider group-hover:text-[#79C9F2] transition-colors line-clamp-1">
          {member.name}
        </h3>

        <div className="mt-1.5 inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#050B16] border border-[#1D5E91]/40 text-[11px] font-mono font-semibold text-[#C7D3DF] tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-[#79C9F2] mr-1.5" />
          <span>{member.designation}</span>
        </div>
      </div>
    </div>
  );
}

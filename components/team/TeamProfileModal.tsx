'use client';

import React, { useEffect } from 'react';
import { X, Award, Shield, AlertTriangle } from 'lucide-react';
import { TeamMember } from '@/lib/team';

interface TeamProfileModalProps {
  member: TeamMember | null;
  onClose: () => void;
}

export default function TeamProfileModal({ member, onClose }: TeamProfileModalProps) {
  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!member) return null;

  const isSenior = member.team === 'Senior Team';
  const orderString = String(member.order).padStart(2, '0');

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#0B1727] via-[#070F1B] to-[#03060B] border border-[#1D5E91] shadow-[0_20px_60px_rgba(0,0,0,0.95)] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cosmic Ambient Background Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(ellipse_at_top_right,_rgba(121,201,242,0.18)_0%,_transparent_70%)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(29,94,145,0.22)_0%,_transparent_70%)] pointer-events-none" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-[#03060B]/80 hover:bg-[#0B1727] border border-[#1D5E91]/50 text-slate-300 hover:text-white transition-all shadow-md"
          aria-label="Close profile popup"
        >
          <X className="w-5 h-5 text-[#79C9F2]" />
        </button>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 flex flex-col items-center text-center">
          {/* Large High-Res Photograph Showcase */}
          <div className="relative w-48 sm:w-56 aspect-[4/5] rounded-2xl overflow-hidden bg-black/80 border-2 border-[#1D5E91]/60 shadow-[0_12px_35px_rgba(121,201,242,0.25)] mb-6">
            <img
              src={member.imageSrc}
              alt={member.name}
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/branding/athlos_ipm_sports_club_crest.png';
              }}
            />

            {/* Numerical Order Badge inside photo frame */}
            <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-[#1D5E91] text-[#79C9F2] text-xs font-mono font-bold">
              #{orderString}
            </div>
          </div>

          {/* Ambiguity Alert Notice if duplicate index */}
          {member.isAmbiguous && (
            <div className="mb-4 w-full flex items-center justify-center space-x-2 px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-mono">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>Warning: Filename index #{orderString} is duplicated in uploaded assets.</span>
            </div>
          )}

          {/* Team Category Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#050B16] border border-[#1D5E91] text-[#79C9F2] text-xs font-spartan font-bold uppercase tracking-widest mb-3">
            <Shield className="w-3.5 h-3.5 text-[#79C9F2]" />
            <span>{member.team}</span>
            <span className="text-slate-500">•</span>
            <span className="font-mono">Position #{orderString}</span>
          </div>

          {/* Member Name in League Spartan */}
          <h2 className="font-spartan font-black text-2xl sm:text-3xl text-white uppercase tracking-wider mb-2">
            {member.name}
          </h2>

          {/* Official Designation in Metallic Silver */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-xl bg-[#0B1727]/90 border border-[#1D5E91]/60 shadow-sm">
            <Award className="w-4 h-4 text-[#79C9F2]" />
            <span className="font-mono text-sm sm:text-base font-bold text-[#F2F7FC] tracking-wider uppercase">
              {member.designation.replace(/\bco[-_]ordinator\b/gi, 'Coordinator')}
            </span>
          </div>

          {/* Tournament Identity Footer */}
          <div className="mt-6 pt-5 border-t border-[#0B1727] w-full flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="text-[#79C9F2]">ATHLOS 2026–27</span>
            <span>Organizing Committee</span>
          </div>
        </div>
      </div>
    </div>
  );
}

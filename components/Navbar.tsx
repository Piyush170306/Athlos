'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Trophy, Calendar, Flame, BarChart2, History, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: Shield },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/matches', label: 'Matches', icon: Calendar },
  { href: '/sports', label: 'Sports', icon: Flame },
  { href: '/highlights', label: 'Highlights', icon: Flame },
  { href: '/polls', label: 'Predictions', icon: BarChart2 },
  { href: '/history', label: 'Past Seasons', icon: History },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-[#080808]/92 backdrop-blur-md border-b border-[#302719] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-[#17140E] border border-[#C6A45A]/40 group-hover:border-[#E6CA83] transition shadow-[0_0_15px_rgba(230,202,131,0.2)]">
              <img
                src="/assets/branding/athlos_ipm_sports_club_crest.png"
                alt="ATHLOS"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/branding/athlos_logo_primary.png';
                }}
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-spartan font-black text-base tracking-wider uppercase gold-metallic-text">
                  ATHLOS
                </span>
                <span className="text-[10px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#1f1910] text-[#E6CA83] border border-[#C6A45A]/40">
                  2026–27
                </span>
              </div>
              <p className="text-[11px] font-seasons italic text-[#F5EBD4]/70 tracking-wider">
                War of Batches
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-spartan font-bold uppercase tracking-wider transition ${
                    isActive
                      ? 'bg-[#17140E] text-[#E6CA83] border border-[#C6A45A]/60 shadow-[0_0_15px_rgba(230,202,131,0.15)]'
                      : 'text-slate-300 hover:text-white hover:bg-[#14110C]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#E6CA83]' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-[#17140E] text-slate-300 hover:text-white border border-[#302719]"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#E6CA83]" /> : <Menu className="w-5 h-5 text-[#E6CA83]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0c0a07] border-b border-[#302719] px-4 pt-2 pb-4 space-y-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-spartan font-bold uppercase tracking-wider ${
                  isActive
                    ? 'bg-[#1c160e] text-[#E6CA83] border border-[#C6A45A]/50'
                    : 'text-slate-300 hover:text-white hover:bg-[#14110c]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#E6CA83]' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Trophy, Calendar, BookOpen, Flame, BarChart2, History, Users, Instagram, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Home', icon: Shield },
  { href: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { href: '/matches', label: 'Fixtures', icon: Calendar },
  { href: '/sports', label: 'Rules', icon: BookOpen },
  { href: '/highlights', label: 'Highlights', icon: Flame },
  { href: '/polls', label: 'Predictions', icon: BarChart2 },
  { href: '/team', label: 'Team', icon: Users },
  {
    href: 'https://www.instagram.com/ipmsports.club?evlk=MXJqdjNzNGk4NTRlOA==',
    label: 'Social',
    icon: Instagram,
    isExternal: true,
  },
  { href: '/history', label: 'Past Seasons', icon: History },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-[#03060B]/94 backdrop-blur-md border-b border-[#0B1727] w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo Brand: UNBOXED, Prominent Natural Aspect Ratio Crest */}
          <Link href="/" className="flex items-center space-x-3.5 group flex-shrink-0">
            <img
              src="/assets/branding/athlos_ipm_sports_club_crest.png"
              alt="ATHLOS Official Crest"
              className="h-10 sm:h-11 w-auto object-contain filter drop-shadow-[0_2px_14px_rgba(121,201,242,0.35)] transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/branding/athlos_logo_primary.png';
              }}
            />
            <div>
              <span className="font-spartan font-black text-xl sm:text-2xl tracking-[0.18em] uppercase cosmic-silver-text">
                ATHLOS
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              const linkClasses = `flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-spartan font-bold uppercase tracking-wider transition-all duration-200 ${
                isActive
                  ? 'bg-[#0B1727] text-[#F2F7FC] border border-[#1D5E91] shadow-[0_0_18px_rgba(121,201,242,0.22)]'
                  : 'text-slate-300 hover:text-white hover:bg-[#050B16]'
              }`;

              if (link.isExternal) {
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={linkClasses}
                    title="Official ATHLOS Instagram Profile"
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-400 hover:text-[#79C9F2]" />
                    <span>{link.label}</span>
                  </a>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={linkClasses}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#79C9F2]' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-[#0B1727] text-slate-300 hover:text-white border border-[#1D5E91]/60"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#79C9F2]" /> : <Menu className="w-5 h-5 text-[#79C9F2]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#050B16] border-b border-[#0B1727] px-4 pt-2 pb-4 space-y-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            const linkClasses = `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-spartan font-bold uppercase tracking-wider ${
              isActive
                ? 'bg-[#0B1727] text-[#F2F7FC] border border-[#1D5E91]'
                : 'text-slate-300 hover:text-white hover:bg-[#080F1E]'
            }`;

            if (link.isExternal) {
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className={linkClasses}
                >
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span>{link.label}</span>
                </a>
              );
            }

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={linkClasses}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#79C9F2]' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

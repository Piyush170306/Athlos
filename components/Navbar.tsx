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
    <nav className="sticky top-0 z-40 bg-[#080c14]/90 backdrop-blur-md border-b border-[#1f2c47]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-surfaceLight border border-athlos-gold/30 group-hover:border-athlos-gold transition">
              <img
                src="/assets/branding/athlos_logo_primary.png"
                alt="ATHLOS"
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-wider uppercase bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
                  ATHLOS
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60">
                  2026–27
                </span>
              </div>
              <p className="text-[11px] text-slate-400 tracking-wider uppercase font-medium">
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
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition ${
                    isActive
                      ? 'bg-surfaceLight text-athlos-gold border border-athlos-gold/30 shadow-glow-gold'
                      : 'text-slate-300 hover:text-white hover:bg-surfaceLight/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-athlos-gold' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-surfaceLight text-slate-300 hover:text-white border border-surfaceBorder"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0f1d] border-b border-surfaceBorder px-4 pt-2 pb-4 space-y-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider ${
                  isActive
                    ? 'bg-surfaceLight text-athlos-gold border border-athlos-gold/30'
                    : 'text-slate-300 hover:text-white hover:bg-surfaceLight/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-athlos-gold' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}
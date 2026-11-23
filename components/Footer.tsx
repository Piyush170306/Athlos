import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#060504] border-t border-[#302719] mt-20 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Tournament Overview */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="font-spartan font-black text-base tracking-wider uppercase gold-metallic-text">
                ATHLOS
              </span>
              <span className="text-white font-bold text-sm tracking-wide font-spartan">
                War of Batches 2026–27
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md font-manrope">
              The premier inter-batch sports championship competing across 15 sporting disciplines with verified schedules and authoritative results.
            </p>
            <div className="flex items-center space-x-2 text-emerald-400 font-medium text-[11px] pt-1">
              <ShieldCheck className="w-4 h-4 text-[#E6CA83]" />
              <span>Official Leaderboard authority: Approved Batch Scores Table</span>
            </div>
          </div>

          {/* Tournament Batches */}
          <div>
            <h4 className="text-slate-200 font-spartan font-bold uppercase tracking-wider text-xs mb-3">
              Tournament Cohorts
            </h4>
            <ul className="space-y-2 font-mono text-xs">
              <li className="flex items-center space-x-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                <span className="font-bold tracking-wider">IPM06</span>
              </li>
              <li className="flex items-center space-x-2 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="font-bold tracking-wider">IPM07</span>
              </li>
              <li className="flex items-center space-x-2 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                <span className="font-bold tracking-wider">IPM08</span>
              </li>
            </ul>
          </div>

          {/* Fast Navigation */}
          <div>
            <h4 className="text-slate-200 font-spartan font-bold uppercase tracking-wider text-xs mb-3">
              Championship Hub
            </h4>
            <ul className="space-y-1.5 font-manrope">
              <li>
                <Link href="/leaderboard" className="hover:text-[#E6CA83] transition">
                  Official Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/matches" className="hover:text-[#E6CA83] transition">
                  Schedule & Fixtures
                </Link>
              </li>
              <li>
                <Link href="/sports" className="hover:text-[#E6CA83] transition">
                  Sports & Formats
                </Link>
              </li>
              <li>
                <Link href="/highlights" className="hover:text-[#E6CA83] transition">
                  Tournament Highlights
                </Link>
              </li>
              <li>
                <Link href="/polls" className="hover:text-[#E6CA83] transition">
                  Match Predictions
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-[#E6CA83] transition">
                  Past Seasons Archive
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-[#302719] flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-3">
          <p>© 2026 ATHLOS Sports Committee. All Rights Reserved. Built for War of Batches.</p>
          <div className="flex items-center space-x-2 font-mono">
            <Clock className="w-3.5 h-3.5 text-[#C6A45A]" />
            <span>Timezone: Asia/Kolkata (IST, UTC+5:30)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#05080e] border-t border-surfaceBorder mt-20 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Tournament Overview */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-base tracking-wider uppercase text-athlos-gold">
                ATHLOS
              </span>
              <span className="text-white font-bold text-sm tracking-wide">
                War of Batches 2026–27
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              The premier inter-batch sports tournament competing across 15 sporting disciplines with verified schedules and official approved results.
            </p>
            <div className="flex items-center space-x-2 text-emerald-400 font-medium text-[11px] pt-1">
              <ShieldCheck className="w-4 h-4 text-athlos-gold" />
              <span>Official Leaderboard authority: Approved Batch Scores Table</span>
            </div>
          </div>

          {/* Tournament Batches */}
          <div>
            <h4 className="text-slate-200 font-bold uppercase tracking-wider text-xs mb-3">
              Tournament Batches
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="font-bold tracking-wider">IPM06</span>
              </li>
              <li className="flex items-center space-x-2 text-orange-400">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                <span className="font-bold tracking-wider">IPM07</span>
              </li>
              <li className="flex items-center space-x-2 text-yellow-400">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400"></span>
                <span className="font-bold tracking-wider">IPM08</span>
              </li>
            </ul>
          </div>

          {/* Fast Navigation */}
          <div>
            <h4 className="text-slate-200 font-bold uppercase tracking-wider text-xs mb-3">
              Navigation
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link href="/leaderboard" className="hover:text-athlos-gold transition">
                  Official Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/matches" className="hover:text-athlos-gold transition">
                  Schedule & Fixtures
                </Link>
              </li>
              <li>
                <Link href="/sports" className="hover:text-athlos-gold transition">
                  Sports & Formats
                </Link>
              </li>
              <li>
                <Link href="/highlights" className="hover:text-athlos-gold transition">
                  Tournament Highlights
                </Link>
              </li>
              <li>
                <Link href="/polls" className="hover:text-athlos-gold transition">
                  Match Predictions
                </Link>
              </li>
              <li>
                <Link href="/history" className="hover:text-athlos-gold transition">
                  Past Seasons Archive
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-surfaceBorder/60 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-3">
          <p>© 2026 ATHLOS Sports Committee. All Rights Reserved. Built for War of Batches.</p>
          <div className="flex items-center space-x-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Timezone: Asia/Kolkata (IST, UTC+5:30)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

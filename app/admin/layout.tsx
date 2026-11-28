'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Flame,
  Swords,
  FileSpreadsheet,
  Award,
  BarChart3,
  ShieldAlert,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Shield,
  Key,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';

const ADMIN_NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/sheets', label: 'Live Google Sheets Sync', icon: RefreshCw },
  { href: '/admin/seasons', label: 'Seasons & Activation', icon: CalendarDays },
  { href: '/admin/sports', label: 'Sports & Formats', icon: Flame },
  { href: '/admin/matches', label: 'Matches & Results', icon: Swords },
  { href: '/admin/imports', label: 'Import Review Queue', icon: FileSpreadsheet },
  { href: '/admin/highlights', label: 'Highlights & News', icon: Award },
  { href: '/admin/polls', label: 'Poll Management', icon: BarChart3 },
  { href: '/admin/audit', label: 'Audit Trail', icon: ShieldAlert },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const isAuthPage =
    pathname === '/admin/login' ||
    pathname === '/admin/forgot-password' ||
    pathname === '/admin/reset-password';

  useEffect(() => {
    if (isAuthPage) {
      setCheckingAuth(false);
      return;
    }

    // If session is already verified and active in memory, allow seamless section navigation without re-fetching
    if (adminUser) {
      setCheckingAuth(false);
      return;
    }

    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          router.push('/admin/login');
        } else {
          const data = await res.json();
          setAdminUser(data.user);
        }
      } catch (err) {
        router.push('/admin/login');
      } finally {
        setCheckingAuth(false);
      }
    }

    checkAuth();
  }, [pathname, isAuthPage, router, adminUser]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (isAuthPage) {
    return <div className="min-h-screen bg-[#080c14]">{children}</div>;
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center text-slate-400 text-xs font-mono">
        Verifying administrative security session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070b13] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#0c1220] border-b border-surfaceBorder p-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-athlos-gold" />
          <span className="font-black text-sm uppercase text-white tracking-wider">
            ATHLOS Admin
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg bg-surfaceLight text-slate-300"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileOpen ? 'block' : 'hidden'
        } md:block w-full md:w-64 bg-[#0a0f1d] border-r border-surfaceBorder flex-shrink-0 flex flex-col justify-between`}
      >
        <div className="p-4 space-y-6">
          {/* Brand header */}
          <div className="hidden md:flex items-center space-x-3 px-2 py-1">
            <div className="w-8 h-8 rounded-lg bg-surfaceLight border border-athlos-gold/40 flex items-center justify-center text-athlos-gold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-black text-sm uppercase text-white tracking-wider">
                ATHLOS Admin
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">Tournament Console</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                    isActive
                      ? 'bg-athlos-gold/10 text-athlos-gold border border-athlos-gold/30 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-surfaceLight/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-athlos-gold' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User bar & Public switch */}
        <div className="p-4 border-t border-surfaceBorder space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-1.5 rounded bg-surfaceLight/60 text-slate-400 hover:text-white text-[11px] font-semibold border border-surfaceBorder"
          >
            <span>View Public Site</span>
            <ExternalLink className="w-3.5 h-3.5 text-athlos-gold" />
          </Link>

          <div className="flex items-center justify-between text-xs px-2">
            <div className="truncate pr-2">
              <span className="font-bold text-white block truncate">
                {adminUser?.email || 'admin@athlos.edu'}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                {adminUser?.role || 'SUPER_ADMIN'}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-7xl">{children}</main>

    </div>
  );
}

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
} from 'lucide-react';

const ADMIN_NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
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

  // Forced password rotation states for first login
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurPw, setShowCurPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  const handlePasswordRotate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(null);
    setPwLoading(true);

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: curPw,
          newPassword: newPw,
          confirmPassword: confirmPw,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPwError(data.error || 'Failed to update password');
      } else {
        setPwSuccess('Password successfully updated! You are now authorized to continue.');
        setTimeout(() => {
          setAdminUser({ ...adminUser, mustChangePassword: false });
        }, 1200);
      }
    } catch {
      setPwError('A network error occurred. Please try again.');
    } finally {
      setPwLoading(false);
    }
  };

  const isAuthPage =
    pathname === '/admin/login' ||
    pathname === '/admin/forgot-password' ||
    pathname === '/admin/reset-password';

  useEffect(() => {
    if (isAuthPage) {
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
  }, [pathname, isAuthPage, router]);

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

      {/* Mandatory First-Time Password Rotation Modal */}
      {adminUser?.mustChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#0A1220] border border-athlos-gold/50 rounded-2xl p-6 sm:p-8 shadow-glow-gold space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-amber-950/60 border border-athlos-gold/60 flex items-center justify-center mx-auto text-athlos-gold">
                <Key className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-wider text-white">
                Set Unique Admin Password
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Initial credential login detected. For tournament security, please replace the temporary password with a private, unique administrator password.
              </p>
            </div>

            {pwError && (
              <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pwError}</span>
              </div>
            )}

            {pwSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{pwSuccess}</span>
              </div>
            )}

            <form onSubmit={handlePasswordRotate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Current Password (Athlos@2026)
                </label>
                <div className="relative">
                  <input
                    type={showCurPw ? 'text' : 'password'}
                    required
                    value={curPw}
                    onChange={(e) => setCurPw(e.target.value)}
                    className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-athlos-gold pr-9"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurPw(!showCurPw)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showCurPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  New Unique Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    required
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-athlos-gold pr-9"
                    placeholder="Min. 8 chars (uppercase, lowercase, number)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showNewPw ? 'text' : 'password'}
                  required
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  className="w-full px-3 py-2 bg-surfaceLight border border-surfaceBorder rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-athlos-gold"
                  placeholder="Re-enter new password"
                />
              </div>

              <button
                type="submit"
                disabled={pwLoading}
                className="w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-wider bg-athlos-gold hover:bg-yellow-400 text-black transition shadow-glow-gold disabled:opacity-50 mt-2"
              >
                {pwLoading ? 'Securing Account...' : 'Save New Password & Continue'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

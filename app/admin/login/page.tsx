'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Key, ShieldCheck, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@athlos.edu');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed');
      } else {
        router.push('/admin');
        router.refresh();
      }
    } catch (err) {
      setError('A network error occurred. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-surfaceLight border border-athlos-gold/40 flex items-center justify-center mx-auto text-athlos-gold shadow-glow-gold">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-white">
            Admin Authentication
          </h2>
          <p className="text-xs text-slate-400">
            ATHLOS War of Batches 2026–27 Management Portal
          </p>
        </div>

        <div className="esports-card rounded-2xl p-6 sm:p-8 border-athlos-gold/30 shadow-2xl space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Authorized Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-surfaceLight border border-surfaceBorder rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-athlos-gold"
                  placeholder="admin@athlos.edu"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <Link
                  href="/admin/forgot-password"
                  className="text-[11px] text-athlos-gold hover:underline font-semibold"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-surfaceLight border border-surfaceBorder rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-athlos-gold"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-wider bg-athlos-gold hover:bg-yellow-400 text-black transition shadow-glow-gold disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            </button>
          </form>

          <div className="pt-4 border-t border-surfaceBorder/60 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Protected server-side session with brute-force rate limiter</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

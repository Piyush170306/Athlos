'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Key, Lock, CheckCircle2 } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to update password');
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="esports-card rounded-2xl p-6 sm:p-8 border-athlos-gold/30 shadow-2xl space-y-6">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-black uppercase text-white tracking-wider">
          Set New Password
        </h2>
        <p className="text-xs text-slate-400">
          Enter your secure new administrator password
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {success ? (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 space-y-4 text-center">
          <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400" />
          <h4 className="font-bold text-sm text-white">Password Updated Successfully</h4>
          <p>Your administrator password has been updated and your session cleared.</p>
          <Link
            href="/admin/login"
            className="inline-block py-2 px-4 rounded-lg bg-athlos-gold text-black font-extrabold text-xs uppercase tracking-wider"
          >
            Sign In Now →
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              New Password (min 8 chars)
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-surfaceLight border border-surfaceBorder rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-athlos-gold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-surfaceLight border border-surfaceBorder rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-athlos-gold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !token}
            className="w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-wider bg-athlos-gold hover:bg-yellow-400 text-black transition shadow-glow-gold disabled:opacity-50"
          >
            {loading ? 'Updating Password...' : 'Save New Password'}
          </button>

          {!token && (
            <p className="text-[11px] text-center text-rose-400">
              Missing reset token in URL. Please request a new recovery link.
            </p>
          )}
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <Suspense fallback={<div className="text-center text-xs text-slate-400 font-mono">Loading recovery form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}

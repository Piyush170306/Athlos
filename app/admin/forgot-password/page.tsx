'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to request reset');
      } else {
        setSubmitted(true);
        if (data.resetUrl) {
          setResetUrl(data.resetUrl);
        }
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/admin/login"
          className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>

        <div className="esports-card rounded-2xl p-6 sm:p-8 border-athlos-gold/30 shadow-2xl space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black uppercase text-white tracking-wider">
              Password Recovery
            </h2>
            <p className="text-xs text-slate-400">
              Authorized admin accounts receive an expiring one-time reset link
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {submitted ? (
            <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 space-y-3">
              <div className="flex items-center space-x-2 font-bold text-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>Instructions Generated</span>
              </div>
              <p>
                If <strong>{email}</strong> is an authorized admin account, password reset
                instructions have been processed.
              </p>
              {resetUrl && (
                <div className="pt-2 border-t border-emerald-800/80">
                  <span className="text-[11px] text-slate-400 block mb-1">
                    Development Reset Link:
                  </span>
                  <Link
                    href={resetUrl}
                    className="text-athlos-gold underline font-mono text-xs break-all"
                  >
                    Proceed to Reset Form →
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@athlos.edu"
                    className="w-full pl-9 pr-3 py-2.5 bg-surfaceLight border border-surfaceBorder rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-athlos-gold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-wider bg-athlos-gold hover:bg-yellow-400 text-black transition shadow-glow-gold disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Send Recovery Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

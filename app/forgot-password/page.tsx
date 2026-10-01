'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createBrowserSupabase } from '@/lib/supabase-browser';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createBrowserSupabase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur p-8 shadow-2xl">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Reset your password
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Enter your email and we&apos;ll send you a reset link.
          </p>

          {sent ? (
            <div className="mt-6 rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-3 py-3 text-sm text-emerald-300">
              If an account exists for <strong>{email}</strong>, a reset link is on its way.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2.5 text-slate-100 placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <div className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2.5 text-sm text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm">
            <Link
              href="/login"
              className="font-medium text-indigo-400 hover:text-indigo-300 transition"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
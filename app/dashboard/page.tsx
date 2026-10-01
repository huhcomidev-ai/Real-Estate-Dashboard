import { createServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Dashboard() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-semibold text-white">
            Real Estate Dashboard
          </Link>
          <span className="text-xs text-slate-500">{user.email}</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-400">
          Signed in as <span className="text-slate-200">{user.email}</span>
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Placeholder cards — we'll fill these with real integrations later */}
          {['QuickBooks', 'Twilio', 'Property Data'].map((name) => (
            <div
              key={name}
              className="rounded-xl border border-slate-800 bg-slate-900/50 p-5"
            >
              <div className="text-sm font-medium text-slate-200">{name}</div>
              <p className="mt-1 text-xs text-slate-500">Not connected</p>
              <button
                disabled
                className="mt-4 w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-xs font-medium text-slate-500"
              >
                Connect
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
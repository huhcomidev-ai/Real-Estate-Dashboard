import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
      </div>

      <div className="relative text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-white">
          Real Estate Dashboard
        </h1>
        <p className="mt-3 text-slate-400">
          Client portal for API integrations
        </p>
        <Link
          href="/login"
          className="mt-8 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          Sign in / Sign up
        </Link>
      </div>
    </main>
  );
}
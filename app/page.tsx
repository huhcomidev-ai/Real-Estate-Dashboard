import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          Real Estate Dashboard
        </h1>
        <p className="mt-2 text-slate-600">
          Client portal for API integrations
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
        >
          Sign in / Sign up
        </Link>
      </div>
    </main>
  );
}
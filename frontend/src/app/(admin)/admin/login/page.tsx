'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, LockKeyhole } from 'lucide-react';

import { getToken, login } from '@/lib/admin';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Skip the form if a valid session already exists in this tab.
  useEffect(() => {
    if (getToken()) router.replace('/admin');
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await login(username.trim(), password);
      router.replace('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal masuk.');
      setBusy(false);
    }
  };

  const inputClass =
    'mt-1.5 w-full rounded-xl border border-ink-300 bg-white px-4 py-3 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 disabled:bg-ink-100';

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient">
            <LockKeyhole className="h-6 w-6 text-white" aria-hidden="true" />
          </span>
          <h1 className="font-heading text-2xl font-bold text-brand-950">RAMS CMS</h1>
          <p className="mt-2 text-sm text-ink-500">Masuk untuk mengelola konten situs.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-ink-200 bg-white p-7 shadow-card"
        >
          {error ? (
            <p
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              {error}
            </p>
          ) : null}

          <label className="block">
            <span className="text-sm font-medium text-ink-800">Nama pengguna</span>
            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              autoComplete="username"
              disabled={busy}
              className={inputClass}
            />
          </label>

          <label className="mt-5 block">
            <span className="text-sm font-medium text-ink-800">Kata sandi</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              disabled={busy}
              className={inputClass}
            />
          </label>

          <button
            type="submit"
            disabled={busy}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-800 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Memproses…
              </>
            ) : (
              'Masuk'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

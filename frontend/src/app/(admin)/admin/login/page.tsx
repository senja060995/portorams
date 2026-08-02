'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Fingerprint, Loader2, Wallet } from 'lucide-react';

import { getToken, walletChallenge, walletVerify } from '@/lib/admin';
import { AdminApiError } from '@/lib/admin';
import {
  connectWallet,
  hasWalletProvider,
  signMessage,
  USER_REJECTED,
  type WalletConnection,
  WalletError,
} from '@/lib/wallet';

type Step = 'idle' | 'connecting' | 'ready' | 'signing' | 'verifying';

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('idle');
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [message, setMessage] = useState('');
  const [nonce, setNonce] = useState('');
  const [error, setError] = useState('');
  const [providerMissing, setProviderMissing] = useState(false);

  // Skip the form if a valid session already exists in this tab.
  useEffect(() => {
    if (getToken()) router.replace('/admin');
  }, [router]);

  useEffect(() => {
    setProviderMissing(!hasWalletProvider());
  }, []);

  const handleConnect = async () => {
    setStep('connecting');
    setError('');

    try {
      const conn = await connectWallet();

      const challenge = await walletChallenge(conn.address);

      setConnection(conn);
      setMessage(challenge.message);
      setNonce(challenge.nonce);
      setStep('ready');
    } catch (err) {
      setStep('idle');
      if (err instanceof WalletError && err.code === USER_REJECTED) {
        setError('Anda menolak permintaan koneksi dari MetaMask.');
      } else if (err instanceof AdminApiError) {
        setError(err.status === 401 ? 'Wallet ini tidak terdaftar di CMS.' : err.message);
      } else if (err instanceof WalletError) {
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat menghubungkan wallet.');
      }
    }
  };

  const handleSign = async () => {
    if (!connection || !message || !nonce) return;
    setStep('signing');
    setError('');

    try {
      const signature = await signMessage(message);
      setStep('verifying');
      await walletVerify(connection.address, nonce, signature);
      router.replace('/admin');
    } catch (err) {
      setStep('ready');
      if (err instanceof WalletError && err.code === USER_REJECTED) {
        setError('Tanda tangan ditolak. Login dibatalkan.');
      } else if (err instanceof WalletError) {
        setError(err.message);
      } else if (err instanceof AdminApiError) {
        setError('Tanda tangan tidak valid atau telah kedaluwarsa. Silakan coba lagi.');
      } else {
        setError(err instanceof Error ? err.message : 'Verifikasi gagal.');
      }
    }
  };

  const busy = step !== 'idle' && step !== 'ready';

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient">
            <Wallet className="h-6 w-6 text-white" aria-hidden="true" />
          </span>
          <h1 className="font-heading text-2xl font-bold text-brand-950">Login Admin</h1>
          <p className="mt-2 text-sm text-ink-500">Login Tanpa Password</p>
        </div>

        <div className="rounded-3xl border border-ink-200 bg-white p-7 shadow-card">
          {error ? (
            <p
              role="alert"
              className="mb-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </p>
          ) : null}

          {providerMissing ? (
            <div className="text-sm text-ink-600">
              <p className="font-semibold text-ink-800">MetaMask tidak terpasang.</p>
              <p className="mt-1.5">
                Pasang ekstensi MetaMask di browser, lalu muat ulang halaman ini untuk dapat
                masuk ke CMS.
              </p>
            </div>
          ) : step === 'ready' ? (
            <>
              <div className="rounded-2xl border border-brand-100 bg-brand-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-800">
                  Akun terhubung
                </p>
                <p className="mt-1 break-all font-mono text-sm text-brand-950">
                  {connection?.address}
                </p>
              </div>

              <div className="mt-5 rounded-2xl border border-ink-200 bg-ink-50 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Anda akan menandatangani
                </p>
                <pre className="mt-2 max-h-44 overflow-y-auto whitespace-pre-wrap break-words font-mono text-[0.7rem] leading-relaxed text-ink-700">
                  {message}
                </pre>
              </div>

              <button
                type="button"
                onClick={handleSign}
                disabled={busy}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-800 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Memverifikasi…
                  </>
                ) : (
                  <>
                    <Fingerprint className="h-4 w-4" aria-hidden="true" />
                    Tandatangani & Masuk
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-xs text-ink-400">
                Tanda tangan tidak mengirimkan transaksi apa pun dan tidak memakan gas.
              </p>
            </>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-800 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Menyiapkan login…
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4" aria-hidden="true" />
                  Login Admin
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

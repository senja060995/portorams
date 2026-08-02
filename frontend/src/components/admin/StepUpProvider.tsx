'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AlertTriangle, Fingerprint, Loader2 } from 'lucide-react';

import {
  adminActionChallenge,
  isStepUpRequired,
  type ActionChallenge,
} from '@/lib/admin';
import {
  hasWalletProvider,
  mapProviderError,
  signMessage,
  USER_REJECTED,
  WalletError,
} from '@/lib/wallet';

/** Fresh wallet confirmation attached to a destructive request. */
export interface StepUpAuth {
  action_nonce: string;
  action_signature: string;
}

/** Thrown by runWithStepUp when the user closes the dialog without signing. */
export class StepUpCanceledError extends Error {
  constructor() {
    super('Konfirmasi dibatalkan.');
    this.name = 'StepUpCanceledError';
  }
}

interface StepUpRequest {
  action: string;
  target: string;
  resolve: (auth: StepUpAuth) => void;
  reject: (err: unknown) => void;
}

interface StepUpContextValue {
  /**
   * Runs a destructive mutation. On the first attempt the backend rejects it
   * demanding a wallet confirmation; this then opens the signing dialog and
   * retries the mutation with the fresh signature.
   */
  runWithStepUp: (
    action: string,
    target: string,
    run: (auth: StepUpAuth | null) => Promise<void>,
  ) => Promise<void>;
}

const StepUpContext = createContext<StepUpContextValue>({
  runWithStepUp: async () => {},
});

export function useRunWithStepUp() {
  return useContext(StepUpContext);
}

type Status = 'challenging' | 'ready' | 'signing';

export function StepUpProvider({ children }: { children: React.ReactNode }) {
  const [request, setRequest] = useState<StepUpRequest | null>(null);
  const [challenge, setChallenge] = useState<ActionChallenge | null>(null);
  const [status, setStatus] = useState<Status>('challenging');
  const [error, setError] = useState('');

  const runWithStepUp = useCallback(
    async (
      action: string,
      target: string,
      run: (auth: StepUpAuth | null) => Promise<void>,
    ): Promise<void> => {
      try {
        await run(null);
        return;
      } catch (err) {
        if (!isStepUpRequired(err)) throw err;
      }

      const auth = await new Promise<StepUpAuth>((resolve, reject) => {
        setRequest({ action, target, resolve, reject });
      });
      await run(auth);
    },
    [],
  );

  const cancel = useCallback(() => {
    setRequest((current) => {
      current?.reject(new StepUpCanceledError());
      return null;
    });
    setChallenge(null);
    setError('');
  }, []);

  // Fetch the challenge as soon as the dialog appears.
  useEffect(() => {
    if (!request) return;
    let active = true;
    setStatus('challenging');
    setError('');
    adminActionChallenge(request.action, request.target)
      .then((challengeResult) => {
        if (!active) return;
        setChallenge(challengeResult);
        setStatus('ready');
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Gagal membuat konfirmasi.');
        setStatus('ready');
      });
    return () => {
      active = false;
    };
  }, [request]);

  const handleSign = async () => {
    if (!request || !challenge) return;
    if (!hasWalletProvider()) {
      setError('MetaMask tidak terdeteksi. Pasang ekstensi MetaMask untuk mengonfirmasi.');
      return;
    }
    setStatus('signing');
    setError('');
    try {
      const signature = await signMessage(challenge.message);
      request.resolve({ action_nonce: challenge.nonce, action_signature: signature });
      setRequest(null);
      setChallenge(null);
    } catch (err) {
      setStatus('ready');
      if (err instanceof WalletError && err.code === USER_REJECTED) {
        setError('Anda menolak tanda tangan. Aksi dibatalkan.');
      } else if (err instanceof WalletError) {
        setError(mapProviderError(err).message);
      } else {
        setError(err instanceof Error ? err.message : 'Penandatanganan gagal.');
      }
    }
  };

  const busy = status === 'signing';

  return (
    <StepUpContext.Provider value={{ runWithStepUp }}>
      {children}

      {request ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Tutup"
            onClick={() => !busy && cancel()}
            className="absolute inset-0 bg-brand-950/50 backdrop-blur-sm"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Konfirmasi aksi"
            className="relative w-full max-w-md rounded-3xl border border-ink-200 bg-white p-7 shadow-card-hover"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50">
                <Fingerprint className="h-5 w-5 text-brand-800" aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-heading text-lg font-bold text-brand-950">
                  Konfirmasi aksi
                </h2>
                <p className="text-xs text-ink-500">
                  Aksi ini memerlukan tanda tangan wallet Anda.
                </p>
              </div>
            </div>

            <dl className="mt-5 grid gap-2 rounded-2xl border border-ink-200 bg-ink-50 px-4 py-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-ink-500">Aksi</dt>
                <dd className="text-right font-mono text-xs text-ink-800">{request.action}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-ink-500">Target</dt>
                <dd className="break-all text-right font-mono text-xs text-ink-800">
                  {request.target}
                </dd>
              </div>
            </dl>

            {error ? (
              <p
                role="alert"
                className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </p>
            ) : null}

            {status === 'challenging' ? (
              <div className="mt-6 flex items-center justify-center gap-2 rounded-full border border-ink-200 py-3.5 text-sm text-ink-500">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Menyiapkan konfirmasi…
              </div>
            ) : challenge ? (
              <>
                <div className="mt-5 rounded-2xl border border-ink-200 bg-white px-4 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">
                    Anda akan menandatangani
                  </p>
                  <pre className="mt-2 max-h-44 overflow-y-auto whitespace-pre-wrap break-words font-mono text-[0.7rem] leading-relaxed text-ink-700">
                    {challenge.message}
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
                      Menandatangani…
                    </>
                  ) : (
                    <>
                      <Fingerprint className="h-4 w-4" aria-hidden="true" />
                      Tandatangani & Lanjutkan
                    </>
                  )}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={cancel}
                className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-ink-200 px-6 py-3.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-100"
              >
                Tutup
              </button>
            )}

            {!busy ? (
              <button
                type="button"
                onClick={cancel}
                className="mt-3 w-full rounded-full px-6 py-2.5 text-sm font-semibold text-ink-500 transition-colors hover:bg-ink-100"
              >
                Batal
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </StepUpContext.Provider>
  );
}

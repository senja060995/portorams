'use client';

import { useEffect, useRef } from 'react';
import { Loader2, X } from 'lucide-react';

import { cn } from '@/lib/utils';

interface DrawerProps {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  saving?: boolean;
  error?: string;
  children: React.ReactNode;
  submitLabel?: string;
  size?: 'md' | 'lg' | 'xl' | 'full';
}

/**
 * Slide-over editor used by every admin resource. Traps Escape and restores
 * body scroll so keyboard users are never stuck behind the panel.
 */
export function AdminDrawer({
  open,
  title,
  onClose,
  onSubmit,
  saving = false,
  error,
  children,
  submitLabel = 'Simpan',
  size = 'md',
}: DrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !saving) onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, open, saving]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button
        type="button"
        aria-label="Tutup"
        onClick={() => !saving && onClose()}
        className="absolute inset-0 bg-brand-950/40 backdrop-blur-sm"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative flex h-full w-full flex-col bg-white shadow-card-hover transition-all duration-300',
          size === 'full'
            ? 'max-w-7xl'
            : size === 'xl'
              ? 'max-w-5xl'
              : size === 'lg'
                ? 'max-w-3xl'
                : 'max-w-2xl',
        )}
      >
        <div className="flex items-center justify-between border-b border-ink-200 px-6 py-5">
          <h2 className="font-heading text-lg font-bold text-brand-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-ink-100 hover:text-ink-800"
            aria-label="Tutup"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit();
          }}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {error ? (
              <p
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {error}
              </p>
            ) : null}

            <div className="flex flex-col gap-5">{children}</div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-ink-200 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-full border border-ink-200 px-5 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:bg-ink-100 disabled:opacity-60"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className={cn(
                'inline-flex items-center gap-2 rounded-full bg-brand-800 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60',
              )}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Menyimpan…
                </>
              ) : (
                submitLabel
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react';

import { cn } from '@/lib/utils';

export function AdminButton({
  children,
  onClick,
  variant = 'primary',
  type = 'button',
  disabled,
  className,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  type?: 'button' | 'submit';
  disabled?: boolean;
  className?: string;
}) {
  const variants = {
    primary: 'bg-brand-800 text-white hover:bg-brand-700',
    secondary: 'border border-ink-200 text-ink-700 hover:bg-ink-100',
    danger: 'border border-red-200 text-red-600 hover:bg-red-50',
  } as const;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60',
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <AdminButton onClick={onClick}>
      <Plus className="h-4 w-4" aria-hidden="true" />
      {label}
    </AdminButton>
  );
}

/** Consistent loading, error, and empty states for admin list pages. */
export function AdminListState({
  loading,
  error,
  empty,
  emptyLabel = 'Belum ada data.',
}: {
  loading: boolean;
  error: string;
  empty: boolean;
  emptyLabel?: string;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 rounded-3xl border border-ink-200 bg-white py-20 text-sm text-ink-500">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Memuat…
      </div>
    );
  }

  if (error) {
    return (
      <p
        role="alert"
        className="rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-sm font-medium text-red-700"
      >
        {error}
      </p>
    );
  }

  if (empty) {
    return (
      <p className="rounded-3xl border border-dashed border-ink-200 bg-white py-20 text-center text-sm text-ink-500">
        {emptyLabel}
      </p>
    );
  }

  return null;
}

/** Compact edit + delete pair used in every table row. */
export function RowActions({
  onEdit,
  onDelete,
  deleting = false,
}: {
  onEdit: () => void;
  onDelete?: () => void;
  deleting?: boolean;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={onEdit}
        aria-label="Ubah"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-brand-50 hover:text-brand-800"
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
      </button>

      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting}
          aria-label="Hapus"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        >
          {deleting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      ) : null}
    </div>
  );
}

export function StatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: 'green' | 'amber' | 'blue' | 'gray';
}) {
  const tones = {
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-brand-100 text-brand-800',
    gray: 'bg-ink-200 text-ink-700',
  } as const;

  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.06em]',
        tones[tone],
      )}
    >
      {label}
    </span>
  );
}

/** Scroll container plus consistent table chrome. */
export function AdminTable({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-ink-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <thead className="border-b border-ink-200 bg-ink-100/60">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={header}
                  scope="col"
                  className={cn(
                    'px-5 py-3.5 text-xs font-bold uppercase tracking-[0.08em] text-ink-500',
                    index === headers.length - 1 && 'text-right',
                  )}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-200">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

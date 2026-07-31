'use client';

import { GripVertical, Plus, Trash2 } from 'lucide-react';

/** Grouping wrapper for a list of repeatable sub-records inside a drawer. */
export function RepeaterSection({
  title,
  count,
  onAdd,
  children,
}: {
  title: string;
  count: number;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-ink-100/60 p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-ink-800">
          {title} <span className="font-normal text-ink-500">({count})</span>
        </p>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-brand-800 shadow-sm transition-colors hover:bg-brand-50"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Tambah
        </button>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

export function RepeaterItem({
  index,
  onRemove,
  children,
}: {
  index: number;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-ink-200 bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.08em] text-ink-400">
          <GripVertical className="h-3.5 w-3.5" aria-hidden="true" />
          #{index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 transition-colors hover:text-red-600"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
          Hapus
        </button>
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

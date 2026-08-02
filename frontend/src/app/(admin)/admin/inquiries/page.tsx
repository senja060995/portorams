'use client';

import { useState } from 'react';
import { Mail, Phone, Trash2 } from 'lucide-react';

import { AdminShell } from '@/components/admin/AdminShell';
import { AdminListState, StatusBadge } from '@/components/admin/AdminUi';
import { adminRequest, type AdminInquiry } from '@/lib/admin';
import { useAdminCrud } from '@/components/admin/useAdminCrud';
import { cn } from '@/lib/utils';

export default function AdminInquiriesPage() {
  const crud = useAdminCrud<AdminInquiry>({
    path: '/admin/inquiries',
    getId: (item) => item.id,
    stepUp: { deleteAction: 'delete.inquiry' },
  });

  const [expanded, setExpanded] = useState<number | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  const markRead = async (inquiry: AdminInquiry) => {
    if (inquiry.status === 'read') return;
    setUpdating(inquiry.id);
    try {
      await adminRequest(`/admin/inquiries/${inquiry.id}/status`, {
        method: 'PUT',
        body: { status: 'read' },
      });
      await crud.reload();
    } finally {
      setUpdating(null);
    }
  };

  const toggle = (inquiry: AdminInquiry) => {
    const next = expanded === inquiry.id ? null : inquiry.id;
    setExpanded(next);
    if (next !== null) void markRead(inquiry);
  };

  return (
    <AdminShell
      title="Pesan Masuk"
      description="Pertanyaan yang dikirim melalui formulir kontak."
    >
      <AdminListState
        loading={crud.loading}
        error={crud.error}
        empty={crud.items.length === 0}
        emptyLabel="Belum ada pesan masuk."
      />

      {!crud.loading && !crud.error && crud.items.length > 0 ? (
        <div className="flex flex-col gap-3">
          {crud.items.map((inquiry) => {
            const open = expanded === inquiry.id;
            const unread = inquiry.status !== 'read';

            return (
              <article
                key={inquiry.id}
                className={cn(
                  'rounded-3xl border bg-white transition-colors',
                  unread ? 'border-brand-300' : 'border-ink-200',
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(inquiry)}
                  aria-expanded={open}
                  className="flex w-full items-start gap-4 px-6 py-5 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-ink-900">{inquiry.name}</p>
                      {unread ? <StatusBadge label="Baru" tone="blue" /> : null}
                      <StatusBadge
                        label={inquiry.locale.toUpperCase()}
                        tone="gray"
                      />
                    </div>

                    <p className="mt-1 text-sm text-ink-500">
                      {inquiry.company ? `${inquiry.company} · ` : ''}
                      {inquiry.email}
                    </p>

                    {!open ? (
                      <p className="mt-2 line-clamp-1 text-sm text-ink-700">{inquiry.message}</p>
                    ) : null}
                  </div>

                  <time className="shrink-0 text-xs text-ink-400">
                    {inquiry.created_at?.slice(0, 10)}
                  </time>
                </button>

                {open ? (
                  <div className="border-t border-ink-200 px-6 py-5">
                    <dl className="grid gap-4 sm:grid-cols-2">
                      <Detail label="Email">
                        <a href={`mailto:${inquiry.email}`} className="text-brand-700 underline">
                          {inquiry.email}
                        </a>
                      </Detail>
                      {inquiry.phone ? (
                        <Detail label="Telepon">
                          <a
                            href={`tel:${inquiry.phone.replace(/\s/g, '')}`}
                            className="text-brand-700 underline"
                          >
                            {inquiry.phone}
                          </a>
                        </Detail>
                      ) : null}
                      {inquiry.company ? <Detail label="Perusahaan">{inquiry.company}</Detail> : null}
                      {inquiry.solution_interest ? (
                        <Detail label="Solusi diminati">{inquiry.solution_interest}</Detail>
                      ) : null}
                    </dl>

                    <div className="mt-5">
                      <p className="text-xs font-bold uppercase tracking-[0.08em] text-ink-400">
                        Pesan
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-800">
                        {inquiry.message}
                      </p>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-2">
                      <a
                        href={`mailto:${inquiry.email}`}
                        className="inline-flex items-center gap-2 rounded-full bg-brand-800 px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-brand-700"
                      >
                        <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                        Balas via email
                      </a>

                      {inquiry.phone ? (
                        <a
                          href={`https://wa.me/${inquiry.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-ink-200 px-5 py-2.5 text-xs font-semibold text-ink-700 transition-colors hover:bg-ink-100"
                        >
                          <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                          WhatsApp
                        </a>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Hapus pesan dari ${inquiry.name}?`)) {
                            void crud.remove(inquiry);
                          }
                        }}
                        disabled={crud.deletingId === inquiry.id || updating === inquiry.id}
                        className="inline-flex items-center gap-2 rounded-full border border-red-200 px-5 py-2.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Hapus
                      </button>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}
    </AdminShell>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-[0.08em] text-ink-400">{label}</dt>
      <dd className="mt-1 text-sm text-ink-800">{children}</dd>
    </div>
  );
}

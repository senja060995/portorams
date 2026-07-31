'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Inbox,
  Images,
  PencilLine,
  SquareStack,
  MailOpen,
} from 'lucide-react';

import { AdminShell } from '@/components/admin/AdminShell';
import { adminRequest, type AdminStats } from '@/lib/admin';

export default function AdminDashboardPage() {
  return (
    <AdminShell
      title="Dasbor"
      description="Ringkasan konten dan aktivitas terbaru."
    >
      <DashboardBody />
    </AdminShell>
  );
}

function DashboardBody() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminRequest<AdminStats>('/admin/stats')
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat data.'));
  }, []);

  if (error) {
    return (
      <p className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
        {error}
      </p>
    );
  }

  const cards = [
    { label: 'Solusi', value: stats?.total_solutions, icon: SquareStack, href: '/admin/solutions' },
    { label: 'Artikel terbit', value: stats?.total_articles, icon: FileText, href: '/admin/articles' },
    { label: 'Draf artikel', value: stats?.total_drafts, icon: PencilLine, href: '/admin/articles' },
    { label: 'Pesan masuk', value: stats?.total_inquiries, icon: Inbox, href: '/admin/inquiries' },
    { label: 'Belum dibaca', value: stats?.unread_inquiries, icon: MailOpen, href: '/admin/inquiries' },
    { label: 'Berkas media', value: stats?.total_media, icon: Images, href: '/admin/media' },
  ];

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-3xl border border-ink-200 bg-white p-6 transition-all duration-300 hover:border-brand-300 hover:shadow-card"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-100 text-brand-800">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <p className="mt-5 font-heading text-3xl font-bold text-brand-950">
              {card.value ?? '—'}
            </p>
            <p className="mt-1 text-sm text-ink-500">{card.label}</p>
          </Link>
        );
      })}
    </div>
  );
}

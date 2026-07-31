'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  FileText,
  Handshake,
  Inbox,
  Images,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Package,
  Scale,
  Settings,
  Sparkles,
  SquareStack,
} from 'lucide-react';

import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { cn } from '@/lib/utils';

const navGroups = [
  {
    title: 'Ringkasan',
    items: [{ href: '/admin', label: 'Dasbor', icon: LayoutDashboard }],
  },
  {
    title: 'Konten Utama',
    items: [
      { href: '/admin/solutions', label: 'Solusi', icon: SquareStack },
      { href: '/admin/products', label: 'Produk', icon: Package },
      { href: '/admin/articles', label: 'Artikel', icon: FileText },
    ],
  },
  {
    title: 'Elemen Halaman',
    items: [
      { href: '/admin/sections', label: 'Seksi Halaman', icon: ListOrdered },
      { href: '/admin/value-props', label: 'Keunggulan', icon: Sparkles },
      { href: '/admin/approach', label: 'Tahapan Kerja', icon: Building2 },
      { href: '/admin/partners', label: 'Mitra', icon: Handshake },
    ],
  },
  {
    title: 'Lain-lain',
    items: [
      { href: '/admin/inquiries', label: 'Pesan Masuk', icon: Inbox },
      { href: '/admin/media', label: 'Media', icon: Images },
      { href: '/admin/legal', label: 'Halaman Legal', icon: Scale },
      { href: '/admin/settings', label: 'Pengaturan', icon: Settings },
    ],
  },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAdminAuth();

  return (
    <aside className="sticky top-0 h-screen hidden w-64 shrink-0 flex-col border-r border-ink-200 bg-white lg:flex">
      <div className="border-b border-ink-200 px-6 py-6">
        <p className="font-heading text-lg font-bold text-brand-900">RAMS CMS</p>
        <p className="mt-1 text-xs text-ink-500">Panel Konten</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5" aria-label="Menu admin">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-6">
            <p className="px-3 pb-2 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-ink-400">
              {group.title}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.href);
                const Icon = item.icon;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                        active
                          ? 'bg-brand-800 text-white'
                          : 'text-ink-700 hover:bg-brand-50 hover:text-brand-800',
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-ink-200 px-4 py-4">
        {user ? (
          <div className="mb-3 px-2">
            <p className="truncate text-sm font-medium text-ink-800">{user.username}</p>
            <p className="truncate text-xs text-ink-500">{user.role}</p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Keluar
        </button>
      </div>
    </aside>
  );
}

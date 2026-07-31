'use client';

import { Loader2 } from 'lucide-react';

import { AdminAuthProvider, useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

/**
 * Shared chrome for every authenticated admin page. Content is withheld until
 * the API confirms the session, so protected data never flashes on screen.
 */
export function AdminShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AdminShellInner title={title} description={description} actions={actions}>
        {children}
      </AdminShellInner>
    </AdminAuthProvider>
  );
}

function AdminShellInner({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { user, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-brand-700" aria-hidden="true" />
        <span className="sr-only">Memuat…</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-ink-200 bg-white/95 backdrop-blur-md px-6 py-6 lg:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold text-brand-950">{title}</h1>
              {description ? (
                <p className="mt-1.5 text-sm text-ink-500">{description}</p>
              ) : null}
            </div>
            {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
          </div>
        </header>

        <div className="flex-1 px-6 py-8 lg:px-10">{children}</div>
      </div>
    </div>
  );
}

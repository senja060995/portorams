'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AdminApiError, clearToken, fetchMe, getToken, type AdminUser } from '@/lib/admin';

interface AdminAuthValue {
  user: AdminUser | null;
  loading: boolean;
  signOut: () => void;
}

const AdminAuthContext = createContext<AdminAuthValue>({
  user: null,
  loading: true,
  signOut: () => {},
});

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

/**
 * Verifies the stored token against the API on mount. A token that the server
 * rejects is discarded immediately, so a stale value cannot keep the shell open.
 */
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = useCallback(() => {
    clearToken();
    setUser(null);
    router.replace('/admin/login');
  }, [router]);

  useEffect(() => {
    let active = true;

    const verify = async () => {
      if (!getToken()) {
        if (active) {
          setLoading(false);
          router.replace('/admin/login');
        }
        return;
      }

      try {
        const me = await fetchMe();
        if (active) setUser(me);
      } catch (error) {
        if (!active) return;
        if (error instanceof AdminApiError && error.status === 401) {
          clearToken();
          router.replace('/admin/login');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void verify();
    return () => {
      active = false;
    };
  }, [router]);

  const value = useMemo(() => ({ user, loading, signOut }), [loading, signOut, user]);

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

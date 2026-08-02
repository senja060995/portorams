'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';

import { AdminApiError, clearToken, fetchMe, logout, type AdminUser } from '@/lib/admin';
import { hasWalletProvider, watchWallet } from '@/lib/wallet';

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

/** Sign the user out after this much idle time (default 30 minutes). */
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

/**
 * Verifies the stored token against the API on mount. A token that the server
 * rejects is discarded immediately, so a stale value cannot keep the shell open.
 *
 * Because the CMS is wallet-only, the session is also torn down the moment the
 * wallet changes account or network, and after a period of inactivity.
 */
export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const forceSignOut = useCallback(() => {
    clearToken();
    setUser(null);
    router.replace('/admin/login');
  }, [router]);

  const signOut = useCallback(async () => {
    setUser(null);
    try {
      await logout();
    } catch {
      // Local token is cleared regardless; the server session also expires.
    }
    router.replace('/admin/login');
  }, [router]);

  // Wallet switching must end the session immediately: the identity that owns
  // the JWT is no longer in control of the browser.
  useEffect(() => {
    if (!user || !hasWalletProvider()) return;
    const unsubscribe = watchWallet(forceSignOut, forceSignOut);
    return unsubscribe;
  }, [user, forceSignOut]);

  // Idle timeout: a signed-in but unattended tab does not stay open forever.
  useEffect(() => {
    if (!user) return;

    const reset = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        void logout().catch(() => {});
        forceSignOut();
      }, IDLE_TIMEOUT_MS);
    };

    const events: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, reset, { passive: true }));
    reset();

    return () => {
      events.forEach((event) => window.removeEventListener(event, reset));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [user, forceSignOut]);

  useEffect(() => {
    let active = true;

    const verify = async () => {
      // The session is carried by the httpOnly cookie; a sessionStorage token
      // is an optional fallback. Either way the server decides.
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

  const value = useMemo(
    () => ({ user, loading, signOut }),
    [loading, signOut, user],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

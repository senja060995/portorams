'use client';

import { useCallback, useEffect, useState } from 'react';

import { adminRequest } from '@/lib/admin';

interface CrudOptions<T> {
  /** API path for the collection, e.g. '/admin/articles'. */
  path: string;
  /** Extracts the id used for PUT and DELETE paths. */
  getId: (item: T) => number;
  /** Some resources use POST for both create and update. */
  upsert?: boolean;
}

/**
 * Shared list/create/update/delete state for admin resources. Every mutation
 * refetches the collection, so the table always reflects what the API stored
 * rather than an optimistic guess.
 */
export function useAdminCrud<T>({ path, getId, upsert = false }: CrudOptions<T>) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await adminRequest<T[]>(path));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data.');
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Returns true when the save succeeded, so the caller can close its drawer. */
  const save = useCallback(
    async (payload: Partial<T>, existing?: T | null): Promise<boolean> => {
      setSaving(true);
      setSaveError('');
      try {
        if (existing && !upsert) {
          await adminRequest(`${path}/${getId(existing)}`, { method: 'PUT', body: payload });
        } else {
          await adminRequest(path, { method: 'POST', body: payload });
        }
        await load();
        return true;
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Gagal menyimpan.');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [getId, load, path, upsert],
  );

  const remove = useCallback(
    async (item: T) => {
      const id = getId(item);
      setDeletingId(id);
      try {
        await adminRequest(`${path}/${id}`, { method: 'DELETE' });
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal menghapus.');
      } finally {
        setDeletingId(null);
      }
    },
    [getId, load, path],
  );

  return {
    items,
    loading,
    error,
    saving,
    saveError,
    deletingId,
    reload: load,
    save,
    remove,
    setSaveError,
  };
}

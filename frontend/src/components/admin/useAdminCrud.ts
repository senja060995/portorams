'use client';

import { useCallback, useEffect, useState } from 'react';

import { adminRequest } from '@/lib/admin';
import {
  StepUpCanceledError,
  useRunWithStepUp,
  type StepUpAuth,
} from '@/components/admin/StepUpProvider';

interface CrudOptions<T> {
  /** API path for the collection, e.g. '/admin/articles'. */
  path: string;
  /** Extracts the id used for PUT and DELETE paths. */
  getId: (item: T) => number;
  /** Some resources use POST for both create and update. */
  upsert?: boolean;
  /** When set, DELETE requires a fresh wallet signature for this action. */
  stepUp?: {
    deleteAction: string;
    /** Applied to POST saves, e.g. 'create.wallet'. */
    createAction?: string;
    /** Applied to PUT saves, e.g. 'update.wallet'. */
    updateAction?: string;
    /** Challenge target for saves; defaults to the id for updates. */
    saveTarget?: (payload: Partial<T>, existing?: T | null) => string;
  };
}

/**
 * Shared list/create/update/delete state for admin resources. Every mutation
 * refetches the collection, so the table always reflects what the API stored
 * rather than an optimistic guess.
 */
export function useAdminCrud<T>({ path, getId, upsert = false, stepUp }: CrudOptions<T>) {
  const { runWithStepUp } = useRunWithStepUp();
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
        const isUpdate = Boolean(existing && !upsert);
        const action = isUpdate ? stepUp?.updateAction : stepUp?.createAction;
        const target = stepUp?.saveTarget
          ? stepUp.saveTarget(payload, existing ?? null)
          : isUpdate
            ? String(getId(existing!))
            : '';

        const run = async (auth: StepUpAuth | null) => {
          const body = {
            ...payload,
            ...(auth
              ? { action_nonce: auth.action_nonce, action_signature: auth.action_signature }
              : {}),
          };
          if (isUpdate) {
            await adminRequest(`${path}/${getId(existing!)}`, { method: 'PUT', body });
          } else {
            await adminRequest(path, { method: 'POST', body });
          }
        };

        if (action) {
          await runWithStepUp(action, target, run);
        } else {
          await run(null);
        }
        await load();
        return true;
      } catch (err) {
        if (err instanceof StepUpCanceledError) return false;
        setSaveError(err instanceof Error ? err.message : 'Gagal menyimpan.');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [getId, load, path, runWithStepUp, stepUp, upsert],
  );

  const remove = useCallback(
    async (item: T) => {
      const id = getId(item);
      setDeletingId(id);
      try {
        const run = async (auth: StepUpAuth | null) => {
          await adminRequest(`${path}/${id}`, {
            method: 'DELETE',
            body: auth
              ? {
                  action_nonce: auth.action_nonce,
                  action_signature: auth.action_signature,
                }
              : undefined,
          });
        };
        if (stepUp) {
          await runWithStepUp(stepUp.deleteAction, String(id), run);
        } else {
          await run(null);
        }
        await load();
      } catch (err) {
        if (err instanceof StepUpCanceledError) return;
        setError(err instanceof Error ? err.message : 'Gagal menghapus.');
      } finally {
        setDeletingId(null);
      }
    },
    [getId, load, path, runWithStepUp, stepUp],
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

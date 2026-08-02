'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Check, Copy, ImagePlus, Loader2, Trash2 } from 'lucide-react';

import { AdminShell } from '@/components/admin/AdminShell';
import { AdminButton, AdminListState } from '@/components/admin/AdminUi';
import {
  StepUpCanceledError,
  useRunWithStepUp,
} from '@/components/admin/StepUpProvider';
import { adminRequest, uploadMedia, type MediaAsset } from '@/lib/admin';

export default function AdminMediaPage() {
  const { runWithStepUp } = useRunWithStepUp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await adminRequest<MediaAsset[]>('/admin/media'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat media.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length) return;

    setUploading(true);
    setError('');
    try {
      // Sequential upload keeps error messages attributable to one file.
      for (const file of Array.from(files)) {
        await uploadMedia(file);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unggahan gagal.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleCopy = async (asset: MediaAsset) => {
    await navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    window.setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDelete = async (asset: MediaAsset) => {
    if (!window.confirm(`Hapus berkas "${asset.original_name}"?`)) return;

    setDeletingId(asset.id);
    try {
      await runWithStepUp('delete.media', String(asset.id), async (auth) => {
        await adminRequest(`/admin/media/${asset.id}`, {
          method: 'DELETE',
          body: auth
            ? {
                action_nonce: auth.action_nonce,
                action_signature: auth.action_signature,
              }
            : undefined,
        });
      });
      await load();
    } catch (err) {
      if (err instanceof StepUpCanceledError) return;
      setError(err instanceof Error ? err.message : 'Gagal menghapus berkas.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AdminShell
      title="Media"
      description="Semua gambar yang diunggah melalui panel ini."
      actions={
        <AdminButton onClick={() => inputRef.current?.click()} disabled={uploading}>
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Mengunggah…
            </>
          ) : (
            <>
              <ImagePlus className="h-4 w-4" aria-hidden="true" />
              Unggah gambar
            </>
          )}
        </AdminButton>
      }
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
        onChange={(event) => handleUpload(event.target.files)}
        className="hidden"
      />

      <AdminListState
        loading={loading}
        error={error}
        empty={items.length === 0}
        emptyLabel="Belum ada berkas media. Unggah gambar pertama Anda."
      />

      {!loading && !error && items.length > 0 ? (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((asset) => (
            <li
              key={asset.id}
              className="overflow-hidden rounded-3xl border border-ink-200 bg-white"
            >
              <div className="relative aspect-[4/3] bg-ink-100">
                <Image
                  src={asset.url}
                  alt={asset.original_name}
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                  unoptimized
                />
              </div>

              <div className="p-4">
                <p className="truncate text-sm font-medium text-ink-900" title={asset.original_name}>
                  {asset.original_name}
                </p>
                <p className="mt-0.5 text-xs text-ink-500">
                  {(asset.size_bytes / 1024).toFixed(0)} KB · {asset.created_at?.slice(0, 10)}
                </p>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(asset)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-ink-200 px-3 py-2 text-xs font-semibold text-ink-700 transition-colors hover:bg-ink-100"
                  >
                    {copiedId === asset.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                        Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        Salin URL
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(asset)}
                    disabled={deletingId === asset.id}
                    aria-label="Hapus berkas"
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink-200 text-ink-500 transition-colors hover:border-red-300 hover:text-red-600 disabled:opacity-60"
                  >
                    {deletingId === asset.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </AdminShell>
  );
}

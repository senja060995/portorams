'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ImagePlus, Loader2, Trash2 } from 'lucide-react';

import { uploadMedia } from '@/lib/admin';
import { cn } from '@/lib/utils';

interface ImageFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  className?: string;
}

/**
 * Image picker that uploads through the API and stores the returned URL. The
 * URL box stays editable so an editor can also paste an external image.
 */
export function ImageField({ label, value, onChange, hint, className }: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    setUploading(true);
    setError('');
    try {
      const asset = await uploadMedia(file);
      onChange(asset.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unggahan gagal.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className={cn('rounded-2xl border border-ink-200 p-4', className)}>
      <p className="text-sm font-semibold text-ink-800">{label}</p>

      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="relative h-24 w-36 shrink-0 overflow-hidden rounded-xl border border-ink-200 bg-ink-100">
          {value ? (
            <Image
              src={value}
              alt=""
              fill
              sizes="144px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <span className="flex h-full items-center justify-center text-xs text-ink-400">
              Belum ada
            </span>
          )}
        </div>

        <div className="flex-1">
          <input
            type="url"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="https://… atau unggah berkas"
            className="w-full rounded-xl border border-ink-300 bg-white px-4 py-2.5 text-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-full bg-brand-800 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {uploading ? 'Mengunggah…' : 'Unggah gambar'}
            </button>

            {value ? (
              <button
                type="button"
                onClick={() => onChange('')}
                className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 px-4 py-2 text-xs font-semibold text-ink-700 transition-colors hover:border-red-300 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Hapus
              </button>
            ) : null}
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            onChange={(event) => handleFile(event.target.files?.[0])}
            className="hidden"
          />

          {error ? <p className="mt-2 text-xs font-medium text-red-600">{error}</p> : null}
          {hint && !error ? <p className="mt-2 text-xs text-ink-500">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}

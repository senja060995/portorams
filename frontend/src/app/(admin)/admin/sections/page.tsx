'use client';

import { useState } from 'react';

import { AdminDrawer } from '@/components/admin/AdminDrawer';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminListState, AdminTable, RowActions } from '@/components/admin/AdminUi';
import { BilingualField, TextField } from '@/components/admin/Fields';
import { ImageField } from '@/components/admin/ImageField';
import { useAdminCrud } from '@/components/admin/useAdminCrud';
import type { AdminPageSection } from '@/lib/admin';

/** Human labels for the section keys the seeder creates. */
const sectionLabels: Record<string, string> = {
  home_hero: 'Beranda — Hero',
  home_partners: 'Beranda — Klien & Mitra',
  home_value: 'Beranda — Keunggulan',
  home_solutions: 'Beranda — Solusi',
  home_news: 'Beranda — Berita',
  home_cta: 'Beranda — CTA penutup',
  solutions_index: 'Halaman Solusi — Kepala',
  news_index: 'Halaman Berita — Kepala',
  contact_approach: 'Kontak — Tahapan kerja',
  contact_form: 'Kontak — Formulir',
};

const emptyDraft = {
  key: '',
  eyebrow_id: '',
  eyebrow_en: '',
  title_id: '',
  title_en: '',
  subtitle_id: '',
  subtitle_en: '',
  desc_id: '',
  desc_en: '',
  image_url: '',
  image_mobile_url: '',
  cta_label_id: '',
  cta_label_en: '',
  cta_href: '',
};

type Draft = typeof emptyDraft;

export default function AdminSectionsPage() {
  // Sections are upserted by key, so POST handles both create and update.
  const crud = useAdminCrud<AdminPageSection>({
    path: '/admin/sections',
    getId: (item) => item.id,
    upsert: true,
  });

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const startEdit = (section: AdminPageSection) => {
    setDraft({ ...emptyDraft, ...section });
    crud.setSaveError('');
    setOpen(true);
  };

  const handleSubmit = async () => {
    const ok = await crud.save(draft as Partial<AdminPageSection>);
    if (ok) setOpen(false);
  };

  return (
    <AdminShell
      title="Seksi Halaman"
      description="Ubah judul, subjudul, gambar, dan tombol untuk setiap bagian halaman."
    >
      <AdminListState
        loading={crud.loading}
        error={crud.error}
        empty={crud.items.length === 0}
        emptyLabel="Belum ada seksi halaman."
      />

      {!crud.loading && !crud.error && crud.items.length > 0 ? (
        <AdminTable headers={['Seksi', 'Judul (ID)', 'Tombol', 'Aksi']}>
          {crud.items.map((section) => (
            <tr key={section.id} className="hover:bg-brand-50/40">
              <td className="px-5 py-4">
                <p className="font-medium text-ink-900">
                  {sectionLabels[section.key] ?? section.key}
                </p>
                <p className="mt-0.5 font-mono text-xs text-ink-500">{section.key}</p>
              </td>
              <td className="max-w-sm px-5 py-4 text-ink-700">
                <span className="line-clamp-2">{section.title_id || '—'}</span>
              </td>
              <td className="px-5 py-4 text-ink-700">{section.cta_label_id || '—'}</td>
              <td className="px-5 py-4">
                <RowActions onEdit={() => startEdit(section)} />
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : null}

      <AdminDrawer
        open={open}
        title={sectionLabels[draft.key] ?? draft.key}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        saving={crud.saving}
        error={crud.saveError}
      >
        <p className="rounded-xl bg-brand-50 px-4 py-3 text-xs text-brand-900">
          Kunci seksi: <span className="font-mono font-semibold">{draft.key}</span>. Kunci tidak
          dapat diubah karena dipakai oleh kode halaman.
        </p>

        <BilingualField
          label="Label kecil (eyebrow)"
          valueId={draft.eyebrow_id}
          valueEn={draft.eyebrow_en}
          onChangeId={(value) => set('eyebrow_id', value)}
          onChangeEn={(value) => set('eyebrow_en', value)}
        />

        <BilingualField
          label="Judul"
          multiline
          rows={3}
          valueId={draft.title_id}
          valueEn={draft.title_en}
          onChangeId={(value) => set('title_id', value)}
          onChangeEn={(value) => set('title_en', value)}
          hint="Tekan Enter untuk memaksa pindah baris pada tampilan."
        />

        <BilingualField
          label="Subjudul"
          multiline
          rows={3}
          valueId={draft.subtitle_id}
          valueEn={draft.subtitle_en}
          onChangeId={(value) => set('subtitle_id', value)}
          onChangeEn={(value) => set('subtitle_en', value)}
        />

        <ImageField
          label="Gambar"
          value={draft.image_url}
          onChange={(value) => set('image_url', value)}
        />

        <BilingualField
          label="Label tombol"
          valueId={draft.cta_label_id}
          valueEn={draft.cta_label_en}
          onChangeId={(value) => set('cta_label_id', value)}
          onChangeEn={(value) => set('cta_label_en', value)}
          hint="Biarkan kosong bila bagian ini tidak memerlukan tombol."
        />

        <TextField
          label="Tautan tombol"
          value={draft.cta_href}
          onChange={(value) => set('cta_href', value)}
          hint="Contoh: /contact atau /news-updates"
        />
      </AdminDrawer>
    </AdminShell>
  );
}

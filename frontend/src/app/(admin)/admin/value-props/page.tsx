'use client';

import { useState } from 'react';

import { AdminDrawer } from '@/components/admin/AdminDrawer';
import { AdminShell } from '@/components/admin/AdminShell';
import { AddButton, AdminListState, AdminTable, RowActions } from '@/components/admin/AdminUi';
import { BilingualField, TextField } from '@/components/admin/Fields';
import { ImageField } from '@/components/admin/ImageField';
import { useAdminCrud } from '@/components/admin/useAdminCrud';
import type { AdminValueProp } from '@/lib/admin';

const emptyDraft = {
  icon_url: '',
  title_id: '',
  title_en: '',
  desc_id: '',
  desc_en: '',
  order: 0,
};

type Draft = typeof emptyDraft;

export default function AdminValuePropsPage() {
  const crud = useAdminCrud<AdminValueProp>({
    path: '/admin/value-props',
    getId: (item) => item.id,
    upsert: true,
  });

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft & { id?: number }>(emptyDraft);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const startCreate = () => {
    setDraft({ ...emptyDraft, order: crud.items.length + 1 });
    crud.setSaveError('');
    setOpen(true);
  };

  const startEdit = (item: AdminValueProp) => {
    setDraft({ ...emptyDraft, ...item });
    crud.setSaveError('');
    setOpen(true);
  };

  const handleSubmit = async () => {
    const ok = await crud.save(draft as Partial<AdminValueProp>);
    if (ok) setOpen(false);
  };

  return (
    <AdminShell
      title="Keunggulan"
      description="Tiga kartu alasan memilih RAMS di beranda."
      actions={<AddButton label="Keunggulan baru" onClick={startCreate} />}
    >
      <AdminListState
        loading={crud.loading}
        error={crud.error}
        empty={crud.items.length === 0}
        emptyLabel="Belum ada keunggulan."
      />

      {!crud.loading && !crud.error && crud.items.length > 0 ? (
        <AdminTable headers={['Judul (ID)', 'Judul (EN)', 'Urutan', 'Aksi']}>
          {crud.items.map((item) => (
            <tr key={item.id} className="hover:bg-brand-50/40">
              <td className="px-5 py-4 font-medium text-ink-900">
                {item.title_id.replace(/\n/g, ' ')}
              </td>
              <td className="px-5 py-4 text-ink-700">{item.title_en.replace(/\n/g, ' ')}</td>
              <td className="px-5 py-4 text-ink-700">{item.order}</td>
              <td className="px-5 py-4">
                <RowActions
                  onEdit={() => startEdit(item)}
                  onDelete={() => {
                    if (window.confirm('Hapus keunggulan ini?')) void crud.remove(item);
                  }}
                  deleting={crud.deletingId === item.id}
                />
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : null}

      <AdminDrawer
        open={open}
        title={draft.id ? 'Ubah keunggulan' : 'Keunggulan baru'}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        saving={crud.saving}
        error={crud.saveError}
      >
        <BilingualField
          label="Judul"
          required
          multiline
          rows={2}
          valueId={draft.title_id}
          valueEn={draft.title_en}
          onChangeId={(value) => set('title_id', value)}
          onChangeEn={(value) => set('title_en', value)}
          hint="Tekan Enter untuk memaksa pindah baris."
        />

        <BilingualField
          label="Deskripsi"
          multiline
          rows={4}
          valueId={draft.desc_id}
          valueEn={draft.desc_en}
          onChangeId={(value) => set('desc_id', value)}
          onChangeEn={(value) => set('desc_en', value)}
        />

        <ImageField
          label="Ikon"
          value={draft.icon_url}
          onChange={(value) => set('icon_url', value)}
          hint="Bila kosong, huruf pertama judul dipakai sebagai ikon."
        />

        <TextField
          label="Urutan"
          type="number"
          value={String(draft.order)}
          onChange={(value) => set('order', Number(value) || 0)}
        />
      </AdminDrawer>
    </AdminShell>
  );
}

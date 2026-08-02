'use client';

import { useState } from 'react';

import { AdminDrawer } from '@/components/admin/AdminDrawer';
import { AdminShell } from '@/components/admin/AdminShell';
import { AddButton, AdminListState, AdminTable, RowActions } from '@/components/admin/AdminUi';
import { BilingualField, TextField } from '@/components/admin/Fields';
import { ImageField } from '@/components/admin/ImageField';
import { useAdminCrud } from '@/components/admin/useAdminCrud';
import type { AdminApproachStep } from '@/lib/admin';

const emptyDraft = {
  number: '',
  title_id: '',
  title_en: '',
  desc_id: '',
  desc_en: '',
  image_url: '',
  order: 0,
};

type Draft = typeof emptyDraft;

export default function AdminApproachPage() {
  const crud = useAdminCrud<AdminApproachStep>({
    path: '/admin/approach-steps',
    getId: (item) => item.id,
    upsert: true,
    stepUp: { deleteAction: 'delete.approach_step' },
  });

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft & { id?: number }>(emptyDraft);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const startCreate = () => {
    const next = crud.items.length + 1;
    setDraft({ ...emptyDraft, number: String(next).padStart(2, '0'), order: next });
    crud.setSaveError('');
    setOpen(true);
  };

  const startEdit = (step: AdminApproachStep) => {
    setDraft({ ...emptyDraft, ...step });
    crud.setSaveError('');
    setOpen(true);
  };

  const handleSubmit = async () => {
    const ok = await crud.save(draft as Partial<AdminApproachStep>);
    if (ok) setOpen(false);
  };

  return (
    <AdminShell
      title="Tahapan Kerja"
      description="Langkah kerja yang ditampilkan di halaman Kontak."
      actions={<AddButton label="Tahapan baru" onClick={startCreate} />}
    >
      <AdminListState
        loading={crud.loading}
        error={crud.error}
        empty={crud.items.length === 0}
        emptyLabel="Belum ada tahapan kerja."
      />

      {!crud.loading && !crud.error && crud.items.length > 0 ? (
        <AdminTable headers={['No.', 'Judul (ID)', 'Judul (EN)', 'Aksi']}>
          {crud.items.map((step) => (
            <tr key={step.id} className="hover:bg-brand-50/40">
              <td className="px-5 py-4 font-mono font-semibold text-brand-700">{step.number}</td>
              <td className="px-5 py-4 font-medium text-ink-900">{step.title_id}</td>
              <td className="px-5 py-4 text-ink-700">{step.title_en}</td>
              <td className="px-5 py-4">
                <RowActions
                  onEdit={() => startEdit(step)}
                  onDelete={() => {
                    if (window.confirm(`Hapus tahapan "${step.title_id}"?`)) void crud.remove(step);
                  }}
                  deleting={crud.deletingId === step.id}
                />
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : null}

      <AdminDrawer
        open={open}
        title={draft.id ? 'Ubah tahapan' : 'Tahapan baru'}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        saving={crud.saving}
        error={crud.saveError}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Nomor tampilan"
            required
            value={draft.number}
            onChange={(value) => set('number', value)}
            hint="Contoh: 01"
            maxLength={4}
          />
          <TextField
            label="Urutan"
            type="number"
            value={String(draft.order)}
            onChange={(value) => set('order', Number(value) || 0)}
          />
        </div>

        <BilingualField
          label="Judul tahapan"
          required
          valueId={draft.title_id}
          valueEn={draft.title_en}
          onChangeId={(value) => set('title_id', value)}
          onChangeEn={(value) => set('title_en', value)}
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
          label="Gambar"
          value={draft.image_url}
          onChange={(value) => set('image_url', value)}
          hint="Bila kosong, nomor tahapan ditampilkan di atas gradien."
        />
      </AdminDrawer>
    </AdminShell>
  );
}

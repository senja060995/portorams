'use client';

import { useState } from 'react';

import { AdminDrawer } from '@/components/admin/AdminDrawer';
import { AdminShell } from '@/components/admin/AdminShell';
import { AdminListState, AdminTable, RowActions } from '@/components/admin/AdminUi';
import { BilingualField } from '@/components/admin/Fields';
import { useAdminCrud } from '@/components/admin/useAdminCrud';
import type { AdminLegalPage } from '@/lib/admin';

const emptyDraft = {
  slug: '',
  title_id: '',
  title_en: '',
  body_id: '',
  body_en: '',
};

type Draft = typeof emptyDraft;

export default function AdminLegalPage_() {
  const crud = useAdminCrud<AdminLegalPage>({
    path: '/admin/legal',
    getId: (item) => item.id,
    upsert: true,
  });

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const startEdit = (page: AdminLegalPage) => {
    setDraft({ ...emptyDraft, ...page });
    crud.setSaveError('');
    setOpen(true);
  };

  const handleSubmit = async () => {
    const ok = await crud.save(draft as Partial<AdminLegalPage>);
    if (ok) setOpen(false);
  };

  return (
    <AdminShell
      title="Halaman Legal"
      description="Kebijakan Privasi dan Syarat & Ketentuan."
    >
      <AdminListState
        loading={crud.loading}
        error={crud.error}
        empty={crud.items.length === 0}
        emptyLabel="Belum ada halaman legal."
      />

      {!crud.loading && !crud.error && crud.items.length > 0 ? (
        <AdminTable headers={['Halaman', 'Slug', 'Diperbarui', 'Aksi']}>
          {crud.items.map((page) => (
            <tr key={page.id} className="hover:bg-brand-50/40">
              <td className="px-5 py-4">
                <p className="font-medium text-ink-900">{page.title_id}</p>
                <p className="mt-0.5 text-xs text-ink-500">{page.title_en}</p>
              </td>
              <td className="px-5 py-4 font-mono text-xs text-ink-700">{page.slug}</td>
              <td className="px-5 py-4 text-ink-700">{page.updated_at?.slice(0, 10) ?? '—'}</td>
              <td className="px-5 py-4">
                <RowActions onEdit={() => startEdit(page)} />
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : null}

      <AdminDrawer
        open={open}
        title={draft.title_id || 'Halaman legal'}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        saving={crud.saving}
        error={crud.saveError}
      >
        <p className="rounded-xl bg-brand-50 px-4 py-3 text-xs text-brand-900">
          Slug halaman: <span className="font-mono font-semibold">{draft.slug}</span>
        </p>

        <BilingualField
          label="Judul halaman"
          required
          valueId={draft.title_id}
          valueEn={draft.title_en}
          onChangeId={(value) => set('title_id', value)}
          onChangeEn={(value) => set('title_en', value)}
        />

        <BilingualField
          label="Isi halaman"
          required
          multiline
          rows={22}
          markdown
          valueId={draft.body_id}
          valueEn={draft.body_en}
          onChangeId={(value) => set('body_id', value)}
          onChangeEn={(value) => set('body_en', value)}
        />
      </AdminDrawer>
    </AdminShell>
  );
}

'use client';

import { useState } from 'react';

import { AdminDrawer } from '@/components/admin/AdminDrawer';
import { AdminShell } from '@/components/admin/AdminShell';
import {
  AddButton,
  AdminListState,
  AdminTable,
  RowActions,
  StatusBadge,
} from '@/components/admin/AdminUi';
import { CheckboxField, TextField } from '@/components/admin/Fields';
import { ImageField } from '@/components/admin/ImageField';
import { useAdminCrud } from '@/components/admin/useAdminCrud';
import type { AdminPartner } from '@/lib/admin';

const emptyDraft = {
  name: '',
  logo_url: '',
  website: '',
  order: 0,
  active: true,
};

type Draft = typeof emptyDraft;

export default function AdminPartnersPage() {
  const crud = useAdminCrud<AdminPartner>({
    path: '/admin/partners',
    getId: (item) => item.id,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminPartner | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const startCreate = () => {
    setEditing(null);
    setDraft({ ...emptyDraft, order: crud.items.length + 1 });
    crud.setSaveError('');
    setOpen(true);
  };

  const startEdit = (partner: AdminPartner) => {
    setEditing(partner);
    setDraft({ ...emptyDraft, ...partner });
    crud.setSaveError('');
    setOpen(true);
  };

  const handleSubmit = async () => {
    const ok = await crud.save(draft as Partial<AdminPartner>, editing);
    if (ok) setOpen(false);
  };

  return (
    <AdminShell
      title="Mitra"
      description="Logo klien dan mitra yang bergulir di beranda."
      actions={<AddButton label="Mitra baru" onClick={startCreate} />}
    >
      <AdminListState
        loading={crud.loading}
        error={crud.error}
        empty={crud.items.length === 0}
        emptyLabel="Belum ada mitra."
      />

      {!crud.loading && !crud.error && crud.items.length > 0 ? (
        <AdminTable headers={['Nama', 'Situs', 'Urutan', 'Status', 'Aksi']}>
          {crud.items.map((partner) => (
            <tr key={partner.id} className="hover:bg-brand-50/40">
              <td className="px-5 py-4 font-medium text-ink-900">{partner.name}</td>
              <td className="px-5 py-4 text-ink-700">{partner.website || '—'}</td>
              <td className="px-5 py-4 text-ink-700">{partner.order}</td>
              <td className="px-5 py-4">
                <StatusBadge
                  label={partner.active ? 'Aktif' : 'Nonaktif'}
                  tone={partner.active ? 'green' : 'gray'}
                />
              </td>
              <td className="px-5 py-4">
                <RowActions
                  onEdit={() => startEdit(partner)}
                  onDelete={() => {
                    if (window.confirm(`Hapus mitra "${partner.name}"?`)) {
                      void crud.remove(partner);
                    }
                  }}
                  deleting={crud.deletingId === partner.id}
                />
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : null}

      <AdminDrawer
        open={open}
        title={editing ? 'Ubah mitra' : 'Mitra baru'}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        saving={crud.saving}
        error={crud.saveError}
      >
        <TextField
          label="Nama mitra"
          required
          value={draft.name}
          onChange={(value) => set('name', value)}
        />

        <ImageField
          label="Logo"
          value={draft.logo_url}
          onChange={(value) => set('logo_url', value)}
          hint="PNG atau SVG transparan. Bila kosong, nama mitra ditampilkan sebagai teks."
        />

        <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
          <TextField
            label="Situs web"
            type="url"
            value={draft.website}
            onChange={(value) => set('website', value)}
          />
          <TextField
            label="Urutan"
            type="number"
            value={String(draft.order)}
            onChange={(value) => set('order', Number(value) || 0)}
          />
        </div>

        <CheckboxField
          label="Tampilkan di beranda"
          checked={draft.active}
          onChange={(checked) => set('active', checked)}
        />
      </AdminDrawer>
    </AdminShell>
  );
}

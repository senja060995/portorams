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
import { BilingualField, CheckboxField, TextField } from '@/components/admin/Fields';
import { ImageField } from '@/components/admin/ImageField';
import { RepeaterItem, RepeaterSection } from '@/components/admin/Repeater';
import { useAdminCrud } from '@/components/admin/useAdminCrud';
import type {
  AdminSolution,
  AdminSolutionFeature,
  AdminSolutionUseCase,
} from '@/lib/admin';

const emptyFeature: AdminSolutionFeature = {
  label_id: '',
  label_en: '',
  title_id: '',
  title_en: '',
  desc_id: '',
  desc_en: '',
  image_url: '',
  order: 0,
};

const emptyUseCase: AdminSolutionUseCase = {
  title_id: '',
  title_en: '',
  desc_id: '',
  desc_en: '',
  order: 0,
};

const emptyDraft = {
  slug: '',
  name_id: '',
  name_en: '',
  eyebrow_id: 'Solusi untuk',
  eyebrow_en: 'Solution for',
  title_id: '',
  title_en: '',
  desc_id: '',
  desc_en: '',
  summary_id: '',
  summary_en: '',
  icon_url: '',
  card_image_url: '',
  hero_image_url: '',
  cta_label_id: '',
  cta_label_en: '',
  cta_href: '/contact',
  feature_title_id: '',
  feature_title_en: '',
  capability_title_id: '',
  capability_title_en: '',
  capability_image: '',
  cta_title_id: '',
  cta_title_en: '',
  cta_banner: '',
  order: 0,
  published: true,
  features: [] as AdminSolutionFeature[],
  use_cases: [] as AdminSolutionUseCase[],
};

type Draft = typeof emptyDraft;

export default function AdminSolutionsPage() {
  const crud = useAdminCrud<AdminSolution>({
    path: '/admin/solutions',
    getId: (item) => item.id,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminSolution | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const startCreate = () => {
    setEditing(null);
    setDraft({ ...emptyDraft, order: crud.items.length + 1 });
    crud.setSaveError('');
    setOpen(true);
  };

  const startEdit = (solution: AdminSolution) => {
    setEditing(solution);
    setDraft({
      ...emptyDraft,
      ...solution,
      features: solution.features ?? [],
      use_cases: solution.use_cases ?? [],
    });
    crud.setSaveError('');
    setOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      ...draft,
      features: draft.features.map((feature, index) => ({ ...feature, order: index + 1 })),
      use_cases: draft.use_cases.map((useCase, index) => ({ ...useCase, order: index + 1 })),
    };
    const ok = await crud.save(payload as Partial<AdminSolution>, editing);
    if (ok) setOpen(false);
  };

  const updateFeature = (index: number, patch: Partial<AdminSolutionFeature>) =>
    setDraft((current) => ({
      ...current,
      features: current.features.map((feature, i) =>
        i === index ? { ...feature, ...patch } : feature,
      ),
    }));

  const updateUseCase = (index: number, patch: Partial<AdminSolutionUseCase>) =>
    setDraft((current) => ({
      ...current,
      use_cases: current.use_cases.map((useCase, i) =>
        i === index ? { ...useCase, ...patch } : useCase,
      ),
    }));

  return (
    <AdminShell
      title="Solusi"
      description="Kelola lima solusi beserta fitur dan studi penggunaannya."
      actions={<AddButton label="Solusi baru" onClick={startCreate} />}
    >
      <AdminListState
        loading={crud.loading}
        error={crud.error}
        empty={crud.items.length === 0}
        emptyLabel="Belum ada solusi."
      />

      {!crud.loading && !crud.error && crud.items.length > 0 ? (
        <AdminTable headers={['Nama', 'Slug', 'Fitur', 'Status', 'Aksi']}>
          {crud.items.map((solution) => (
            <tr key={solution.id} className="hover:bg-brand-50/40">
              <td className="px-5 py-4">
                <p className="font-medium text-ink-900">{solution.name_id}</p>
                <p className="mt-0.5 text-xs text-ink-500">{solution.name_en}</p>
              </td>
              <td className="px-5 py-4 text-ink-700">{solution.slug}</td>
              <td className="px-5 py-4 text-ink-700">
                {solution.features?.length ?? 0} fitur · {solution.use_cases?.length ?? 0} studi
              </td>
              <td className="px-5 py-4">
                <StatusBadge
                  label={solution.published ? 'Terbit' : 'Draf'}
                  tone={solution.published ? 'green' : 'amber'}
                />
              </td>
              <td className="px-5 py-4">
                <RowActions
                  onEdit={() => startEdit(solution)}
                  onDelete={() => {
                    if (window.confirm(`Hapus solusi "${solution.name_id}"?`)) {
                      void crud.remove(solution);
                    }
                  }}
                  deleting={crud.deletingId === solution.id}
                />
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : null}

      <AdminDrawer
        open={open}
        title={editing ? 'Ubah solusi' : 'Solusi baru'}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        saving={crud.saving}
        error={crud.saveError}
      >
        <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
          <TextField
            label="Slug"
            required
            value={draft.slug}
            onChange={(value) => set('slug', value)}
            hint="Contoh: pos-retail"
          />
          <TextField
            label="Urutan"
            type="number"
            value={String(draft.order)}
            onChange={(value) => set('order', Number(value) || 0)}
          />
        </div>

        <BilingualField
          label="Nama solusi"
          required
          valueId={draft.name_id}
          valueEn={draft.name_en}
          onChangeId={(value) => set('name_id', value)}
          onChangeEn={(value) => set('name_en', value)}
        />

        <BilingualField
          label="Label kecil di atas nama"
          valueId={draft.eyebrow_id}
          valueEn={draft.eyebrow_en}
          onChangeId={(value) => set('eyebrow_id', value)}
          onChangeEn={(value) => set('eyebrow_en', value)}
        />

        <BilingualField
          label="Judul utama"
          multiline
          rows={2}
          valueId={draft.title_id}
          valueEn={draft.title_en}
          onChangeId={(value) => set('title_id', value)}
          onChangeEn={(value) => set('title_en', value)}
          hint="Tekan Enter untuk memaksa pindah baris pada tampilan."
        />

        <BilingualField
          label="Deskripsi hero"
          multiline
          rows={3}
          valueId={draft.desc_id}
          valueEn={draft.desc_en}
          onChangeId={(value) => set('desc_id', value)}
          onChangeEn={(value) => set('desc_en', value)}
        />

        <BilingualField
          label="Ringkasan kartu"
          multiline
          rows={2}
          valueId={draft.summary_id}
          valueEn={draft.summary_en}
          onChangeId={(value) => set('summary_id', value)}
          onChangeEn={(value) => set('summary_en', value)}
          hint="Dipakai di kartu beranda dan menu navigasi."
        />

        <div className="grid gap-4">
          <ImageField
            label="Gambar kartu"
            value={draft.card_image_url}
            onChange={(value) => set('card_image_url', value)}
          />
          <ImageField
            label="Gambar hero"
            value={draft.hero_image_url}
            onChange={(value) => set('hero_image_url', value)}
          />
        </div>

        <BilingualField
          label="Judul bagian fitur"
          multiline
          rows={2}
          valueId={draft.feature_title_id}
          valueEn={draft.feature_title_en}
          onChangeId={(value) => set('feature_title_id', value)}
          onChangeEn={(value) => set('feature_title_en', value)}
        />

        <RepeaterSection
          title="Fitur"
          count={draft.features.length}
          onAdd={() =>
            set('features', [...draft.features, { ...emptyFeature, order: draft.features.length + 1 }])
          }
        >
          {draft.features.map((feature, index) => (
            <RepeaterItem
              key={index}
              index={index}
              onRemove={() =>
                set(
                  'features',
                  draft.features.filter((_, i) => i !== index),
                )
              }
            >
              <BilingualField
                label="Label"
                valueId={feature.label_id}
                valueEn={feature.label_en}
                onChangeId={(value) => updateFeature(index, { label_id: value })}
                onChangeEn={(value) => updateFeature(index, { label_en: value })}
              />
              <BilingualField
                label="Judul fitur"
                valueId={feature.title_id}
                valueEn={feature.title_en}
                onChangeId={(value) => updateFeature(index, { title_id: value })}
                onChangeEn={(value) => updateFeature(index, { title_en: value })}
              />
              <BilingualField
                label="Deskripsi"
                multiline
                rows={3}
                valueId={feature.desc_id}
                valueEn={feature.desc_en}
                onChangeId={(value) => updateFeature(index, { desc_id: value })}
                onChangeEn={(value) => updateFeature(index, { desc_en: value })}
              />
              <ImageField
                label="Gambar fitur"
                value={feature.image_url}
                onChange={(value) => updateFeature(index, { image_url: value })}
              />
            </RepeaterItem>
          ))}
        </RepeaterSection>

        <BilingualField
          label="Judul bagian studi penggunaan"
          multiline
          rows={2}
          valueId={draft.capability_title_id}
          valueEn={draft.capability_title_en}
          onChangeId={(value) => set('capability_title_id', value)}
          onChangeEn={(value) => set('capability_title_en', value)}
        />

        <ImageField
          label="Gambar latar studi penggunaan"
          value={draft.capability_image}
          onChange={(value) => set('capability_image', value)}
        />

        <RepeaterSection
          title="Studi penggunaan"
          count={draft.use_cases.length}
          onAdd={() =>
            set('use_cases', [
              ...draft.use_cases,
              { ...emptyUseCase, order: draft.use_cases.length + 1 },
            ])
          }
        >
          {draft.use_cases.map((useCase, index) => (
            <RepeaterItem
              key={index}
              index={index}
              onRemove={() =>
                set(
                  'use_cases',
                  draft.use_cases.filter((_, i) => i !== index),
                )
              }
            >
              <BilingualField
                label="Judul"
                valueId={useCase.title_id}
                valueEn={useCase.title_en}
                onChangeId={(value) => updateUseCase(index, { title_id: value })}
                onChangeEn={(value) => updateUseCase(index, { title_en: value })}
              />
              <BilingualField
                label="Deskripsi"
                multiline
                rows={3}
                valueId={useCase.desc_id}
                valueEn={useCase.desc_en}
                onChangeId={(value) => updateUseCase(index, { desc_id: value })}
                onChangeEn={(value) => updateUseCase(index, { desc_en: value })}
              />
            </RepeaterItem>
          ))}
        </RepeaterSection>

        <BilingualField
          label="Judul CTA penutup"
          multiline
          rows={2}
          valueId={draft.cta_title_id}
          valueEn={draft.cta_title_en}
          onChangeId={(value) => set('cta_title_id', value)}
          onChangeEn={(value) => set('cta_title_en', value)}
        />

        <BilingualField
          label="Label tombol CTA"
          valueId={draft.cta_label_id}
          valueEn={draft.cta_label_en}
          onChangeId={(value) => set('cta_label_id', value)}
          onChangeEn={(value) => set('cta_label_en', value)}
        />

        <TextField
          label="Tautan tombol CTA"
          value={draft.cta_href}
          onChange={(value) => set('cta_href', value)}
          hint="Gunakan /contact untuk mengarah ke halaman kontak."
        />

        <ImageField
          label="Gambar banner CTA"
          value={draft.cta_banner}
          onChange={(value) => set('cta_banner', value)}
        />

        <CheckboxField
          label="Terbitkan solusi ini"
          hint="Solusi yang tidak terbit disembunyikan dari situs publik."
          checked={draft.published}
          onChange={(checked) => set('published', checked)}
        />
      </AdminDrawer>
    </AdminShell>
  );
}

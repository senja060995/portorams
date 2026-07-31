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
  AdminProduct,
  AdminProductFeature,
  AdminProductValue,
} from '@/lib/admin';

const emptyValue: AdminProductValue = {
  letter: '',
  title_id: '',
  title_en: '',
  desc_id: '',
  desc_en: '',
  image_url: '',
  order: 0,
};

const emptyFeature: AdminProductFeature = {
  title_id: '',
  title_en: '',
  desc_id: '',
  desc_en: '',
  image_url: '',
  order: 0,
};

const emptyDraft = {
  slug: '',
  name_id: '',
  name_en: '',
  title_id: '',
  title_en: '',
  tagline_id: '',
  tagline_en: '',
  logo_url: '',
  hero_image_url: '',
  prompts_id: '',
  prompts_en: '',
  acronym_title_id: '',
  acronym_title_en: '',
  cta_title_id: '',
  cta_title_en: '',
  cta_label_id: '',
  cta_label_en: '',
  cta_href: '/contact',
  order: 0,
  published: true,
  values: [] as AdminProductValue[],
  features: [] as AdminProductFeature[],
};

type Draft = typeof emptyDraft;

export default function AdminProductsPage() {
  const crud = useAdminCrud<AdminProduct>({
    path: '/admin/products',
    getId: (item) => item.id,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const startCreate = () => {
    setEditing(null);
    setDraft({ ...emptyDraft, order: crud.items.length + 1 });
    crud.setSaveError('');
    setOpen(true);
  };

  const startEdit = (product: AdminProduct) => {
    setEditing(product);
    setDraft({
      ...emptyDraft,
      ...product,
      values: product.values ?? [],
      features: product.features ?? [],
    });
    crud.setSaveError('');
    setOpen(true);
  };

  const handleSubmit = async () => {
    const payload = {
      ...draft,
      values: draft.values.map((value, index) => ({ ...value, order: index + 1 })),
      features: draft.features.map((feature, index) => ({ ...feature, order: index + 1 })),
    };
    const ok = await crud.save(payload as Partial<AdminProduct>, editing);
    if (ok) setOpen(false);
  };

  const updateValue = (index: number, patch: Partial<AdminProductValue>) =>
    setDraft((current) => ({
      ...current,
      values: current.values.map((value, i) => (i === index ? { ...value, ...patch } : value)),
    }));

  const updateFeature = (index: number, patch: Partial<AdminProductFeature>) =>
    setDraft((current) => ({
      ...current,
      features: current.features.map((feature, i) =>
        i === index ? { ...feature, ...patch } : feature,
      ),
    }));

  return (
    <AdminShell
      title="Produk"
      description="Kelola produk unggulan seperti SIDRA beserta nilai dan fiturnya."
      actions={<AddButton label="Produk baru" onClick={startCreate} />}
    >
      <AdminListState
        loading={crud.loading}
        error={crud.error}
        empty={crud.items.length === 0}
        emptyLabel="Belum ada produk."
      />

      {!crud.loading && !crud.error && crud.items.length > 0 ? (
        <AdminTable headers={['Nama', 'Slug', 'Isi', 'Status', 'Aksi']}>
          {crud.items.map((product) => (
            <tr key={product.id} className="hover:bg-brand-50/40">
              <td className="px-5 py-4">
                <p className="font-medium text-ink-900">{product.name_id}</p>
                <p className="mt-0.5 text-xs text-ink-500">{product.title_id}</p>
              </td>
              <td className="px-5 py-4 text-ink-700">{product.slug}</td>
              <td className="px-5 py-4 text-ink-700">
                {product.values?.length ?? 0} nilai · {product.features?.length ?? 0} fitur
              </td>
              <td className="px-5 py-4">
                <StatusBadge
                  label={product.published ? 'Terbit' : 'Draf'}
                  tone={product.published ? 'green' : 'amber'}
                />
              </td>
              <td className="px-5 py-4">
                <RowActions
                  onEdit={() => startEdit(product)}
                  onDelete={() => {
                    if (window.confirm(`Hapus produk "${product.name_id}"?`)) {
                      void crud.remove(product);
                    }
                  }}
                  deleting={crud.deletingId === product.id}
                />
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : null}

      <AdminDrawer
        open={open}
        title={editing ? 'Ubah produk' : 'Produk baru'}
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
            hint="Contoh: sidra"
          />
          <TextField
            label="Urutan"
            type="number"
            value={String(draft.order)}
            onChange={(value) => set('order', Number(value) || 0)}
          />
        </div>

        <BilingualField
          label="Nama produk"
          required
          valueId={draft.name_id}
          valueEn={draft.name_en}
          onChangeId={(value) => set('name_id', value)}
          onChangeEn={(value) => set('name_en', value)}
        />

        <BilingualField
          label="Judul hero"
          multiline
          rows={2}
          valueId={draft.title_id}
          valueEn={draft.title_en}
          onChangeId={(value) => set('title_id', value)}
          onChangeEn={(value) => set('title_en', value)}
        />

        <BilingualField
          label="Tagline"
          multiline
          rows={3}
          valueId={draft.tagline_id}
          valueEn={draft.tagline_en}
          onChangeId={(value) => set('tagline_id', value)}
          onChangeEn={(value) => set('tagline_en', value)}
        />

        <div className="grid gap-4">
          <ImageField
            label="Logo produk"
            value={draft.logo_url}
            onChange={(value) => set('logo_url', value)}
            hint="Gunakan PNG atau SVG dengan latar transparan."
          />
          <ImageField
            label="Gambar hero"
            value={draft.hero_image_url}
            onChange={(value) => set('hero_image_url', value)}
          />
        </div>

        <BilingualField
          label="Contoh pertanyaan (marquee)"
          multiline
          rows={5}
          valueId={draft.prompts_id}
          valueEn={draft.prompts_en}
          onChangeId={(value) => set('prompts_id', value)}
          onChangeEn={(value) => set('prompts_en', value)}
          hint="Satu pertanyaan per baris."
        />

        <BilingualField
          label="Judul bagian akronim"
          multiline
          rows={2}
          valueId={draft.acronym_title_id}
          valueEn={draft.acronym_title_en}
          onChangeId={(value) => set('acronym_title_id', value)}
          onChangeEn={(value) => set('acronym_title_en', value)}
        />

        <RepeaterSection
          title="Nilai akronim"
          count={draft.values.length}
          onAdd={() =>
            set('values', [...draft.values, { ...emptyValue, order: draft.values.length + 1 }])
          }
        >
          {draft.values.map((value, index) => (
            <RepeaterItem
              key={index}
              index={index}
              onRemove={() =>
                set(
                  'values',
                  draft.values.filter((_, i) => i !== index),
                )
              }
            >
              <TextField
                label="Huruf"
                value={value.letter}
                onChange={(next) => updateValue(index, { letter: next })}
                maxLength={2}
                hint="Satu huruf, contoh: S"
              />
              <BilingualField
                label="Judul"
                valueId={value.title_id}
                valueEn={value.title_en}
                onChangeId={(next) => updateValue(index, { title_id: next })}
                onChangeEn={(next) => updateValue(index, { title_en: next })}
              />
              <BilingualField
                label="Deskripsi"
                multiline
                rows={3}
                valueId={value.desc_id}
                valueEn={value.desc_en}
                onChangeId={(next) => updateValue(index, { desc_id: next })}
                onChangeEn={(next) => updateValue(index, { desc_en: next })}
              />
            </RepeaterItem>
          ))}
        </RepeaterSection>

        <RepeaterSection
          title="Fitur besar"
          count={draft.features.length}
          onAdd={() =>
            set('features', [
              ...draft.features,
              { ...emptyFeature, order: draft.features.length + 1 },
            ])
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
                label="Judul fitur"
                valueId={feature.title_id}
                valueEn={feature.title_en}
                onChangeId={(next) => updateFeature(index, { title_id: next })}
                onChangeEn={(next) => updateFeature(index, { title_en: next })}
              />
              <BilingualField
                label="Deskripsi"
                multiline
                rows={4}
                valueId={feature.desc_id}
                valueEn={feature.desc_en}
                onChangeId={(next) => updateFeature(index, { desc_id: next })}
                onChangeEn={(next) => updateFeature(index, { desc_en: next })}
              />
              <ImageField
                label="Gambar fitur"
                value={feature.image_url}
                onChange={(next) => updateFeature(index, { image_url: next })}
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
        />

        <CheckboxField
          label="Terbitkan produk ini"
          checked={draft.published}
          onChange={(checked) => set('published', checked)}
        />
      </AdminDrawer>
    </AdminShell>
  );
}

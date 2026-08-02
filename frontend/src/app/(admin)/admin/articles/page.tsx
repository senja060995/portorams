'use client';

import { useEffect, useState } from 'react';

import { AdminDrawer } from '@/components/admin/AdminDrawer';
import { AdminShell } from '@/components/admin/AdminShell';
import { AddButton, AdminListState, AdminTable, RowActions, StatusBadge } from '@/components/admin/AdminUi';
import { BilingualField, CheckboxField, SelectField, TextField } from '@/components/admin/Fields';
import { ImageField } from '@/components/admin/ImageField';
import { useAdminCrud } from '@/components/admin/useAdminCrud';
import {
  adminRequest,
  type AdminArticle,
  type AdminArticleCategory,
} from '@/lib/admin';

const emptyArticle = {
  slug: '',
  category_id: 0,
  title_id: '',
  title_en: '',
  excerpt_id: '',
  excerpt_en: '',
  content_id: '',
  content_en: '',
  image_url: '',
  author: '',
  status: 'draft',
  featured: false,
  read_time: '',
  published_at: new Date().toISOString().slice(0, 10),
};

type Draft = typeof emptyArticle;

export default function AdminArticlesPage() {
  const crud = useAdminCrud<AdminArticle>({
    path: '/admin/articles',
    getId: (item) => item.id,
    stepUp: { deleteAction: 'delete.article' },
  });

  const [categories, setCategories] = useState<AdminArticleCategory[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminArticle | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyArticle);

  useEffect(() => {
    adminRequest<AdminArticleCategory[]>('/admin/article-categories')
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const startCreate = () => {
    setEditing(null);
    setDraft({ ...emptyArticle, category_id: categories[0]?.id ?? 0 });
    crud.setSaveError('');
    setOpen(true);
  };

  const startEdit = (article: AdminArticle) => {
    setEditing(article);
    setDraft({
      slug: article.slug,
      category_id: article.category_id,
      title_id: article.title_id,
      title_en: article.title_en,
      excerpt_id: article.excerpt_id,
      excerpt_en: article.excerpt_en,
      content_id: article.content_id,
      content_en: article.content_en,
      image_url: article.image_url,
      author: article.author,
      status: article.status,
      featured: article.featured,
      read_time: article.read_time,
      published_at: article.published_at?.slice(0, 10) ?? '',
    });
    crud.setSaveError('');
    setOpen(true);
  };

  const handleSubmit = async () => {
    const ok = await crud.save(draft as Partial<AdminArticle>, editing);
    if (ok) setOpen(false);
  };

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const state = (
    <AdminListState
      loading={crud.loading}
      error={crud.error}
      empty={crud.items.length === 0}
      emptyLabel="Belum ada artikel. Tambahkan artikel pertama Anda."
    />
  );

  return (
    <AdminShell
      title="Artikel"
      description="Kelola berita, pembaruan, dan studi kasus dalam dua bahasa."
      actions={<AddButton label="Artikel baru" onClick={startCreate} />}
    >
      {state ?? null}

      {!crud.loading && !crud.error && crud.items.length > 0 ? (
        <AdminTable headers={['Judul', 'Kategori', 'Status', 'Tanggal', 'Aksi']}>
          {crud.items.map((article) => (
            <tr key={article.id} className="hover:bg-brand-50/40">
              <td className="px-5 py-4">
                <p className="font-medium text-ink-900">{article.title_id}</p>
                <p className="mt-0.5 text-xs text-ink-500">{article.slug}</p>
              </td>
              <td className="px-5 py-4 text-ink-700">{article.category?.name_id ?? '—'}</td>
              <td className="px-5 py-4">
                <div className="flex flex-wrap gap-1.5">
                  <StatusBadge
                    label={article.status === 'published' ? 'Terbit' : 'Draf'}
                    tone={article.status === 'published' ? 'green' : 'amber'}
                  />
                  {article.featured ? <StatusBadge label="Utama" tone="blue" /> : null}
                </div>
              </td>
              <td className="px-5 py-4 text-ink-700">{article.published_at?.slice(0, 10) || '—'}</td>
              <td className="px-5 py-4">
                <RowActions
                  onEdit={() => startEdit(article)}
                  onDelete={() => {
                    if (window.confirm(`Hapus artikel "${article.title_id}"?`)) {
                      void crud.remove(article);
                    }
                  }}
                  deleting={crud.deletingId === article.id}
                />
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : null}

      <AdminDrawer
        open={open}
        title={editing ? 'Ubah artikel' : 'Artikel baru'}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        saving={crud.saving}
        error={crud.saveError}
        size="full"
      >
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Main Content Column (Left - 8 Cols) */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            <TextField
              label="Slug URL"
              required
              value={draft.slug}
              onChange={(value) => set('slug', value)}
              hint="URL unik artikel, contoh: erp-percetakan-sidomulyo-advertising"
            />

            <BilingualField
              label="Judul Artikel"
              required
              valueId={draft.title_id}
              valueEn={draft.title_en}
              onChangeId={(value) => set('title_id', value)}
              onChangeEn={(value) => set('title_en', value)}
            />

            <BilingualField
              label="Ringkasan (Excerpt)"
              multiline
              rows={3}
              valueId={draft.excerpt_id}
              valueEn={draft.excerpt_en}
              onChangeId={(value) => set('excerpt_id', value)}
              onChangeEn={(value) => set('excerpt_en', value)}
              hint="Tampil di kartu artikel, cuplikan berita, dan SEO meta description."
            />

            <BilingualField
              label="Isi Artikel (Markdown Supported)"
              multiline
              rows={16}
              markdown
              valueId={draft.content_id}
              valueEn={draft.content_en}
              onChangeId={(value) => set('content_id', value)}
              onChangeEn={(value) => set('content_en', value)}
            />
          </div>

          {/* Publishing & Metadata Column (Right - 4 Cols) */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <div className="rounded-2xl border border-ink-200 bg-ink-50/50 p-5 space-y-5">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-ink-900 border-b border-ink-200 pb-2">
                Pengaturan Publikasi
              </h3>

              <SelectField
                label="Status Terbit"
                value={draft.status}
                onChange={(value) => set('status', value)}
                options={[
                  { value: 'draft', label: 'Draf (Simpan Lokal)' },
                  { value: 'published', label: 'Terbit (Publikasi)' },
                ]}
              />

              <SelectField
                label="Kategori"
                required
                value={String(draft.category_id)}
                onChange={(value) => set('category_id', Number(value))}
                options={categories.map((category) => ({
                  value: String(category.id),
                  label: category.name_id,
                }))}
              />

              <CheckboxField
                label="Jadikan Artikel Utama (Featured)"
                hint="Artikel utama akan tampil besar di bagian atas halaman Berita."
                checked={draft.featured}
                onChange={(checked) => set('featured', checked)}
              />
            </div>

            <div className="rounded-2xl border border-ink-200 bg-ink-50/50 p-5 space-y-5">
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-ink-900 border-b border-ink-200 pb-2">
                Gambar & Metadata
              </h3>

              <ImageField
                label="Gambar Utama Artikel"
                value={draft.image_url}
                onChange={(value) => set('image_url', value)}
                hint="Rasio 16:10 lanskap disarankan."
              />

              <TextField
                label="Penulis"
                value={draft.author}
                onChange={(value) => set('author', value)}
                placeholder="Contoh: Tim RAMS"
              />

              <TextField
                label="Estimasi Waktu Baca (Menit)"
                value={draft.read_time}
                onChange={(value) => set('read_time', value)}
                placeholder="Contoh: 5"
              />

              <TextField
                label="Tanggal Terbit"
                type="date"
                value={draft.published_at}
                onChange={(value) => set('published_at', value)}
              />
            </div>
          </div>
        </div>
      </AdminDrawer>
    </AdminShell>
  );
}

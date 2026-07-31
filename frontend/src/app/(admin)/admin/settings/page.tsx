'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';

import { AdminShell } from '@/components/admin/AdminShell';
import { AdminButton, AdminListState } from '@/components/admin/AdminUi';
import { BilingualField } from '@/components/admin/Fields';
import { ImageField } from '@/components/admin/ImageField';
import { adminRequest, type AdminSetting } from '@/lib/admin';

/**
 * Labels and grouping for the settings the seeder creates. Anything the API
 * returns that is not listed here still shows up under "Lainnya", so a new
 * backend key is never silently uneditable.
 */
const groups: Array<{ title: string; keys: Array<{ key: string; label: string; hint?: string; image?: boolean }> }> = [
  {
    title: 'Identitas',
    keys: [
      { key: 'company_name', label: 'Nama perusahaan' },
      { key: 'company_short', label: 'Nama singkat', hint: 'Dipakai pada logo dan judul tab.' },
      { key: 'tagline', label: 'Tagline' },
      { key: 'logo_url', label: 'Logo', image: true },
    ],
  },
  {
    title: 'Kontak',
    keys: [
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Telepon' },
      { key: 'whatsapp', label: 'WhatsApp', hint: 'Format angka saja, contoh: 6281234567890' },
      { key: 'address', label: 'Alamat' },
    ],
  },
  {
    title: 'Media Sosial',
    keys: [
      { key: 'linkedin', label: 'LinkedIn' },
      { key: 'instagram', label: 'Instagram' },
    ],
  },
  {
    title: 'Footer',
    keys: [
      { key: 'footer_note', label: 'Catatan footer' },
      { key: 'copyright', label: 'Teks hak cipta' },
    ],
  },
];

export default function AdminSettingsPage() {
  return (
    <AdminShell title="Pengaturan" description="Identitas perusahaan, kontak, dan teks footer.">
      <SettingsBody />
    </AdminShell>
  );
}

function SettingsBody() {
  const [settings, setSettings] = useState<Record<string, AdminSetting>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    adminRequest<AdminSetting[]>('/admin/settings')
      .then((list) => {
        const map: Record<string, AdminSetting> = {};
        for (const setting of list) map[setting.key] = setting;
        setSettings(map);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Gagal memuat pengaturan.'))
      .finally(() => setLoading(false));
  }, []);

  const update = (key: string, patch: Partial<AdminSetting>) =>
    setSettings((current) => {
      const existing = current[key] ?? { key, value_id: '', value_en: '' };
      return { ...current, [key]: { ...existing, ...patch, key } };
    });

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      await adminRequest('/admin/settings', {
        method: 'POST',
        body: Object.values(settings),
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan pengaturan.');
    } finally {
      setSaving(false);
    }
  };

  const state = <AdminListState loading={loading} error={error && !saving ? error : ''} empty={false} />;
  if (loading || (error && !saving)) return state;

  const known = new Set(groups.flatMap((group) => group.keys.map((entry) => entry.key)));
  const extras = Object.keys(settings).filter((key) => !known.has(key));

  return (
    <div className="flex flex-col gap-6">
      {saved ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-800">
          Pengaturan tersimpan.
        </p>
      ) : null}

      {groups.map((group) => (
        <section key={group.title} className="rounded-3xl border border-ink-200 bg-white p-6">
          <h2 className="mb-5 font-heading text-lg font-bold text-brand-950">{group.title}</h2>

          <div className="flex flex-col gap-5">
            {group.keys.map((entry) => {
              const setting = settings[entry.key];

              if (entry.image) {
                return (
                  <ImageField
                    key={entry.key}
                    label={entry.label}
                    value={setting?.value_id ?? ''}
                    onChange={(value) =>
                      update(entry.key, { value_id: value, value_en: value })
                    }
                    hint={entry.hint}
                  />
                );
              }

              return (
                <BilingualField
                  key={entry.key}
                  label={entry.label}
                  hint={entry.hint}
                  valueId={setting?.value_id ?? ''}
                  valueEn={setting?.value_en ?? ''}
                  onChangeId={(value) => update(entry.key, { value_id: value })}
                  onChangeEn={(value) => update(entry.key, { value_en: value })}
                />
              );
            })}
          </div>
        </section>
      ))}

      {extras.length > 0 ? (
        <section className="rounded-3xl border border-ink-200 bg-white p-6">
          <h2 className="mb-5 font-heading text-lg font-bold text-brand-950">Lainnya</h2>
          <div className="flex flex-col gap-5">
            {extras.map((key) => (
              <BilingualField
                key={key}
                label={key}
                valueId={settings[key]?.value_id ?? ''}
                valueEn={settings[key]?.value_en ?? ''}
                onChangeId={(value) => update(key, { value_id: value })}
                onChangeEn={(value) => update(key, { value_en: value })}
              />
            ))}
          </div>
        </section>
      ) : null}

      {error && saving === false ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}

      <div className="sticky bottom-0 flex justify-end border-t border-ink-200 bg-ink-100/80 py-4 backdrop-blur">
        <AdminButton onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Menyimpan…
            </>
          ) : (
            <>
              <Save className="h-4 w-4" aria-hidden="true" />
              Simpan pengaturan
            </>
          )}
        </AdminButton>
      </div>
    </div>
  );
}

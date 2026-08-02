'use client';

import { useEffect, useState } from 'react';

import { useAdminAuth } from '@/components/admin/AdminAuthProvider';
import { AdminDrawer } from '@/components/admin/AdminDrawer';
import { AdminShell } from '@/components/admin/AdminShell';
import {
  AddButton,
  AdminListState,
  AdminTable,
  RowActions,
  StatusBadge,
} from '@/components/admin/AdminUi';
import { CheckboxField, SelectField, TextField } from '@/components/admin/Fields';
import { useAdminCrud } from '@/components/admin/useAdminCrud';
import {
  fetchAuditLog,
  type AdminAuditEntry,
  type AdminWallet,
} from '@/lib/admin';

const emptyDraft = {
  address: '',
  label: '',
  role: 'editor' as 'admin' | 'editor',
  active: true,
};

type Draft = typeof emptyDraft;

function shortAddress(address: string) {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

export default function AdminWalletsPage() {
  const { user } = useAdminAuth();
  const crud = useAdminCrud<AdminWallet>({
    path: '/admin/wallets',
    getId: (item) => item.id,
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminWallet | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const [audit, setAudit] = useState<AdminAuditEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchAuditLog(50)
      .then((entries) => {
        if (active) setAudit(entries);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setAuditLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const startCreate = () => {
    setEditing(null);
    setDraft({ ...emptyDraft });
    crud.setSaveError('');
    setOpen(true);
  };

  const startEdit = (wallet: AdminWallet) => {
    setEditing(wallet);
    setDraft({
      address: wallet.address,
      label: wallet.label,
      role: wallet.role,
      active: wallet.active,
    });
    crud.setSaveError('');
    setOpen(true);
  };

  const isSelf = (wallet: AdminWallet) =>
    user?.wallet_address?.toLowerCase() === wallet.address.toLowerCase();

  if (user && user.role !== 'admin') {
    return (
      <AdminShell title="Wallet Akses" description="Manajemen wallet yang diizinkan masuk ke CMS.">
        <p
          role="alert"
          className="rounded-3xl border border-red-200 bg-red-50 px-6 py-5 text-sm font-medium text-red-700"
        >
          Halaman ini khusus admin. Hubungi admin lain untuk mengubah daftar wallet.
        </p>
      </AdminShell>
    );
  }

  const handleSubmit = async () => {
    const payload = {
      ...(draft.address ? { address: draft.address } : {}),
      ...(draft.label ? { label: draft.label } : {}),
      role: draft.role,
      active: draft.active,
    };
    const ok = await crud.save(payload, editing);
    if (ok) setOpen(false);
  };

  return (
    <AdminShell
      title="Wallet Akses"
      description="Daftar wallet Ethereum yang diizinkan masuk ke CMS. Hanya admin yang dapat mengubah daftar ini."
      actions={<AddButton label="Tambah wallet" onClick={startCreate} />}
    >
      <AdminListState
        loading={crud.loading}
        error={crud.error}
        empty={crud.items.length === 0}
        emptyLabel="Belum ada wallet terdaftar."
      />

      {!crud.loading && !crud.error && crud.items.length > 0 ? (
        <AdminTable headers={['Alamat', 'Label', 'Role', 'Status', 'Aksi']}>
          {crud.items.map((wallet) => {
            const self = isSelf(wallet);
            return (
              <tr key={wallet.id} className="hover:bg-brand-50/40">
                <td className="max-w-[14rem] px-5 py-4">
                  <span
                    className="block truncate font-mono text-xs text-ink-900"
                    title={wallet.address}
                  >
                    {wallet.address}
                  </span>
                  {self ? (
                    <span className="mt-0.5 inline-flex rounded-full bg-brand-100 px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wide text-brand-800">
                      Sesimu
                    </span>
                  ) : null}
                </td>
                <td className="px-5 py-4 text-ink-700">{wallet.label || '—'}</td>
                <td className="px-5 py-4">
                  <StatusBadge
                    label={wallet.role}
                    tone={wallet.role === 'admin' ? 'blue' : 'gray'}
                  />
                </td>
                <td className="px-5 py-4">
                  <StatusBadge
                    label={wallet.active ? 'Aktif' : 'Nonaktif'}
                    tone={wallet.active ? 'green' : 'amber'}
                  />
                </td>
                <td className="px-5 py-4">
                  <RowActions
                    onEdit={() => startEdit(wallet)}
                    onDelete={
                      self
                        ? undefined
                        : () => {
                            if (
                              window.confirm(
                                `Hapus wallet ${shortAddress(wallet.address)}? Pemiliknya langsung kehilangan akses.`,
                              )
                            ) {
                              void crud.remove(wallet);
                            }
                          }
                    }
                    deleting={crud.deletingId === wallet.id}
                  />
                </td>
              </tr>
            );
          })}
        </AdminTable>
      ) : null}

      <div className="mt-10">
        <h2 className="font-heading text-lg font-bold text-brand-950">Riwayat Masuk</h2>
        <p className="mt-1 text-sm text-ink-500">
          50 percobaan login terakhir dari semua wallet, termasuk yang gagal.
        </p>

        <div className="mt-4">
          {auditLoading ? (
            <div className="flex items-center justify-center rounded-3xl border border-ink-200 bg-white py-16 text-sm text-ink-500">
              Memuat…
            </div>
          ) : audit.length === 0 ? (
            <p className="rounded-3xl border border-dashed border-ink-200 bg-white py-16 text-center text-sm text-ink-500">
              Belum ada riwayat masuk.
            </p>
          ) : (
            <AdminTable headers={['Waktu', 'Alamat', 'Hasil', 'Alasan', 'IP']}>
              {audit.map((entry) => (
                <tr key={entry.id} className="hover:bg-brand-50/40">
                  <td className="whitespace-nowrap px-5 py-3.5 text-xs text-ink-600">
                    {new Date(entry.created_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="block max-w-[13rem] truncate font-mono text-xs text-ink-900" title={entry.address}>
                      {entry.address}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <StatusBadge
                      label={entry.outcome === 'success' ? 'Berhasil' : 'Gagal'}
                      tone={entry.outcome === 'success' ? 'green' : 'red'}
                    />
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-ink-600">{entry.reason}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-ink-600">{entry.ip}</td>
                </tr>
              ))}
            </AdminTable>
          )}
        </div>
      </div>

      <AdminDrawer
        open={open}
        title={editing ? 'Ubah wallet' : 'Tambah wallet'}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmit}
        saving={crud.saving}
        error={crud.saveError}
      >
        <TextField
          label="Alamat wallet (0x…)"
          required
          value={draft.address}
          onChange={(value) => set('address', value)}
          placeholder="0x…"
          className="[&_input]:font-mono [&_input]:text-xs"
        />

        <TextField
          label="Label"
          value={draft.label}
          onChange={(value) => set('label', value)}
          hint="Opsional, misalnya nama pemilik wallet."
        />

        <SelectField
          label="Role"
          value={draft.role}
          onChange={(value) => set('role', value as 'admin' | 'editor')}
          options={[
            { value: 'editor', label: 'Editor — mengelola konten' },
            { value: 'admin', label: 'Admin — mengelola konten & akses' },
          ]}
        />

        <CheckboxField
          label="Aktif"
          hint={
            editing && isSelf(editing)
              ? 'Wallet yang sedang digunakan tidak dapat dinonaktifkan.'
              : 'Wallet nonaktif langsung kehilangan akses, termasuk sesi yang masih berjalan.'
          }
          checked={draft.active}
          onChange={(checked) => set('active', checked)}
          disabled={Boolean(editing && isSelf(editing))}
        />
      </AdminDrawer>
    </AdminShell>
  );
}

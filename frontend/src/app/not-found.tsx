import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { NotFoundView } from '@/components/layout/NotFoundView';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';
import { localePath } from '@/lib/utils';

export const metadata: Metadata = {
  title: '404 — Halaman Tidak Ditemukan',
  robots: { index: false, follow: false },
};

export default async function RootNotFound() {
  const stored = cookies().get('NEXT_LOCALE')?.value ?? '';
  const locale = isLocale(stored) ? stored : defaultLocale;
  const t = await getTranslations({ locale: locale as Locale, namespace: 'error' });

  return (
    <NotFoundView
      title={t('notFoundTitle')}
      body={t('notFoundBody')}
      backHomeLabel={t('backHome')}
      homeHref={localePath(locale, '/')}
      exploreLabel={t('exploreSolutions')}
      exploreHref={localePath(locale, '/solutions')}
    />
  );
}

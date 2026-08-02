import { getTranslations } from 'next-intl/server';

import { NotFoundView } from '@/components/layout/NotFoundView';
import { defaultLocale, isLocale, type Locale } from '@/i18n/config';
import { localePath } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface Props {
  params?: { locale?: string };
}

export default async function LocaleNotFound({ params }: Props) {
  const locale = isLocale(params?.locale ?? '') ? (params?.locale as Locale) : defaultLocale;
  const t = await getTranslations({ locale, namespace: 'error' });

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

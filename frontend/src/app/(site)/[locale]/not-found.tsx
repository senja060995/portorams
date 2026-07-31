import { getTranslations } from 'next-intl/server';

import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { defaultLocale } from '@/i18n/config';
import { localePath } from '@/lib/utils';

export default async function LocaleNotFound() {
  const t = await getTranslations('error');

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-heading text-7xl font-bold text-brand-200">404</p>
      <h1 className="mt-6 text-display-md font-semibold">{t('notFoundTitle')}</h1>
      <p className="mt-4 max-w-md text-ink-700">{t('notFoundBody')}</p>
      <ButtonLink href={localePath(defaultLocale, '/')} size="lg" className="mt-9">
        {t('backHome')}
      </ButtonLink>
    </Container>
  );
}

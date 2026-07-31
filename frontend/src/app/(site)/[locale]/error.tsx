'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export default function LocaleError({ reset }: { error: Error; reset: () => void }) {
  const t = useTranslations('error');

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <h1 className="text-display-md font-semibold">{t('genericTitle')}</h1>
      <p className="mt-4 max-w-md text-ink-700">{t('genericBody')}</p>
      <Button type="button" onClick={reset} size="lg" className="mt-9">
        {t('retry')}
      </Button>
    </Container>
  );
}

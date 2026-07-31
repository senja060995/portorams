import { notFound } from 'next/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { Container } from '@/components/ui/Container';
import { RichText } from '@/components/ui/RichText';
import type { Locale } from '@/i18n/config';
import { getLegalPage } from '@/lib/api';
import { localeAlternates } from '@/lib/seo';
import { formatDate, localePath } from '@/lib/utils';

/** Both legal documents share this layout; only the slug differs. */
export async function renderLegalPage(locale: string, slug: string) {
  const typedLocale = locale as Locale;
  unstable_setRequestLocale(typedLocale);

  let page;
  try {
    page = await getLegalPage(slug, typedLocale);
  } catch {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <div className="bg-white py-14 lg:py-20">
      <Container>
        <Breadcrumb
          items={[
            { label: t('breadcrumbHome'), href: localePath(typedLocale, '/') },
            { label: page.title },
          ]}
          className="mb-10"
        />

        <h1 className="text-display-lg font-semibold">{page.title}</h1>

        {page.updated_at ? (
          <p className="mt-4 text-sm text-ink-500">
            {t('updatedAt')}: {formatDate(page.updated_at, typedLocale)}
          </p>
        ) : null}

        <div className="mt-12">
          <RichText content={page.body} />
        </div>
      </Container>
    </div>
  );
}

export async function legalMetadata(locale: string, slug: string) {
  try {
    const page = await getLegalPage(slug, locale as Locale);
    return {
      title: page.title,
      description: page.title,
      alternates: localeAlternates(locale as Locale, `/${slug}`),
    };
  } catch {
    return {};
  }
}

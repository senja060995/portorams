import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/Section';
import { SolutionsGrid } from '@/components/home/SolutionsGrid';
import { CtaBanner } from '@/components/home/CtaBanner';
import type { Locale } from '@/i18n/config';
import { getSolutions, getSections } from '@/lib/api';
import { localeAlternates } from '@/lib/seo';
import { localePath } from '@/lib/utils';

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  const t = await getTranslations({ locale, namespace: 'nav' });
  return {
    title: t('solutions'),
    alternates: localeAlternates(locale as Locale, '/solutions'),
  };
}

export default async function SolutionsIndexPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale as Locale);

  const [solutions, sections, t] = await Promise.all([
    getSolutions(locale as Locale),
    getSections(locale as Locale),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  const contactHref = localePath(locale as Locale, '/contact');

  return (
    <>
      <div className="bg-white py-16 sm:py-20 lg:py-28">
        <Container>
          <SectionHeader
            as="h1"
            eyebrow={sections.solutions_index?.eyebrow}
            title={sections.solutions_index?.title ?? ''}
            subtitle={sections.solutions_index?.subtitle}
            align="center"
            className="mx-auto max-w-3xl"
          />
        </Container>
      </div>

      <SolutionsGrid
        section={undefined}
        solutions={solutions}
        locale={locale as Locale}
        learnMoreLabel={t('learnMore')}
      />

      <CtaBanner
        section={{
          title: sections.solutions_index?.title ?? '',
          ctaLabel: t('contactUs'),
          ctaHref: contactHref,
        }}
        fallbackHref={contactHref}
      />
    </>
  );
}
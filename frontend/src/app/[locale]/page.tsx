import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { CtaBanner } from '@/components/home/CtaBanner';
import { Hero } from '@/components/home/Hero';
import { NewsPreview } from '@/components/home/NewsPreview';
import { PartnerMarquee } from '@/components/home/PartnerMarquee';
import { SolutionsGrid } from '@/components/home/SolutionsGrid';
import { ValueProps } from '@/components/home/ValueProps';
import type { Locale } from '@/i18n/config';
import {
  getArticles,
  getPartners,
  getSections,
  getSolutions,
  getValueProps,
} from '@/lib/api';
import { localePath } from '@/lib/utils';

export const revalidate = 300;

export default async function HomePage({
  params: { locale },
}: {
  params: { locale: Locale };
}) {
  unstable_setRequestLocale(locale);

  const [sections, partners, valueProps, solutions, news, t] = await Promise.all([
    getSections(locale),
    getPartners(),
    getValueProps(locale),
    getSolutions(locale),
    getArticles(locale, { limit: 3, page: 1 }),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  const contactHref = localePath(locale, '/contact');

  return (
    <>
      <Hero section={sections.home_hero} fallbackCtaHref={contactHref} />

      <PartnerMarquee section={sections.home_partners} partners={partners} />

      <ValueProps section={sections.home_value} items={valueProps} />

      <SolutionsGrid
        section={sections.home_solutions}
        solutions={solutions}
        locale={locale}
        learnMoreLabel={t('learnMore')}
      />

      <NewsPreview
        section={sections.home_news}
        articles={news.items}
        locale={locale}
        readMoreLabel={t('readMore')}
      />

      <CtaBanner
        section={{
          title: sections.home_cta?.title ?? '',
          imageUrl: sections.home_cta?.image_url,
          ctaLabel: sections.home_cta?.cta_label,
          ctaHref: sections.home_cta?.cta_href,
        }}
        fallbackHref={contactHref}
      />
    </>
  );
}

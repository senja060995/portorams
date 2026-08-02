import { notFound } from 'next/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { FeatureSticky } from '@/components/solution/FeatureSticky';
import { SolutionCta } from '@/components/solution/SolutionCta';
import { SolutionHero } from '@/components/solution/SolutionHero';
import { UseCasesGrid } from '@/components/solution/UseCasesGrid';
import type { Locale } from '@/i18n/config';
import { getSolution, getSolutions, getSections } from '@/lib/api';
import { absoluteUrl, localeAlternates } from '@/lib/seo';
import { localePath } from '@/lib/utils';

export async function generateStaticParams({ params: { locale } }: { params: { locale: string } }) {
  try {
    const solutions = await getSolutions(locale as Locale);
    return solutions.map((solution) => ({ locale, slug: solution.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  try {
    const solution = await getSolution(slug, locale as Locale);
    return {
      title: solution.name,
      description: solution.summary,
      alternates: localeAlternates(locale as Locale, `/solutions/${slug}`),
      openGraph: {
        title: solution.name,
        description: solution.summary,
        url: absoluteUrl(locale as Locale, `/solutions/${slug}`),
        ...(solution.hero_image_url ? { images: [solution.hero_image_url] } : {}),
      },
    };
  } catch {
    return {};
  }
}

export default async function SolutionDetailPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  unstable_setRequestLocale(locale as Locale);

  let solution;
  try {
    solution = await getSolution(slug, locale as Locale);
  } catch {
    notFound();
  }

  const [t] = await Promise.all([
    getTranslations({ locale, namespace: 'common' }),
  ]);

  const contactHref = localePath(locale as Locale, '/contact');

  const crumbs = [
    { label: t('breadcrumbHome'), href: localePath(locale as Locale, '/') },
    { label: solution.name },
  ];

  return (
    <>
      <SolutionHero
        eyebrow={solution.eyebrow}
        name={solution.name}
        title={solution.title}
        desc={solution.desc}
        imageUrl={solution.hero_image_url}
        ctaLabel={solution.cta_label}
        ctaHref={solution.cta_href || contactHref}
        crumbs={crumbs}
      />

      <FeatureSticky
        title={solution.feature_title}
        features={solution.features ?? []}
      />

      <UseCasesGrid
        title={solution.capability_title}
        imageUrl={solution.capability_image}
        items={solution.use_cases ?? []}
      />

      <SolutionCta
        title={solution.cta_title}
        label={solution.cta_label}
        href={solution.cta_href || contactHref}
        imageUrl={solution.cta_banner}
      />
    </>
  );
}
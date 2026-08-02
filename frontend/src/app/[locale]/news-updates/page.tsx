import { Suspense } from 'react';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { ArticleCard } from '@/components/news/ArticleCard';
import { ArticleGrid } from '@/components/news/ArticleGrid';
import { CategoryTabs } from '@/components/news/CategoryTabs';
import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/Section';
import type { Locale } from '@/i18n/config';
import { getArticleCategories, getArticles, getSections } from '@/lib/api';
import { localeAlternates } from '@/lib/seo';

const PAGE_SIZE = 6;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'nav' });
  return {
    title: t('news'),
    alternates: localeAlternates(locale as Locale, '/news-updates'),
  };
}

export default async function NewsIndexPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { category?: string };
}) {
  const typedLocale = locale as Locale;
  unstable_setRequestLocale(typedLocale);

  const activeCategory = searchParams.category ?? 'all';

  const [sections, categories, featured, tCommon, tNews] = await Promise.all([
    getSections(typedLocale),
    getArticleCategories(typedLocale),
    // The lead story is only shown on the unfiltered view, matching the reference.
    activeCategory === 'all'
      ? getArticles(typedLocale, { featured: true, limit: 1 })
      : Promise.resolve({ items: [], total: 0, page: 1, limit: 0, has_more: false }),
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'news' }),
  ]);

  const leadArticle = featured.items[0];

  const list = await getArticles(typedLocale, {
    limit: PAGE_SIZE,
    category: activeCategory === 'all' ? undefined : activeCategory,
    exclude: leadArticle?.slug,
  });

  return (
    <>
      <div className="bg-white pb-14 pt-14 lg:pb-20 lg:pt-20">
        <Container className="flex flex-col gap-10">
          <SectionHeader
            as="h1"
            title={sections.news_index?.title ?? ''}
            subtitle={sections.news_index?.subtitle}
            className="max-w-2xl"
          />

          <Suspense fallback={<div className="h-11" />}>
            <CategoryTabs
              categories={categories}
              activeSlug={activeCategory}
              allLabel={tNews('all')}
              ariaLabel={tNews('filterLabel')}
            />
          </Suspense>
        </Container>
      </div>

      {leadArticle ? (
        <div className="pb-14 lg:pb-20">
          <Container>
            <h2 className="mb-6 text-sm font-semibold uppercase tracking-[0.16em] text-brand-500">
              {tCommon('latestUpdate')}
            </h2>
            <ArticleCard
              article={leadArticle}
              locale={typedLocale}
              readMoreLabel={tCommon('readMore')}
              variant="feature"
              priority
            />
          </Container>
        </div>
      ) : null}

      <div className="bg-brand-50 py-16 lg:py-24">
        <Container>
          <ArticleGrid
            locale={typedLocale}
            initialArticles={list.items}
            initialHasMore={list.has_more}
            pageSize={PAGE_SIZE}
            category={activeCategory}
            excludeSlug={leadArticle?.slug}
            labels={{
              readMore: tCommon('readMore'),
              loadMore: tCommon('loadMore'),
              loading: tCommon('loading'),
              empty: tCommon('empty'),
            }}
          />
        </Container>
      </div>
    </>
  );
}

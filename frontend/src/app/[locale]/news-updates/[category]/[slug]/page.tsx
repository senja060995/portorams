import { notFound } from 'next/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';

import { ArticleCard } from '@/components/news/ArticleCard';
import { Breadcrumb } from '@/components/layout/Breadcrumb';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { RichText } from '@/components/ui/RichText';
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo/JsonLd';
import type { Locale } from '@/i18n/config';
import { getArticle, getArticles } from '@/lib/api';
import { absoluteUrl, localeAlternates, siteUrl } from '@/lib/seo';
import { formatDate, localePath } from '@/lib/utils';

export async function generateStaticParams({
  params: { locale },
}: {
  params: { locale: string };
}) {
  try {
    const list = await getArticles(locale as Locale, { limit: 100 });
    return list.items.map((article) => ({
      category: article.category_slug,
      slug: article.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params: { locale, category, slug },
}: {
  params: { locale: string; category: string; slug: string };
}) {
  try {
    const article = await getArticle(slug, locale as Locale);
    return {
      title: article.title,
      description: article.excerpt,
      alternates: localeAlternates(
        locale as Locale,
        `/news-updates/${category}/${slug}`,
      ),
      openGraph: {
        type: 'article',
        title: article.title,
        description: article.excerpt,
        url: absoluteUrl(locale as Locale, `/news-updates/${category}/${slug}`),
        publishedTime: article.published_at || undefined,
        images: article.image_url ? [article.image_url] : undefined,
      },
    };
  } catch {
    return {};
  }
}

export default async function ArticleDetailPage({
  params: { locale, category, slug },
}: {
  params: { locale: string; category: string; slug: string };
}) {
  const typedLocale = locale as Locale;
  unstable_setRequestLocale(typedLocale);

  let article;
  try {
    article = await getArticle(slug, typedLocale);
  } catch {
    notFound();
  }

  const [tCommon, tNews] = await Promise.all([
    getTranslations({ locale, namespace: 'common' }),
    getTranslations({ locale, namespace: 'news' }),
  ]);

  const backHref = localePath(typedLocale, '/news-updates');
  const breadcrumbs = [
    { label: tCommon('breadcrumbHome'), href: localePath(typedLocale, '/') },
    { label: tCommon('allArticles'), href: backHref },
    { label: article.category_name },
  ];

  const related = await getArticles(typedLocale, {
    category,
    limit: 3,
    exclude: slug,
  });

  const canonical = `${siteUrl}/${typedLocale}/news-updates/${category}/${slug}`;

  return (
    <>
      <ArticleJsonLd
        url={canonical}
        headline={article.title}
        description={article.excerpt}
        imageUrl={article.image_url}
        datePublished={article.published_at}
        author={article.author}
        publisher="PT Ragam Manfaat Sinergi"
        section={article.category_name}
      />

      <BreadcrumbJsonLd
        items={[
          { name: tCommon('breadcrumbHome'), url: `${siteUrl}/${typedLocale}` },
          { name: tCommon('allArticles'), url: `${siteUrl}${backHref}` },
          { name: article.title, url: canonical },
        ]}
      />

      <div className="bg-white pb-14 pt-16 lg:pb-20 lg:pt-20">
        <Container>
          <Breadcrumb items={breadcrumbs} className="mb-8" />

          <div className="grid gap-8 lg:grid-cols-[1fr_350px] lg:gap-16">
            <article>
              <div className="mb-8 flex flex-wrap items-center gap-3 text-sm font-semibold uppercase tracking-[0.12em] text-brand-500">
                {article.category_name ? (
                  <span className="rounded-full bg-brand-100 px-3 py-1">
                    {article.category_name}
                  </span>
                ) : null}
                <span>{formatDate(article.published_at, typedLocale)}</span>
                <span>{article.views.toLocaleString()} views</span>
                {article.read_time ? (
                  <span>{article.read_time} {tCommon('minRead')}</span>
                ) : null}
              </div>

              <h1 className="text-display-lg font-semibold">{article.title}</h1>

              {article.excerpt ? (
                <p className="mt-4 text-lg leading-relaxed text-ink-700">
                  {article.excerpt}
                </p>
              ) : null}

              {article.author ? (
                <p className="mt-8 text-sm text-ink-500">
                  {article.author}
                </p>
              ) : null}
            </article>

            <div>
              <ButtonLink
                href={backHref}
                variant="ghost"
                className="w-full justify-start"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {tNews('backToList')}
              </ButtonLink>
            </div>
          </div>
        </Container>
      </div>

      <div className="bg-white pb-16 lg:pb-24">
        <Container className="grid gap-12 lg:grid-cols-[1fr_350px] lg:gap-16">
          <RichText content={article.content ?? ''} className="lg:pb-8" />

          {related.items.length > 0 ? (
            <aside className="lg:mt-12">
              <h2 className="mb-6 text-lg font-semibold">{tNews('relatedTitle')}</h2>
              <ul className="flex flex-col gap-6">
                {related.items.map((item) => (
                  <li key={item.id}>
                    <ArticleCard
                      article={item}
                      locale={typedLocale}
                      readMoreLabel={tCommon('readMore')}
                      variant="compact"
                    />
                  </li>
                ))}
              </ul>
            </aside>
          ) : null}
        </Container>
      </div>
    </>
  );
}
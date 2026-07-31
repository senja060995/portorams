import type { MetadataRoute } from 'next';

import { locales } from '@/i18n/config';
import { getArticles, getProducts, getSolutions } from '@/lib/api';

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');

/** Static routes that exist for every locale. */
const staticPaths = [
  { path: '', priority: 1, changeFrequency: 'weekly' as const },
  { path: '/solutions', priority: 0.9, changeFrequency: 'monthly' as const },
  { path: '/news-updates', priority: 0.8, changeFrequency: 'weekly' as const },
  { path: '/contact', priority: 0.7, changeFrequency: 'yearly' as const },
  { path: '/privacy-policy', priority: 0.3, changeFrequency: 'yearly' as const },
  { path: '/terms-and-conditions', priority: 0.3, changeFrequency: 'yearly' as const },
];

/**
 * Builds the sitemap from live API content. Locale pairing is expressed through
 * per-page `alternates.languages` metadata rather than sitemap entries, which
 * this Next version does not support.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of staticPaths) {
      entries.push({
        url: `${siteUrl}/${locale}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
      });
    }

    // Content routes are best-effort: the sitemap should still build if the API
    // is briefly unavailable during a deploy.
    try {
      const solutions = await getSolutions(locale);
      for (const solution of solutions) {
        entries.push({
          url: `${siteUrl}/${locale}/solutions/${solution.slug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.8,
        });
      }
    } catch {
      // Skip solution URLs for this locale.
    }

    try {
      const products = await getProducts(locale);
      for (const product of products) {
        entries.push({
          url: `${siteUrl}/${locale}/produk/${product.slug}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.9,
        });
      }
    } catch {
      // Skip product URLs for this locale.
    }

    try {
      const articles = await getArticles(locale, { limit: 200 });
      for (const article of articles.items) {
        entries.push({
          url: `${siteUrl}/${locale}/news-updates/${article.category_slug}/${article.slug}`,
          lastModified: article.published_at ? new Date(article.published_at) : new Date(),
          changeFrequency: 'yearly',
          priority: 0.6,
        });
      }
    } catch {
      // Skip article URLs for this locale.
    }
  }

  return entries;
}

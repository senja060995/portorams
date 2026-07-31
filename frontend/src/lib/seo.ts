import type { Metadata } from 'next';

import { locales, type Locale } from '@/i18n/config';

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
  /\/$/,
  '',
);

/**
 * Canonical plus hreflang alternates for a locale-scoped path such as
 * '/solutions/pos-retail'. Every indexable page should spread this so the two
 * language versions point at each other.
 */
export function localeAlternates(locale: Locale, path = ''): Metadata['alternates'] {
  const clean = path && !path.startsWith('/') ? `/${path}` : path;

  return {
    canonical: `${siteUrl}/${locale}${clean}`,
    languages: Object.fromEntries(
      locales.map((code) => [code, `${siteUrl}/${code}${clean}`]),
    ),
  };
}

/** Absolute URL for a locale-scoped path, used by OpenGraph and JSON-LD. */
export function absoluteUrl(locale: Locale, path = '') {
  const clean = path && !path.startsWith('/') ? `/${path}` : path;
  return `${siteUrl}/${locale}${clean}`;
}

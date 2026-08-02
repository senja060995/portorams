import type { Locale } from '@/i18n/config';

interface OrganizationJsonLdProps {
  locale: Locale;
  siteUrl: string;
  name: string;
  tagline: string;
  logoUrl?: string;
  email?: string;
  phone?: string;
  address?: string;
  socials: Array<string | undefined>;
}

/**
 * Organization markup for the site root. Emitting it once in the locale layout
 * keeps a single authoritative company record instead of one per page.
 */
export function OrganizationJsonLd({
  locale,
  siteUrl,
  name,
  tagline,
  logoUrl,
  email,
  phone,
  address,
  socials,
}: OrganizationJsonLdProps) {
  const sameAs = socials.filter((value): value is string => Boolean(value));

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    url: `${siteUrl}/${locale}`,
    ...(tagline ? { description: tagline } : {}),
    ...(logoUrl ? { logo: logoUrl.startsWith('http') ? logoUrl : `${siteUrl}${logoUrl}` } : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
    ...(email || phone
      ? {
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            ...(email ? { email } : {}),
            ...(phone ? { telephone: phone } : {}),
            areaServed: 'ID',
            availableLanguage: ['id', 'en'],
          },
        }
      : {}),
    ...(address
      ? {
          address: {
            '@type': 'PostalAddress',
            streetAddress: address,
            addressCountry: 'ID',
          },
        }
      : {}),
  };

  return <JsonLd data={data} />;
}

interface ArticleJsonLdProps {
  url: string;
  headline: string;
  description: string;
  imageUrl?: string;
  datePublished?: string;
  author?: string;
  publisher: string;
  section?: string;
}

export function ArticleJsonLd({
  url,
  headline,
  description,
  imageUrl,
  datePublished,
  author,
  publisher,
  section,
}: ArticleJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline,
    description,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    ...(imageUrl ? { image: [imageUrl] } : {}),
    ...(datePublished ? { datePublished, dateModified: datePublished } : {}),
    ...(author ? { author: { '@type': 'Organization', name: author } } : {}),
    publisher: { '@type': 'Organization', name: publisher },
    ...(section ? { articleSection: section } : {}),
  };

  return <JsonLd data={data} />;
}

interface BreadcrumbJsonLdProps {
  items: Array<{ name: string; url?: string }>;
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      ...(item.url ? { item: item.url } : {}),
    })),
  };

  return <JsonLd data={data} />;
}

function JsonLd({ data }: { data: Record<string, unknown> }) {
  // JSON.stringify does not escape "</script>", which would let a CMS string
  // break out of the script tag and execute as markup. Escaping "<" keeps the
  // payload valid JSON while neutralising the closing-tag attack.
  const html = JSON.stringify(data).replace(/</g, '\\u003c');
  return (
    <script
      type="application/ld+json"
      // The payload is built from typed server data, never raw user input.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

import { notFound } from 'next/navigation';
import { unstable_setRequestLocale } from 'next-intl/server';

import { CtaBanner } from '@/components/home/CtaBanner';
import { AcronymValues } from '@/components/product/AcronymValues';
import { FeatureBlocks } from '@/components/product/FeatureBlocks';
import { ProductHero } from '@/components/product/ProductHero';
import type { Locale } from '@/i18n/config';
import { getProduct, getProducts } from '@/lib/api';
import { absoluteUrl, localeAlternates } from '@/lib/seo';
import { localePath } from '@/lib/utils';

export async function generateStaticParams({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const products = await getProducts(locale as Locale);
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  try {
    const product = await getProduct(slug, locale as Locale);
    return {
      title: `${product.name} — ${product.title}`,
      description: product.tagline,
      alternates: localeAlternates(locale as Locale, `/produk/${slug}`),
      openGraph: {
        title: `${product.name} — ${product.title}`,
        description: product.tagline,
        url: absoluteUrl(locale as Locale, `/produk/${slug}`),
        images: product.hero_image_url ? [product.hero_image_url] : undefined,
      },
    };
  } catch {
    return {};
  }
}

export default async function ProductPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  const typedLocale = locale as Locale;
  unstable_setRequestLocale(typedLocale);

  let product;
  try {
    product = await getProduct(slug, typedLocale);
  } catch {
    notFound();
  }

  const contactHref = localePath(typedLocale, '/contact');

  return (
    <>
      <ProductHero
        name={product.name}
        title={product.title}
        tagline={product.tagline}
        logoUrl={product.logo_url}
        heroImageUrl={product.hero_image_url}
        prompts={product.prompts ?? []}
        ctaLabel={product.cta_label}
        ctaHref={product.cta_href || contactHref}
      />

      <AcronymValues title={product.acronym_title} values={product.values ?? []} />

      <FeatureBlocks features={product.features ?? []} />

      <CtaBanner
        section={{
          title: product.cta_title,
          ctaLabel: product.cta_label,
          ctaHref: product.cta_href || contactHref,
        }}
        fallbackHref={contactHref}
      />
    </>
  );
}

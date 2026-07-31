import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { WhatsAppFab } from '@/components/layout/WhatsAppFab';
import { OrganizationJsonLd } from '@/components/seo/JsonLd';
import { isLocale, locales, type Locale } from '@/i18n/config';
import { getProducts, getSettings, getSolutions } from '@/lib/api';
import { localeAlternates } from '@/lib/seo';
import { localePath, whatsappLink } from '@/lib/utils';

import '@/app/globals.css';

const heading = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
});

const body = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isLocale(locale)) return {};

  const settings = await getSettings(locale);
  const name = settings.company_name ?? 'PT Ragam Manfaat Sinergi';
  const tagline = settings.tagline ?? '';

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${name} — ${tagline}`,
      template: `%s | ${settings.company_short ?? 'RAMS'}`,
    },
    description: tagline,
    alternates: localeAlternates(locale as Locale),
    openGraph: {
      type: 'website',
      siteName: name,
      title: `${name} — ${tagline}`,
      description: tagline,
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      url: `${siteUrl}/${locale}`,
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(locale)) notFound();

  const typedLocale = locale as Locale;
  unstable_setRequestLocale(typedLocale);

  const [messages, t, settings, solutions, products] = await Promise.all([
    getMessages(),
    getTranslations({ locale, namespace: 'nav' }),
    getSettings(typedLocale),
    getSolutions(typedLocale),
    getProducts(typedLocale),
  ]);

  const tCommon = await getTranslations({ locale, namespace: 'common' });
  const tFooter = await getTranslations({ locale, namespace: 'footer' });

  const flagship = products[0] ?? null;
  const companyName = settings.company_name ?? 'PT Ragam Manfaat Sinergi';
  const companyShort = settings.company_short ?? 'RAMS';

  const navigationLinks = [
    { label: t('home'), href: localePath(typedLocale, '/') },
    ...(flagship
      ? [{ label: flagship.name, href: localePath(typedLocale, `/produk/${flagship.slug}`) }]
      : []),
    { label: t('news'), href: localePath(typedLocale, '/news-updates') },
    { label: t('contact'), href: localePath(typedLocale, '/contact') },
  ];

  const solutionLinks = solutions.map((solution) => ({
    label: solution.name,
    href: localePath(typedLocale, `/solutions/${solution.slug}`),
  }));

  return (
    <html lang={typedLocale} className={`${heading.variable} ${body.variable}`}>
      <body className="flex min-h-screen flex-col">
        <NextIntlClientProvider locale={typedLocale} messages={messages}>
          <OrganizationJsonLd
            locale={typedLocale}
            siteUrl={siteUrl}
            name={companyName}
            tagline={settings.tagline ?? ''}
            logoUrl={settings.logo_url}
            email={settings.email}
            phone={settings.phone}
            address={settings.address}
            socials={[settings.linkedin, settings.instagram]}
          />

          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-brand-800 focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
          >
            {t('skipToContent')}
          </a>

          <Header
            locale={typedLocale}
            companyName={companyName}
            companyShort={companyShort}
            productLabel={flagship?.name ?? ''}
            productHref={flagship ? `/produk/${flagship.slug}` : null}
            solutions={solutions.map((solution) => ({
              slug: solution.slug,
              name: solution.name,
              summary: solution.summary,
            }))}
            labels={{
              home: t('home'),
              solutions: t('solutions'),
              news: t('news'),
              contact: t('contact'),
              openMenu: t('openMenu'),
              closeMenu: t('closeMenu'),
            }}
          />

          <main id="main" className="flex-1 pt-20">
            {children}
          </main>

          <Footer
            locale={typedLocale}
            companyName={companyName}
            companyShort={companyShort}
            footerNote={settings.footer_note ?? ''}
            copyright={settings.copyright ?? companyName}
            contact={{
              email: settings.email,
              phone: settings.phone,
              address: settings.address,
            }}
            social={{
              linkedin: settings.linkedin,
              instagram: settings.instagram,
            }}
            navigation={navigationLinks}
            solutions={solutionLinks}
            labels={{
              navigation: tFooter('navigation'),
              solutions: tFooter('solutions'),
              legal: tFooter('legal'),
              follow: tFooter('follow'),
              privacy: tFooter('privacy'),
              terms: tFooter('terms'),
            }}
          />

          <WhatsAppFab
            href={whatsappLink(settings.whatsapp)}
            label={tCommon('whatsapp')}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

import Image from 'next/image';
import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import { ApproachSteps } from '@/components/contact/ApproachSteps';
import { ContactForm } from '@/components/contact/ContactForm';
import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/Section';
import type { Locale } from '@/i18n/config';
import { getApproachSteps, getSections, getSettings, getSolutions } from '@/lib/api';
import { localeAlternates } from '@/lib/seo';
import { whatsappLink } from '@/lib/utils';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations({ locale, namespace: 'nav' });
  return {
    title: t('contact'),
    alternates: localeAlternates(locale as Locale, '/contact'),
  };
}

export default async function ContactPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const typedLocale = locale as Locale;
  unstable_setRequestLocale(typedLocale);

  const [sections, steps, settings, solutions, tCommon] = await Promise.all([
    getSections(typedLocale),
    getApproachSteps(typedLocale),
    getSettings(typedLocale),
    getSolutions(typedLocale),
    getTranslations({ locale, namespace: 'common' }),
  ]);

  const approach = sections.contact_approach;
  const formSection = sections.contact_form;
  const waHref = whatsappLink(settings.whatsapp);

  return (
    <>
      {approach?.image_url ? (
        <section className="relative isolate h-[18rem] overflow-hidden bg-brand-950 lg:h-[24rem]">
          <Image
            src={approach.image_url}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-hero-scrim" aria-hidden="true" />
        </section>
      ) : null}

      <ApproachSteps section={approach} steps={steps} headingLevel="h1" />

      <section className="bg-brand-50 py-16 sm:py-20 lg:py-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
            <div>
              <SectionHeader
                title={formSection?.title ?? ''}
                subtitle={formSection?.subtitle}
              />

              <ul className="mt-10 flex flex-col gap-5">
                {settings.email ? (
                  <ContactDetail icon={<Mail className="h-5 w-5" aria-hidden="true" />}>
                    <a href={`mailto:${settings.email}`} className="hover:text-brand-700">
                      {settings.email}
                    </a>
                  </ContactDetail>
                ) : null}

                {settings.phone ? (
                  <ContactDetail icon={<Phone className="h-5 w-5" aria-hidden="true" />}>
                    <a
                      href={`tel:${settings.phone.replace(/\s/g, '')}`}
                      className="hover:text-brand-700"
                    >
                      {settings.phone}
                    </a>
                  </ContactDetail>
                ) : null}

                {waHref ? (
                  <ContactDetail icon={<MessageCircle className="h-5 w-5" aria-hidden="true" />}>
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-brand-700"
                    >
                      WhatsApp
                    </a>
                  </ContactDetail>
                ) : null}

                {settings.address ? (
                  <ContactDetail icon={<MapPin className="h-5 w-5" aria-hidden="true" />}>
                    {settings.address}
                  </ContactDetail>
                ) : null}
              </ul>
            </div>

            <div className="rounded-4xl bg-white p-7 shadow-card sm:p-10">
              <ContactForm
                locale={typedLocale}
                solutionNames={solutions.map((solution) => solution.name)}
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function ContactDetail({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <li className="flex items-start gap-4 text-ink-700">
      <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-800">
        {icon}
      </span>
      <span className="pt-2.5 text-sm">{children}</span>
    </li>
  );
}

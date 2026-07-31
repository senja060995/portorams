import Link from 'next/link';
import { Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { Logo } from '@/components/layout/Logo';
import type { Locale } from '@/i18n/config';
import { localePath } from '@/lib/utils';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterProps {
  locale: Locale;
  companyName: string;
  companyShort: string;
  footerNote: string;
  copyright: string;
  contact: {
    email?: string;
    phone?: string;
    address?: string;
  };
  social: {
    linkedin?: string;
    instagram?: string;
  };
  navigation: FooterLink[];
  solutions: FooterLink[];
  labels: {
    navigation: string;
    solutions: string;
    legal: string;
    follow: string;
    privacy: string;
    terms: string;
  };
}

export function Footer({
  locale,
  companyName,
  companyShort,
  footerNote,
  copyright,
  contact,
  social,
  navigation,
  solutions,
  labels,
}: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-950 text-brand-100">
      <Container className="py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-5">
            <Logo
              locale={locale}
              companyName={companyName}
              companyShort={companyShort}
              invert
            />
            <p className="max-w-sm text-sm leading-relaxed text-brand-100/75">
              {footerNote}
            </p>

            <ul className="flex flex-col gap-3 text-sm text-brand-100/75">
              {contact.email ? (
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" aria-hidden="true" />
                  <a href={`mailto:${contact.email}`} className="hover:text-white">
                    {contact.email}
                  </a>
                </li>
              ) : null}
              {contact.phone ? (
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" aria-hidden="true" />
                  <a href={`tel:${contact.phone.replace(/\s/g, '')}`} className="hover:text-white">
                    {contact.phone}
                  </a>
                </li>
              ) : null}
              {contact.address ? (
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" aria-hidden="true" />
                  <span>{contact.address}</span>
                </li>
              ) : null}
            </ul>
          </div>

          <FooterColumn title={labels.navigation}>
            {navigation.map((link) => (
              <FooterItem key={link.href} href={link.href} label={link.label} />
            ))}
          </FooterColumn>

          <FooterColumn title={labels.solutions}>
            {solutions.map((link) => (
              <FooterItem key={link.href} href={link.href} label={link.label} />
            ))}
          </FooterColumn>

          <div className="flex flex-col gap-8">
            <FooterColumn title={labels.legal}>
              <FooterItem href={localePath(locale, '/privacy-policy')} label={labels.privacy} />
              <FooterItem href={localePath(locale, '/terms-and-conditions')} label={labels.terms} />
            </FooterColumn>

            {social.linkedin || social.instagram ? (
              <div>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-white">
                  {labels.follow}
                </h3>
                <div className="flex items-center gap-3">
                  {social.linkedin ? (
                    <SocialLink href={social.linkedin} label="LinkedIn">
                      <Linkedin className="h-4 w-4" aria-hidden="true" />
                    </SocialLink>
                  ) : null}
                  {social.instagram ? (
                    <SocialLink href={social.instagram} label="Instagram">
                      <Instagram className="h-4 w-4" aria-hidden="true" />
                    </SocialLink>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-14 border-t border-white/10 pt-6">
          <p className="text-xs text-brand-100/60">
            © {year} {copyright}
          </p>
        </div>
      </Container>
    </footer>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-white">
        {title}
      </h3>
      <ul className="flex flex-col gap-3">{children}</ul>
    </div>
  );
}

function FooterItem({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link href={href} className="text-sm text-brand-100/75 transition-colors hover:text-white">
        {label}
      </Link>
    </li>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-brand-100 transition-colors hover:border-white/40 hover:text-white"
    >
      {children}
    </a>
  );
}

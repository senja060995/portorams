import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import type { Locale } from '@/i18n/config';

/** Merges conditional class names and resolves Tailwind conflicts. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Prefixes an internal path with the active locale. */
export function localePath(locale: Locale, path = '/') {
  const clean = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${clean}`;
}

/**
 * Renders a title containing newlines as JSX line breaks. The CMS stores
 * intentional line breaks in headings, mirroring the reference design.
 */
export function splitTitleLines(title: string): string[] {
  return title.split('\n').filter((line) => line.trim() !== '');
}

const dateLocales: Record<Locale, string> = {
  id: 'id-ID',
  en: 'en-US',
};

/** Formats an ISO date (YYYY-MM-DD) for display. Returns '' when unparseable. */
export function formatDate(iso: string, locale: Locale): string {
  if (!iso) return '';
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(dateLocales[locale], {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

/** Builds a wa.me link from a digits-only phone number. */
export function whatsappLink(phone?: string, message?: string): string {
  const digits = (phone ?? '').replace(/\D/g, '');
  if (!digits) return '';
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** True when the URL points somewhere outside this site. */
export function isExternalHref(href: string): boolean {
  return /^(https?:)?\/\//.test(href) || href.startsWith('mailto:') || href.startsWith('tel:');
}

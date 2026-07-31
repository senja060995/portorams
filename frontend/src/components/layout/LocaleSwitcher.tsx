import Link from 'next/link';

import { Check } from 'lucide-react';

import type { Locale } from '@/i18n/config';
import { locales, localeNames } from '@/i18n/config';
import { cn } from '@/lib/utils';

interface LocaleSwitcherProps {
  locale: Locale;
  pathname: string;
  className?: string;
  align?: 'left' | 'right';
}

/**
 * Renders an inline switch between the site languages. Plain links keep it
 * server-friendly and indexable.
 */
export function LocaleSwitcher({
  locale,
  pathname,
  className,
  align = 'right',
}: LocaleSwitcherProps) {
  return (
    <nav
      aria-label="Language"
      className={cn(
        'flex items-center rounded-full border border-ink-200 bg-white p-1 text-sm font-medium',
        className,
      )}
    >
      {locales.map((code) => {
        const active = code === locale;
        const target = pathname.replace(/^\/(id|en)/, `/${code}`);
        return (
          <Link
            key={code}
            href={target === '' ? `/${code}` : target}
            lang={code}
            aria-current={active ? 'true' : undefined}
            className={cn(
              'flex items-center gap-1 rounded-full px-3 py-1.5 transition-colors',
              active ? 'bg-brand-800 text-white' : 'text-ink-500 hover:text-brand-800',
            )}
          >
            {code.toUpperCase()}
            {active ? (
              <Check className="h-3 w-3" aria-hidden="true" />
            ) : null}
            <span className="sr-only">{localeNames[code]}</span>
          </Link>
        );
      })}
    </nav>
  );
}

import Image from 'next/image';
import Link from 'next/link';

import type { Locale } from '@/i18n/config';
import { cn, localePath } from '@/lib/utils';

interface LogoProps {
  locale: Locale;
  companyName: string;
  companyShort: string;
  /** Renders light text for use over dark backgrounds. */
  invert?: boolean;
  className?: string;
}

/**
 * Brand lockup: mark plus wordmark. The mark comes from public/logo.svg so the
 * client can swap the file without touching code.
 */
export function Logo({
  locale,
  companyName,
  companyShort,
  invert = false,
  className,
}: LogoProps) {
  return (
    <Link
      href={localePath(locale, '/')}
      className={cn('group inline-flex items-center gap-3', className)}
      aria-label={companyName}
    >
      <Image
        src="/logo.svg"
        alt=""
        width={40}
        height={40}
        priority
        className="h-9 w-9 shrink-0 object-contain sm:h-10 sm:w-10 animate-blur-flip"
      />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-heading text-xl font-bold tracking-tight',
            invert ? 'text-white' : 'text-brand-900',
          )}
        >
          {companyShort}
        </span>
        <span
          className={cn(
            'mt-0.5 hidden text-[0.65rem] font-medium uppercase tracking-[0.14em] sm:block',
            invert ? 'text-brand-200' : 'text-ink-500',
          )}
        >
          {companyName}
        </span>
      </span>
    </Link>
  );
}

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: Crumb[];
  /** Light styling for use over dark hero imagery. */
  invert?: boolean;
  className?: string;
}

export function Breadcrumb({ items, invert = false, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className={cn(
                    'transition-colors',
                    invert ? 'text-white/70 hover:text-white' : 'text-ink-500 hover:text-brand-800',
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? 'page' : undefined}
                  className={cn(
                    'font-medium',
                    invert ? 'text-white' : 'text-brand-900',
                  )}
                >
                  {item.label}
                </span>
              )}

              {!last ? (
                <ChevronRight
                  className={cn('h-3.5 w-3.5', invert ? 'text-white/50' : 'text-ink-400')}
                  aria-hidden="true"
                />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

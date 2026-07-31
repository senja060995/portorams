'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

import type { ArticleCategory } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  categories: ArticleCategory[];
  activeSlug: string;
  allLabel: string;
  ariaLabel: string;
}

/**
 * Category filter rendered as real links with a ?category= query, so each
 * filtered view is shareable and works without JavaScript.
 */
export function CategoryTabs({
  categories,
  activeSlug,
  allLabel,
  ariaLabel,
}: CategoryTabsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildHref = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug === 'all') {
      params.delete('category');
    } else {
      params.set('category', slug);
    }
    params.delete('page');
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const tabs = [{ slug: 'all', name: allLabel }, ...categories];

  return (
    <nav aria-label={ariaLabel}>
      <ul className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:px-0">
        {tabs.map((tab) => {
          const active = tab.slug === activeSlug;
          return (
            <li key={tab.slug} className="shrink-0">
              <Link
                href={buildHref(tab.slug)}
                scroll={false}
                aria-current={active ? 'true' : undefined}
                className={cn(
                  'inline-flex rounded-full border px-5 py-2.5 text-sm font-medium transition-colors duration-200',
                  active
                    ? 'border-brand-800 bg-brand-800 text-white'
                    : 'border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-800',
                )}
              >
                {tab.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

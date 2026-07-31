import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import type { Locale } from '@/i18n/config';
import type { Article } from '@/lib/types';
import { cn, formatDate, localePath } from '@/lib/utils';

interface ArticleCardProps {
  article: Article;
  locale: Locale;
  readMoreLabel: string;
  /** 'feature' renders a horizontal layout for the lead story. */
  variant?: 'card' | 'feature' | 'compact';
  className?: string;
  priority?: boolean;
}

export function ArticleCard({
  article,
  locale,
  readMoreLabel,
  variant = 'card',
  className,
  priority = false,
}: ArticleCardProps) {
  const href = localePath(locale, `/news-updates/${article.category_slug}/${article.slug}`);
  const date = formatDate(article.published_at, locale);
  const feature = variant === 'feature';

  return (
    <Link
      href={href}
      className={cn(
        'group flex overflow-hidden rounded-4xl bg-white shadow-card transition-shadow duration-300 ease-smooth hover:shadow-card-hover',
        feature ? 'flex-col lg:flex-row' : 'h-full flex-col',
        className,
      )}
    >
      <div
        className={cn(
          'relative shrink-0 overflow-hidden bg-brand-100',
          feature ? 'aspect-[16/10] lg:aspect-auto lg:w-1/2' : 'aspect-[16/10] w-full',
        )}
      >
        {article.image_url ? (
          <Image
            src={article.image_url}
            alt=""
            fill
            priority={priority}
            sizes={
              feature
                ? '(min-width: 1024px) 50vw, 100vw'
                : '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
            }
            className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-[1.04]"
          />
        ) : null}
      </div>

      <div className={cn('flex flex-1 flex-col p-6', feature && 'lg:justify-center lg:p-10')}>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em]">
          {article.category_name ? (
            <span className="rounded-full bg-brand-100 px-3 py-1 text-brand-800">
              {article.category_name}
            </span>
          ) : null}
          {date ? <span className="text-ink-400">{date}</span> : null}
        </div>

        <h3
          className={cn(
            'mt-4 font-semibold text-brand-950 transition-colors group-hover:text-brand-700',
            feature ? 'text-display-md' : 'text-lg leading-snug',
          )}
        >
          {article.title}
        </h3>

        {variant !== 'compact' && article.excerpt ? (
          <p
            className={cn(
              'mt-3 leading-relaxed text-ink-700',
              feature ? 'line-clamp-4 text-base' : 'line-clamp-3 text-sm',
            )}
          >
            {article.excerpt}
          </p>
        ) : null}

        <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand-800">
          {readMoreLabel}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}

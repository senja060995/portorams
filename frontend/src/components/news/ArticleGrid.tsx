'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';

import { ArticleCard } from '@/components/news/ArticleCard';
import { Button } from '@/components/ui/Button';
import type { Locale } from '@/i18n/config';
import { getArticles } from '@/lib/api';
import type { Article } from '@/lib/types';

interface ArticleGridProps {
  locale: Locale;
  initialArticles: Article[];
  initialHasMore: boolean;
  pageSize: number;
  category: string;
  excludeSlug?: string;
  labels: {
    readMore: string;
    loadMore: string;
    loading: string;
    empty: string;
  };
}

/**
 * Article grid with incremental "load more". The first page arrives already
 * rendered from the server; only subsequent pages are fetched client-side.
 */
export function ArticleGrid({
  locale,
  initialArticles,
  initialHasMore,
  pageSize,
  category,
  excludeSlug,
  labels,
}: ArticleGridProps) {
  const [articles, setArticles] = useState(initialArticles);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  // Reset when the server sends a different filtered first page.
  useEffect(() => {
    setArticles(initialArticles);
    setPage(1);
    setHasMore(initialHasMore);
  }, [initialArticles, initialHasMore]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const nextPage = page + 1;

    try {
      const result = await getArticles(locale, {
        page: nextPage,
        limit: pageSize,
        category: category === 'all' ? undefined : category,
        exclude: excludeSlug,
      });

      startTransition(() => {
        setArticles((current) => {
          // Guard against duplicates if a request is retried.
          const seen = new Set(current.map((a) => a.id));
          return [...current, ...result.items.filter((a) => !seen.has(a.id))];
        });
        setPage(nextPage);
        setHasMore(result.has_more);
      });
    } finally {
      setLoading(false);
    }
  }, [category, excludeSlug, hasMore, loading, locale, page, pageSize]);

  if (articles.length === 0) {
    return (
      <p className="rounded-4xl border border-dashed border-ink-200 py-16 text-center text-ink-500">
        {labels.empty}
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-12">
      <ul className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {articles.map((article) => (
          <li key={article.id}>
            <ArticleCard
              article={article}
              locale={locale}
              readMoreLabel={labels.readMore}
            />
          </li>
        ))}
      </ul>

      {hasMore ? (
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={loadMore}
          disabled={loading || isPending}
        >
          {loading || isPending ? labels.loading : labels.loadMore}
        </Button>
      ) : null}
    </div>
  );
}

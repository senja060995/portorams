import { ArticleCard } from '@/components/news/ArticleCard';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/Section';
import type { Locale } from '@/i18n/config';
import type { Article, PageSection } from '@/lib/types';
import { localePath } from '@/lib/utils';

interface NewsPreviewProps {
  section?: PageSection;
  articles: Article[];
  locale: Locale;
  readMoreLabel: string;
}

/** Latest three articles, shown just above the closing CTA. */
export function NewsPreview({
  section,
  articles,
  locale,
  readMoreLabel,
}: NewsPreviewProps) {
  if (articles.length === 0) return null;

  return (
    <section className="bg-brand-50 py-16 sm:py-20 lg:py-28">
      <Container>
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          {section ? (
            <SectionHeader
              title={section.title}
              subtitle={section.subtitle}
              className="max-w-2xl"
            />
          ) : null}

          {section?.cta_label ? (
            <ButtonLink
              href={section.cta_href || localePath(locale, '/news-updates')}
              variant="secondary"
              className="shrink-0 self-start lg:self-auto"
            >
              {section.cta_label}
            </ButtonLink>
          ) : null}
        </div>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {articles.map((article) => (
            <li key={article.id}>
              <ArticleCard
                article={article}
                locale={locale}
                readMoreLabel={readMoreLabel}
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/Section';
import type { Locale } from '@/i18n/config';
import type { PageSection, Solution } from '@/lib/types';
import { cn, localePath } from '@/lib/utils';

interface SolutionsGridProps {
  section?: PageSection;
  solutions: Solution[];
  locale: Locale;
  learnMoreLabel: string;
}

/**
 * Homepage solution index. The first card spans two columns so the lineup reads
 * as a campaign rather than a flat list of equal tiles.
 */
export function SolutionsGrid({
  section,
  solutions,
  locale,
  learnMoreLabel,
}: SolutionsGridProps) {
  if (solutions.length === 0) return null;

  const [lead, ...rest] = solutions;

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-28">
      <Container>
        {section ? (
          <SectionHeader
            title={section.title}
            subtitle={section.subtitle}
            align="center"
            className="mx-auto mb-14 max-w-3xl"
          />
        ) : null}

        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          <li className="md:col-span-2">
            <SolutionCard
              solution={lead}
              locale={locale}
              learnMoreLabel={learnMoreLabel}
              variant="wide"
            />
          </li>

          {rest.map((solution) => (
            <li key={solution.id}>
              <SolutionCard
                solution={solution}
                locale={locale}
                learnMoreLabel={learnMoreLabel}
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function SolutionCard({
  solution,
  locale,
  learnMoreLabel,
  variant = 'tile',
}: {
  solution: Solution;
  locale: Locale;
  learnMoreLabel: string;
  variant?: 'wide' | 'tile';
}) {
  const wide = variant === 'wide';

  const solutionImages: Record<string, string> = {
    'erp-enterprise': 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1600&q=80',
    'pos-retail': 'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?w=1600&q=80',
    'ticketing-event': 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1600&q=80',
    'logistics-wms': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&q=80',
    'custom-software': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1600&q=80',
  };

  const imageUrl =
    solution.card_image_url ||
    solutionImages[solution.slug] ||
    'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1600&q=80';

  return (
    <Link
      href={localePath(locale, `/solutions/${solution.slug}`)}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-4xl bg-brand-950 text-white transition-shadow duration-300 ease-smooth hover:shadow-card-hover',
        wide ? 'min-h-[20rem] lg:min-h-[24rem]' : 'min-h-[22rem]',
      )}
    >
      <Image
        src={imageUrl}
        alt={solution.name}
        fill
        sizes={wide ? '(min-width: 768px) 66vw, 100vw' : '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'}
        className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-[1.05]"
      />

      <div
        className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/70 to-brand-950/20 transition-opacity duration-300 group-hover:opacity-90"
        aria-hidden="true"
      />

      <div className={cn('relative z-10 mt-auto p-7', wide && 'lg:p-10')}>
        {solution.eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-300">
            {solution.eyebrow}
          </p>
        ) : null}

        <h3
          className={cn(
            'mt-2 font-semibold text-white',
            wide ? 'text-display-md' : 'text-display-sm',
          )}
        >
          {solution.name}
        </h3>

        <p
          className={cn(
            'mt-3 line-clamp-2 leading-relaxed text-white/80',
            wide ? 'text-sm sm:text-base' : 'text-sm',
          )}
        >
          {solution.summary}
        </p>

        <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-300 transition-colors group-hover:text-brand-200">
          {learnMoreLabel}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 ease-smooth group-hover:translate-x-1"
            aria-hidden="true"
          />
        </span>
      </div>
    </Link>
  );
}

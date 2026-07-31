import Image from 'next/image';

import { Breadcrumb, type Crumb } from '@/components/layout/Breadcrumb';
import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { splitTitleLines } from '@/lib/utils';

interface SolutionHeroProps {
  eyebrow: string;
  name: string;
  title: string;
  desc: string;
  imageUrl: string;
  ctaLabel: string;
  ctaHref: string;
  crumbs: Crumb[];
}

/** Solution detail hero: breadcrumb, eyebrow + name, headline, copy, CTA. */
export function SolutionHero({
  eyebrow,
  name,
  title,
  desc,
  imageUrl,
  ctaLabel,
  ctaHref,
  crumbs,
}: SolutionHeroProps) {
  const lines = splitTitleLines(title);

  return (
    <section className="relative isolate overflow-hidden bg-brand-950">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      ) : null}

      <div className="absolute inset-0 bg-hero-scrim" aria-hidden="true" />

      <Container className="relative z-10 pb-16 pt-14 lg:pb-24 lg:pt-20">
        <Breadcrumb items={crumbs} invert className="mb-10" />

        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-sm font-medium text-white/70">{eyebrow}</p>
          ) : null}

          <p className="mt-1 text-display-sm font-semibold text-brand-300">{name}</p>

          <h1 className="mt-5 text-display-lg font-semibold text-white">
            {lines.map((line, index) => (
              <span key={index} className="block">
                {line}
              </span>
            ))}
          </h1>

          {desc ? (
            <p className="mt-6 text-base leading-relaxed text-white/85 sm:text-lg">
              {desc}
            </p>
          ) : null}

          {ctaLabel ? (
            <div className="mt-9">
              <ButtonLink href={ctaHref} variant="onDark" size="lg">
                {ctaLabel}
              </ButtonLink>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}

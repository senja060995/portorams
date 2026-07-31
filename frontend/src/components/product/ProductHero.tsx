import Image from 'next/image';

import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { Marquee } from '@/components/ui/Marquee';
import { splitTitleLines } from '@/lib/utils';

interface ProductHeroProps {
  name: string;
  title: string;
  tagline: string;
  logoUrl: string;
  heroImageUrl: string;
  prompts: string[];
  ctaLabel: string;
  ctaHref: string;
}

/**
 * Product hero: logo lockup, headline, tagline, then a marquee of example
 * questions the product answers.
 */
export function ProductHero({
  name,
  title,
  tagline,
  logoUrl,
  heroImageUrl,
  prompts,
  ctaLabel,
  ctaHref,
}: ProductHeroProps) {
  const lines = splitTitleLines(title);

  return (
    <section className="relative isolate overflow-hidden bg-brand-950 pb-16 pt-16 lg:pb-24 lg:pt-24">
      {heroImageUrl ? (
        <>
          <Image
            src={heroImageUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-brand-950/85 via-brand-950/75 to-brand-950"
            aria-hidden="true"
          />
        </>
      ) : null}

      <Container className="relative z-10">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={name}
              width={200}
              height={64}
              priority
              sizes="200px"
              className="mb-8 h-14 w-auto object-contain"
            />
          ) : (
            <p className="mb-6 font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
              {name}
            </p>
          )}

          <h1 className="text-display-lg font-semibold text-white">
            {lines.map((line, index) => (
              <span key={index} className="block">
                {line}
              </span>
            ))}
          </h1>

          {tagline ? (
            <p className="mt-6 text-base leading-relaxed text-white/80 sm:text-lg">{tagline}</p>
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

      {prompts.length > 0 ? (
        <div className="relative z-10 mt-14 flex flex-col gap-4">
          <Marquee durationSeconds={52}>
            {prompts.map((prompt, index) => (
              <span
                key={`a-${index}`}
                className="mx-2 whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm text-white/80 backdrop-blur-sm"
              >
                {prompt}
              </span>
            ))}
          </Marquee>

          {prompts.length > 2 ? (
            <Marquee durationSeconds={64} className="[&>div]:flex-row-reverse">
              {[...prompts].reverse().map((prompt, index) => (
                <span
                  key={`b-${index}`}
                  className="mx-2 whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm text-white/80 backdrop-blur-sm"
                >
                  {prompt}
                </span>
              ))}
            </Marquee>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

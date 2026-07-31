import Image from 'next/image';

import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

interface CtaProps {
  title: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

interface CtaBannerProps {
  section?: CtaProps;
  fallbackHref: string;
}

export function CtaBanner({ section, fallbackHref }: CtaBannerProps) {
  if (!section) return null;

  const lines = section.title.split('\n').filter(Boolean);

  return (
    <section className="bg-white pb-16 sm:pb-20 lg:pb-28">
      <Container>
        <div className="relative isolate overflow-hidden rounded-5xl bg-brand-900 px-7 py-16 sm:px-12 lg:px-16 lg:py-24">
          {section.imageUrl ? (
            <Image
              src={section.imageUrl}
              alt=""
              fill
              sizes="(min-width: 1280px) 1280px, 100vw"
              className="object-cover opacity-25"
            />
          ) : null}

          <div
            className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-900/85 to-brand-800/60"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="max-w-2xl text-display-lg font-semibold text-white">
              {lines.map((line, index) => (
                <span key={index} className="block">
                  {line}
                </span>
              ))}
            </h2>

            {section.ctaLabel ? (
              <ButtonLink
                href={section.ctaHref || fallbackHref}
                variant="onDark"
                size="lg"
                className="shrink-0"
              >
                {section.ctaLabel}
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
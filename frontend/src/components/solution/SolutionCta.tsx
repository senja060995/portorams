import Image from 'next/image';

import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { splitTitleLines } from '@/lib/utils';

interface SolutionCtaBannerProps {
  title: string;
  label: string;
  href: string;
  imageUrl: string;
}

/** Narrower CTA band specific to the solution detail page. */
export function SolutionCta({ title, label, href, imageUrl }: SolutionCtaBannerProps) {
  const lines = splitTitleLines(title);

  return (
    <section className="bg-white pb-16 sm:pb-20 lg:pb-28">
      <Container>
        <div className="relative isolate overflow-hidden rounded-5xl bg-brand-900 px-7 py-14 sm:px-12 lg:py-20">
          {imageUrl ? (
            <Image
              src={imageUrl}
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

          <div className="relative z-10 flex flex-col items-start gap-7 lg:flex-row lg:items-center lg:justify-between">
            <h2 className="max-w-2xl text-display-md font-semibold text-white">
              {lines.map((line, index) => (
                <span key={index} className="block">
                  {line}
                </span>
              ))}
            </h2>

            {label ? (
              <ButtonLink href={href} variant="onDark" size="lg" className="shrink-0">
                {label}
              </ButtonLink>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}
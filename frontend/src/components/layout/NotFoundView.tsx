import { ArrowRight, Compass, Home } from 'lucide-react';

import { ButtonLink } from '@/components/ui/Button';

interface NotFoundViewProps {
  title: string;
  body: string;
  backHomeLabel: string;
  homeHref: string;
  exploreLabel?: string;
  exploreHref?: string;
}

/**
 * Attractive 404 landing shared by the root and per-locale not-found pages.
 * Purely presentational: the callers resolve locale and translations.
 */
export function NotFoundView({
  title,
  body,
  backHomeLabel,
  homeHref,
  exploreLabel,
  exploreHref,
}: NotFoundViewProps) {
  return (
    <main className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-brand-soft px-4 py-24">
      {/* Ambient colour orbs for depth. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand-300/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-brand-400/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-200/60"
      />

      <div className="animate-fade-up relative z-10 mx-auto flex max-w-xl flex-col items-center text-center">
        {/* Rotating compass badge. */}
        <div className="relative mb-8 flex h-28 w-28 items-center justify-center" role="img" aria-label="404">
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-spin rounded-full border-2 border-dashed border-brand-400/60 [animation-duration:14s]"
          />
          <span aria-hidden="true" className="absolute inset-2.5 rounded-full border border-brand-200" />
          <Compass className="h-9 w-9 text-brand-700" aria-hidden="true" />
        </div>

        <p className="bg-brand-gradient bg-clip-text font-heading text-8xl font-bold leading-none tracking-tight text-transparent sm:text-9xl">
          404
        </p>

        <h1 className="mt-5 text-display-md font-semibold text-brand-950">{title}</h1>
        <p className="mt-3 max-w-md text-base leading-relaxed text-ink-700">{body}</p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href={homeHref} size="lg" variant="primary">
            <Home className="h-4 w-4" aria-hidden="true" />
            {backHomeLabel}
          </ButtonLink>
          {exploreLabel && exploreHref ? (
            <ButtonLink href={exploreHref} size="lg" variant="secondary">
              {exploreLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </main>
  );
}

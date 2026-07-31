'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import { Container } from '@/components/ui/Container';
import type { SolutionFeature } from '@/lib/types';
import { cn, splitTitleLines } from '@/lib/utils';

interface FeatureStickyProps {
  title: string;
  features: SolutionFeature[];
}

/**
 * Desktop: a sticky visual panel whose image tracks whichever copy block is in
 * view. Mobile: the same content as a plain stack, since sticky columns are not
 * useful on a narrow viewport.
 */
export function FeatureSticky({ title, features }: FeatureStickyProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const blockRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (features.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the vertical centre of the viewport.
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) {
          const index = blockRefs.current.indexOf(visible.target as HTMLDivElement);
          if (index !== -1) setActiveIndex(index);
        }
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    blockRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [features.length]);

  if (features.length === 0) return null;

  const titleLines = splitTitleLines(title);

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-28">
      <Container>
        {titleLines.length > 0 ? (
          <h2 className="mb-14 max-w-3xl text-display-lg font-semibold lg:mb-20">
            {titleLines.map((line, index) => (
              <span key={index} className="block">
                {line}
              </span>
            ))}
          </h2>
        ) : null}

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Sticky visual, desktop only. */}
          <div className="hidden lg:block">
            <div className="sticky top-32">
              <div className="relative aspect-[4/3] overflow-hidden rounded-4xl bg-brand-100">
                {features.map((feature, index) => (
                  <div
                    key={feature.id}
                    className={cn(
                      'absolute inset-0 transition-opacity duration-500 ease-smooth',
                      index === activeIndex ? 'opacity-100' : 'opacity-0',
                    )}
                    aria-hidden={index === activeIndex ? undefined : 'true'}
                  >
                    {feature.image_url ? (
                      <Image
                        src={feature.image_url}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-brand-gradient">
                        <span className="font-heading text-6xl font-bold text-white/25">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Progress rail mirroring the active block. */}
              <ol className="mt-8 flex items-center gap-2" aria-hidden="true">
                {features.map((feature, index) => (
                  <li
                    key={feature.id}
                    className={cn(
                      'h-1 flex-1 rounded-full transition-colors duration-300',
                      index === activeIndex ? 'bg-brand-800' : 'bg-ink-200',
                    )}
                  />
                ))}
              </ol>
            </div>
          </div>

          <ol className="flex flex-col gap-8 lg:gap-0">
            {features.map((feature, index) => (
              <li key={feature.id}>
                <div
                  ref={(node) => {
                    blockRefs.current[index] = node;
                  }}
                  className="lg:flex lg:min-h-[70vh] lg:flex-col lg:justify-center"
                >
                  {/* Inline visual for narrow viewports. */}
                  {feature.image_url ? (
                    <div className="relative mb-6 aspect-[16/10] overflow-hidden rounded-3xl bg-brand-100 lg:hidden">
                      <Image
                        src={feature.image_url}
                        alt=""
                        fill
                        sizes="100vw"
                        className="object-cover"
                      />
                    </div>
                  ) : null}

                  {feature.label ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-500">
                      {feature.label}
                    </p>
                  ) : null}

                  <h3 className="mt-3 text-display-sm font-semibold">{feature.title}</h3>

                  <p className="mt-4 max-w-xl leading-relaxed text-ink-700">{feature.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

import Image from 'next/image';

import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/Section';
import type { ApproachStep, PageSection } from '@/lib/types';

interface ApproachStepsProps {
  section?: PageSection;
  steps: ApproachStep[];
  /** The contact page uses this block as its top-level heading. */
  headingLevel?: 'h1' | 'h2';
}

/**
 * Numbered process steps. Each row alternates image side on desktop and stacks
 * on mobile, mirroring the reference layout.
 */
export function ApproachSteps({ section, steps, headingLevel = 'h2' }: ApproachStepsProps) {
  if (steps.length === 0) return null;

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-28">
      <Container>
        {section ? (
          <SectionHeader
            as={headingLevel}
            title={section.title}
            subtitle={section.subtitle}
            align="center"
            className="mx-auto mb-16 max-w-3xl"
          />
        ) : null}

        <ol className="flex flex-col gap-12 lg:gap-20">
          {steps.map((step, index) => {
            const reversed = index % 2 === 1;

            return (
              <li key={step.id} className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
                <div
                  className={
                    reversed
                      ? 'relative aspect-[4/3] overflow-hidden rounded-4xl bg-brand-100 lg:order-2'
                      : 'relative aspect-[4/3] overflow-hidden rounded-4xl bg-brand-100'
                  }
                >
                  {step.image_url ? (
                    <Image
                      src={step.image_url}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-brand-gradient">
                      <span
                        className="font-heading text-6xl font-bold text-white/30"
                        aria-hidden="true"
                      >
                        {step.number}
                      </span>
                    </div>
                  )}
                </div>

                <div className={reversed ? 'lg:order-1' : undefined}>
                  <p className="font-heading text-4xl font-bold text-brand-300">{step.number}</p>
                  <h3 className="mt-4 text-display-md font-semibold">{step.title}</h3>
                  <p className="mt-5 leading-relaxed text-ink-700">{step.desc}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}

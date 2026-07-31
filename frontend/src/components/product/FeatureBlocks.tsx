import Image from 'next/image';

import { Container } from '@/components/ui/Container';
import type { ProductFeature } from '@/lib/types';
import { cn } from '@/lib/utils';

interface FeatureBlocksProps {
  features: ProductFeature[];
}

/** Large alternating image / copy rows. Direction flips on each row. */
export function FeatureBlocks({ features }: FeatureBlocksProps) {
  if (features.length === 0) return null;

  return (
    <section className="bg-brand-50 py-16 sm:py-20 lg:py-28">
      <Container className="flex flex-col gap-16 lg:gap-24">
        {features.map((feature, index) => {
          const reversed = index % 2 === 1;

          return (
            <article
              key={feature.id}
              className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16"
            >
              <div
                className={cn(
                  'relative aspect-[4/3] overflow-hidden rounded-4xl bg-brand-100',
                  reversed && 'lg:order-2',
                )}
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
                    <span
                      className="font-heading text-6xl font-bold text-white/25"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                )}
              </div>

              <div className={cn(reversed && 'lg:order-1')}>
                <h3 className="text-display-md font-semibold">{feature.title}</h3>
                <p className="mt-5 leading-relaxed text-ink-700">{feature.desc}</p>
              </div>
            </article>
          );
        })}
      </Container>
    </section>
  );
}

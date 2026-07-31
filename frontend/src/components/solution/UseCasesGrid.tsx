import Image from 'next/image';

import { Container } from '@/components/ui/Container';
import type { SolutionUseCase } from '@/lib/types';

interface UseCasesGridProps {
  title: string;
  imageUrl: string;
  items: SolutionUseCase[];
}

/** Two-over-two grid of use-case cards. */
export function UseCasesGrid({ title, imageUrl, items }: UseCasesGridProps) {
  if (items.length === 0) return null;

  return (
    <section className="relative isolate overflow-hidden bg-brand-50 py-16 sm:py-20 lg:py-28">
      {imageUrl ? (
        <>
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-[0.07]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50 via-brand-50/80 to-brand-50" aria-hidden="true" />
        </>
      ) : null}

      <Container className="relative z-10">
        <h2 className="mx-auto mb-14 max-w-3xl text-center text-display-lg font-semibold">
          {title}
        </h2>

        <ul className="grid gap-6 sm:grid-cols-2 lg:gap-8">
          {items.map((item) => (
            <li key={item.id}>
              <div className="rounded-4xl bg-white p-8 shadow-card transition-shadow duration-300 ease-smooth hover:shadow-card-hover">
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-700">{item.desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>

      {items.length > 0 ? (
        <div className="mt-16 flex justify-center gap-3" aria-hidden="true">
          {Array.from({ length: Math.min(items.length, 4) }).map((_, i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-brand-300/60"
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
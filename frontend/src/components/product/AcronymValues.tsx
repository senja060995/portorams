import { Container } from '@/components/ui/Container';
import type { ProductValue } from '@/lib/types';

interface AcronymValuesProps {
  title: string;
  values: ProductValue[];
}

/** Spells out the product name, one letter and principle per column. */
export function AcronymValues({ title, values }: AcronymValuesProps) {
  if (values.length === 0) return null;

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-28">
      <Container>
        {title ? (
          <h2 className="mx-auto mb-14 max-w-2xl text-center text-display-lg font-semibold">
            {title}
          </h2>
        ) : null}

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {values.map((value) => (
            <li
              key={value.id}
              className="flex flex-col rounded-4xl border border-ink-200 p-7 transition-colors duration-300 ease-smooth hover:border-brand-300 hover:bg-brand-50"
            >
              <span
                className="font-heading text-5xl font-bold leading-none text-brand-500"
                aria-hidden="true"
              >
                {value.letter}
              </span>
              <h3 className="mt-5 text-lg font-semibold">{value.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">{value.desc}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

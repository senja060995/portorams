import Image from 'next/image';

import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/Section';
import type { PageSection, ValueProp } from '@/lib/types';
import { splitTitleLines } from '@/lib/utils';

interface ValuePropsProps {
  section?: PageSection;
  items: ValueProp[];
}

/** Three-card "why work with us" band over a soft tinted background. */
export function ValueProps({ section, items }: ValuePropsProps) {
  if (items.length === 0) return null;

  return (
    <section className="relative isolate overflow-hidden bg-brand-50 py-16 sm:py-20 lg:py-28">
      {section?.image_url ? (
        <>
          <Image
            src={section.image_url}
            alt=""
            fill
            sizes="100vw"
            className="object-cover opacity-[0.07]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-brand-50 via-brand-50/80 to-brand-50" aria-hidden="true" />
        </>
      ) : null}

      <Container className="relative z-10">
        {section ? (
          <SectionHeader
            title={section.title}
            subtitle={section.subtitle}
            align="center"
            className="mx-auto mb-14 max-w-3xl"
          />
        ) : null}

        <ul className="grid gap-6 md:grid-cols-3 lg:gap-8">
          {items.map((item) => {
            const titleLines = splitTitleLines(item.title);
            return (
              <li
                key={item.id}
                className="flex flex-col items-start rounded-4xl bg-white p-8 shadow-card transition-shadow duration-300 ease-smooth hover:shadow-card-hover"
              >
                {item.icon_url ? (
                  <Image
                    src={item.icon_url}
                    alt=""
                    width={64}
                    height={64}
                    sizes="64px"
                    className="mb-6 h-14 w-14 object-contain"
                  />
                ) : (
                  <span
                    className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-lg font-bold text-white"
                    aria-hidden="true"
                  >
                    {titleLines[0]?.charAt(0) ?? '•'}
                  </span>
                )}

                <h3 className="text-display-sm font-semibold">
                  {titleLines.map((line, index) => (
                    <span key={index} className="block">
                      {line}
                    </span>
                  ))}
                </h3>

                <p className="mt-4 text-sm leading-relaxed text-ink-700">{item.desc}</p>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}

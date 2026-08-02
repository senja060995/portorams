import Image from 'next/image';

import { ButtonLink } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import type { PageSection } from '@/lib/types';
import { splitTitleLines } from '@/lib/utils';

interface HeroProps {
  section?: PageSection;
  fallbackCtaHref: string;
}

/** Full-bleed dark blue asix.id-style hero with centered typography and electric blue CTA. */
export function Hero({ section, fallbackCtaHref }: HeroProps) {
  if (!section) return null;

  const defaultTitle = 'Sistem Digital Presisi\nuntuk Bisnis Indonesia';
  const defaultSubtitle = 'RAMS mengembangkan ERP, POS, dan perangkat lunak kustom yang benar-benar digunakan di lapangan — dibangun dari tantangan nyata, bukan dari klaim teoritis.';

  const rawTitle = section.title && section.title.trim() !== '' ? section.title : defaultTitle;
  const rawSubtitle = section.subtitle && section.subtitle.trim() !== '' ? section.subtitle : defaultSubtitle;

  const lines = splitTitleLines(rawTitle);

  function renderTitleLine(line: string) {
    const parts = line.split(/(Indonesia)/);
    return parts.map((part, i) => {
      if (part === 'Indonesia') {
        return (
          <span key={i} className="animate-merah-type inline-block">
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  }

  return (
    <section className="relative isolate flex flex-col justify-center overflow-hidden bg-[#020817] pt-20 pb-8 sm:pt-24 sm:pb-10 lg:pt-28 lg:pb-12">
      {/* Glossy Dark Blue Ambient Gradient Overlays */}
      <div
        className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_100%_70%_at_50%_-10%,rgba(0,130,255,0.28),rgba(2,8,23,0))]"
        aria-hidden="true"
      />
      <div
        className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-600/15 blur-[130px] pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[140px] pointer-events-none"
        aria-hidden="true"
      />

      {section.image_url ? (
        <Image
          src={section.image_url}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-15 mix-blend-luminosity"
        />
      ) : null}

      <Container className="relative z-10 flex flex-col items-center text-center">
        <div className="flex max-w-4xl flex-col items-center text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.14]">
            {lines.map((line, index) => (
              <span key={index} className="block">
                {renderTitleLine(line)}
              </span>
            ))}
          </h1>

          {rawSubtitle ? (
            <p className="mt-4 sm:mt-5 max-w-2xl text-center text-sm leading-relaxed text-white/85 sm:text-base lg:text-lg font-normal">
              {rawSubtitle}
            </p>
          ) : null}

          <div className="mt-6 sm:mt-8">
            <ButtonLink
              href={section.cta_href || fallbackCtaHref}
              className="rounded-full px-7 py-3 bg-[#0082FF] hover:bg-[#0070E0] text-white font-medium text-sm sm:text-base shadow-lg shadow-blue-500/30 transition-all duration-300 transform hover:scale-[1.03] active:scale-[0.98]"
            >
              {section.cta_label || 'Jelajahi Solusi Kami'}
            </ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}


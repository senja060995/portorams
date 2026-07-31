import Image from 'next/image';

import { Container } from '@/components/ui/Container';
import { Marquee } from '@/components/ui/Marquee';
import type { PageSection, Partner } from '@/lib/types';

interface PartnerMarqueeProps {
  section?: PageSection;
  partners: Partner[];
}

/**
 * Scrolling strip of client logos matching asix.id dark blue styling.
 */
export function PartnerMarquee({ section, partners }: PartnerMarqueeProps) {
  const titleText = section?.title || 'Trusted Clients & Partners';

  // Fallback partner chips if partners array is empty
  const displayPartners = partners.length > 0 ? partners : [
    { id: 1, name: 'BSD CITY', logo_url: '', active: true, order: 1 },
    { id: 2, name: 'BANK SINARMAS', logo_url: '', active: true, order: 2 },
    { id: 3, name: 'PYRIDAM FARMA', logo_url: '', active: true, order: 3 },
    { id: 4, name: 'SM+', logo_url: '', active: true, order: 4 },
    { id: 5, name: 'SINAR PRIMERA', logo_url: '', active: true, order: 5 },
    { id: 6, name: 'SM', logo_url: '', active: true, order: 6 },
    { id: 7, name: 'SIDOMULYO ADVERTISING', logo_url: '', active: true, order: 7 },
    { id: 8, name: 'TIXNOVA', logo_url: '', active: true, order: 8 },
  ];

  return (
    <section className="bg-[#020817] pt-2 pb-10 sm:pt-4 sm:pb-12 lg:pt-6 lg:pb-14 text-white border-b border-white/10">
      <Container>
        <p className="mb-5 sm:mb-6 text-center text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
          {titleText}
        </p>
      </Container>

      <Marquee durationSeconds={36}>
        {displayPartners.map((partner) => (
          <div
            key={partner.id}
            className="flex h-16 shrink-0 items-center justify-center px-8 sm:px-12"
          >
            {partner.logo_url ? (
              <Image
                src={partner.logo_url}
                alt={partner.name}
                width={160}
                height={64}
                sizes="160px"
                className="h-10 w-auto object-contain opacity-70 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
              />
            ) : (
              <span className="whitespace-nowrap rounded-full border border-white/15 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white/80 backdrop-blur-md hover:border-blue-500/50 hover:text-white transition-all">
                {partner.name}
              </span>
            )}
          </div>
        ))}
      </Marquee>
    </section>
  );
}


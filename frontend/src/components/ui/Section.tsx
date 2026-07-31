import { cn } from '@/lib/utils';

type Tone = 'white' | 'soft' | 'brand';

const toneClasses: Record<Tone, string> = {
  white: 'bg-white',
  soft: 'bg-brand-50',
  brand: 'bg-brand-900 text-brand-100',
};

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  tone?: Tone;
  /** Removes the default vertical rhythm when a section manages its own spacing. */
  flush?: boolean;
}

export function Section({
  tone = 'white',
  flush = false,
  className,
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn(
        toneClasses[tone],
        !flush && 'py-16 sm:py-20 lg:py-28',
        className,
      )}
      {...props}
    >
      {children}
    </section>
  );
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  invert?: boolean;
  className?: string;
  /**
   * Heading level for the title. Index pages pass 'h1' so each page keeps
   * exactly one top-level heading; in-page sections keep the default 'h2'.
   */
  as?: 'h1' | 'h2';
}

/** Shared eyebrow + headline + supporting copy block. */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  invert = false,
  className,
  as: Heading = 'h2',
}: SectionHeaderProps) {
  const lines = title.split('\n').filter(Boolean);

  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            'text-sm font-semibold uppercase tracking-[0.16em]',
            invert ? 'text-brand-300' : 'text-brand-500',
          )}
        >
          {eyebrow}
        </p>
      ) : null}

      <Heading
        className={cn(
          'text-display-lg font-semibold',
          invert && 'text-white',
        )}
      >
        {lines.map((line, index) => (
          <span key={index} className="block">
            {line}
          </span>
        ))}
      </Heading>

      {subtitle ? (
        <p
          className={cn(
            'max-w-3xl text-base leading-relaxed sm:text-lg',
            invert ? 'text-brand-100/85' : 'text-ink-700',
          )}
        >
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

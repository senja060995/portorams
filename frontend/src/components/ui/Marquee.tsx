import { cn } from '@/lib/utils';

interface MarqueeProps {
  children: React.ReactNode;
  /** Seconds for one full loop. */
  durationSeconds?: number;
  className?: string;
  itemClassName?: string;
}

/**
 * CSS-only infinite marquee. The track is duplicated and translated by -50%,
 * so the seam is invisible. Pure CSS keeps this a server component and it
 * freezes automatically under prefers-reduced-motion.
 */
export function Marquee({
  children,
  durationSeconds = 40,
  className,
  itemClassName,
}: MarqueeProps) {
  return (
    <div className={cn('marquee-mask group relative w-full overflow-hidden', className)}>
      <div
        className="flex w-max animate-marquee group-hover:[animation-play-state:paused]"
        style={{ ['--marquee-duration' as string]: `${durationSeconds}s` }}
      >
        <div className={cn('flex shrink-0 items-center', itemClassName)}>{children}</div>
        <div className={cn('flex shrink-0 items-center', itemClassName)} aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

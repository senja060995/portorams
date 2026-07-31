import Link from 'next/link';

import { cn, isExternalHref } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'onDark';
type Size = 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 ease-smooth disabled:cursor-not-allowed disabled:opacity-60';

const variants: Record<Variant, string> = {
  primary: 'bg-brand-800 text-white hover:bg-brand-700 hover:shadow-card-hover',
  secondary: 'border border-brand-800 text-brand-800 hover:bg-brand-800 hover:text-white',
  ghost: 'text-brand-800 hover:text-brand-500',
  onDark: 'bg-white text-brand-900 hover:bg-brand-100',
};

const sizes: Record<Size, string> = {
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
};

interface ButtonBaseProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

interface ButtonLinkProps extends ButtonBaseProps {
  href: string;
}

/** Button-styled link. Automatically hardens external links. */
export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  className,
  children,
}: ButtonLinkProps) {
  const classes = cn(base, variants[variant], sizes[size], className);

  if (isExternalHref(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

interface ButtonProps
  extends ButtonBaseProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> {}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

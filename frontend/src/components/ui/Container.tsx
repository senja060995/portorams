import { cn } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: 'div' | 'section' | 'header' | 'footer' | 'nav' | 'article';
}

/** Centers content at the shared max width with responsive gutters. */
export function Container({
  as: Tag = 'div',
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <Tag className={cn('mx-auto w-full max-w-content px-5 sm:px-8 lg:px-12', className)} {...props}>
      {children}
    </Tag>
  );
}

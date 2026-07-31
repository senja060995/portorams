'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { LocaleSwitcher } from '@/components/layout/LocaleSwitcher';
import { Logo } from '@/components/layout/Logo';
import type { Locale } from '@/i18n/config';
import { cn, localePath } from '@/lib/utils';

export interface HeaderLink {
  label: string;
  href: string;
}

export interface HeaderSolution {
  slug: string;
  name: string;
  summary: string;
}

interface HeaderProps {
  locale: Locale;
  companyName: string;
  companyShort: string;
  productLabel: string;
  productHref: string | null;
  solutions: HeaderSolution[];
  labels: {
    home: string;
    solutions: string;
    news: string;
    contact: string;
    openMenu: string;
    closeMenu: string;
  };
}

export function Header({
  locale,
  companyName,
  companyShort,
  productLabel,
  productHref,
  solutions,
  labels,
}: HeaderProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const solutionsRef = useRef<HTMLDivElement>(null);

  // Collapse every overlay when the route changes.
  useEffect(() => {
    setMobileOpen(false);
    setSolutionsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the desktop dropdown on outside click or Escape.
  useEffect(() => {
    if (!solutionsOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!solutionsRef.current?.contains(event.target as Node)) {
        setSolutionsOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSolutionsOpen(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [solutionsOpen]);

  // Prevent background scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const isActive = (href: string) => {
    const full = localePath(locale, href);
    return href === '/' ? pathname === full : pathname.startsWith(full);
  };

  const primaryLinks: HeaderLink[] = [
    { label: labels.home, href: '/' },
    ...(productHref ? [{ label: productLabel, href: productHref }] : []),
  ];

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-smooth border-b border-white/10',
        scrolled || mobileOpen
          ? 'bg-[#020817]/95 shadow-xl backdrop-blur-md'
          : 'bg-[#020817]/80 backdrop-blur-md',
      )}
    >
      <Container className="flex h-20 items-center justify-between gap-6">
        <Logo locale={locale} companyName={companyName} companyShort={companyShort} invert={true} />

        <nav aria-label="Primary" className="hidden items-center gap-1.5 lg:flex">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={localePath(locale, link.href)}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-medium transition-all',
                isActive(link.href)
                  ? 'text-white bg-white/15'
                  : 'text-white/80 hover:text-white hover:bg-white/10',
              )}
            >
              {link.label}
            </Link>
          ))}

          {solutions.length > 0 ? (
            <div ref={solutionsRef} className="relative">
              <button
                type="button"
                onClick={() => setSolutionsOpen((open) => !open)}
                aria-expanded={solutionsOpen}
                aria-haspopup="true"
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all',
                  isActive('/solutions')
                    ? 'text-white bg-white/15'
                    : 'text-white/80 hover:text-white hover:bg-white/10',
                )}
              >
                {labels.solutions}
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-200',
                    solutionsOpen && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </button>

              {solutionsOpen ? (
                <div className="absolute left-1/2 top-full z-50 mt-3 w-[26rem] -translate-x-1/2 overflow-hidden rounded-3xl border border-white/15 bg-[#0b1329] p-2 shadow-2xl backdrop-blur-xl">
                  {solutions.map((solution) => (
                    <Link
                      key={solution.slug}
                      href={localePath(locale, `/solutions/${solution.slug}`)}
                      className="block rounded-2xl px-4 py-3 transition-colors hover:bg-white/10"
                    >
                      <span className="block text-sm font-semibold text-white">
                        {solution.name}
                      </span>
                      <span className="mt-1 block line-clamp-2 text-xs leading-relaxed text-white/70">
                        {solution.summary}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <Link
            href={localePath(locale, '/news-updates')}
            aria-current={isActive('/news-updates') ? 'page' : undefined}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-medium transition-all',
              isActive('/news-updates')
                ? 'text-white bg-white/15'
                : 'text-white/80 hover:text-white hover:bg-white/10',
            )}
          >
            {labels.news}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher locale={locale} pathname={pathname} className="hidden sm:flex" />

          <Link
            href={localePath(locale, '/contact')}
            className="hidden rounded-full border border-white/30 bg-white/5 px-6 py-2.5 text-sm font-medium text-white transition-all hover:border-white hover:bg-white hover:text-slate-950 lg:inline-flex"
          >
            {labels.contact}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileOpen ? labels.closeMenu : labels.openMenu}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white lg:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </Container>

      {mobileOpen ? (
        <div
          id="mobile-navigation"
          className="max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-white/10 bg-[#020817] text-white lg:hidden"
        >
          <Container className="flex flex-col gap-1 py-6">
            {primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={localePath(locale, link.href)}
                className="rounded-2xl px-4 py-3 text-base font-medium text-white/90 hover:bg-white/10"
              >
                {link.label}
              </Link>
            ))}

            {solutions.length > 0 ? (
              <div className="mt-2">
                <p className="px-4 pb-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                  {labels.solutions}
                </p>
                {solutions.map((solution) => (
                  <Link
                    key={solution.slug}
                    href={localePath(locale, `/solutions/${solution.slug}`)}
                    className="block rounded-2xl px-4 py-3 text-base font-medium text-white/90 hover:bg-white/10"
                  >
                    {solution.name}
                  </Link>
                ))}
              </div>
            ) : null}

            <Link
              href={localePath(locale, '/news-updates')}
              className="mt-2 rounded-2xl px-4 py-3 text-base font-medium text-white/90 hover:bg-white/10"
            >
              {labels.news}
            </Link>

            <div className="mt-4 flex flex-col gap-3 border-t border-white/10 pt-5">
              <LocaleSwitcher locale={locale} pathname={pathname} className="self-start" />
              <Link
                href={localePath(locale, '/contact')}
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white"
              >
                {labels.contact}
              </Link>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}

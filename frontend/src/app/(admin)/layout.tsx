import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';

import '@/app/globals.css';

const heading = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
});

const body = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'RAMS CMS',
  // The admin area must never appear in search results.
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${heading.variable} ${body.variable}`}>
      <body className="min-h-screen bg-ink-100">{children}</body>
    </html>
  );
}

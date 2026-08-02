import type { Metadata } from 'next';

import { StepUpProvider } from '@/components/admin/StepUpProvider';

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
    <div className="min-h-screen bg-ink-100">
      <StepUpProvider>{children}</StepUpProvider>
    </div>
  );
}

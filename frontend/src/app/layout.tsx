import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RAMS • PT. Ragam Manfaat Sinergi | Enterprise Tech & System Architecture',
  description: 'Portofolio Resmi RAMS • PT. Ragam Manfaat Sinergi - Perusahaan Teknologi Pengembang Sistem ERP, POS Offline-First, Automated CRM, dan Custom Enterprise Software.',
  keywords: 'RAMS, PT RAMS, Ragam Manfaat Sinergi, ERP Percetakan, POS Offline First, Software House Indonesia, System Architecture, Golang, Next.js',
  openGraph: {
    title: 'RAMS • PT. Ragam Manfaat Sinergi - Enterprise Solutions',
    description: 'Mengubah permasalahan nyata masyarakat menjadi sistem digital berkinerja tinggi melalui filosofi Ragam, Manfaat, dan Sinergi.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body>{children}</body>
    </html>
  );
}

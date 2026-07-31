import { legalMetadata, renderLegalPage } from '@/components/legal/LegalPageView';

const SLUG = 'terms-and-conditions';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return legalMetadata(locale, SLUG);
}

export default function TermsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return renderLegalPage(locale, SLUG);
}

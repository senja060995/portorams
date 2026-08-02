import { legalMetadata, renderLegalPage } from '@/components/legal/LegalPageView';

const SLUG = 'privacy-policy';

export function generateMetadata({ params: { locale } }: { params: { locale: string } }) {
  return legalMetadata(locale, SLUG);
}

export default function PrivacyPolicyPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return renderLegalPage(locale, SLUG);
}

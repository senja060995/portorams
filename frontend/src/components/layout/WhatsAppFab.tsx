import { MessageCircle } from 'lucide-react';

interface WhatsAppFabProps {
  href: string;
  label: string;
}

/** Floating WhatsApp contact button, fixed to the bottom-right corner. */
export function WhatsAppFab({ href, label }: WhatsAppFabProps) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-card-hover transition-transform duration-300 ease-smooth hover:scale-105 sm:bottom-8 sm:right-8"
    >
      <MessageCircle className="h-6 w-6" aria-hidden="true" />
    </a>
  );
}

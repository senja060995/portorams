import createMiddleware from 'next-intl/middleware';

import { defaultLocale, locales } from './i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  // Keep the locale visible in every URL so ID and EN pages are separately
  // indexable and shareable.
  localePrefix: 'always',
});

export const config = {
  // Locale routing applies to the public site only. The admin panel, API
  // routes, and static assets must pass through untouched.
  matcher: ['/((?!api|admin|_next|uploads|.*\\..*).*)'],
};

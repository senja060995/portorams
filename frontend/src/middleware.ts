import { NextResponse, type NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { defaultLocale, locales } from './i18n/config';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  // Keep the locale visible in every URL so ID and EN pages are separately
  // indexable and shareable.
  localePrefix: 'always',
});

/**
 * Builds a per-request Content Security Policy for the admin panel. Next.js
 * injects inline bootstrap scripts into the HTML, so a unique nonce (carried
 * on the `x-nonce` request header) is used instead of 'unsafe-inline'; every
 * inline script Next renders carries that nonce. `'strict-dynamic'` lets
 * nonce'd scripts load their chunks while still blocking injected inline code.
 */
function buildCsp(nonce: string, apiHost: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https://images.unsplash.com${apiHost ? ` ${apiHost}` : ''}`,
    "font-src 'self' data:",
    `connect-src 'self'${apiHost ? ` ${apiHost}` : ''}`,
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; ');
}

/**
 * Applies the nonce-based CSP to a rendered page. The `x-nonce` is stamped
 * onto the request headers so Next.js adds it to the inline scripts it emits.
 */
function applyCspToAdmin(request: NextRequest): NextResponse {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  // NEXT_PUBLIC_API_URL may be relative ('/api'): the API is then same-origin,
  // which needs no extra host in the CSP.
  let apiHost = '';
  if (process.env.NEXT_PUBLIC_API_URL) {
    try {
      apiHost = new URL(process.env.NEXT_PUBLIC_API_URL).origin;
    } catch {
      apiHost = '';
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', buildCsp(nonce, apiHost));
  return response;
}

export default function middleware(request: NextRequest) {
  // The admin panel never gets locale routing; it gets the nonce-based CSP
  // instead. The public site keeps plain next-intl routing (its static
  // security headers come from next.config).
  if (request.nextUrl.pathname.startsWith('/admin')) {
    return applyCspToAdmin(request);
  }

  return intlMiddleware(request);
}

export const config = {
  // Locale routing applies to the public site; the admin panel is handled
  // above. API routes, static assets and uploaded media pass through untouched.
  matcher: ['/((?!api|_next|uploads|.*\\..*).*)'],
};

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const apiOrigin = process.env.NEXT_PUBLIC_API_URL
  ? new URL(process.env.NEXT_PUBLIC_API_URL)
  : null;

const apiHost = apiOrigin ? `${apiOrigin.protocol}//${apiOrigin.host}` : '';

/**
 * Content Security Policy for the admin CMS. Next.js injects inline bootstrap
 * scripts and style tags, so those need 'unsafe-inline'; everything else is
 * locked to self-hosted resources plus the API origin the editor talks to.
 * Scoped to production: Next's dev HMR needs 'unsafe-eval', and a broken CSP
 * during development would be worse than none at all.
 */
const adminCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https://images.unsplash.com${apiHost ? ` ${apiHost}` : ''}`,
  "font-src 'self' data:",
  `connect-src 'self'${apiHost ? ` ${apiHost}` : ''}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      // Media uploaded through the CMS is served by the Go API.
      ...(apiOrigin
        ? [
            {
              protocol: apiOrigin.protocol.replace(':', ''),
              hostname: apiOrigin.hostname,
              ...(apiOrigin.port ? { port: apiOrigin.port } : {}),
              pathname: '/uploads/**',
            },
          ]
        : []),
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
      ...(process.env.NODE_ENV === 'production'
        ? [
            {
              source: '/admin/:path*',
              headers: [
                { key: 'X-Frame-Options', value: 'DENY' },
                { key: 'Content-Security-Policy', value: adminCsp },
              ],
            },
          ]
        : []),
    ];
  },
};

export default withNextIntl(nextConfig);

import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

let apiOrigin = null;
if (process.env.NEXT_PUBLIC_API_URL) {
  try {
    apiOrigin = new URL(process.env.NEXT_PUBLIC_API_URL);
  } catch {
    apiOrigin = null;
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone',
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
    ];
  },
};

export default withNextIntl(nextConfig);

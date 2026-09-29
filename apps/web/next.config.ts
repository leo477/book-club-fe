import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { backendOrigin } from './src/lib/backend-origin';

const BACKEND_ORIGIN = backendOrigin();

function legacyOrigin(): string | null {
  const raw = process.env['LEGACY_ORIGIN'];
  if (!raw) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('LEGACY_ORIGIN is required in production (origin of the legacy Angular deployment)');
    }
    return null;
  }
  try {
    return new URL(raw).origin;
  } catch {
    throw new Error(`LEGACY_ORIGIN is not a valid absolute URL: ${raw}`);
  }
}

const legacy = legacyOrigin();

const SECURITY_HEADERS = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  turbopack: { resolveAlias: { '../locales/index.js': './src/lib/zod-locales-stub.ts' } },
  transpilePackages: ['@book-club/api-client', '@book-club/contracts', '@book-club/i18n'],
  async headers() {
    return [
      { source: '/:path*', headers: SECURITY_HEADERS },
      { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'private, no-store' }] },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [{ source: '/api/:path*', destination: `${BACKEND_ORIGIN}/api/:path*` }],
      afterFiles: [],
      fallback: legacy ? [{ source: '/:path*', destination: `${legacy}/:path*` }] : [],
    };
  },
};

export default createNextIntlPlugin('./src/i18n/request.ts')(nextConfig);

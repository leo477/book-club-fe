import type { NextConfig } from 'next';
import { PHASE_PRODUCTION_BUILD } from 'next/constants.js';
import createNextIntlPlugin from 'next-intl/plugin';
import { backendOrigin } from './src/lib/backend-origin';
import { BUILD_MARKER, assertLegacyFallbackAllowed, fallbackRewrites, legacyFallbackDisabled } from './src/lib/legacy-fallback';
import { checkOAuthBaseUrl } from './src/lib/oauth-base-url';
import { checkWsBaseUrl } from './src/lib/ws-base-url';

const BACKEND_ORIGIN = backendOrigin();

assertLegacyFallbackAllowed();
const fallbackDisabled = legacyFallbackDisabled();

function legacyOrigin(): string | null {
  const raw = process.env['LEGACY_ORIGIN'];
  if (!raw) {
    if (process.env.NODE_ENV === 'production' && !fallbackDisabled) {
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

const SKIP_TOOLBAR = { key: 'x-vercel-skip-toolbar', value: '1' };

const nextConfig: NextConfig = {
  agentRules: false,
  reactCompiler: true,
  poweredByHeader: false,
  env: { [BUILD_MARKER]: fallbackDisabled ? '1' : '' },
  turbopack: { resolveAlias: { '../locales/index.js': './src/lib/zod-locales-stub.ts' } },
  transpilePackages: ['@book-club/api-client', '@book-club/contracts', '@book-club/i18n'],
  async headers() {
    return [
      { source: '/:path*', headers: SECURITY_HEADERS },
      { source: '/api/:path*', headers: [{ key: 'Cache-Control', value: 'private, no-store' }] },
      { source: '/sitemap.xml', headers: [{ key: 'Content-Type', value: 'application/xml; charset=utf-8' }, SKIP_TOOLBAR] },
      { source: '/robots.txt', headers: [{ key: 'Content-Type', value: 'text/plain; charset=utf-8' }, SKIP_TOOLBAR] },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [{ source: '/api/:path*', destination: `${BACKEND_ORIGIN}/api/:path*` }],
      afterFiles: [],
      fallback: fallbackRewrites(legacy, fallbackDisabled),
    };
  },
};

// Messages are compiled to icu-minify JSON at build time and formatted by the format-only runtime (no ICU parser in the client bundle).
const withIntl = createNextIntlPlugin({
  requestConfig: './src/i18n/request.ts',
  experimental: { messages: { path: '../../packages/i18n/locales', format: 'json', locales: 'infer', sourceLocale: 'uk', precompile: true } },
});

// the value is inlined at build time, so only a production build needs it (not `next start` or dev)
const config = (phase: string): NextConfig => {
  if (phase === PHASE_PRODUCTION_BUILD) {
    checkOAuthBaseUrl();
    checkWsBaseUrl();
  }
  return withIntl(nextConfig);
};

export default config;

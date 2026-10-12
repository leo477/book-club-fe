import type { NextRequest } from 'next/server';
import { handleProxy } from '@/strangler/proxy-handler';
import { legacyFallbackDisabled } from '@/lib/legacy-fallback';
import { readStranglerConfig } from '@/strangler/edge-config';

export function proxy(request: NextRequest) {
  return handleProxy(request, {
    readConfig: readStranglerConfig,
    legacyOrigin: process.env['LEGACY_ORIGIN'],
    dev: process.env.NODE_ENV !== 'production',
    legacyDisabled: legacyFallbackDisabled(),
  });
}

export const config = {
  matcher: ['/((?!api/|_next/|_vercel/|_internal/|strangler\\.json).*)'],
};

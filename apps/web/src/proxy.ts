import { NextResponse, type NextRequest } from 'next/server';
import { handleProxy } from '@/strangler/proxy-handler';
import { BUILD_MARKER, flaggedBuildOnProduction, legacyFallbackDisabled } from '@/lib/legacy-fallback';
import { readStranglerConfig } from '@/strangler/edge-config';

export function proxy(request: NextRequest) {
  // statically referenced so Next inlines the build-time value
  if (flaggedBuildOnProduction(process.env['LEGACY_FALLBACK_DISABLED_AT_BUILD'], process.env, request.headers.get('host'))) {
    console.error(`${BUILD_MARKER}: this deployment was built with DISABLE_LEGACY_FALLBACK and is serving production; refusing. Redeploy from a build without the flag.`);
    return new NextResponse('Service Unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
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

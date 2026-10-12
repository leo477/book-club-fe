import { NextResponse, type NextRequest } from 'next/server';
import { BUCKET_COOKIE, BUCKET_HEADER, BUCKET_MAX_AGE, decide, newBucket, validBucket, type StranglerConfig } from './config';
import { buildCsp, newNonce, TRUSTED_TYPES_REPORT_ONLY } from './csp';
import { isLegacyShadowed, matchRoute } from './routes';

export interface ProxyDeps {
  readConfig: () => Promise<StranglerConfig | null>;
  legacyOrigin: string | undefined;
  dev?: boolean | undefined;
  /** preview-only: every manifest route renders on Next and nothing is proxied to legacy */
  legacyDisabled?: boolean | undefined;
}

function resolveOrigin(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.origin : null;
  } catch {
    return null;
  }
}

function withCsp(headers: Headers, dev: boolean | undefined, bucket?: number): NextResponse {
  const nonce = newNonce();
  const csp = buildCsp(nonce, dev);
  headers.set('x-nonce', nonce);
  if (bucket !== undefined) headers.set(BUCKET_HEADER, String(bucket));
  headers.set('content-security-policy', csp);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('Content-Security-Policy-Report-Only', TRUSTED_TYPES_REPORT_ONLY);
  return response;
}

export async function handleProxy(request: NextRequest, deps: ProxyDeps): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;
  const cleanHeaders = new Headers(request.headers);
  cleanHeaders.delete(BUCKET_HEADER);
  // set only by this proxy; a client-supplied nonce or CSP must never reach the app
  cleanHeaders.delete('x-nonce');
  cleanHeaders.delete('content-security-policy');

  const route = matchRoute(pathname);
  const shadowed = route === null && !deps.legacyDisabled && isLegacyShadowed(pathname);
  if (!route && !shadowed) {
    // without the legacy fallback every pass-through is rendered by Next (its 404 included), so it gets the same CSP; with it, the request may still be rewritten to legacy and must stay untouched
    return deps.legacyDisabled ? withCsp(cleanHeaders, deps.dev) : NextResponse.next({ request: { headers: cleanHeaders } });
  }

  const existing = validBucket(request.cookies.get(BUCKET_COOKIE)?.value);
  const bucket = existing ?? newBucket();
  const decision = !route ? 'legacy' : deps.legacyDisabled ? 'next' : decide(await deps.readConfig(), route.pattern, bucket);
  const legacyOrigin = resolveOrigin(deps.legacyOrigin);

  if (decision === 'legacy' && !legacyOrigin && !deps.dev) {
    return new NextResponse('Service Unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }

  let response: NextResponse;
  if (decision === 'legacy' && legacyOrigin) {
    const target = new URL(legacyOrigin);
    target.pathname = pathname.replace(/^[\\/]{2,}/, '/');
    target.search = search;
    response = NextResponse.rewrite(target, { request: { headers: cleanHeaders } });
  } else {
    response = withCsp(cleanHeaders, deps.dev, bucket);
  }

  if (existing === null) {
    response.cookies.set(BUCKET_COOKIE, String(bucket), {
      maxAge: BUCKET_MAX_AGE,
      sameSite: 'lax',
      httpOnly: false,
      secure: !deps.dev,
      path: '/',
    });
  }
  return response;
}

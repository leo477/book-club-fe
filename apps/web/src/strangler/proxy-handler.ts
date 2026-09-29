import { NextResponse, type NextRequest } from 'next/server';
import { BUCKET_COOKIE, BUCKET_HEADER, BUCKET_MAX_AGE, decide, newBucket, validBucket, type StranglerConfig } from './config';
import { buildCsp, newNonce, TRUSTED_TYPES_REPORT_ONLY } from './csp';
import { matchRoute } from './routes';

export interface ProxyDeps {
  readConfig: () => Promise<StranglerConfig | null>;
  legacyOrigin: string | undefined;
  dev?: boolean | undefined;
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

export async function handleProxy(request: NextRequest, deps: ProxyDeps): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;
  const cleanHeaders = new Headers(request.headers);
  cleanHeaders.delete(BUCKET_HEADER);

  const route = matchRoute(pathname);
  if (!route) return NextResponse.next({ request: { headers: cleanHeaders } });

  const existing = validBucket(request.cookies.get(BUCKET_COOKIE)?.value);
  const bucket = existing ?? newBucket();
  const decision = decide(await deps.readConfig(), route.pattern, bucket);
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
    const nonce = newNonce();
    const csp = buildCsp(nonce, deps.dev);
    const headers = cleanHeaders;
    headers.set('x-nonce', nonce);
    headers.set(BUCKET_HEADER, String(bucket));
    headers.set('content-security-policy', csp);
    response = NextResponse.next({ request: { headers } });
    response.headers.set('Cache-Control', 'private, no-store');
    response.headers.set('Content-Security-Policy', csp);
    response.headers.set('Content-Security-Policy-Report-Only', TRUSTED_TYPES_REPORT_ONLY);
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

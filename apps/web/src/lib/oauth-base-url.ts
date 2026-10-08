/** Validates NEXT_PUBLIC_OAUTH_BASE_URL (inlined into the client bundle at build time); a production build must not ship without it. */
export function checkOAuthBaseUrl(env: Record<string, string | undefined> = process.env): string | null {
  const raw = env['NEXT_PUBLIC_OAUTH_BASE_URL'];
  const production = env['NODE_ENV'] === 'production' || env['VERCEL_ENV'] === 'production';
  if (!raw) {
    if (production) throw new Error('NEXT_PUBLIC_OAUTH_BASE_URL is required for a production build (absolute backend API URL, e.g. https://book-club-be.onrender.com/api/v1)');
    return null;
  }
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`NEXT_PUBLIC_OAUTH_BASE_URL is not a valid absolute URL: ${raw}`);
  }
  if (url.protocol !== 'https:' && !(!production && url.protocol === 'http:')) {
    throw new Error(`NEXT_PUBLIC_OAUTH_BASE_URL must be https${production ? '' : ' (or http in development)'}: ${raw}`);
  }
  if (url.search || url.hash || raw.endsWith('/')) throw new Error(`NEXT_PUBLIC_OAUTH_BASE_URL must have no trailing slash, query or fragment: ${raw}`);
  return raw;
}

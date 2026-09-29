const DEFAULT_ORIGIN = 'https://book-club-be.onrender.com';

/** The one backend origin for the /api rewrite and server fetches; https-only in production, throws on anything invalid. */
export function backendOrigin(env: Record<string, string | undefined> = process.env): string {
  const raw = env['BACKEND_ORIGIN'] || env['BACKEND_API_URL'] || DEFAULT_ORIGIN;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`BACKEND_ORIGIN is not a valid absolute URL: ${raw}`);
  }
  const production = env['NODE_ENV'] === 'production';
  if (url.protocol !== 'https:' && !(!production && url.protocol === 'http:')) {
    throw new Error(`BACKEND_ORIGIN must be https${production ? '' : ' (or http in development)'}: ${raw}`);
  }
  return url.origin;
}

export const backendApiUrl = (env?: Record<string, string | undefined>): string => `${backendOrigin(env)}/api/v1`;

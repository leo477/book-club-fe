const DEFAULT_ORIGIN = 'https://book-club-be.onrender.com';

/** The one backend origin for the /api rewrite and server fetches; https-only in production, explicit on Vercel production, throws on anything invalid. */
export function backendOrigin(env: Record<string, string | undefined> = process.env): string {
  const configured = env['BACKEND_ORIGIN'] || env['BACKEND_API_URL'];
  // a Vercel production deploy must never silently proxy /api to the dev default backend
  if (!configured && env['VERCEL_ENV'] === 'production') throw new Error('BACKEND_ORIGIN is required when VERCEL_ENV=production');
  const raw = configured || DEFAULT_ORIGIN;
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

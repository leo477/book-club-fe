type Env = Record<string, string | undefined>;

const FLAG = 'DISABLE_LEGACY_FALLBACK';

const requested = (env: Env) => env[FLAG] === '1' || env[FLAG] === 'true';

/** Only a Vercel preview build or a local non-production run may drop the legacy fallback; every other target (production, a bare `next build` in CI) refuses. */
const allowed = (env: Env) => env['VERCEL_ENV'] === 'preview' || (env['VERCEL_ENV'] === undefined && env['NODE_ENV'] !== 'production');

/** Build-time guard: a set flag on a target where it is not allowed fails the build instead of silently shipping without legacy. */
export function assertLegacyFallbackAllowed(env: Env = process.env): void {
  if (requested(env) && !allowed(env)) {
    throw new Error(`${FLAG} is preview-only (VERCEL_ENV=preview or a local dev run); refusing to build with VERCEL_ENV=${env['VERCEL_ENV'] ?? '(unset)'} NODE_ENV=${env['NODE_ENV'] ?? '(unset)'}`);
  }
}

/** Runtime reading: never true where the build guard would have refused, so a flag added to a production project after the build is inert. */
export function legacyFallbackDisabled(env: Env = process.env): boolean {
  return requested(env) && allowed(env);
}

export function fallbackRewrites(legacy: string | null, disabled: boolean): { source: string; destination: string }[] {
  return legacy && !disabled ? [{ source: '/:path*', destination: `${legacy}/:path*` }] : [];
}

/** Inlined by next.config `env` at build, so it survives into a deployment that is later promoted to production. */
export const BUILD_MARKER = 'LEGACY_FALLBACK_DISABLED_AT_BUILD';

/**
 * Rewrites are baked at build, so a preview built with the flag and then promoted would serve production without legacy.
 * Fail closed there: `VERCEL_ENV=production`, or the request arrives on the project's production domain (a promoted preview keeps its build-time env).
 */
const bareHost = (value: string) =>
  value
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, '')
    .replace(/[/?#].*$/, '')
    .replace(/:\d+$/, '')
    .replace(/\.$/, '')
    .replace(/^www\./, '');

export function flaggedBuildOnProduction(marker: string | undefined, env: Env, host: string | null): boolean {
  if (marker !== '1') return false;
  const production = env['VERCEL_PROJECT_PRODUCTION_URL'];
  return env['VERCEL_ENV'] === 'production' || (!!production && !!host && bareHost(host) === bareHost(production));
}

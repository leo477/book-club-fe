import { request, type APIRequestContext } from '@playwright/test';
import { apiBaseURL } from '../../playwright.full-audit.config';

// Every spec in this suite writes endpoint paths with a leading slash
// (e.g. `api.post('/auth/register', ...)`), matching the backend router
// prefixes as documented. That's incompatible with Playwright's `baseURL`
// context option: per the WHATWG URL spec, a reference starting with `/` is
// an absolute-path reference and is resolved against the ORIGIN of the base,
// discarding the base's own path — so `baseURL: '.../api/v1'` + `'/auth/register'`
// resolves to `.../auth/register`, silently dropping `/api/v1` (confirmed by a
// live 404 the first time this suite ran end-to-end). Rather than rewrite the
// leading slash out of every call site across ~18 spec files, contexts here
// are created WITHOUT the `baseURL` option and instead prepend the full
// `apiBaseURL` themselves before every request.
function toAbsolute(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${apiBaseURL}${path.startsWith('/') ? '' : '/'}${path}`;
}

const INTERCEPTED_METHODS = ['get', 'post', 'patch', 'put', 'delete', 'head', 'fetch'] as const;

export async function newApiContext(options?: {
  extraHTTPHeaders?: Record<string, string>;
  timeout?: number;
}): Promise<APIRequestContext> {
  // Default per-call timeout is generous (45s, vs. Playwright's normal 20s
  // actionTimeout default) because these requests hit a live, free-tier
  // Render backend that occasionally has real multi-second latency spikes
  // on heavier endpoints (e.g. club stats aggregation) — a plain 20s ceiling
  // produced spurious timeouts unrelated to any test or app bug.
  const ctx = await request.newContext({ timeout: 45_000, ...options });
  // Patch the methods directly on the real context object instead of
  // returning a Proxy: an earlier version wrapped `ctx` in a `new Proxy(...)`,
  // and every method call on it (`.get`, `.post`, `dispose()`, etc.) then ran
  // with `this` bound to the Proxy rather than the real instance. Playwright's
  // APIRequestContext tracks its closed/disposed state via `this`-bound
  // internals, so calls made through the Proxy silently desynced from the
  // real object's state — the first full end-to-end run of this suite hit
  // exactly this: ~37 unrelated tests failed with "Target page, context or
  // browser has been closed" for contexts that were never actually disposed.
  // Mutating the real object in place keeps its identity (and `this`) intact.
  for (const method of INTERCEPTED_METHODS) {
    const original = (ctx as unknown as Record<string, (...args: unknown[]) => unknown>)[method];
    (ctx as unknown as Record<string, unknown>)[method] = (url: string, ...rest: unknown[]) =>
      original.call(ctx, toAbsolute(url), ...rest);
  }
  return ctx;
}

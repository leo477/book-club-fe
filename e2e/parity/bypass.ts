import type { BrowserContext } from '@playwright/test';
import { test as base } from '@playwright/test';

/** Header injection per request keeps the secret off third-party origins (extraHTTPHeaders would send it everywhere). */
export async function addBypass(context: BrowserContext, origin: string, secret: string | undefined): Promise<void> {
  if (!secret) return;
  await context.route(
    (url) => url.origin === origin,
    // set-bypass-cookie: later same-origin requests that skip this route (page.route continue) stay authenticated
    (route) => route.continue({ headers: { ...route.request().headers(), 'x-vercel-protection-bypass': secret, 'x-vercel-set-bypass-cookie': 'true' } }),
  );
}

const secret = process.env['PARITY_NEXT_BYPASS'];

export const test = base.extend({
  context: async ({ context, baseURL }, use, testInfo) => {
    if (testInfo.project.name === 'next' && baseURL) await addBypass(context, new URL(baseURL).origin, secret);
    await use(context);
  },
  request: async ({ playwright, baseURL }, use, testInfo) => {
    // only ever targets baseURL-relative paths, so the header cannot reach another origin
    const ctx = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: testInfo.project.name === 'next' && secret ? { 'x-vercel-protection-bypass': secret } : undefined,
    });
    await use(ctx);
    await ctx.dispose();
  },
});

export { expect } from '@playwright/test';

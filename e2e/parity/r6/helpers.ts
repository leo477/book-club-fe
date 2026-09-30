import type { BrowserContext, Page } from '@playwright/test';
import { COVER, COVER_SVG, handleApi, newState, type MockState } from './fixtures';

export interface LoggedRequest {
  method: string;
  path: string;
  query: string;
  body: string | null;
  headers: Record<string, string>;
}

/**
 * Fulfils every /api/v1 request of `target` from the fixtures, so the real backend is never reached (legacy's API calls
 * go to the production backend otherwise). Also stubs the cover host and kills websockets (Angular opens a chat socket).
 */
export async function installApiMock(target: Page | BrowserContext, state: MockState = newState('guest'), latencyMs: Record<string, number> = {}): Promise<{ log: LoggedRequest[]; state: MockState }> {
  const log: LoggedRequest[] = [];
  await target.route('**/api/v1/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname.replace(/^\/api\/v1/, '');
    log.push({ method: req.method(), path, query: url.search, body: req.postData(), headers: req.headers() });
    const wait = latencyMs[`${req.method()} ${path.replace(/[0-9a-f-]{36}/g, ':id').replace(/\/opt-\d+/g, '/:opt')}`];
    if (wait) await new Promise((r) => setTimeout(r, wait));
    const reply = handleApi(state, req.method(), path, url.search, req.postData());
    await route.fulfill({
      status: reply.status,
      contentType: 'application/json',
      body: reply.body === undefined ? '' : JSON.stringify(reply.body),
    });
  });
  await target.route(`${new URL(COVER).origin}/**`, (route) => route.fulfill({ status: 200, contentType: 'image/svg+xml', body: COVER_SVG }));
  await target.routeWebSocket(/.*/, (ws) => void ws.close());
  return { log, state };
}

const IGNORED_CONSOLE = [/\/_vercel\//, /Failed to load resource/];

/** Console errors and uncaught page errors; `Failed to load resource` lines (deliberate 4xx/5xx mocks) are not counted. */
export function watchConsole(page: Page, extraIgnore: RegExp[] = []): string[] {
  const errs: string[] = [];
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const text = m.text();
    if ([...IGNORED_CONSOLE, ...extraIgnore].some((re) => re.test(text))) return;
    errs.push(`console: ${text.slice(0, 300)}`);
  });
  page.on('pageerror', (e) => errs.push(`pageerror: ${e.message.slice(0, 300)}`));
  return errs;
}

export const LANG_COOKIE = (baseURL: string, lang: 'uk' | 'en', theme: 'light' | 'dark') => [
  { name: 'lang', value: lang, url: baseURL },
  { name: 'theme', value: theme, url: baseURL },
];

/** Waits until the club page finished its client work: name visible, network quiet. */
export async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.getByTestId('club-name').waitFor();
  await page.waitForTimeout(400);
}

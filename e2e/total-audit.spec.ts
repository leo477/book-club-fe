import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// ── Routes under audit ────────────────────────────────────────────────────────

const PUBLIC_PAGES = ['/', '/login', '/register'] as const;

// ── Helpers ───────────────────────────────────────────────────────────────────

function routeSlug(route: string): string {
  return route === '/' ? 'home' : route.replace(/\//g, '-').replace(/^-/, '');
}

async function navigateAndSettle(page: Page, route: string): Promise<void> {
  await page.goto(route);
  await page.waitForLoadState('networkidle');
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('Total Site Audit', () => {

  // ── 1. Accessibility ──────────────────────────────────────────────────────

  for (const route of PUBLIC_PAGES) {
    test(`[A11y] Accessibility audit — ${route}`, async ({ page }) => {
      await navigateAndSettle(page, route);

      const results = await new AxeBuilder({ page }).analyze();

      if (results.violations.length > 0) {
        console.log(`\n── axe violations on ${route} (${results.violations.length}) ──`);
        for (const v of results.violations) {
          console.log(`  [${v.impact ?? 'unknown'}] ${v.id}: ${v.description}`);
          for (const node of v.nodes) {
            console.log(`    ↳ ${node.target.join(', ')}`);
            if (node.failureSummary) console.log(`      ${node.failureSummary.split('\n')[0]}`);
          }
        }
      } else {
        console.log(`[A11y] ${route} — no violations`);
      }

      expect.soft(results.violations, 'axe violations').toHaveLength(0);
    });
  }

  // ── 2. Console errors & network failures ──────────────────────────────────

  for (const route of PUBLIC_PAGES) {
    test(`[Monitor] Console errors & network failures — ${route}`, async ({ page }) => {
      const consoleErrors: string[] = [];
      const networkFailures: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // suppress known browser noise
          if (text.includes('favicon') || text.includes('ResizeObserver')) return;
          consoleErrors.push(text);
        }
      });

      page.on('pageerror', err => {
        consoleErrors.push(err.message);
      });

      page.on('response', resp => {
        if (resp.status() >= 400) {
          const url = resp.url();
          if (resp.status() === 401 && url.includes('/auth/refresh')) return;
          networkFailures.push(`HTTP ${resp.status()} — ${url}`);
        }
      });

      await navigateAndSettle(page, route);

      if (consoleErrors.length > 0) {
        console.log(`\n── Console errors on ${route} ──`);
        consoleErrors.forEach(e => console.log(`  ${e}`));
      }

      if (networkFailures.length > 0) {
        console.log(`\n── Network failures on ${route} ──`);
        networkFailures.forEach(e => console.log(`  ${e}`));
      }

      expect.soft(consoleErrors, 'JS console errors').toHaveLength(0);
      expect.soft(networkFailures, 'HTTP 4xx/5xx responses').toHaveLength(0);
    });
  }

  // ── 3. Web Vitals ─────────────────────────────────────────────────────────

  for (const route of PUBLIC_PAGES) {
    test(`[Perf] Web Vitals — ${route}`, async ({ page }) => {
      await navigateAndSettle(page, route);

      const vitals = await page.evaluate(() => {
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          ttfb: Math.round(nav.responseStart - nav.requestStart),
          domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
          loadEvent: Math.round(nav.loadEventEnd - nav.startTime),
        };
      });

      console.log(
        `[Perf] ${route} — TTFB: ${vitals.ttfb}ms | ` +
        `DOMContentLoaded: ${vitals.domContentLoaded}ms | ` +
        `Load: ${vitals.loadEvent}ms`
      );

      // informational only — no hard thresholds
    });
  }

  // ── 4. SEO meta tags ──────────────────────────────────────────────────────

  test('[SEO] Meta tags — /', async ({ page }) => {
    await navigateAndSettle(page, '/');

    const title = await page.title();
    const description = await page.locator('meta[name="description"]').getAttribute('content').catch(() => null);
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content').catch(() => null);
    const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content').catch(() => null);
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content').catch(() => null);

    console.log('\n── SEO meta tags ──');
    console.log(`  <title>:           ${title || '(missing)'}`);
    console.log(`  meta description:  ${description || '(missing)'}`);
    console.log(`  og:title:          ${ogTitle || '(missing)'}`);
    console.log(`  og:description:    ${ogDescription || '(missing)'}`);
    console.log(`  og:image:          ${ogImage || '(missing)'}`);

    expect.soft(title, '<title> must be set').toBeTruthy();
    expect.soft(description, 'meta description must be set').toBeTruthy();
    expect.soft(ogImage, 'og:image must be set').toBeTruthy();
  });

});

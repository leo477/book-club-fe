import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, type TestInfo } from '@playwright/test';

// Navigates to a route, lets Angular hydrate, runs an axe WCAG 2 A/AA scan,
// attaches the full violation list to the report and fails only on `critical`
// impact (lower-severity findings are reported but don't block the build).
export async function auditRoute(page: Page, testInfo: TestInfo, route: string): Promise<void> {
  await page.goto(route);
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500);

  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

  await testInfo.attach(`axe-${route === '/' ? 'root' : route.replace(/\W+/g, '_')}.json`, {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  });

  const summary = results.violations.map((v) => `${v.impact}:${v.id}(${v.nodes.length})`).join(', ');
  console.log(`[audit] ${route} → ${results.violations.length} violation(s): ${summary || 'none'}`);

  const critical = results.violations.filter((v) => v.impact === 'critical');
  expect(critical, `critical a11y violations on ${route}: ${critical.map((v) => v.id).join(', ')}`).toEqual([]);
}

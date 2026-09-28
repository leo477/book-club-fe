import { test, expect } from '@playwright/test';
import { publicRoutes, slug } from './routes';

const viewports = [
  { name: '375', width: 375, height: 812 },
  { name: '768', width: 768, height: 1024 },
  { name: '1280', width: 1280, height: 800 },
];
const themes = ['light', 'dark'] as const;
const dynamicAreas = ['[data-testid="dynamic"]', 'app-toast-container', 'iframe', 'video'];

test.beforeAll(({}, testInfo) => {
  if (testInfo.project.name === 'next' && ['all', 'changed'].includes(testInfo.config.updateSnapshots)) {
    throw new Error('Refusing to update snapshots for the "next" project: legacy baselines are the reference.');
  }
});

for (const route of publicRoutes) {
  for (const theme of themes) {
    for (const vp of viewports) {
      test(`${route} ${theme} ${vp.name}`, async ({ page, context, baseURL }) => {
        await context.addCookies([
          { name: 'theme', value: theme, url: baseURL! },
          { name: 'lang', value: 'uk', url: baseURL! },
        ]);
        await page.addInitScript(
          ([t]) => {
            localStorage.setItem('theme', t);
            localStorage.setItem('lang', 'uk');
          },
          [theme],
        );
        await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route);
        await expect(page).toHaveURL((url) => url.pathname === route);
        await page.waitForLoadState('networkidle');
        await expect(page.locator('html')).toHaveAttribute('lang', 'uk');
        await expect(page).toHaveScreenshot(`${slug(route)}-${theme}-${vp.name}.png`, {
          fullPage: true,
          mask: dynamicAreas.map((s) => page.locator(s)),
        });
      });
    }
  }
}

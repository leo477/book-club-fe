import { test, expect } from './bypass';
import { assertBaselineWritable } from './snapshot-guard';
import { publicRoutes, slug } from './routes';

const viewports = [
  { name: '375', width: 375, height: 812 },
  { name: '768', width: 768, height: 1024 },
  { name: '1280', width: 1280, height: 800 },
];
const themes = ['light', 'dark'] as const;
const lang = process.env['PARITY_LANG'] ?? 'uk';
const langSuffix = lang === 'uk' ? '' : `-${lang}`;
const dynamicAreas = ['[data-testid="dynamic"]', 'app-toast-container', 'iframe', 'video'];

test.beforeAll(({}, testInfo) => assertBaselineWritable(testInfo));

for (const route of publicRoutes) {
  for (const theme of themes) {
    for (const vp of viewports) {
      test(`${route} ${theme} ${vp.name}`, async ({ page, context, baseURL }) => {
        await context.addCookies([
          { name: 'theme', value: theme, url: baseURL! },
          { name: 'lang', value: lang, url: baseURL! },
        ]);
        await page.addInitScript(
          ([t, l]) => {
            localStorage.setItem('theme', t);
            localStorage.setItem('lang', l);
          },
          [theme, lang],
        );
        await page.emulateMedia({ reducedMotion: 'reduce', colorScheme: theme });
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route);
        await expect(page).toHaveURL((url) => url.pathname === route);
        await page.waitForLoadState('networkidle');
        await expect(page.locator('html')).toHaveAttribute('lang', lang);
        await expect(page).toHaveScreenshot(`${slug(route)}-${theme}-${vp.name}${langSuffix}.png`, {
          fullPage: true,
          mask: dynamicAreas.map((s) => page.locator(s)),
        });
      });
    }
  }
}

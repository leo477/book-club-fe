import { memberTest, organizerTest, expect } from '../fixtures/auth.fixture';

organizerTest.describe('organizer dashboard — organizer', () => {
  organizerTest('/manage renders for an organizer', async ({ page }) => {
    await page.goto('/manage');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});

memberTest.describe('organizer dashboard — member', () => {
  memberTest('member is redirected away from /manage', async ({ page }) => {
    await page.goto('/manage');
    await expect(page).not.toHaveURL(/\/manage$/, { timeout: 10_000 });
  });
});

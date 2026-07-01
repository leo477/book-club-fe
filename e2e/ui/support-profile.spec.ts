import { memberTest, expect } from '../fixtures/auth.fixture';

memberTest.describe('support — member', () => {
  memberTest('support board renders', async ({ page }) => {
    await page.goto('/support');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  memberTest('empty submit is blocked by required-field validation', async ({ page }) => {
    await page.goto('/support/new');
    await page.getByTestId('submission-submit').click();
    await expect(page).toHaveURL(/\/support\/new$/);
  });

  memberTest('creating a submission redirects back to the support board', async ({ page }) => {
    await page.goto('/support/new');
    await page.getByTestId('submission-type-select').selectOption('comment');
    await page.getByTestId('submission-title-input').fill(`PW Audit submission ${Date.now()}`);
    await page.getByTestId('submission-body-input').fill('Created by the Playwright full-audit suite.');
    await page.getByTestId('submission-submit').click();
    await expect(page).toHaveURL(/\/support$/, { timeout: 15_000 });
  });
});

memberTest.describe('profile — member', () => {
  memberTest('profile page renders', async ({ page }) => {
    await page.goto('/profile');
    await expect(page.locator('#profile-heading')).toBeVisible();
  });

  memberTest('editing the display name persists the change', async ({ page }) => {
    await page.goto('/profile');
    // display-name.validator.ts allowlists letters/digits/space/./'/-/_ only
    // (XSS-hardening) — parentheses (used in an earlier version of this
    // name) fail validation and leave the submit button disabled.
    const newName = `PW Audit Member ${Date.now()}`;
    await page.getByTestId('display-name-input').fill(newName);
    await page.getByTestId('display-name-input').locator('xpath=ancestor::form[1]//button[@type="submit"]').click();
    await expect(page.getByText(newName)).toBeVisible({ timeout: 10_000 });
  });

  memberTest('toggling socials visibility does not error', async ({ page }) => {
    await page.goto('/profile');
    const toggle = page.getByRole('checkbox').first();
    const before = await toggle.isChecked();
    await toggle.click();
    await expect(toggle).toHaveJSProperty('checked', !before);
  });
});

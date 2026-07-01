import { test, expect } from '@playwright/test';

// Pre-login/public pages — no auth fixture needed here.

test.describe('login page', () => {
  test('renders the sign-in form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
    await expect(page.locator('form button[type="submit"]')).toBeVisible();
  });

  test('empty submit keeps the user on the page and does not call the API', async ({ page }) => {
    await page.goto('/login');
    await page.locator('form button[type="submit"]').click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test('wrong credentials surface a login-error alert', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#login-email').fill('nonexistent-pw-audit-probe@gmail.com');
    await page.locator('#login-password').fill('DefinitelyWrong123!');
    await page.locator('form button[type="submit"]').click();
    await expect(page.getByTestId('login-error')).toBeVisible({ timeout: 15_000 });
  });
});

test.describe('register page', () => {
  test('renders the registration form', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('#reg-display-name')).toBeVisible();
    await expect(page.locator('#reg-email')).toBeVisible();
    await expect(page.locator('#reg-password')).toBeVisible();
    await expect(page.locator('#reg-confirm-password')).toBeVisible();
  });

  test('invalid email keeps the field-level error visible', async ({ page }) => {
    await page.goto('/register');
    await page.locator('#reg-display-name').fill('Playwright Prober');
    await page.locator('#reg-email').fill('not-an-email');
    await page.locator('#reg-email').blur();
    // Matched on the validator attribute, not error text: the text is locale-
    // dependent (register.component.html renders it via ngx-translate) and
    // the Ukrainian translation ("...електронної пошти") doesn't contain the
    // literal word "email", so an /email/i text match silently misses it
    // whenever the page renders in Ukrainian.
    await expect(page.locator('hlm-field-error[validator="email"]').first()).toBeVisible();
  });

  test('mismatched passwords are flagged before submit', async ({ page }) => {
    await page.goto('/register');
    await page.locator('#reg-display-name').fill('Playwright Prober');
    await page.locator('#reg-email').fill('pw.audit.probe@gmail.com');
    await page.locator('#reg-password').fill('AuditProbe123!');
    await page.locator('#reg-confirm-password').fill('DoesNotMatch123!');
    await page.locator('#reg-confirm-password').blur();
    await expect(page.getByText(/passwords_no_match|не збіга|match/i)).toBeVisible();
  });

  test('role selector defaults are toggleable and required to proceed', async ({ page }) => {
    await page.goto('/register');
    const organizerOption = page.locator('button[aria-pressed]', { hasText: /🎯/ });
    await organizerOption.click();
    await expect(organizerOption).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('static legal pages', () => {
  test('/privacy renders', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.getByRole('heading', { name: 'Політика конфіденційності' })).toBeVisible();
  });

  test('/terms renders', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.getByRole('heading', { name: 'Умови використання' })).toBeVisible();
  });
});

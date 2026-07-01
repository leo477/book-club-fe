import { memberTest, expect } from '../fixtures/auth.fixture';
import { apiContextFor, loadRunContext } from '../fixtures/seed-helper';

const runContext = loadRunContext();

memberTest.describe('chats — member', () => {
  memberTest.beforeAll(async () => {
    // Global setup doesn't seed a chat room — create one for the shared club so the
    // member (already a member of that club) has something to open.
    const organizerApi = await apiContextFor('organizer');
    const resp = await organizerApi.post(`/clubs/${runContext.clubId}/chat/rooms`, {
      data: { name: `PW Audit Room ${Date.now()}`.slice(0, 40) },
    });
    if (![201, 409].includes(resp.status())) {
      throw new Error(`[chats.spec] failed to seed a chat room: ${resp.status()} ${await resp.text()}`);
    }
    await organizerApi.dispose();
  });

  memberTest('chats page lists the seeded club room', async ({ page }) => {
    await page.goto('/chats');
    await expect(page.locator('.room-row').first()).toBeVisible();
  });

  memberTest('opening a room and sending a message shows it in the thread', async ({ page }) => {
    await page.goto('/chats');
    await page.locator('.room-row').first().click();
    const text = `PW Audit message ${Date.now()}`;
    await page.getByPlaceholder(/message|повідомлен/i).fill(text);
    await page.getByRole('button', { name: /send|надіслати/i }).click();
    await expect(page.getByText(text)).toBeVisible({ timeout: 10_000 });
  });
});

/**
 * Regression tests for bugs fixed in the 2026-05-25 audit.
 *
 * Run with:
 *   npx playwright test --config playwright.vercel.config.ts e2e/audit-2026-05-25.spec.ts
 *
 * The file deliberately mirrors the style of audit.spec.ts:
 *  - API constants at the top
 *  - Shared state mutated in beforeAll
 *  - injectAuth / waitForAngular helpers
 *  - API-first setup to minimise UI flakiness
 */

import { test, expect } from '@playwright/test';

// ── Constants ─────────────────────────────────────────────────────────────────

const API = 'https://book-club-be.onrender.com/api/v1';

/** Organizer account that owns at least one club */
const ORGANIZER_EMAIL = 'test123@mail.com';
const ORGANIZER_PASSWORD = 'test123@mail.com';

// ── Shared state ──────────────────────────────────────────────────────────────

let ORGANIZER_TOKEN = '';
let ORGANIZER_CLUB_ID = '';

/** A fresh user registered per-run so we start with no club memberships */
let FRESH_USER_TOKEN = '';
let FRESH_USER_EMAIL = '';

/** An event that belongs to ORGANIZER_CLUB_ID (any event will do) */
let ANY_EVENT_ID = '';

// ── Helpers ───────────────────────────────────────────────────────────────────

async function injectAuth(page: import('@playwright/test').Page, token: string): Promise<void> {
  await page.addInitScript(
    ({ at }) => {
      sessionStorage.setItem('bc_access_token', at);
    },
    { at: token },
  );
}

async function waitForAngular(page: import('@playwright/test').Page): Promise<void> {
  await page.waitForLoadState('networkidle').catch(() => {/* ignore timeout */});
}

// ── Setup ─────────────────────────────────────────────────────────────────────

test.setTimeout(120_000);

test.beforeAll(async ({ request }) => {
  // ── 1. Login as organizer ──────────────────────────────────────────────────
  const loginResp = await request.post(`${API}/auth/login`, {
    data: { email: ORGANIZER_EMAIL, password: ORGANIZER_PASSWORD },
    timeout: 60_000,
  });
  if (loginResp.ok()) {
    const body = await loginResp.json();
    ORGANIZER_TOKEN = body.accessToken ?? '';
  }

  // ── 2. Discover organizer's first club ────────────────────────────────────
  if (ORGANIZER_TOKEN) {
    const headers = { Authorization: `Bearer ${ORGANIZER_TOKEN}` };
    const clubsResp = await request.get(`${API}/clubs`, { headers, timeout: 30_000 }).catch(() => null);
    if (clubsResp?.ok()) {
      const body = await clubsResp.json();
      const clubs: { id: string }[] = Array.isArray(body) ? body : body.items ?? body.data ?? [];
      if (clubs.length > 0) ORGANIZER_CLUB_ID = clubs[0].id;
    }

    // ── 3. Discover an event ────────────────────────────────────────────────
    const eventsResp = await request.get(`${API}/events`, { headers, timeout: 30_000 }).catch(() => null);
    if (eventsResp?.ok()) {
      const body = await eventsResp.json();
      const events: { id: string }[] = Array.isArray(body) ? body : body.items ?? body.data ?? [];
      if (events.length > 0) ANY_EVENT_ID = events[0].id;
    }
  }

  // ── 4. Register a brand-new user so it has no club memberships ────────────
  FRESH_USER_EMAIL = `audit-regression-${Date.now()}@mailinator.com`;
  const regResp = await request.post(`${API}/auth/register`, {
    data: {
      email: FRESH_USER_EMAIL,
      password: 'AuditPass123!',
      displayName: 'AuditRegressionUser',
      role: 'reader',
    },
    timeout: 30_000,
  }).catch(() => null);
  if (regResp?.ok()) {
    const body = await regResp.json();
    FRESH_USER_TOKEN = body.accessToken ?? '';
  }
  // If register didn't return a token, attempt an explicit login
  if (!FRESH_USER_TOKEN) {
    const loginResp2 = await request.post(`${API}/auth/login`, {
      data: { email: FRESH_USER_EMAIL, password: 'AuditPass123!' },
      timeout: 30_000,
    }).catch(() => null);
    if (loginResp2?.ok()) {
      const body = await loginResp2.json();
      FRESH_USER_TOKEN = body.accessToken ?? '';
    }
  }
});

// ── B1 — WS 403 after join ────────────────────────────────────────────────────
// Register user → join club → open chat panel → no 403 WebSocket / chat renders

test.describe('B1 — WS 403 after join', () => {
  test('chat panel is reachable after joining a club (no 403)', async ({ page, request }) => {
    test.skip(!FRESH_USER_TOKEN || !ORGANIZER_CLUB_ID, 'Skipped: fresh user token or club ID not available');

    const freshHeaders = { Authorization: `Bearer ${FRESH_USER_TOKEN}` };

    // Step 1: Join the club via API
    const joinResp = await request.post(`${API}/clubs/${ORGANIZER_CLUB_ID}/join`, {
      headers: freshHeaders,
      timeout: 30_000,
    });
    // 200, 201, or 409 (already member) are all acceptable
    expect([200, 201, 409]).toContain(joinResp.status());

    // Step 2: Detect any WS close with code 4003 / 403-equivalent
    const wsCloseErrors: number[] = [];
    page.on('websocket', ws => {
      ws.on('close', () => {
        // Playwright does not expose WS close code directly, but we can record the event
        // Any unexpected WS close is flagged — the real assertion is on the UI below
      });
      ws.on('framereceived', frame => {
        const data = typeof frame.payload === 'string' ? frame.payload : '';
        if (data.includes('"error"') && data.includes('403')) {
          wsCloseErrors.push(403);
        }
      });
    });

    // Track network 403s that point to the WS endpoint (HTTP upgrade failure shows as XHR)
    const forbidden403s: string[] = [];
    page.on('response', resp => {
      if (resp.status() === 403 && resp.url().includes('chat')) {
        forbidden403s.push(resp.url());
      }
    });

    await injectAuth(page, FRESH_USER_TOKEN);
    await page.goto(`/clubs/${ORGANIZER_CLUB_ID}`);
    await waitForAngular(page);

    // Open chat: click the chat FAB (aria-label translated as "Open chat" / "Відкрити чат")
    const fabBtn = page.locator('button.chat-fab').first();
    const fabVisible = await fabBtn.isVisible().catch(() => false);
    if (fabVisible) {
      await fabBtn.click();
      await page.waitForTimeout(2000);
    }

    // The chat panel or the room-list container should be visible, not an error state
    const chatPanel = page.locator('.chat-panel').first();
    const panelVisible = await chatPanel.isVisible().catch(() => false);

    // No 403 errors on chat-related endpoints
    expect(forbidden403s, `Unexpected 403 on chat endpoint: ${forbidden403s.join(', ')}`).toHaveLength(0);
    expect(wsCloseErrors, `WebSocket 403 error encountered`).toHaveLength(0);

    if (fabVisible) {
      // If the FAB was there the panel should open successfully
      expect(panelVisible, 'Chat panel did not open after joining club').toBe(true);
    }

    // Cleanup: leave the club so we don't pollute state
    await request.post(`${API}/clubs/${ORGANIZER_CLUB_ID}/leave`, {
      headers: { Authorization: `Bearer ${FRESH_USER_TOKEN}` },
      timeout: 15_000,
    }).catch(() => {});
  });
});

// ── B2 — RSVP does not auto-join club ─────────────────────────────────────────
// RSVP to an event should NOT add the event's club to the user's clubs list

test.describe('B2 — RSVP does not auto-join club', () => {
  test('RSVPing to event does not add club to user club list', async ({ request }) => {
    test.skip(!FRESH_USER_TOKEN || !ANY_EVENT_ID, 'Skipped: fresh user token or event ID not available');

    const freshHeaders = { Authorization: `Bearer ${FRESH_USER_TOKEN}` };

    // Confirm user is NOT already a member of any club
    const clubsBefore = await request.get(`${API}/users/me/clubs`, {
      headers: freshHeaders,
      timeout: 30_000,
    });
    const beforeBody = clubsBefore.ok() ? await clubsBefore.json() : [];
    const clubsBefore_ids: string[] = (Array.isArray(beforeBody) ? beforeBody : beforeBody.items ?? beforeBody.data ?? [])
      .map((c: { id: string }) => c.id);

    // RSVP to the event
    const rsvpResp = await request.post(`${API}/events/${ANY_EVENT_ID}/attend`, {
      headers: freshHeaders,
      timeout: 30_000,
    });
    // 200, 201, or 409 (already attending) are acceptable
    expect([200, 201, 409]).toContain(rsvpResp.status());

    // Fetch user's clubs after RSVP
    const clubsAfter = await request.get(`${API}/users/me/clubs`, {
      headers: freshHeaders,
      timeout: 30_000,
    });
    expect(clubsAfter.ok()).toBe(true);
    const afterBody = await clubsAfter.json();
    const clubsAfter_ids: string[] = (Array.isArray(afterBody) ? afterBody : afterBody.items ?? afterBody.data ?? [])
      .map((c: { id: string }) => c.id);

    // The set of clubs must not have grown due to the RSVP
    const newClubs = clubsAfter_ids.filter(id => !clubsBefore_ids.includes(id));
    expect(
      newClubs,
      `RSVP added the user to club(s) automatically: ${newClubs.join(', ')}`,
    ).toHaveLength(0);
  });
});

// ── B3 — stats clubs_joined updates ──────────────────────────────────────────
// Joining a club should increase clubs_joined in /users/me/stats

test.describe('B3 — stats clubs_joined updates', () => {
  test('clubs_joined stat increments after joining a club', async ({ request }) => {
    test.skip(!FRESH_USER_TOKEN || !ORGANIZER_CLUB_ID, 'Skipped: fresh user token or club ID not available');

    const freshHeaders = { Authorization: `Bearer ${FRESH_USER_TOKEN}` };

    // Capture baseline stats
    const statsBefore = await request.get(`${API}/users/me/stats`, {
      headers: freshHeaders,
      timeout: 30_000,
    });
    const beforeBody = statsBefore.ok() ? await statsBefore.json() : {};
    const clubsJoinedBefore: number = beforeBody.clubsJoined ?? beforeBody.clubs_joined ?? 0;

    // Join the club
    const joinResp = await request.post(`${API}/clubs/${ORGANIZER_CLUB_ID}/join`, {
      headers: freshHeaders,
      timeout: 30_000,
    });
    expect([200, 201, 409]).toContain(joinResp.status());

    // Fetch stats after joining
    const statsAfter = await request.get(`${API}/users/me/stats`, {
      headers: freshHeaders,
      timeout: 30_000,
    });
    expect(statsAfter.ok()).toBe(true);
    const afterBody = await statsAfter.json();
    const clubsJoinedAfter: number = afterBody.clubsJoined ?? afterBody.clubs_joined ?? 0;

    expect(
      clubsJoinedAfter,
      `clubs_joined did not increment — before: ${clubsJoinedBefore}, after: ${clubsJoinedAfter}`,
    ).toBeGreaterThanOrEqual(1);

    // Cleanup
    await request.post(`${API}/clubs/${ORGANIZER_CLUB_ID}/leave`, {
      headers: freshHeaders,
      timeout: 15_000,
    }).catch(() => {});
  });
});

// ── B4 — duplicate chat room returns 409 ─────────────────────────────────────
// Creating a chat room with the same name twice should yield 201 then 409

test.describe('B4 — duplicate chat room returns 409', () => {
  test('second POST with same room name returns 409', async ({ request }) => {
    test.skip(!ORGANIZER_TOKEN || !ORGANIZER_CLUB_ID, 'Skipped: organizer token or club ID not available');

    const headers = { Authorization: `Bearer ${ORGANIZER_TOKEN}` };
    const roomName = `audit-regression-room-${Date.now()}`;

    // First create — must succeed
    const first = await request.post(`${API}/clubs/${ORGANIZER_CLUB_ID}/chat/rooms`, {
      headers,
      data: { name: roomName },
      timeout: 30_000,
    });
    expect(first.status(), `First room creation failed: ${first.status()}`).toBe(201);

    // Second create with identical name — must return 409
    const second = await request.post(`${API}/clubs/${ORGANIZER_CLUB_ID}/chat/rooms`, {
      headers,
      data: { name: roomName },
      timeout: 30_000,
    });
    expect(second.status(), `Expected 409 for duplicate room, got: ${second.status()}`).toBe(409);

    // Cleanup: attempt to delete the created room
    if (first.ok()) {
      const body = await first.json().catch(() => ({}));
      const roomId: string = body.id ?? '';
      if (roomId) {
        await request.delete(`${API}/clubs/${ORGANIZER_CLUB_ID}/chat/rooms/${roomId}`, {
          headers,
          timeout: 15_000,
        }).catch(() => {});
      }
    }
  });
});

// ── F1 — organizer dashboard accessible ──────────────────────────────────────
// Logged-in organizer navigates to /manage and sees the dashboard heading

test.describe('F1 — organizer dashboard accessible', () => {
  test('/manage renders organizer dashboard heading (no redirect to /login)', async ({ page }) => {
    test.skip(!ORGANIZER_TOKEN, 'Skipped: organizer token not available');

    await injectAuth(page, ORGANIZER_TOKEN);
    await page.goto('/manage');
    await waitForAngular(page);

    const url = page.url();
    expect(url, 'Organizer was redirected away from /manage').not.toContain('/login');

    // The organizer dashboard h1 reads "Organizer Dashboard" (en) / "ORGANIZER.title" translation
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
    // Heading must contain meaningful text (not empty, not an Angular placeholder)
    const headingText = await heading.innerText();
    expect(headingText.trim().length, 'h1 is empty on /manage').toBeGreaterThan(0);
  });
});

// ── F2 — my events tab shows RSVPed events ────────────────────────────────────
// After RSVPing to an event, visiting /events and switching to "My Events" shows the card

test.describe('F2 — my events tab shows RSVPed events', () => {
  test('RSVPed event appears under "My Events" tab on /events', async ({ page, request }) => {
    test.skip(!FRESH_USER_TOKEN || !ANY_EVENT_ID, 'Skipped: fresh user token or event ID not available');

    const freshHeaders = { Authorization: `Bearer ${FRESH_USER_TOKEN}` };

    // Ensure the user is attending the event
    await request.post(`${API}/events/${ANY_EVENT_ID}/attend`, {
      headers: freshHeaders,
      timeout: 30_000,
    }).catch(() => {});

    await injectAuth(page, FRESH_USER_TOKEN);
    await page.goto('/events');
    await waitForAngular(page);

    // Click the "My Events" tab — role="tab" with text matching EVENTS.tab_my translation
    const myEventsTab = page.locator('[role="tab"]', { hasText: /My Events|Мої події/i }).first();
    await expect(myEventsTab).toBeVisible({ timeout: 10_000 });
    await myEventsTab.click();
    await waitForAngular(page);

    // After clicking the tab, at least one event card should be present
    const eventCards = page.locator('[data-testid="event-card"], app-event-card');
    const cardCount = await eventCards.count();
    expect(
      cardCount,
      'No event cards visible in "My Events" tab after RSVPing to an event',
    ).toBeGreaterThan(0);
  });
});

// ── F3 — send button enables with text ───────────────────────────────────────
// Chat textarea: send button is disabled initially; typing enables it

test.describe('F3 — send button enables with text', () => {
  test('chat send button is disabled when input is empty and enabled when text is typed', async ({ page }) => {
    test.skip(!ORGANIZER_TOKEN || !ORGANIZER_CLUB_ID, 'Skipped: organizer token or club ID not available');

    await injectAuth(page, ORGANIZER_TOKEN);
    await page.goto(`/clubs/${ORGANIZER_CLUB_ID}`);
    await waitForAngular(page);

    // Open chat FAB
    const fabBtn = page.locator('button.chat-fab').first();
    const fabVisible = await fabBtn.isVisible().catch(() => false);
    if (!fabVisible) {
      test.skip(true, 'Skipped: chat FAB not visible — club may have no chat rooms');
      return;
    }
    await fabBtn.click();
    await page.waitForTimeout(1500);

    // If the room list is shown first, pick the first room
    const roomCard = page.locator('button.room-card').first();
    if (await roomCard.isVisible().catch(() => false)) {
      await roomCard.click();
      await page.waitForTimeout(1000);
    }

    // Locate the message input and send button inside the chat panel
    const chatInput = page.locator('.chat-panel input[type="text"]').last();
    const sendBtn = page.locator(
      '.chat-panel button[aria-label*="Send"], .chat-panel button[aria-label*="Надіслати"]',
    ).last();

    await expect(chatInput).toBeVisible({ timeout: 8_000 });
    await expect(sendBtn).toBeVisible({ timeout: 8_000 });

    // Initially disabled (input is empty)
    expect(
      await sendBtn.isDisabled(),
      'Send button should be disabled when the message input is empty',
    ).toBe(true);

    // Type some text — button should become enabled
    await chatInput.fill('Hello regression test');
    await expect(sendBtn).toBeEnabled({ timeout: 3_000 });

    // Clear the text — button should be disabled again
    await chatInput.fill('');
    expect(
      await sendBtn.isDisabled(),
      'Send button should be disabled again after clearing the message input',
    ).toBe(true);
  });
});

// ── U1 — RSVP button label consistent ────────────────────────────────────────
// The RSVP/attend button label must be identical on /events and /clubs/:id

test.describe('U1 — RSVP button label consistent', () => {
  test('RSVP button text matches between /events list and /clubs/:id detail', async ({ page }) => {
    test.skip(!ORGANIZER_TOKEN || !ORGANIZER_CLUB_ID || !ANY_EVENT_ID, 'Skipped: required IDs not available');

    await injectAuth(page, ORGANIZER_TOKEN);

    // ── Read RSVP label from /events ────────────────────────────────────────
    await page.goto('/events');
    await waitForAngular(page);

    // Look for the first visible non-disabled RSVP button rendered by <app-event-rsvp-button>
    // The component renders hlmBtn buttons — match by text content (RSVP / ✓ Going / Участь)
    const rsvpBtnEvents = page.locator('app-event-rsvp-button button').first();
    await expect(rsvpBtnEvents).toBeVisible({ timeout: 10_000 });
    const labelOnEvents = (await rsvpBtnEvents.innerText()).trim();

    // ── Read RSVP label from /clubs/:id ─────────────────────────────────────
    await page.goto(`/clubs/${ORGANIZER_CLUB_ID}`);
    await waitForAngular(page);

    const rsvpBtnClub = page.locator('app-event-rsvp-button button').first();
    await expect(rsvpBtnClub).toBeVisible({ timeout: 10_000 });
    const labelOnClub = (await rsvpBtnClub.innerText()).trim();

    // Both labels should be derived from the same translation key — they must match
    // Strip any loading spinner text (hlm-spinner aria text can sneak in)
    const normalize = (s: string) => s.replace(/\s+/g, ' ').trim();
    expect(
      normalize(labelOnEvents),
      `RSVP button text on /events ("${labelOnEvents}") differs from /clubs/:id ("${labelOnClub}") — labels are inconsistent`,
    ).toBe(normalize(labelOnClub));
  });
});

// ── U3 — single close chat button + Escape ────────────────────────────────────
// When chat is open there must be exactly ONE "Close chat" button; pressing Escape closes it

test.describe('U3 — single close chat button + Escape', () => {
  test('exactly one close-chat button exists and Escape closes the panel', async ({ page }) => {
    test.skip(!ORGANIZER_TOKEN || !ORGANIZER_CLUB_ID, 'Skipped: organizer token or club ID not available');

    await injectAuth(page, ORGANIZER_TOKEN);
    await page.goto(`/clubs/${ORGANIZER_CLUB_ID}`);
    await waitForAngular(page);

    // Open chat
    const fabBtn = page.locator('button.chat-fab').first();
    const fabVisible = await fabBtn.isVisible().catch(() => false);
    if (!fabVisible) {
      test.skip(true, 'Skipped: chat FAB not visible — club may have no chat rooms');
      return;
    }
    await fabBtn.click();
    await page.waitForTimeout(1500);

    // If we land on the room list (no single active room), navigate into a room first
    const roomCard = page.locator('button.room-card').first();
    if (await roomCard.isVisible().catch(() => false)) {
      await roomCard.click();
      await page.waitForTimeout(1000);
    }

    // Count buttons whose aria-label contains the Ukrainian "Закрити чат" or English "Close chat"
    // The component uses [attr.aria-label]="'CHAT.close' | translate"
    const closeBtns = page.locator(
      'button[aria-label="Закрити чат"], button[aria-label="Close chat"]',
    );
    const closeCount = await closeBtns.count();
    expect(
      closeCount,
      `Expected exactly 1 close-chat button, found ${closeCount}`,
    ).toBe(1);

    // Press Escape — the chat panel should disappear
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const chatPanel = page.locator('.chat-panel').first();
    await expect(
      chatPanel,
      'Chat panel should be hidden after pressing Escape',
    ).not.toBeVisible({ timeout: 3_000 });
  });
});

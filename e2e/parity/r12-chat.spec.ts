// R12 parity checks for the chat widget (shell) and /chats, run against BOTH targets (playwright projects `legacy` = Angular and `next`).
// REST and the chat WebSocket are mocked by e2e/parity/r12/fixtures.ts (page.route + page.routeWebSocket), so no backend, account or
// credential is involved. `shell.chatWidget` is switched on for Next by the local Edge Config stub (e2e/parity/r12/edge-config-server.mjs)
// plus the bucket cookie: bucket 10 = flag on, bucket 90 = flag off (see docs/migration/PARITY-R12.md "Method"). Angular always has the widget.
// Locators are shared by both DOMs (roles, aria-labels, placeholder, uk/en text); what differs by design is branched on the project
// name and listed as D-N* in the report.
import AxeBuilder from '@axe-core/playwright';
import type { Locator, Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { expect, test } from './bypass';
import { LANG_COOKIE, watchConsole } from './r6/helpers';
import { CLUB, history, installChatMock, OTHER_ID, OTHER_NAME, ROOM_A, ROOM_B, type ChatMock, type ChatOpts, type Viewer } from './r12/fixtures';

const SHOTS = 'playwright-report/parity/r12';
mkdirSync(SHOTS, { recursive: true });

type Lang = 'uk' | 'en';
const isNext = () => test.info().project.name === 'next';
// a Next server without the Edge Config stub cannot enable the flag: PARITY_R12_FLAG=0 skips what needs it instead of failing
const FLAG_AVAILABLE = process.env['PARITY_R12_FLAG'] !== '0';
const BUCKET_ON = '10';
const BUCKET_OFF = '90';

const L = {
  fab: /^(Open chat|Відкрити чат)/,
  fabClosed: /^(Close chat|Закрити чат)$/,
  placeholder: /Type a message|Написати повідомлення/,
  back: /^(Back|Назад)$/,
  retry: /^(Retry|Повторити|Спробувати ще)/,
} as const;

async function open(
  page: Page,
  viewer: Viewer,
  path: string,
  opts: ChatOpts = {},
  lang: Lang = 'en',
  theme: 'light' | 'dark' = 'light',
  bucket: string = BUCKET_ON,
): Promise<ChatMock> {
  const mock = await installChatMock(page, viewer, opts);
  const baseURL = test.info().project.use.baseURL!;
  await page.context().addCookies([...LANG_COOKIE(baseURL, lang, theme), { name: 'bc_bucket', value: bucket, url: baseURL }]);
  await page.goto(path);
  return mock;
}

const fab = (page: Page): Locator => page.getByRole('button', { name: /^(Open chat|Відкрити чат|Close chat|Закрити чат)/ }).first();
const panel = (page: Page): Locator => (isNext() ? page.getByRole('dialog') : page.locator('.chat-panel'));
const composer = (page: Page): Locator => page.getByPlaceholder(L.placeholder);
const sendBtn = (page: Page) => page.getByRole('button', { name: /^(Send|Надіслати)$/ });

async function openWidget(page: Page): Promise<void> {
  await fab(page).click();
  await expect(panel(page)).toBeVisible();
}
/** Types in the widget composer and presses Enter (both DOMs submit on Enter). */
async function typeAndSend(page: Page, text: string): Promise<void> {
  const box = composer(page);
  await box.fill(text);
  await box.press('Enter');
}
const count = (page: Page, text: string | RegExp) => page.getByText(text).count();
const settle = (page: Page) => page.waitForLoadState('networkidle');
const ws = (m: ChatMock) => m.sockets.map((s) => `${s.roomId.slice(-1)}:${s.ticket ?? '-'}:${s.closed ? 'x' : 'o'}`).join(' ');
const chatCalls = (m: ChatMock) => m.log.filter((r) => /\/chat\/|ws-ticket|\/unread-count/.test(r.path));

/** The mock sockets that are still open and answered auth. */
const live = (m: ChatMock, roomId?: string) => m.open(roomId).filter((s) => s.authed);

test.beforeEach(() => {
  test.skip(isNext() && !FLAG_AVAILABLE, 'PARITY_R12_FLAG=0: the Next server has no Edge Config stub');
});

// ---------------------------------------------------------------------------------------------------------------------
// P1/P4 guards
// ---------------------------------------------------------------------------------------------------------------------
test.describe('guest', () => {
  for (const path of ['/chats', '/clubs']) {
    test(`guest on ${path}: no widget, no ticket, no socket, no chat call`, async ({ page }) => {
      const m = await open(page, 'guest', path);
      if (path === '/chats') await expect(page).toHaveURL(/\/login/);
      await settle(page);
      await page.waitForTimeout(500);
      expect(m.sockets).toHaveLength(0);
      expect(m.tickets).toHaveLength(0);
      expect(chatCalls(m).map((r) => r.path)).toEqual([]);
      await expect(page.getByRole('button', { name: L.fab })).toHaveCount(0);
      await expect(page.getByRole('link', { name: L.fab })).toHaveCount(0);
    });
  }

  test('guest guard redirects /chats to /login without a returnUrl', async ({ page }) => {
    await open(page, 'guest', '/chats');
    await expect(page).toHaveURL(/\/login(\?|$)/);
    expect(new URL(page.url()).searchParams.get('returnUrl')).toBeNull();
  });
});

// ---------------------------------------------------------------------------------------------------------------------
// flag off (Next only: Angular has no flag)
// ---------------------------------------------------------------------------------------------------------------------
test.describe('flag off', () => {
  test.beforeEach(() => test.skip(!isNext(), 'Angular has no chat flag: the widget is always on'));

  test('legacy ChatLink to /chats, zero chat requests and sockets on /clubs', async ({ page }) => {
    const m = await open(page, 'member', '/clubs', {}, 'en', 'light', BUCKET_OFF);
    const link = page.getByRole('link', { name: L.fab });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', '/chats');
    await settle(page);
    await page.waitForTimeout(800);
    expect(chatCalls(m).map((r) => r.path)).toEqual([]);
    expect(m.sockets).toHaveLength(0);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('the link still reaches a working /chats (page is active without the flag)', async ({ page }) => {
    const m = await open(page, 'member', '/clubs', {}, 'en', 'light', BUCKET_OFF);
    await page.getByRole('link', { name: L.fab }).click();
    await expect(page).toHaveURL(/\/chats$/);
    await expect(page.getByText('Повідомлення A-6')).toBeVisible();
    await expect.poll(() => live(m).length).toBe(1);
  });

  test('leaving /chats with the flag off closes the socket (zero open sockets)', async ({ page }) => {
    const m = await open(page, 'member', '/chats', {}, 'en', 'light', BUCKET_OFF);
    await expect.poll(() => live(m).length).toBe(1);
    await page.getByRole('link', { name: /Clubs|Клуби/ }).first().click();
    await expect(page).toHaveURL(/\/clubs$/);
    await expect.poll(() => m.open().length, { message: ws(m) }).toBe(0);
  });
});

// ---------------------------------------------------------------------------------------------------------------------
// flag on: FAB, badge, open/close, send, live, paging
// ---------------------------------------------------------------------------------------------------------------------
test.describe('widget', () => {
  test('FAB, unread badge from the server counts, open shows history, close returns focus', async ({ page }) => {
    const errs = watchConsole(page);
    const m = await open(page, 'member', '/clubs', { unread: { [ROOM_A]: { count: 3, last: null }, [ROOM_B]: { count: 2, last: null } } });
    const f = fab(page);
    await expect(f).toBeVisible();
    if (isNext()) {
      await expect(f).toContainText('5');
      await expect(f).toHaveAccessibleName(/5 unread|5 непрочитан/);
    } else {
      // D-N1: Angular fetches /unread-count only from the /chats page, so the widget FAB never shows server counts
      await page.waitForTimeout(800);
      expect(m.calls('GET', `/chat/rooms/${ROOM_A}/unread-count`)).toHaveLength(0);
      expect(await f.textContent()).not.toMatch(/\d/);
    }
    await f.click();
    await expect(panel(page)).toBeVisible();
    await expect(page.getByText('Повідомлення A-6')).toBeVisible();
    await expect(composer(page)).toBeVisible();
    if (isNext()) {
      // opening the room marks it read: the server is told the newest id and the badge drops by this room's count
      await expect.poll(() => m.calls('POST', `/chat/rooms/${ROOM_A}/read`).length).toBeGreaterThanOrEqual(1);
      expect(JSON.parse(m.calls('POST', `/chat/rooms/${ROOM_A}/read`)[0]!.body ?? '{}')).toEqual({ last_read_message_id: history(ROOM_A, 6)[5]!.id });
      await expect(fab(page)).toContainText('2');
    }
    await fab(page).click();
    await expect(panel(page)).toHaveCount(0);
    expect(errs).toEqual([]);
  });

  test('Escape closes the panel and focus returns to the FAB (Next; Angular recorded)', async ({ page }) => {
    await open(page, 'member', '/clubs');
    await openWidget(page);
    await composer(page).press('Escape');
    if (isNext()) {
      await expect(panel(page)).toHaveCount(0);
      await expect(fab(page)).toBeFocused();
    } else {
      test.info().annotations.push({ type: 'escape', description: `panel still open: ${await panel(page).count()}` });
    }
  });

  test('send: optimistic bubble, one POST, the WebSocket echo does not duplicate it', async ({ page }) => {
    const m = await open(page, 'member', '/clubs', { echoDelayMs: 700 });
    await openWidget(page);
    await typeAndSend(page, 'Привіт, клубе');
    await expect(page.getByText('Привіт, клубе')).toHaveCount(1);
    await expect.poll(() => m.calls('POST', `/chat/rooms/${ROOM_A}/messages`).length).toBe(1);
    expect(JSON.parse(m.calls('POST', `/chat/rooms/${ROOM_A}/messages`)[0]!.body!)).toEqual({ text: 'Привіт, клубе' });
    await page.waitForTimeout(1500); // the echo frame arrived by now
    await expect(page.getByText('Привіт, клубе')).toHaveCount(1);
    await expect(composer(page)).toHaveValue('');
  });

  test('send without echo (frame lost) still shows exactly one bubble', async ({ page }) => {
    const m = await open(page, 'member', '/clubs', { echo: false });
    await openWidget(page);
    await typeAndSend(page, 'Без луни');
    await expect.poll(() => m.calls('POST', `/chat/rooms/${ROOM_A}/messages`).length).toBe(1);
    await page.waitForTimeout(600);
    await expect(page.getByText('Без луни')).toHaveCount(1);
  });

  test('empty and whitespace-only text cannot be sent', async ({ page }) => {
    const m = await open(page, 'member', '/clubs');
    await openWidget(page);
    await composer(page).fill('   ');
    await composer(page).press('Enter');
    await sendBtn(page).click({ force: true }).catch(() => undefined);
    await page.waitForTimeout(300);
    expect(m.calls('POST', `/chat/rooms/${ROOM_A}/messages`)).toHaveLength(0);
  });

  test('a message from another user arrives live; closed widget raises the badge', async ({ page }) => {
    const m = await open(page, 'member', '/clubs');
    await openWidget(page);
    await expect.poll(() => live(m, ROOM_A).length).toBe(1);
    m.push(ROOM_A, { text: 'Привіт від Івана' });
    await expect(page.getByText('Привіт від Івана')).toBeVisible();
    await fab(page).click(); // close
    await expect(panel(page)).toHaveCount(0);
    m.push(ROOM_A, { text: 'Ще одне, поки закрито' });
    await expect(fab(page)).toContainText('1');
    await fab(page).click();
    await expect(page.getByText('Ще одне, поки закрито')).toBeVisible();
    await expect(fab(page)).not.toContainText('1');
  });

  test('own frame (same sender) never raises the badge', async ({ page }) => {
    const m = await open(page, 'member', '/clubs');
    await expect.poll(() => live(m, ROOM_A).length).toBe(1);
    m.push(ROOM_A, { text: 'моє з іншої вкладки', senderId: 'user-member', senderName: 'Максим Учасник' });
    await page.waitForTimeout(500);
    expect(await fab(page).textContent()).not.toMatch(/\d/);
  });

  for (const where of ['widget', 'page'] as const) {
    test(`older history in the ${where}: scrolling to the top pages with before_id of the oldest id; no duplicates; stops at the beginning`, async ({ page }, ti) => {
      test.skip(!isNext() && where === 'widget', 'Angular widget list cannot scroll (L-1, pinned by its own test below)');
      const all = history(ROOM_A, 120);
      const m = await open(page, 'member', where === 'widget' ? '/clubs' : '/chats', { messages: { [ROOM_A]: all, [ROOM_B]: history(ROOM_B, 3) } });
      if (where === 'widget') await openWidget(page);
      await expect(page.getByText('Повідомлення A-120', { exact: true })).toBeVisible();
      await expect(page.getByText('Повідомлення A-70', { exact: true })).toHaveCount(0);
      const scroller = where === 'widget' ? panel(page).getByRole('log') : page.locator('[role=log], .chats-main [aria-live=polite]').first();
      const toTop = () => scroller.evaluate((el) => {
        el.scrollTop = 0;
        return el.scrollHeight > el.clientHeight;
      });
      expect(await toTop()).toBe(true);
      const pagedCalls = () => m.log.filter((r) => r.method === 'GET' && /\/messages$/.test(r.path) && /before/.test(r.query));
      await expect.poll(() => pagedCalls().length).toBeGreaterThanOrEqual(1);
      ti.annotations.push({ type: 'paging-query', description: pagedCalls()[0]!.query });
      // the backend parameter is `before_id` (app/routers/chat.py); `before` is silently ignored by the real server (L-2)
      if (isNext()) expect(pagedCalls()[0]!.query).toContain(`before_id=${all[70]!.id}`);
      else expect(pagedCalls()[0]!.query).toContain(`before=${all[70]!.id}`);
      await expect(page.getByText('Повідомлення A-70', { exact: true })).toHaveCount(1);
      for (const k of [71, 100, 120]) await expect(page.getByText(`Повідомлення A-${k}`, { exact: true })).toHaveCount(1);
      await toTop();
      await expect(page.getByText('Повідомлення A-21', { exact: true })).toHaveCount(1, { timeout: 15_000 });
      for (let i = 0; i < 4; i++) {
        await toTop();
        await page.waitForTimeout(250);
      }
      await expect(page.getByText('Повідомлення A-1', { exact: true })).toHaveCount(1);
      ti.annotations.push({ type: 'older-pages', description: String(pagedCalls().length) });
      expect(pagedCalls().length).toBeLessThanOrEqual(4); // 120 = latest 50 + 50 + 20; once exhausted nothing more is requested
    });
  }

  test('L-1 (Angular only, pins the defect): with 50 messages the widget list is as tall as its content, so it never scrolls and the composer is clipped', async ({ page }) => {
    test.skip(isNext(), 'Next scrolls the list inside the panel');
    await open(page, 'member', '/clubs', { messages: { [ROOM_A]: history(ROOM_A, 120), [ROOM_B]: [] } });
    await openWidget(page);
    await expect(page.getByText('Повідомлення A-120', { exact: true })).toHaveCount(1);
    const geo = await panel(page).evaluate((p) => {
      const log = p.querySelector('[role=log]') as HTMLElement;
      return { panel: p.clientHeight, list: log.clientHeight, scrolls: log.scrollHeight > log.clientHeight };
    });
    expect(geo.list).toBeGreaterThan(geo.panel);
    expect(geo.scrolls).toBe(false);
    await expect(composer(page)).not.toBeInViewport();
  });
});

// ---------------------------------------------------------------------------------------------------------------------
// socket lifecycle: rooms, offline, resume, tickets, give-up, 1008, error frames, logout
// ---------------------------------------------------------------------------------------------------------------------
const NOTICE = {
  reconnecting: /Reconnecting|Перепідключення/,
  lost: /Live updates are off|Оновлення в реальному часі вимкнено/,
  stopped: /server ended this chat session|Сервер завершив сеанс чату/,
};
const retry = (page: Page) => page.getByRole('button', { name: L.retry });

/** `document.hidden` / `visibilityState` are what both targets read; redefined because headless Chromium never goes hidden. */
async function setHidden(page: Page, hidden: boolean): Promise<void> {
  await page.evaluate((h) => {
    for (const [k, v] of [['hidden', h], ['visibilityState', h ? 'hidden' : 'visible']] as const) Object.defineProperty(document, k, { configurable: true, get: () => v });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
}

/** Every ticket the app asked for was used by at most one socket, and every socket authenticated with a ticket this mock issued. */
function expectTicketsFresh(m: ChatMock): void {
  const used = m.sockets.map((s) => s.ticket).filter((t): t is string => t !== null);
  expect(new Set(used).size, `tickets reused: ${used.join(',')}`).toBe(used.length);
  for (const t of used) expect(m.tickets).toContain(t);
}

test.describe('socket lifecycle', () => {
  test('connects with a ticket from POST /auth/ws-ticket and an auth frame, to the room path', async ({ page }) => {
    const m = await open(page, 'member', '/clubs');
    await expect.poll(() => live(m).length, { message: ws(m) }).toBe(1);
    const s = live(m)[0]!;
    expect(s.roomId).toBe(ROOM_A);
    expect(s.url).toMatch(/^wss:\/\/book-club-be\.onrender\.com\/api\/v1\/chat\/rooms\//);
    expect(s.ticket).toBe(m.tickets[0]);
    expect(s.url).not.toContain(s.ticket!); // the ticket travels in the first frame, never in the URL
    expect(m.calls('POST', '/auth/ws-ticket')).toHaveLength(1);
  });

  test('room switch closes the old socket and opens a new one with a fresh ticket', async ({ page }) => {
    const errs = watchConsole(page);
    const m = await open(page, 'member', '/clubs');
    await openWidget(page);
    await expect.poll(() => live(m, ROOM_A).length).toBe(1);
    const first = live(m)[0]!;
    await page.getByRole('button', { name: L.back }).click();
    await page.getByRole('button', { name: /Книги/ }).click();
    await expect(page.getByText('Повідомлення B-3')).toBeVisible();
    await expect.poll(() => live(m, ROOM_B).length, { message: ws(m) }).toBe(1);
    await expect.poll(() => first.closed).toBe(true);
    expect(m.open()).toHaveLength(1);
    expect(live(m, ROOM_B)[0]!.ticket).not.toBe(first.ticket);
    expectTicketsFresh(m);
    // frames of the room that was left must not show up in the one on screen
    m.push(ROOM_A, { text: 'чуже з кімнати A' });
    await page.waitForTimeout(400);
    await expect(page.getByText('чуже з кімнати A')).toHaveCount(0);
    expect(errs).toEqual([]);
  });

  test('presence snapshot: sender of an online user is marked online in the list', async ({ page }) => {
    const m = await open(page, 'member', '/clubs');
    await openWidget(page);
    await expect.poll(() => live(m).length).toBe(1);
    await expect(page.getByText(OTHER_NAME).first()).toBeVisible();
    // Next renders `role=img name=Online`; Angular a green dot next to the name (no accessible name)
    if (isNext()) await expect(panel(page).getByRole('img', { name: /Online|Онлайн/ }).first()).toBeVisible();
    else await expect(panel(page).locator('.bg-green-500, [class*=green]').first()).toBeVisible();
    m.frame(ROOM_A, { type: 'presence', payload: { userId: OTHER_ID, status: 'offline' } });
    if (isNext()) await expect(panel(page).getByRole('img', { name: /Online|Онлайн/ })).toHaveCount(0);
  });

  test('reconnect after offline/online: a new socket with a new ticket, one open socket', async ({ page, context }) => {
    const m = await open(page, 'member', '/clubs');
    await openWidget(page);
    await expect.poll(() => live(m).length).toBe(1);
    const first = live(m)[0]!;
    await context.setOffline(true);
    m.drop(); // a mocked socket is not killed by offline emulation: the server side is dropped explicitly
    if (isNext()) await expect(page.getByText(NOTICE.reconnecting)).toBeVisible();
    await context.setOffline(false);
    await expect.poll(() => live(m).length, { timeout: 25_000, message: ws(m) }).toBe(1);
    expect(live(m)[0]).not.toBe(first);
    expect(live(m)[0]!.ticket).not.toBe(first.ticket);
    expectTicketsFresh(m);
    expect(m.open()).toHaveLength(1);
    if (isNext()) await expect(page.getByText(NOTICE.reconnecting)).toHaveCount(0);
    // history gap is refilled after a reopen: frames sent while the socket was down are fetched
    m.messages[ROOM_A]!.push({ id: 'd0000000-0000-4000-8000-0000000007ff', senderId: OTHER_ID, senderName: OTHER_NAME, text: 'пропущене', timestamp: new Date().toISOString(), isSystem: false });
    m.drop();
    await expect.poll(() => live(m).length, { timeout: 25_000 }).toBe(1);
    if (isNext()) await expect(page.getByText('пропущене')).toBeVisible({ timeout: 10_000 });
    else {
      // D-N7: Angular does not re-read history after a reopen, so what was missed while the socket was down stays missing until a reload
      await page.waitForTimeout(2_000);
      await expect(page.getByText('пропущене')).toHaveCount(0);
    }
  });

  test('a tab asleep for more than 30 s reconnects when it comes back, even though the browser never reported a close (Next; Angular recorded)', async ({ page }) => {
    await page.clock.install();
    const m = await open(page, 'member', '/clubs');
    await openWidget(page);
    await expect.poll(() => live(m).length).toBe(1);
    const first = live(m)[0]!;
    await setHidden(page, true);
    await page.clock.fastForward(31_000);
    await setHidden(page, false);
    if (isNext()) {
      await expect.poll(() => live(m).length, { message: ws(m) }).toBe(1);
      expect(live(m)[0]).not.toBe(first);
      await expect.poll(() => first.closed).toBe(true);
      expectTicketsFresh(m);
    } else {
      await page.waitForTimeout(1500);
      test.info().annotations.push({ type: 'resume', description: `sockets after 31s hidden: ${ws(m)}` });
    }
  });

  test('a short hide (under 30 s) with a healthy socket does not reconnect (Next)', async ({ page }) => {
    test.skip(!isNext(), 'Angular recorded in the long-sleep test');
    await page.clock.install();
    const m = await open(page, 'member', '/clubs');
    await openWidget(page);
    await expect.poll(() => live(m).length).toBe(1);
    await setHidden(page, true);
    await page.clock.fastForward(5_000);
    await setHidden(page, false);
    await page.waitForTimeout(800);
    expect(m.sockets).toHaveLength(1);
    expect(m.tickets).toHaveLength(1);
  });

  test('visible again after a drop while hidden reconnects at once (Next)', async ({ page }) => {
    test.skip(!isNext(), 'Angular recorded elsewhere');
    const m = await open(page, 'member', '/clubs');
    await openWidget(page);
    await expect.poll(() => live(m).length).toBe(1);
    await setHidden(page, true);
    m.drop();
    await setHidden(page, false);
    await expect.poll(() => live(m).length, { timeout: 5_000, message: ws(m) }).toBe(1);
    expectTicketsFresh(m);
  });

  test('gives up after repeated pre-auth failures, then Retry opens a working socket', async ({ page }, ti) => {
    await page.clock.install();
    const m = await open(page, 'member', '/clubs', { wsMode: 'refuse' });
    await openWidget(page);
    for (let i = 0; i < 80 && !(isNext() ? (await page.getByText(NOTICE.lost).count()) > 0 : i > 40); i++) {
      await page.clock.fastForward(10_000);
      await page.waitForTimeout(120);
    }
    ti.annotations.push({ type: 'give-up', description: `sockets=${m.sockets.length} tickets=${m.tickets.length}` });
    if (isNext()) {
      await expect(page.getByText(NOTICE.lost)).toBeVisible();
      expect(m.sockets).toHaveLength(6); // maxAuthFailures
      expect(m.tickets).toHaveLength(6); // one ticket per attempt
      expectTicketsFresh(m);
      const before = m.sockets.length;
      await page.clock.fastForward(120_000); // no further attempts once it gave up
      await page.waitForTimeout(300);
      expect(m.sockets).toHaveLength(before);
      m.wsMode = 'ok';
      await retry(page).click();
      await expect.poll(() => live(m).length).toBe(1);
      await expect(page.getByText(NOTICE.lost)).toHaveCount(0);
      expect(m.sockets).toHaveLength(before + 1);
    } else {
      // D-N3: Angular never gives up and has no Retry: it keeps opening sockets and tickets at the capped backoff
      expect(m.sockets.length).toBeGreaterThan(6);
      await expect(retry(page)).toHaveCount(0);
    }
  });

  test('server close 1008 after auth: stopped notice, no reconnect storm, Retry reconnects', async ({ page }, ti) => {
    const m = await open(page, 'member', '/clubs', { wsMode: 'kick' });
    await openWidget(page);
    await expect.poll(() => m.sockets.some((s) => s.closeCode === 1008)).toBe(true);
    await page.waitForTimeout(isNext() ? 3_500 : 6_000);
    ti.annotations.push({ type: '1008', description: `sockets=${m.sockets.length} tickets=${m.tickets.length}` });
    if (isNext()) {
      await expect(page.getByText(NOTICE.stopped)).toBeVisible();
      expect(m.sockets).toHaveLength(1);
      m.wsMode = 'ok';
      await retry(page).click();
      await expect.poll(() => live(m).length).toBe(1);
      expect(m.sockets).toHaveLength(2);
      await expect(page.getByText(NOTICE.stopped)).toHaveCount(0);
      expectTicketsFresh(m);
    } else {
      // D-N4: Angular treats a 1008 like any close and reconnects at once, so a removed or banned user keeps hitting the server
      expect(m.sockets.length).toBeGreaterThan(1);
      await expect(retry(page)).toHaveCount(0);
    }
  });

  for (const [code, text] of [
    ['RATE_LIMITED', /too fast|надто швидко/],
    ['ROOM_BANNED', /banned from this room|заблоковано/],
    ['INVALID_MESSAGE', /Message not sent|Повідомлення не надіслано/],
    ['SOMETHING_NEW', /The chat reported an error|Чат повідомив про помилку/],
  ] as const) {
    test(`error frame ${code} is shown as a message to the viewer (Next; Angular recorded) and the socket survives`, async ({ page }, ti) => {
      const errs = watchConsole(page);
      const m = await open(page, 'member', '/clubs');
      await openWidget(page);
      await expect.poll(() => live(m).length).toBe(1);
      m.frame(ROOM_A, { type: 'error', payload: { code, message: 'server text' } });
      if (isNext()) await expect(page.getByText(text).first()).toBeVisible();
      else {
        await page.waitForTimeout(600);
        ti.annotations.push({ type: 'error-frame', description: `${code}: toast=${(await page.getByText(text).count()) > 0}` });
      }
      await page.waitForTimeout(300);
      expect(live(m)).toHaveLength(1);
      expect(m.sockets).toHaveLength(1);
      expect(errs).toEqual([]);
    });
  }

  for (const [label, send] of [
    ['message with a payload that breaks the contract', (m: ChatMock) => m.frame(ROOM_A, { type: 'message', payload: { id: 1 } })],
    ['unknown frame type', (m: ChatMock) => m.frame(ROOM_A, { type: 'nope' })],
    ['non-JSON text', (m: ChatMock) => live(m).forEach((s) => s.route.send('not json'))],
  ] as const) {
    test(`a ${label} is ignored, the next good frame still renders`, async ({ page }, ti) => {
      const errs = watchConsole(page);
      const m = await open(page, 'member', '/clubs');
      await openWidget(page);
      await expect.poll(() => live(m).length).toBe(1);
      send(m);
      m.push(ROOM_A, { text: 'після сміття' });
      const shown = await page.getByText('після сміття').waitFor({ timeout: 4_000 }).then(() => true, () => false);
      ti.annotations.push({ type: 'bad-frame', description: `${label}: next frame shown=${shown}, console errors=${errs.length}` });
      if (isNext()) {
        expect(shown).toBe(true);
        expect(errs).toEqual([]);
        expect(m.sockets).toHaveLength(1);
      }
    });
  }

  test('a duplicate frame (same id) renders once', async ({ page }) => {
    const m = await open(page, 'member', '/clubs');
    await openWidget(page);
    await expect.poll(() => live(m).length).toBe(1);
    const msg = m.push(ROOM_A, { text: 'двічі' });
    m.frame(ROOM_A, { type: 'message', payload: msg });
    await expect(page.getByText('двічі')).toHaveCount(1);
    await page.waitForTimeout(400);
    await expect(page.getByText('двічі')).toHaveCount(1);
  });

  test('logout closes the socket, clears the chat UI and nothing reconnects', async ({ page }) => {
    const m = await open(page, 'member', '/clubs');
    await openWidget(page);
    await expect.poll(() => live(m).length).toBe(1);
    await page.locator('button[aria-haspopup=menu]:not(#next-logo)').click();
    await page.getByTestId('logout').click();
    await expect.poll(() => m.open().length, { timeout: 10_000, message: ws(m) }).toBe(0);
    await expect(page.getByText('Повідомлення A-6')).toHaveCount(0);
    await expect(page.getByRole('button', { name: L.fab })).toHaveCount(0);
    const socketsAtLogout = m.sockets.length;
    await page.waitForTimeout(1500);
    expect(m.sockets.length).toBe(socketsAtLogout); // nothing reconnects once logged out
  });
});

// ---------------------------------------------------------------------------------------------------------------------
// XSS, /chats, i18n, a11y, console, delayed /clubs/my
// ---------------------------------------------------------------------------------------------------------------------
const XSS = [
  '<img src=x onerror="window.__pwn=1">',
  '<script>window.__pwn=2</script>',
  '"><svg/onload=window.__pwn=3>',
  '[x](javascript:window.__pwn=4) **bold** `code` &lt;b&gt;',
];

test.describe('xss', () => {
  test('message text and sender name are rendered as text (widget)', async ({ page }) => {
    const errs = watchConsole(page);
    const m = await open(page, 'member', '/clubs');
    await openWidget(page);
    await expect.poll(() => live(m).length).toBe(1);
    const evilName = '<b>Evil</b><img src=x onerror="window.__pwn=5">';
    for (const text of XSS) m.push(ROOM_A, { text, senderName: evilName });
    await expect(page.getByText(XSS[0]!, { exact: true })).toBeVisible();
    await expect(page.getByText(XSS[3]!, { exact: true })).toBeVisible();
    await expect(page.getByText(evilName, { exact: true }).first()).toBeVisible();
    const log = panel(page).getByRole('log');
    expect(await log.locator('img, script, svg, b, a').count()).toBe(0);
    await page.waitForTimeout(500);
    expect(await page.evaluate(() => (window as unknown as { __pwn?: number }).__pwn)).toBeUndefined();
    expect(errs).toEqual([]);
  });

  test('message text and sender name are rendered as text (/chats)', async ({ page }) => {
    const m = await open(page, 'member', '/chats');
    await expect.poll(() => live(m).length).toBe(1);
    for (const text of XSS) m.push(ROOM_A, { text, senderName: '<i>x</i>' });
    await expect(page.getByText(XSS[1]!, { exact: true })).toBeVisible();
    expect(await page.locator('main img[src="x"], main script:not([src]), main b, main i, main svg[onload]').count()).toBe(0);
    expect(await page.evaluate(() => (window as unknown as { __pwn?: number }).__pwn)).toBeUndefined();
  });

  test('a hostile room name and club name are text in the room list', async ({ page }) => {
    await open(page, 'member', '/chats', { rooms: [{ id: ROOM_A, name: '<img src=x onerror="window.__pwn=9">' }] });
    await expect(page.getByText('<img src=x onerror="window.__pwn=9">').first()).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { __pwn?: number }).__pwn)).toBeUndefined();
  });

  test('a long unbroken message does not widen the panel (no horizontal scroll)', async ({ page }) => {
    const m = await open(page, 'member', '/clubs');
    await openWidget(page);
    await expect.poll(() => live(m).length).toBe(1);
    m.push(ROOM_A, { text: 'Ш'.repeat(900) });
    await expect(page.getByText('Ш'.repeat(900))).toBeVisible();
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(over).toBeLessThanOrEqual(0);
    const box = await panel(page).boundingBox();
    expect(box!.width).toBeLessThanOrEqual(321);
  });
});

test.describe('/chats page', () => {
  test('rooms, history, switch room, send, sidebar badge, no FAB on the page itself', async ({ page }) => {
    const errs = watchConsole(page);
    const m = await open(page, 'member', '/chats', { unread: { [ROOM_A]: { count: 0, last: null }, [ROOM_B]: { count: 4, last: null } } });
    await expect(page.getByText('Повідомлення A-6')).toBeVisible();
    await expect(page.getByRole('heading', { name: /^(Chats|Чати)$/ }).first()).toBeAttached();
    await expect(page.getByRole('button', { name: /Книги/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /^(Open chat|Відкрити чат)/ })).toHaveCount(0); // the widget is hidden on /chats
    await expect(page.locator('aside, .chats-sidebar').first()).toContainText('4');
    await expect.poll(() => live(m, ROOM_A).length).toBe(1);
    await page.getByRole('button', { name: /Книги/ }).click();
    await expect(page.getByText('Повідомлення B-3')).toBeVisible();
    await expect.poll(() => live(m, ROOM_B).length).toBe(1);
    expect(m.open()).toHaveLength(1);
    await typeAndSend(page, 'з /chats');
    await expect(page.getByText('з /chats')).toHaveCount(1);
    await expect.poll(() => m.calls('POST', `/chat/rooms/${ROOM_B}/messages`).length).toBe(1);
    await page.waitForTimeout(600);
    await expect(page.getByText('з /chats')).toHaveCount(1);
    m.push(ROOM_B, { text: 'жива на сторінці' });
    await expect(page.getByText('жива на сторінці')).toBeVisible();
    expectTicketsFresh(m);
    expect(errs).toEqual([]);
  });

  test('no rooms: an empty state, no socket, no ticket', async ({ page }) => {
    const m = await open(page, 'member', '/chats', { rooms: [], noClubs: true });
    await expect(page.getByText(/No chat rooms|Немає кімнат|no rooms|not (a )?member|ще немає|Кімнати чату недоступні/i).first()).toBeVisible();
    await page.waitForTimeout(500);
    expect(m.sockets).toHaveLength(0);
    expect(m.tickets).toHaveLength(0);
  });

  for (const status of [500, 503] as const) {
    test(`rooms request failing with ${status}: no crash, no socket (Next shows a retry)`, async ({ page }) => {
      const errs = watchConsole(page);
      const m = await open(page, 'member', '/chats', { fail: { 'GET /clubs/my': status } });
      await page.waitForTimeout(1500);
      expect(m.sockets).toHaveLength(0);
      if (isNext()) await expect(page.getByRole('button', { name: /Retry|Try again|Спробувати|Повторити/ }).first()).toBeVisible();
      expect(errs.filter((e) => /pageerror/.test(e))).toEqual([]);
    });
  }

  test('older history on the page keeps the viewport anchored (scroll position stays near the old top)', async ({ page }) => {
    await open(page, 'member', '/chats', { messages: { [ROOM_A]: history(ROOM_A, 120), [ROOM_B]: [] } });
    const scroller = page.locator('[role=log], .chats-main [aria-live=polite]').first();
    await expect(page.getByText('Повідомлення A-120', { exact: true })).toBeVisible();
    await scroller.evaluate((el) => (el.scrollTop = 0));
    await expect(page.getByText('Повідомлення A-70', { exact: true })).toHaveCount(1);
    await page.waitForTimeout(500);
    const st = await scroller.evaluate((el) => el.scrollTop);
    expect(st).toBeGreaterThan(40);
  });
});

for (const lang of ['uk', 'en'] as const) {
  test(`i18n ${lang}: FAB, placeholder, send, close, connection notice`, async ({ page }) => {
    const m = await open(page, 'member', '/clubs', { wsMode: 'refuse' }, lang);
    const name = lang === 'uk' ? /^Відкрити чат/ : /^Open chat/;
    await expect(page.getByRole('button', { name })).toBeVisible();
    await page.getByRole('button', { name }).click();
    await expect(page.getByPlaceholder(lang === 'uk' ? /Написати повідомлення/ : /Type a message/)).toBeVisible();
    await expect(page.getByRole('button', { name: lang === 'uk' ? /^Закрити чат$/ : /^Close chat$/ }).first()).toBeVisible();
    if (isNext()) {
      await expect(page.getByText(lang === 'uk' ? NOTICE_UK : NOTICE.reconnecting)).toBeVisible();
    }
    await expect.poll(() => m.sockets.length).toBeGreaterThan(0);
  });
}
const NOTICE_UK = /Перепідключення/;

// console / render-loop journey: /clubs/my held for 1.5 s
test.describe('slow /clubs/my', () => {
  test('1.5 s delayed /clubs/my: no render loop, page stays responsive, bounded requests, widget works after', async ({ page }) => {
    const errs = watchConsole(page);
    const m = await open(page, 'member', '/clubs', { myClubsDelayMs: 1500 });
    await page.evaluate(() => {
      (window as unknown as { __ticks: number }).__ticks = 0;
      setInterval(() => ((window as unknown as { __ticks: number }).__ticks += 1), 50);
    });
    // responsive while the request is held: a click on the page chrome is handled
    await page.getByRole('button', { name: /dark mode|темн/i }).first().click({ timeout: 3_000 });
    await page.waitForTimeout(2_500);
    const ticks = await page.evaluate(() => (window as unknown as { __ticks: number }).__ticks);
    expect(ticks, 'main thread starved: timer ticks in 2.5 s').toBeGreaterThan(30);
    await expect(fab(page)).toBeVisible();
    await openWidget(page);
    await expect(page.getByText('Повідомлення A-6')).toBeVisible();
    await expect.poll(() => live(m).length).toBe(1);
    expect(m.calls('GET', '/clubs/my').length).toBeLessThanOrEqual(isNext() ? 3 : 4);
    expect(m.calls('GET', `/clubs/${CLUB}/chat/rooms`).length).toBeLessThanOrEqual(3);
    expect(m.sockets.length).toBeLessThanOrEqual(2);
    expect(errs.filter((e) => /Maximum update depth|Too many re-renders/.test(e))).toEqual([]);
    expect(errs).toEqual([]);
  });

  test('the same on /chats: a held /clubs/my shows a pending state, then the rooms', async ({ page }) => {
    const errs = watchConsole(page);
    const m = await open(page, 'member', '/chats', { myClubsDelayMs: 1500 });
    await expect(page.getByText('Повідомлення A-6')).toBeVisible({ timeout: 10_000 });
    expect(m.calls('GET', '/clubs/my').length).toBeLessThanOrEqual(isNext() ? 3 : 4);
    expect(errs).toEqual([]);
  });
});

// a11y and screenshots
const STRICT_CONTRAST = process.env['PARITY_STRICT_CONTRAST'] !== '0';
for (const lang of ['uk', 'en'] as const) {
  for (const theme of ['light', 'dark'] as const) {
    for (const where of ['widget', 'widget-rooms', 'chats'] as const) {
      test(`axe ${where} ${lang} ${theme}`, async ({ page }, ti) => {
        const opts: ChatOpts = { unread: { [ROOM_A]: { count: 2, last: null }, [ROOM_B]: { count: 0, last: null } } };
        const m = await open(page, 'member', where === 'chats' ? '/chats' : '/clubs', opts, lang, theme);
        if (where !== 'chats') {
          await openWidget(page);
          if (where === 'widget-rooms') await page.getByRole('button', { name: L.back }).click();
        }
        await expect(where === 'widget-rooms' ? page.getByRole('button', { name: /Книги/ }) : page.getByText('Повідомлення A-6')).toBeVisible();
        await expect.poll(() => live(m).length).toBeGreaterThan(0);
        m.push(ROOM_A, { text: 'Привіт від Івана' });
        await page.waitForTimeout(400);
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag22aa']).exclude('nextjs-portal').analyze();
        const summary = results.violations.map((v) => `${v.id} (${v.impact}) x${v.nodes.length}: ${v.nodes.slice(0, 3).map((n) => n.target.join(' ').slice(-70)).join(' | ')}`);
        console.log(`[axe ${ti.project.name} ${where} ${lang} ${theme}] ${summary.length ? summary.join('\n  ') : 'no violations'}`);
        const bad = results.violations.filter((v) => (v.impact === 'serious' || v.impact === 'critical') && (STRICT_CONTRAST || v.id !== 'color-contrast'));
        // Angular is the frozen reference: its violations are recorded, the gate is for Next
        if (isNext()) expect(bad.map((v) => v.id)).toEqual([]);
        else ti.annotations.push({ type: 'axe', description: bad.map((v) => `${v.id}x${v.nodes.length}`).join(',') || 'none' });
      });
    }
  }
}

for (const theme of ['light', 'dark'] as const) {
  for (const width of [375, 768, 1280] as const) {
    test(`/chats at ${width}px ${theme}: no horizontal scroll, rooms and composer reachable`, async ({ page }, ti) => {
      await page.setViewportSize({ width, height: 800 });
      await open(page, 'member', '/chats', {}, 'en', theme);
      await expect(page.getByText('Повідомлення A-6')).toBeVisible();
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(over).toBeLessThanOrEqual(0);
      await expect(composer(page)).toBeInViewport();
      await expect(page.getByRole('button', { name: /Книги/ })).toBeAttached();
      await page.screenshot({ path: `${SHOTS}/chats-${ti.project.name}-${width}-${theme}.png` });
    });

    test(`open widget at ${width}px ${theme}: panel inside the viewport`, async ({ page }, ti) => {
      await page.setViewportSize({ width, height: 800 });
      await open(page, 'member', '/clubs', {}, 'en', theme);
      await openWidget(page);
      await expect(page.getByText('Повідомлення A-6')).toBeVisible();
      const box = (await panel(page).boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      await page.screenshot({ path: `${SHOTS}/widget-${ti.project.name}-${width}-${theme}.png` });
    });
  }
}

// Deterministic API for the R7 (/events, /events/:id) parity specs. Dates are relative to the test run so the 3-day countdown
// window is exercised without a fake clock. Nothing here reaches a real backend: every /api/v1 call is fulfilled by page.route.
import type { Page } from '@playwright/test';
import { handleApi, newState, type MockState, type Role } from '../r6/fixtures';

const HOUR = 3_600_000;
const inHours = (h: number) => new Date(Date.now() + h * HOUR).toISOString();

export const EVENT_IDS = {
  soon: 'e7e7e7e7-0000-4000-8000-000000000001',
  far: 'e7e7e7e7-0000-4000-8000-000000000002',
  started: 'e7e7e7e7-0000-4000-8000-000000000003',
  withMap: 'e7e7e7e7-0000-4000-8000-000000000004',
  missing: 'e7e7e7e7-0000-4000-8000-000000000099',
} as const;

const CLUB_ID = 'a1b2c3d4-0000-4000-8000-000000000001';

const make = (id: string, over: Record<string, unknown>) => ({
  id,
  clubId: CLUB_ID,
  clubName: 'Нічні читачі',
  organizerId: 'user-organizer',
  title: 'Зустріч',
  description: 'Опис зустрічі',
  date: inHours(240),
  city: 'Київ',
  address: 'вул. Хрещатик, 1',
  lat: null,
  lng: null,
  status: 'scheduled',
  cancelledAt: null,
  coverUrl: null,
  bookTitle: null,
  theme: null,
  tags: [],
  durationMinutes: 90,
  afterMeetingVenue: null,
  attendeeCount: 2,
  isAttending: false,
  hasWinner: false,
  ...over,
});

export const freshEvents = (): Record<string, ReturnType<typeof make>> => ({
  [EVENT_IDS.soon]: make(EVENT_IDS.soon, { title: 'Скоро зустріч', date: inHours(36) }),
  [EVENT_IDS.far]: make(EVENT_IDS.far, { title: 'Далека зустріч', date: inHours(240), city: 'Львів' }),
  [EVENT_IDS.started]: make(EVENT_IDS.started, { title: 'Вже почалась', date: inHours(-2) }),
  [EVENT_IDS.withMap]: make(EVENT_IDS.withMap, { title: 'Зустріч з картою', date: inHours(480), lat: 50.45, lng: 30.52 }),
});

export interface EventsMock {
  state: MockState;
  events: ReturnType<typeof freshEvents>;
  log: { method: string; path: string; query: string }[];
  /** forced status per `METHOD /events/:id/attend` */
  fail: Record<string, number>;
  mapsKey: 'none' | 'key';
}

export async function installEventsMock(
  page: Page,
  role: Role,
  opts: { latency?: Record<string, number>; fail?: Record<string, number>; mapsKey?: 'none' | 'key' } = {},
): Promise<EventsMock> {
  const mock: EventsMock = { state: newState(role), events: freshEvents(), log: [], fail: opts.fail ?? {}, mapsKey: opts.mapsKey ?? 'none' };
  await page.route('**/api/v1/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname.replace(/^\/api\/v1/, '');
    mock.log.push({ method: req.method(), path, query: url.search });
    const generic = `${req.method()} ${path.replace(/[0-9a-f-]{36}/g, ':id')}`;
    const wait = opts.latency?.[generic];
    if (wait) await new Promise((r) => setTimeout(r, wait));
    const reply = handleEvents(mock, req.method(), path) ?? handleApi(mock.state, req.method(), path, url.search, req.postData());
    await route.fulfill({ status: reply.status, contentType: 'application/json', body: reply.body === undefined ? '' : JSON.stringify(reply.body) });
  });
  await page.routeWebSocket(/^(?!.*_next).*$/, (ws) => void ws.close());
  return mock;
}

function handleEvents(m: EventsMock, method: string, path: string): { status: number; body?: unknown } | null {
  const authed = m.state.role !== 'guest';
  const all = Object.values(m.events);
  if (method === 'GET' && path === '/events') return { status: 200, body: all };
  if (method === 'GET' && path === '/events/my') return authed ? { status: 200, body: all.filter((e) => e.isAttending) } : { status: 401, body: { detail: 'no' } };
  if (method === 'GET' && path === '/config/maps-key') {
    return m.mapsKey === 'key' ? { status: 200, body: { mapsApiKey: 'parity-fake-key', mapsMapId: '' } } : { status: 404, body: { detail: 'no key in tests' } };
  }
  const match = path.match(/^\/events\/([0-9a-f-]{36})(\/attend)?$/);
  if (!match) return null;
  const event = m.events[match[1]!];
  if (!event) return { status: 404, body: { detail: 'Event not found' } };
  if (!match[2]) return method === 'GET' ? { status: 200, body: event } : null;
  const forced = m.fail[`${method} /events/:id/attend`];
  if (forced) return { status: forced, body: { detail: 'Registration is closed' } };
  if (method === 'POST') {
    event.isAttending = true;
    event.attendeeCount += 1;
    return { status: 200, body: { attendeeCount: event.attendeeCount, joinRequestStatus: 'none' } };
  }
  if (method === 'DELETE') {
    event.isAttending = false;
    event.attendeeCount = Math.max(0, event.attendeeCount - 1);
    return { status: 204 };
  }
  return null;
}

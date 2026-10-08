import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API, server, setupApiServer } from '@/test/harness';
import { migrateLegacySession } from './legacy-session';

setupApiServer();
beforeEach(() => localStorage.clear());

const bodies = () => {
  const seen: unknown[] = [];
  server.use(
    http.post(`${API}/auth/refresh`, async ({ request }) => {
      seen.push(await request.json());
      return HttpResponse.json({ accessToken: 'new-access', refreshToken: 'new-refresh' });
    }),
  );
  return seen;
};

describe('migrateLegacySession', () => {
  it('does nothing without legacy keys', async () => {
    const seen = bodies();
    await migrateLegacySession();
    expect(seen).toEqual([]);
  });

  it('posts the legacy refresh token once and deletes both keys', async () => {
    localStorage.setItem('bc_refresh_token', 'old-refresh');
    localStorage.setItem('bc_has_session', '1');
    const seen = bodies();
    await Promise.all([migrateLegacySession(), migrateLegacySession()]);
    expect(seen).toEqual([{ refreshToken: 'old-refresh' }]);
    expect(localStorage.getItem('bc_refresh_token')).toBeNull();
    expect(localStorage.getItem('bc_has_session')).toBeNull();
  });

  it('sends an empty body for the marker alone', async () => {
    localStorage.setItem('bc_has_session', '1');
    const seen = bodies();
    await migrateLegacySession();
    expect(seen).toEqual([{}]);
    expect(localStorage.getItem('bc_has_session')).toBeNull();
  });

  it('deletes both keys when the refresh is rejected', async () => {
    localStorage.setItem('bc_refresh_token', 'stale');
    localStorage.setItem('bc_has_session', '1');
    server.use(http.post(`${API}/auth/refresh`, () => HttpResponse.json({ detail: 'expired' }, { status: 401 })));
    await migrateLegacySession();
    expect(localStorage.length).toBe(0);
  });

  it('deletes both keys when the network fails', async () => {
    localStorage.setItem('bc_refresh_token', 'stale');
    server.use(http.post(`${API}/auth/refresh`, () => HttpResponse.error()));
    await migrateLegacySession();
    expect(localStorage.length).toBe(0);
  });

  it('never stores what the response carries', async () => {
    localStorage.setItem('bc_refresh_token', 'old');
    bodies();
    await migrateLegacySession();
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    expect(document.cookie).toBe('');
  });
});

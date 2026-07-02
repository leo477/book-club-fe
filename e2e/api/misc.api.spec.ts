import { test, expect } from '../fixtures/api-context.fixture';
import { apiOrigin } from '../../playwright.full-audit.config';

// Smaller, mostly independent routers: books (Google Books proxy), config
// (public map key), geocode (Photon/Google Places proxy), health, routes
// (walking directions), upload (Supabase Storage cover images). One smoke
// test per endpoint — these aren't central to the club/event/quiz data model
// and are already indirectly covered by whatever frontend features call them.

test.describe('books API', () => {
  test('GET /books/search — 200, requires auth', async ({ memberApi, anonApi }) => {
    const resp = await memberApi.get('/books/search?q=hobbit');
    expect(resp.status()).toBe(200);
    expect(Array.isArray(await resp.json())).toBe(true);

    const anonResp = await anonApi.get('/books/search?q=hobbit');
    expect(anonResp.status()).toBe(401);
  });

  test('GET /books/details/{book_id} — 404 for a bogus id', async ({ memberApi }) => {
    const resp = await memberApi.get('/books/details/not-a-real-google-books-id');
    expect(resp.status()).toBe(404);
  });

  test('GET /books/stores — 200', async ({ memberApi }) => {
    const resp = await memberApi.get('/books/stores?title=The+Hobbit');
    expect(resp.status()).toBe(200);
  });
});

test.describe('config API', () => {
  test('GET /config/maps-key — 200, no auth required', async ({ anonApi }) => {
    const resp = await anonApi.get('/config/maps-key');
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body).toHaveProperty('mapsApiKey');
  });
});

test.describe('geocode API', () => {
  test('GET /geocode/autocomplete — 200, no auth required', async ({ anonApi }) => {
    const resp = await anonApi.get('/geocode/autocomplete?q=Kyiv');
    expect(resp.status()).toBe(200);
    expect(Array.isArray(await resp.json())).toBe(true);
  });

  test('GET /geocode/place-details — 422 without required query params', async ({ anonApi }) => {
    const resp = await anonApi.get('/geocode/place-details');
    expect(resp.status()).toBe(422);
  });
});

test.describe('health API', () => {
  // Mounted at the app root, not under /api/v1 (app/routers/health.py,
  // `APIRouter(prefix="")`) — every other request in this suite goes through
  // `apiContextFor`'s wrapper, which always prepends the full `/api/v1`-suffixed
  // apiBaseURL, so these two need the bare origin passed as a full absolute URL
  // instead (the wrapper leaves already-absolute URLs untouched).
  test('GET /health — 200, no auth required', async ({ anonApi }) => {
    const resp = await anonApi.get(`${apiOrigin}/health`);
    expect(resp.status()).toBe(200);
  });

  test('GET /ready — 200, no auth required', async ({ anonApi }) => {
    const resp = await anonApi.get(`${apiOrigin}/ready`);
    expect(resp.status()).toBe(200);
  });
});

test.describe('routes API', () => {
  test('GET /routes/walking — 200 with valid coordinates', async ({ memberApi }) => {
    const resp = await memberApi.get(
      '/routes/walking?origin_lat=50.45&origin_lng=30.52&dest_lat=50.44&dest_lng=30.53',
    );
    expect(resp.status()).toBe(200);
  });

  test('GET /routes/walking — 422 with out-of-range coordinates', async ({ memberApi }) => {
    const resp = await memberApi.get(
      '/routes/walking?origin_lat=999&origin_lng=30.52&dest_lat=50.44&dest_lng=30.53',
    );
    expect(resp.status()).toBe(422);
  });
});

test.describe('upload API', () => {
  test('POST /upload/cover — 401 without auth', async ({ anonApi }) => {
    const resp = await anonApi.post('/upload/cover', { multipart: { file: { name: 'x.txt', mimeType: 'text/plain', buffer: Buffer.from('x') } } });
    expect(resp.status()).toBe(401);
  });

  test('POST /upload/cover — 415 for an unsupported content type', async ({ memberApi }) => {
    const resp = await memberApi.post('/upload/cover', {
      multipart: { file: { name: 'x.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') } },
    });
    expect(resp.status()).toBe(415);
  });
});

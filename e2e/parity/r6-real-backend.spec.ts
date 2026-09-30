// R6 checks that need the REAL backend (guest, read-only GETs). Run with PARITY_R6_REAL=1 against a Next build whose
// BACKEND_ORIGIN is the real backend. Covers what the mock-backed suite cannot: the real payload of a real public club
// validated by the zod contracts, the real 404/422 answers, and legacy's answer for the same ids.
import { expect, test } from './bypass';
import { extractSeo, jsonLdProblems, jsonLdTypes } from './html-meta';

const MISSING = '00000000-0000-4000-8000-000000000000';

test.describe('r6 real backend', () => {
  test.skip(process.env['PARITY_R6_REAL'] !== '1', 'needs PARITY_R6_REAL=1 and a Next build backed by the real API');

  test('public club: SSR 200 with name, canonical, og, valid JSON-LD (raw HTML, no JS)', async ({ request }, ti) => {
    test.skip(ti.project.name !== 'next');
    const [club] = (await (await request.get('/api/v1/clubs')).json()) as { id: string; name: string; isPublic: boolean }[];
    expect(club.isPublic).toBe(true);
    const res = await request.get(`/clubs/${club.id}`);
    expect(res.status()).toBe(200);
    const html = await res.text();
    const seo = extractSeo(html);
    expect(seo.title).toContain(club.name);
    expect(seo.canonical).toBe(`https://book-club-planer.vercel.app/clubs/${club.id}`);
    expect(seo.ogImage).toMatch(/^https:\/\//);
    expect(html).toContain(club.name);
    expect(html).toMatch(/<meta name="robots" content="index, ?follow"/);
    expect(jsonLdProblems(jsonLdTypes(seo.jsonLd))).toEqual([]);
    expect(jsonLdTypes(seo.jsonLd).join()).toContain('Organization');
  });

  test('missing club: Next answers a real 404, legacy answers 200', async ({ request, playwright }, ti) => {
    const res = await request.get(`/clubs/${MISSING}`);
    if (ti.project.name === 'next') expect(res.status()).toBe(404);
    else expect(res.status()).toBe(200);
  });

  test('non-UUID ids and /clubs/create are served by legacy (same status on both)', async ({ request }) => {
    for (const p of ['/clubs/create', '/clubs/not-a-uuid']) expect((await request.get(p)).status()).toBe(200);
  });
});

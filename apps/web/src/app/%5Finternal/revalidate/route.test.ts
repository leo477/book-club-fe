// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from './route';

const revalidateTag = vi.hoisted(() => vi.fn());
vi.mock('next/cache', () => ({ revalidateTag }));

const ID = '3f2b8c1e-9a4d-4e7b-8c5f-1a2b3c4d5e6f';
const request = (body: unknown, secret: string | null = 's3cret', raw = false) =>
  new Request('http://localhost/_internal/revalidate', {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...(secret !== null && { 'x-revalidate-secret': secret }) },
    body: raw ? (body as string) : JSON.stringify(body),
  });

beforeEach(() => {
  revalidateTag.mockReset();
  process.env['REVALIDATE_SECRET'] = 's3cret';
});

describe('POST /_internal/revalidate', () => {
  it('expires the club and list tags immediately', async () => {
    const res = await POST(request({ tags: ['clubs', `club:${ID}`] }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ revalidated: ['clubs', `club:${ID}`] });
    expect(revalidateTag).toHaveBeenCalledTimes(2);
    expect(revalidateTag).toHaveBeenCalledWith('clubs', { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith(`club:${ID}`, { expire: 0 });
    expect(res.headers.get('cache-control')).toBe('private, no-store');
  });

  it('de-duplicates and normalizes tag case', async () => {
    const res = await POST(request({ tags: ['clubs', 'clubs', `club:${ID.toUpperCase()}`] }));
    expect(await res.json()).toEqual({ revalidated: ['clubs', `club:${ID}`] });
  });

  it.each([[null], ['wrong'], ['']])('rejects a missing or wrong secret (%s) without revalidating', async (secret) => {
    const res = await POST(request({ tags: ['clubs'] }, secret));
    expect(res.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('is disabled (503) when REVALIDATE_SECRET is unset, even with an empty header', async () => {
    delete process.env['REVALIDATE_SECRET'];
    const res = await POST(request({ tags: ['clubs'] }, ''));
    expect(res.status).toBe(503);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it.each([
    ['not json', '{', true],
    ['no tags', {}, false],
    ['empty tags', { tags: [] }, false],
    ['non-array', { tags: 'clubs' }, false],
    ['foreign tag', { tags: ['clubs', 'users'] }, false],
    ['malformed club tag', { tags: ['club:123'] }, false],
    ['non-string tag', { tags: [1] }, false],
    ['too many tags', { tags: Array.from({ length: 21 }, () => 'clubs') }, false],
  ])('rejects %s with 400 and revalidates nothing', async (_name, body, raw) => {
    const res = await POST(request(body, 's3cret', raw));
    expect(res.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it('rejects an oversized body with 413', async () => {
    const res = await POST(request({ tags: ['clubs'], pad: 'x'.repeat(4000) }));
    expect(res.status).toBe(413);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});

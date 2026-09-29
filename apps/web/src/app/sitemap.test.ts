import { beforeEach, describe, expect, it, vi } from 'vitest';
import { STATIC_LAST_MODIFIED } from '@/lib/site';
import sitemap, { revalidate } from './sitemap';

const list = vi.hoisted(() => vi.fn());
const serverApi = vi.hoisted(() => vi.fn());
vi.mock('@/lib/server-api', () => ({ serverApi }));

beforeEach(() => {
  list.mockReset();
  serverApi.mockReset().mockReturnValue({ clubs: { list } });
});

const SITE = 'https://book-club-planer.vercel.app';

describe('sitemap', () => {
  it('revalidates hourly', () => {
    expect(revalidate).toBe(3600);
  });

  it('lists the static routes with the same frequency and priority as generate-sitemap.mjs', async () => {
    list.mockResolvedValue([]);
    const entries = await sitemap();
    expect(entries.map((e) => [e.url, e.changeFrequency, e.priority])).toEqual([
      [`${SITE}/`, 'weekly', 1],
      [`${SITE}/clubs`, 'daily', 0.8],
      [`${SITE}/privacy`, 'yearly', 0.2],
      [`${SITE}/terms`, 'yearly', 0.2],
    ]);
    expect(entries.map((e) => e.lastModified)).toEqual(Array(4).fill(STATIC_LAST_MODIFIED));
  });

  it('adds public clubs with their creation date and skips non-public ones', async () => {
    list.mockResolvedValue([
      { id: 'a1', isPublic: true, createdAt: '2025-03-04T10:00:00Z' },
      { id: 'b2', isPublic: false, createdAt: '2025-03-05T10:00:00Z' },
      { id: 'c3', isPublic: true, createdAt: '' },
    ]);
    const entries = await sitemap();
    const clubs = entries.filter((e) => e.url.includes('/clubs/'));
    expect(clubs.map((e) => e.url)).toEqual([`${SITE}/clubs/a1`, `${SITE}/clubs/c3`]);
    expect(clubs[0]).toMatchObject({ lastModified: '2025-03-04', changeFrequency: 'weekly', priority: 0.7 });
    expect(clubs[1]?.lastModified).toBe(STATIC_LAST_MODIFIED);
  });

  it('fetches anonymously with the hourly cache window', async () => {
    list.mockResolvedValue([]);
    await sitemap();
    expect(serverApi).toHaveBeenCalledWith({ revalidate: 3600, tags: ['clubs'] });
  });

  it('degrades to the static routes when the backend fails', async () => {
    list.mockRejectedValue(new Error('down'));
    const entries = await sitemap();
    expect(entries).toHaveLength(4);
  });
});

import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { messages, parsedClub, renderWithProviders, setupApiServer } from '@/test/harness';
import ClubsPage, { generateMetadata } from './page';

const list = vi.hoisted(() => vi.fn());
const serverApi = vi.hoisted(() => vi.fn());
const state = vi.hoisted(() => ({ locale: 'uk' as 'uk' | 'en' }));
vi.mock('@/lib/server-api', () => ({ serverApi }));
vi.mock('next-intl/server', async () => {
  const { messages } = await import('@/test/harness');
  return {
    getLocale: async () => state.locale,
    getTranslations: async (ns?: string) => (key: string) => messages[state.locale][ns ? `${ns}.${key}` : key] ?? key,
  };
});

setupApiServer();

beforeEach(() => {
  state.locale = 'uk';
  list.mockReset();
  serverApi.mockReset().mockReturnValue({ clubs: { list } });
});

describe('/clubs page', () => {
  it('fetches anonymously with ISR options and renders the club names into the HTML', async () => {
    list.mockResolvedValue([parsedClub(), parsedClub({ id: 'c2', name: 'Beta Poets' })]);
    const { container } = renderWithProviders(await ClubsPage());
    expect(serverApi).toHaveBeenCalledWith({ revalidate: 300, tags: ['clubs'] });
    expect(screen.getByRole('heading', { name: 'Alpha Readers' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Beta Poets' })).toBeInTheDocument();
    expect(container.querySelectorAll('script[type="application/ld+json"]')).toHaveLength(2);
  });

  it('emits WebSite JSON-LD plus the index.html Organization/WebApplication graph', async () => {
    list.mockResolvedValue([]);
    const { container } = renderWithProviders(await ClubsPage());
    const [website, graph] = [...container.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent ?? ''));
    expect(website).toEqual({
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: messages.uk['SEO.site_name'],
      url: messages.uk['SEO.site_url'],
      description: messages.uk['SEO.site_description'],
    });
    expect(graph['@graph'].map((n: { '@type': string }) => n['@type'])).toEqual(['Organization', 'WebApplication']);
  });

  it('falls back to client-side loading when the backend fetch fails', async () => {
    list.mockRejectedValue(new Error('down'));
    renderWithProviders(await ClubsPage());
    expect(screen.getByLabelText('Loading clubs')).toBeInTheDocument();
  });

  it.each(['uk', 'en'] as const)('generates %s metadata from SEO.clubs_*', async (locale) => {
    state.locale = locale;
    const m = messages[locale];
    const meta = await generateMetadata();
    expect(meta.title).toBe(m['SEO.clubs_title']);
    expect(meta.description).toBe(m['SEO.clubs_description']);
    expect(meta.alternates?.canonical).toBe('https://book-club-planer.vercel.app/clubs');
    expect(meta.robots).toEqual({ index: true, follow: true });
    expect(meta.openGraph).toMatchObject({ title: m['SEO.clubs_og_title'], description: m['SEO.clubs_description'], url: 'https://book-club-planer.vercel.app/clubs' });
    expect(meta.twitter).toMatchObject({ title: m['SEO.clubs_og_title'], description: m['META.twitterDescription'] });
  });
});


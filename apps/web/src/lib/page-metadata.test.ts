import { beforeEach, describe, expect, it, vi } from 'vitest';
import en from '@book-club/i18n/en.icu.json';
import uk from '@book-club/i18n/uk.icu.json';
import { pageMetadata } from './page-metadata';

const state = { locale: 'uk' as 'uk' | 'en' };
vi.mock('next-intl/server', () => ({
  getLocale: async () => state.locale,
  getTranslations: async () => {
    const messages = (state.locale === 'uk' ? uk : en) as Record<string, string>;
    return (key: string) => messages[key] ?? key;
  },
}));

describe('pageMetadata', () => {
  beforeEach(() => {
    state.locale = 'uk';
  });

  it.each([
    ['uk', uk, 'uk_UA'],
    ['en', en, 'en_US'],
  ] as const)('builds title, description, og, twitter and canonical for %s', async (locale, messages, ogLocale) => {
    state.locale = locale;
    const m = messages as Record<string, string>;
    const meta = await pageMetadata('TITLES.privacy', '/privacy');
    expect(meta.title).toBe(m['TITLES.privacy']);
    expect(meta.description).toBe(m['META.description']);
    expect(meta.alternates?.canonical).toBe('https://book-club-planer.vercel.app/privacy');
    expect(meta.robots).toEqual({ index: true, follow: true });
    expect(meta.openGraph).toMatchObject({
      type: 'website',
      url: 'https://book-club-planer.vercel.app/privacy',
      title: m['TITLES.privacy'],
      description: m['META.ogDescription'],
      locale: ogLocale,
      images: ['https://book-club-planer.vercel.app/og-image.png'],
    });
    expect(meta.twitter).toMatchObject({
      card: 'summary_large_image',
      title: m['TITLES.privacy'],
      description: m['META.twitterDescription'],
      images: ['https://book-club-planer.vercel.app/og-image.png'],
    });
  });

  it('has a distinct title per locale and a query-free canonical', async () => {
    const ukMeta = await pageMetadata('TITLES.terms', '/terms');
    state.locale = 'en';
    const enMeta = await pageMetadata('TITLES.terms', '/terms');
    expect(ukMeta.title).not.toBe(enMeta.title);
    expect(String(enMeta.alternates?.canonical)).not.toContain('?');
  });

  it('keeps SEO.site_url identical across locales', () => {
    expect((uk as Record<string, string>)['SEO.site_url']).toBe((en as Record<string, string>)['SEO.site_url']);
  });
});

describe('pageMetadata overrides', () => {
  it('passes ICU values, takes a literal description for og and twitter, a custom image, and noindex', async () => {
    const meta = await pageMetadata('SEO.club_detail_title', '/clubs/x', {
      ogTitleKey: 'SEO.club_detail_og_title',
      values: { name: 'Alpha' },
      description: 'Literal <b>text</b>',
      image: 'https://img.example/c.jpg',
      index: false,
    });
    expect(meta.robots).toEqual({ index: false, follow: true });
    expect(meta.description).toBe('Literal <b>text</b>');
    expect(meta.openGraph).toMatchObject({ description: 'Literal <b>text</b>', images: ['https://img.example/c.jpg'] });
    expect(meta.twitter).toMatchObject({ description: 'Literal <b>text</b>', images: ['https://img.example/c.jpg'] });
  });
});

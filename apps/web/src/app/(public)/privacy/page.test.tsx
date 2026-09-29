import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import uk from '@book-club/i18n/uk.icu.json';
import en from '@book-club/i18n/en.icu.json';
import PrivacyPage, { generateMetadata } from './page';

const state = { locale: 'uk' as 'uk' | 'en' };
vi.mock('next-intl/server', () => ({
  getLocale: async () => state.locale,
  getTranslations: async () => {
    const messages = (state.locale === 'uk' ? uk : en) as Record<string, string>;
    return (key: string) => messages[key] ?? key;
  },
}));

const renderPage = () => render(<PrivacyPage />);

describe('privacy page', () => {
  it('renders the heading, section headings and contact link', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1, name: 'Політика конфіденційності' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThanOrEqual(5);
    expect(screen.getByRole('link', { name: 'privacy@bookclub.ua' })).toHaveAttribute('href', 'mailto:privacy@bookclub.ua');
  });

  it('links back to /events', () => {
    renderPage();
    const back = screen.getByRole('link', { name: '← Назад' });
    expect(back).toHaveAttribute('href', '/events');
    expect(back).not.toHaveAttribute('data-next-link');
    expect(within(document.body).queryByRole('button')).toBeNull();
  });

  it('emits the site-wide Organization + WebApplication JSON-LD like legacy index.html', () => {
    const { container } = renderPage();
    const ld = JSON.parse(container.querySelector('script[type="application/ld+json"]')!.textContent!);
    expect(ld['@graph'].map((n: { '@type': string }) => n['@type'])).toEqual(['Organization', 'WebApplication']);
  });

  it.each(['uk', 'en'] as const)('generates localized metadata for %s', async (locale) => {
    state.locale = locale;
    const meta = await generateMetadata();
    const messages = (locale === 'uk' ? uk : en) as Record<string, string>;
    expect(meta.title).toBe(messages['TITLES.privacy']);
    expect(meta.robots).toEqual({ index: true, follow: true });
    expect(meta.alternates?.canonical).toBe('https://book-club-planer.vercel.app/privacy');
  });

  it('renders the body in Ukrainian under locale en (known i18n gap)', () => {
    state.locale = 'en';
    renderPage();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/[а-яіїєґ]/i);
    expect(screen.getByRole('main')).toHaveAttribute('lang', 'uk');
  });
});

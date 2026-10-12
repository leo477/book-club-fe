import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import uk from '@book-club/i18n/uk.icu.json';
import en from '@book-club/i18n/en.icu.json';
import NotFound, { generateMetadata } from './not-found';

const state = { locale: 'uk' as 'uk' | 'en' };
vi.mock('next-intl/server', () => ({
  getTranslations: async (ns?: string) => {
    const messages = (state.locale === 'uk' ? uk : en) as Record<string, string>;
    return (key: string) => messages[ns ? `${ns}.${key}` : key] ?? key;
  },
}));

describe('app/not-found.tsx', () => {
  it.each(['uk', 'en'] as const)('renders the localized copy and the events link (%s)', async (locale) => {
    state.locale = locale;
    const messages = (locale === 'uk' ? uk : en) as Record<string, string>;
    render(await NotFound());
    expect(screen.getByRole('heading', { level: 1, name: messages['NOT_FOUND.title']! })).toBeInTheDocument();
    expect(screen.getByText(messages['NOT_FOUND.message']!)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: messages['NOT_FOUND.backHome']! })).toHaveAttribute('href', '/events');
    expect(screen.getByText('404')).toHaveAttribute('aria-hidden', 'true');
  });

  it.each(['uk', 'en'] as const)('sets the title and noindex (%s)', async (locale) => {
    state.locale = locale;
    const messages = (locale === 'uk' ? uk : en) as Record<string, string>;
    const meta = await generateMetadata();
    expect(meta.title).toBe(messages['TITLES.not_found']);
    expect(meta.robots).toEqual({ index: false, follow: false });
  });
});

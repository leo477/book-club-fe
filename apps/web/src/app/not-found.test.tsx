import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import uk from '@book-club/i18n/uk.icu.json';
import en from '@book-club/i18n/en.icu.json';
import { NotFoundView } from '@/components/not-found-view';
import NotFound, { generateMetadata } from './not-found';
import ShellNotFound, { generateMetadata as shellMetadata } from './(shell)/not-found';

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
    render(await (NotFound() as unknown as { type: typeof NotFoundView; props: object }).type({}));
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

  it('root variant owns the main landmark', async () => {
    render(await NotFoundView({}));
    expect(screen.getAllByRole('main')).toHaveLength(1);
  });

  it('shell variant renders inside the shell main without nesting another one and keeps metadata', async () => {
    state.locale = 'uk';
    const element = ShellNotFound() as unknown as { type: typeof NotFoundView; props: { as: 'div' } };
    expect(element.props.as).toBe('div');
    render(<main>{await element.type(element.props)}</main>);
    expect(screen.getAllByRole('main')).toHaveLength(1);
    expect(screen.getByRole('link', { name: (uk as Record<string, string>)['NOT_FOUND.backHome']! })).toHaveAttribute('href', '/events');
    expect(await shellMetadata()).toEqual(await generateMetadata());
  });
});

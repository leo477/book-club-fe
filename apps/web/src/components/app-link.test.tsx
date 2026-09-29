import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { StranglerProvider } from '@/strangler/context';
import { AppLink } from './app-link';

vi.mock('next/link', () => ({
  default: (props: ComponentProps<'a'>) => <a data-next-link="" {...props} />,
}));

const PROBE = '/__strangler-probe';
const renderLink = (href: string, enabled: string[]) =>
  render(
    <StranglerProvider value={enabled}>
      <AppLink href={href}>go</AppLink>
    </StranglerProvider>,
  );

describe('AppLink', () => {
  it('uses next/link for Next-owned enabled routes, keeping query and hash', () => {
    renderLink(`${PROBE}?a=1#x`, [PROBE]);
    const link = screen.getByRole('link', { name: 'go' });
    expect(link).toHaveAttribute('data-next-link');
    expect(link).toHaveAttribute('href', `${PROBE}?a=1#x`);
  });

  it('uses a plain anchor for Next-owned routes that are disabled', () => {
    renderLink(PROBE, []);
    expect(screen.getByRole('link')).not.toHaveAttribute('data-next-link');
  });

  it.each(['/clubs', '/clubs/create', 'https://example.com/__strangler-probe', `//evil.com${PROBE}`])(
    'uses a plain anchor for %s',
    (href) => {
      renderLink(href, [PROBE]);
      expect(screen.getByRole('link')).not.toHaveAttribute('data-next-link');
    },
  );
});

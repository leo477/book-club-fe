import { NextIntlClientProvider } from 'next-intl';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { messages, parsedClub } from '@/test/harness';
import { nest } from '@/i18n/locale';
import { ClubCard } from './club-card';

const html = (props: { isAuthenticated: boolean; isMember: boolean; sessionPending: boolean }) =>
  renderToString(
    <NextIntlClientProvider locale="uk" messages={nest(messages.uk)}>
      <ClubCard club={parsedClub()} isOwned={false} joining={false} onJoin={() => {}} {...props} />
    </NextIntlClientProvider>,
  );

describe('ClubCard server HTML', () => {
  it('links to the detail page while the session is pending, without any session-specific CTA', () => {
    const out = html({ isAuthenticated: false, isMember: false, sessionPending: true });
    expect(out).toContain('href="/clubs/c1"');
    expect(out).not.toContain('login-to-join');
    expect(out).not.toContain(messages.uk['CLUBS.join'] ?? 'unreachable-join');
  });

  it('is identical for every session state before it resolves', () => {
    const guest = html({ isAuthenticated: false, isMember: false, sessionPending: true });
    expect(html({ isAuthenticated: true, isMember: true, sessionPending: true })).toBe(guest);
  });
});

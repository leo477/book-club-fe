import { describe, expect, it } from 'vitest';
import { WS_BASE_URL } from '@/features/chat/chat-ticket';
import { buildCsp, newNonce, TRUSTED_TYPES_REPORT_ONLY } from './csp';

const directive = (csp: string, name: string) => csp.split('; ').find((d) => d.startsWith(`${name} `)) ?? '';

describe('buildCsp', () => {
  const csp = buildCsp('abc');

  it('allows scripts only through the nonce and strict-dynamic', () => {
    const script = directive(csp, 'script-src');
    expect(script).toContain("'nonce-abc'");
    expect(script).toContain("'strict-dynamic'");
    expect(script).not.toContain("'unsafe-inline'");
    expect(script).not.toContain("'unsafe-eval'");
  });

  it('keeps inline styles allowed for Sonner and Next style injection', () => {
    expect(directive(csp, 'style-src')).toContain("'unsafe-inline'");
  });

  it('lets the chat socket reach the backend directly and nothing broader', () => {
    const connect = directive(csp, 'connect-src').split(' ');
    expect(connect).toContain(new URL(WS_BASE_URL).origin);
    expect(connect).not.toContain('wss:');
    expect(connect).not.toContain('*');
  });

  it('allows eval in dev only', () => {
    expect(directive(buildCsp('abc', true), 'script-src')).toContain("'unsafe-eval'");
  });

  it('never enforces Trusted Types: that stays in the Report-Only header', () => {
    expect(csp).not.toContain('trusted-types');
    expect(csp).not.toContain('require-trusted-types-for');
    expect(TRUSTED_TYPES_REPORT_ONLY).toContain("require-trusted-types-for 'script'");
  });

  it('lists the Maps and sanitizer Trusted Types policies in Report-Only', () => {
    for (const name of ['nextjs#bundler', 'dompurify-internal', '@googlemaps/js-api-loader', 'google-maps-api-loader', 'google-maps-api#html', 'lit-html']) {
      expect(TRUSTED_TYPES_REPORT_ONLY.split(' ')).toContain(name);
    }
  });

  it('generates unpredictable nonces', () => {
    expect(newNonce()).not.toBe(newNonce());
  });
});

import { describe, expect, it } from 'vitest';
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

  it('allows eval in dev only', () => {
    expect(directive(buildCsp('abc', true), 'script-src')).toContain("'unsafe-eval'");
  });

  it('never enforces Trusted Types: that stays in the Report-Only header', () => {
    expect(csp).not.toContain('trusted-types');
    expect(csp).not.toContain('require-trusted-types-for');
    expect(TRUSTED_TYPES_REPORT_ONLY).toContain("require-trusted-types-for 'script'");
  });

  it('generates unpredictable nonces', () => {
    expect(newNonce()).not.toBe(newNonce());
  });
});

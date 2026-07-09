import { vi } from 'vitest';
import DOMPurify from 'dompurify';
import { setupTrustedTypesPolicy, TrustedTypesWindow } from './trusted-types-policy';

interface CapturedPolicy {
  createScriptURL: (url: string) => string;
  createHTML: (html: string) => string;
}

describe('setupTrustedTypesPolicy', () => {
  function createFakeWindow(): { win: TrustedTypesWindow; createPolicy: ReturnType<typeof vi.fn>; getPolicy: () => CapturedPolicy } {
    let capturedPolicy: CapturedPolicy | undefined;
    const createPolicy = vi.fn((_name: string, policy: CapturedPolicy) => {
      capturedPolicy = policy;
      return policy;
    });
    const win: TrustedTypesWindow = { trustedTypes: { createPolicy } };
    return {
      win,
      createPolicy,
      getPolicy: () => {
        if (!capturedPolicy) throw new Error('policy not captured — call setupTrustedTypesPolicy(win) first');
        return capturedPolicy;
      },
    };
  }

  it('does nothing when trustedTypes is undefined', () => {
    const win: TrustedTypesWindow = {};
    expect(() => setupTrustedTypesPolicy(win)).not.toThrow();
  });

  it('registers a "default" policy when trustedTypes is available', () => {
    const { win, createPolicy } = createFakeWindow();
    setupTrustedTypesPolicy(win);
    expect(createPolicy).toHaveBeenCalledWith('default', expect.any(Object));
  });

  it('registers a private "dompurify-internal" passthrough policy for DOMPurify\'s own parse step', () => {
    const { win, createPolicy } = createFakeWindow();
    setupTrustedTypesPolicy(win);
    expect(createPolicy).toHaveBeenCalledWith('dompurify-internal', expect.any(Object));
    expect(createPolicy).toHaveBeenCalledTimes(2);
  });

  it('the internal policy\'s createScriptURL is a pure passthrough (required by the Trusted Types policy shape, unused by DOMPurify\'s SVG parse)', () => {
    const { win, createPolicy } = createFakeWindow();
    setupTrustedTypesPolicy(win);
    const internalPolicy = createPolicy.mock.calls[0][1] as CapturedPolicy;
    expect(internalPolicy.createScriptURL('https://example.com/x.js')).toBe('https://example.com/x.js');
  });

  it('registers exactly two policies and never re-enters createPolicy from createHTML', () => {
    // Regression test for an infinite-loop hang: createHTML sanitizes via
    // DOMPurify.sanitize(), which parses markup by assigning it to a scratch
    // document's innerHTML. Under real Trusted Types enforcement, an
    // unsigned internal write like that falls back to this same "default"
    // policy, calling createHTML -> sanitize -> createHTML forever. Passing
    // DOMPurify a dedicated internal policy via TRUSTED_TYPES_POLICY breaks
    // the cycle: its internal write is already trusted and never re-enters
    // "default". A fake window can't reproduce the browser's real sink
    // interception, so the regression is asserted structurally instead:
    // setup must call createPolicy exactly twice (the internal policy, then
    // "default"), and running the trap must not call it again.
    const { win, createPolicy, getPolicy } = createFakeWindow();
    setupTrustedTypesPolicy(win);
    expect(createPolicy).toHaveBeenCalledTimes(2);

    getPolicy().createHTML('<svg xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="4"></circle></svg>');
    expect(createPolicy).toHaveBeenCalledTimes(2);
  });

  describe('createScriptURL', () => {
    it('allows same-origin paths starting with /', () => {
      const { win, getPolicy } = createFakeWindow();
      setupTrustedTypesPolicy(win);
      expect(getPolicy().createScriptURL('/main.js')).toBe('/main.js');
    });

    it('allows Google Maps script URLs', () => {
      const { win, getPolicy } = createFakeWindow();
      setupTrustedTypesPolicy(win);
      expect(getPolicy().createScriptURL('https://maps.googleapis.com/maps/api/js')).toBe(
        'https://maps.googleapis.com/maps/api/js',
      );
      expect(getPolicy().createScriptURL('https://maps.gstatic.com/some-asset.js')).toBe(
        'https://maps.gstatic.com/some-asset.js',
      );
    });

    it('throws for an untrusted origin', () => {
      const { win, getPolicy } = createFakeWindow();
      setupTrustedTypesPolicy(win);
      expect(() => getPolicy().createScriptURL('https://evil.example.com/script.js')).toThrow(
        'Blocked untrusted script URL: https://evil.example.com/script.js',
      );
    });
  });

  describe('createHTML', () => {
    it('throws for a string that does not start with <svg', () => {
      const { win, getPolicy } = createFakeWindow();
      setupTrustedTypesPolicy(win);
      expect(() => getPolicy().createHTML('<div>hello</div>')).toThrow('Blocked untrusted HTML assignment');
    });

    it('accepts a well-formed, benign svg string and returns sanitized output', () => {
      const { win, getPolicy } = createFakeWindow();
      setupTrustedTypesPolicy(win);
      const input = '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="5" r="4"></circle></svg>';
      const result = getPolicy().createHTML(input);
      expect(result).toContain('<svg');
      expect(result).toContain('circle');
    });

    it('strips script tags and event handlers from a malicious svg payload', () => {
      const { win, getPolicy } = createFakeWindow();
      setupTrustedTypesPolicy(win);
      const malicious = '<svg onload="alert(1)"><script>alert(1)</script></svg>';

      let result: string | undefined;
      let threw = false;
      try {
        result = getPolicy().createHTML(malicious);
      } catch {
        threw = true;
      }

      if (threw) {
        expect(threw).toBe(true);
      } else {
        expect(result).not.toContain('onload=');
        expect(result).not.toContain('<script');
      }
    });

    it('strips a foreignObject/iframe smuggling a javascript: src', () => {
      const { win, getPolicy } = createFakeWindow();
      setupTrustedTypesPolicy(win);
      const malicious =
        '<svg><foreignObject><iframe src="javascript:alert(1)"></iframe></foreignObject></svg>';

      let result: string | undefined;
      let threw = false;
      try {
        result = getPolicy().createHTML(malicious);
      } catch {
        threw = true;
      }

      if (threw) {
        expect(threw).toBe(true);
      } else {
        expect(result?.toLowerCase()).not.toContain('iframe');
        expect(result?.toLowerCase()).not.toContain('foreignobject');
        expect(result).not.toContain('javascript:');
      }
    });

    it('strips a javascript: URI from an href/xlink:href attribute', () => {
      const { win, getPolicy } = createFakeWindow();
      setupTrustedTypesPolicy(win);
      const malicious = '<svg><use xlink:href="javascript:alert(1)"></use></svg>';

      let result: string | undefined;
      let threw = false;
      try {
        result = getPolicy().createHTML(malicious);
      } catch {
        threw = true;
      }

      if (threw) {
        expect(threw).toBe(true);
      } else {
        expect(result).not.toContain('javascript:');
      }
    });

    it('throws when DOMPurify sanitizes the input down to an empty string', () => {
      const { win, getPolicy } = createFakeWindow();
      setupTrustedTypesPolicy(win);
      const sanitizeSpy = vi.spyOn(DOMPurify, 'sanitize').mockReturnValue('');

      expect(() => getPolicy().createHTML('<svg></svg>')).toThrow('Blocked untrusted HTML assignment');

      sanitizeSpy.mockRestore();
    });

    it('preserves benign gradient/fill svg markup used by real icons', () => {
      const { win, getPolicy } = createFakeWindow();
      setupTrustedTypesPolicy(win);
      const input =
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 4h16v16H4z"></path></svg>';
      const result = getPolicy().createHTML(input);
      expect(result).toContain('<path');
      expect(result).toContain('d="M4 4h16v16H4z"');
    });
  });
});

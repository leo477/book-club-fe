import { vi } from 'vitest';
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
    return { win, createPolicy, getPolicy: () => capturedPolicy! };
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
  });
});

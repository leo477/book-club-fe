import { describe, expect, it } from 'vitest';
import { safeImageUrl } from './safe-image-url';

describe('safeImageUrl', () => {
  it('returns the normalized href of an http(s) URL', () => {
    expect(safeImageUrl('https://example.com/c.jpg')).toBe('https://example.com/c.jpg');
    expect(safeImageUrl('http://example.com/c.jpg?x=1#y')).toBe('http://example.com/c.jpg?x=1#y');
    expect(safeImageUrl('https://example.com')).toBe('https://example.com/');
  });

  it('accepts an upper-case scheme and returns it lower-cased', () => {
    expect(safeImageUrl('HTTPS://Example.com/C.jpg')).toBe('https://example.com/C.jpg');
  });

  it('percent-encodes spaces inside the path', () => {
    expect(safeImageUrl('https://example.com/a b.jpg')).toBe('https://example.com/a%20b.jpg');
  });

  it.each([
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    ' javascript:alert(1)',
    'data:image/svg+xml,<svg onload=alert(1)>',
    'vbscript:msgbox(1)',
    'file:///etc/passwd',
    'ftp://example.com/c.png',
    '//example.com/c.png',
    '/relative.png',
    'example.com/c.png',
    'https://exa mple.com/c.png',
    'https://',
    '',
    '   ',
  ])('rejects %j', (value) => {
    expect(safeImageUrl(value)).toBe('');
  });

  it('accepts blob: only when asked, for local file previews', () => {
    expect(safeImageUrl('blob:http://localhost:3000/3f2b8c1e-9a4d-4e7b-8c5f-1a2b3c4d5e6f')).toBe('');
    expect(safeImageUrl('blob:http://localhost:3000/3f2b8c1e-9a4d-4e7b-8c5f-1a2b3c4d5e6f', { allowBlob: true })).toBe(
      'blob:http://localhost:3000/3f2b8c1e-9a4d-4e7b-8c5f-1a2b3c4d5e6f',
    );
    expect(safeImageUrl('javascript:alert(1)', { allowBlob: true })).toBe('');
  });
});

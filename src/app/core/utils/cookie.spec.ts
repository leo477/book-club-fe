import { readCookie, writeCookie } from './cookie';

describe('cookie utils', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.cookie = 'k=; path=/; max-age=0';
  });

  it('round-trips a value', () => {
    writeCookie('k', 'a b');
    expect(readCookie('k')).toBe('a b');
  });

  it('returns null for a malformed percent-encoded value', () => {
    document.cookie = 'k=%E0%A4%A; path=/';
    expect(readCookie('k')).toBeNull();
  });

  it('returns null when reading document.cookie throws', () => {
    vi.spyOn(document, 'cookie', 'get').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(readCookie('k')).toBeNull();
  });

  it('writeCookie swallows a throwing setter', () => {
    vi.spyOn(document, 'cookie', 'set').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(() => writeCookie('k', 'v')).not.toThrow();
  });

  it('returns null for a missing cookie', () => {
    expect(readCookie('missing')).toBeNull();
  });

  it('does not match on a name suffix', () => {
    document.cookie = 'xk=1; path=/';
    expect(readCookie('k')).toBeNull();
    document.cookie = 'xk=; path=/; max-age=0';
  });

  it('writes 1-year Lax path=/ attributes, no Secure on http', () => {
    const setter = vi.spyOn(document, 'cookie', 'set');
    writeCookie('k', 'v');
    expect(setter).toHaveBeenCalledWith('k=v; path=/; max-age=31536000; SameSite=Lax');
  });

  it('adds Secure on https', () => {
    vi.stubGlobal('location', { protocol: 'https:' });
    const setter = vi.spyOn(document, 'cookie', 'set');
    writeCookie('k', 'v');
    vi.unstubAllGlobals();
    expect(setter).toHaveBeenCalledWith('k=v; path=/; max-age=31536000; SameSite=Lax; Secure');
  });
});

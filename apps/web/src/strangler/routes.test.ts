import { describe, expect, it } from 'vitest';
import { compilePattern, defineRoutes, isLegacyShadowed, manifest, matchRoute } from './routes';

const UUID = '3f2b8c1e-9a4d-4e7b-8c5f-1a2b3c4d5e6f';
const routes = defineRoutes(['/clubs', '/clubs/:id', '/privacy']);

describe('matchRoute', () => {
  it('matches literal routes with and without trailing slash', () => {
    expect(matchRoute('/privacy', routes)?.pattern).toBe('/privacy');
    expect(matchRoute('/privacy/', routes)?.pattern).toBe('/privacy');
  });

  it('matches :id only for UUIDs', () => {
    expect(matchRoute(`/clubs/${UUID}`, routes)?.pattern).toBe('/clubs/:id');
    expect(matchRoute(`/clubs/${UUID.toUpperCase()}`, routes)?.pattern).toBe('/clubs/:id');
  });

  it('never matches /clubs/create as /clubs/:id', () => {
    expect(matchRoute('/clubs/create', routes)).toBeNull();
    expect(matchRoute('/clubs/123', routes)).toBeNull();
  });

  it('does not match extra segments or prefixes', () => {
    expect(matchRoute(`/clubs/${UUID}/manage`, routes)).toBeNull();
    expect(matchRoute('/privacy-policy', routes)).toBeNull();
    expect(matchRoute('/x/privacy', routes)).toBeNull();
  });

  it('escapes regex metacharacters in literals', () => {
    expect(compilePattern('/a.b').test('/aXb')).toBe(false);
  });
});

describe('manifest', () => {
  it('owns the strangler probe, privacy, terms, clubs and club detail', () => {
    expect(manifest.map((r) => [r.pattern, r.owner])).toEqual([
      ['/__strangler-probe', 'next'],
      ['/privacy', 'next'],
      ['/terms', 'next'],
      ['/clubs', 'next'],
      ['/clubs/:id', 'next'],
    ]);
    expect(matchRoute('/__strangler-probe')).not.toBeNull();
    expect(matchRoute('/clubs')?.pattern).toBe('/clubs');
    expect(matchRoute('/clubs/create')).toBeNull();
    expect(matchRoute(`/clubs/${UUID}`)?.pattern).toBe('/clubs/:id');
    expect(matchRoute(`/clubs/${UUID}/manage`)).toBeNull();
    expect(matchRoute(`/clubs/${UUID}/events/create`)).toBeNull();
  });
});

describe('isLegacyShadowed', () => {
  it('flags single-segment look-alikes the UUID constraint excludes, which Next would otherwise serve', () => {
    expect(isLegacyShadowed('/clubs/create')).toBe(true);
    expect(isLegacyShadowed('/clubs/create/')).toBe(true);
    expect(isLegacyShadowed('/clubs/123')).toBe(true);
  });

  it('does not flag UUIDs, other depths or unrelated paths', () => {
    expect(isLegacyShadowed(`/clubs/${UUID}`)).toBe(false);
    expect(isLegacyShadowed(`/clubs/${UUID}/manage`)).toBe(false);
    expect(isLegacyShadowed('/clubs')).toBe(false);
    expect(isLegacyShadowed('/events/abc')).toBe(false);
  });
});

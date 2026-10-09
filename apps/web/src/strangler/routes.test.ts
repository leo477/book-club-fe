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
  it('owns the strangler probe, privacy, terms, clubs, club detail, the organizer forms, the root redirect, events, profile, support and auth', () => {
    expect(manifest.map((r) => [r.pattern, r.owner])).toEqual([
      ['/__strangler-probe', 'next'],
      ['/privacy', 'next'],
      ['/terms', 'next'],
      ['/clubs', 'next'],
      ['/clubs/:id', 'next'],
      ['/', 'next'],
      ['/events', 'next'],
      ['/events/:id', 'next'],
      ['/profile', 'next'],
      ['/support', 'next'],
      ['/support/new', 'next'],
      ['/clubs/create', 'next'],
      ['/clubs/:id/edit', 'next'],
      ['/clubs/:id/events/create', 'next'],
      ['/events/:id/edit', 'next'],
      ['/login', 'next'],
      ['/register', 'next'],
      ['/auth/callback', 'next'],
    ]);
    expect(matchRoute('/__strangler-probe')).not.toBeNull();
    expect(matchRoute('/clubs')?.pattern).toBe('/clubs');
    expect(matchRoute('/clubs/create')?.pattern).toBe('/clubs/create');
    expect(matchRoute(`/clubs/${UUID}/edit`)?.pattern).toBe('/clubs/:id/edit');
    expect(matchRoute('/clubs/create/edit')).toBeNull();
    expect(matchRoute(`/clubs/${UUID}`)?.pattern).toBe('/clubs/:id');
    expect(matchRoute(`/clubs/${UUID}/manage`)).toBeNull();
    expect(matchRoute(`/clubs/${UUID}/events/create`)?.pattern).toBe('/clubs/:id/events/create');
    expect(matchRoute(`/clubs/${UUID}/events`)).toBeNull();
    expect(matchRoute('/')?.pattern).toBe('/');
    expect(matchRoute('/events')?.pattern).toBe('/events');
    expect(matchRoute(`/events/${UUID}`)?.pattern).toBe('/events/:id');
    expect(matchRoute(`/events/${UUID}/edit`)?.pattern).toBe('/events/:id/edit');
    expect(matchRoute('/events/abc')).toBeNull();
    expect(matchRoute('/profile')?.pattern).toBe('/profile');
    expect(matchRoute('/support/')?.pattern).toBe('/support');
    expect(matchRoute('/support/new')?.pattern).toBe('/support/new');
    expect(matchRoute('/support/other')).toBeNull();
    expect(matchRoute('/login')?.pattern).toBe('/login');
    expect(matchRoute('/register/')?.pattern).toBe('/register');
    expect(matchRoute('/auth/callback')?.pattern).toBe('/auth/callback');
    expect(matchRoute('/auth')).toBeNull();
    expect(matchRoute('/auth/callback/extra')).toBeNull();
    expect(matchRoute('/login/other')).toBeNull();
  });
});

describe('isLegacyShadowed', () => {
  it('flags single-segment look-alikes the UUID constraint excludes, which Next would otherwise serve', () => {
    expect(isLegacyShadowed('/clubs/other')).toBe(true);
    expect(isLegacyShadowed('/clubs/other/')).toBe(true);
    expect(isLegacyShadowed('/clubs/abc/events/create')).toBe(true);
    expect(isLegacyShadowed('/events/abc/edit')).toBe(true);
    expect(isLegacyShadowed('/clubs/123')).toBe(true);
  });

  it('does not flag UUIDs, other depths or unrelated paths', () => {
    expect(isLegacyShadowed(`/clubs/${UUID}`)).toBe(false);
    expect(isLegacyShadowed(`/clubs/${UUID}/manage`)).toBe(false);
    expect(isLegacyShadowed('/clubs')).toBe(false);
    expect(isLegacyShadowed('/events/abc')).toBe(true);
    expect(isLegacyShadowed(`/events/${UUID}/edit`)).toBe(false);
    expect(isLegacyShadowed('/clubs/create')).toBe(false);
    expect(isLegacyShadowed('/login')).toBe(false);
  });
});

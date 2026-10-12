// @vitest-environment node
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, describe, expect, it } from 'vitest';

interface Route { kind: 'page' | 'redirect' | 'wildcard'; path: string; to?: string }
interface Result { rows: (Route & { covered: boolean; reason: string })[]; gaps: Route[]; manifestOnly: string[] }
interface Script {
  collectAngularRoutes: (file: string, arrayName?: string) => Route[];
  readManifest: (file: string) => string[];
  checkCoverage: (angular: Route[], manifest: string[], notFound: boolean) => Result;
}

const root = fileURLToPath(new URL('../../../../', import.meta.url));
const scriptPath = join(root, 'scripts/check-route-coverage.mjs');
const script = (await import(/* @vite-ignore */ scriptPath)) as Script;

const dir = mkdtempSync(join(tmpdir(), 'route-coverage-'));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const write = (name: string, body: string) => {
  const file = join(dir, name);
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, body);
  return file;
};

const FIXTURE = write(
  'app.routes.ts',
  `export const routes = [
  { path: 'login', loadComponent: () => import('./l').then(m => m.L) },
  { path: '', component: Shell, children: [
    { path: 'clubs', loadChildren: () => import('./clubs.routes').then(m => m.CLUBS) },
    { path: '', redirectTo: 'events', pathMatch: 'full' },
    { path: '**', loadComponent: () => import('./nf').then(m => m.NF) },
  ] },
  { path: '**', loadComponent: () => import('./nf').then(m => m.NF) },
];`,
);
write(
  'clubs.routes.ts',
  `export const CLUBS = [
  { path: '', component: List },
  { path: ':id', children: [{ path: '', component: Detail }, { path: 'edit', component: Edit }] },
];`,
);

describe('collectAngularRoutes', () => {
  it('flattens children, lazy modules, params, redirects and wildcards; layouts are not pages', () => {
    const routes = script.collectAngularRoutes(FIXTURE);
    expect(routes.map((r) => `${r.kind} ${r.path}${r.to ? ` -> ${r.to}` : ''}`)).toEqual([
      'page /login',
      'page /clubs',
      'page /clubs/:id',
      'page /clubs/:id/edit',
      'redirect / -> /events',
      'wildcard /*',
      'wildcard /*',
    ]);
  });
});

describe('non-literal paths', () => {
  it.each([
    ['an identifier', `const P = 'x'; export const routes = [{ path: P, component: A }];`],
    ['a template with a substitution', 'export const routes = [{ path: `a/${P}`, component: A }];'],
    ['a concatenation', `export const routes = [{ path: 'a' + b, component: A }];`],
  ])('throws on %s instead of treating it as the empty path', (_name, source) => {
    expect(() => script.collectAngularRoutes(write(`bad-${_name.length}.routes.ts`, source))).toThrow(/not a string literal/);
  });

  it('still reads an empty path and a plain template literal', () => {
    const routes = script.collectAngularRoutes(write('ok.routes.ts', 'export const routes = [{ path: \'\', component: A }, { path: `b`, component: B }];'));
    expect(routes.map((r) => r.path)).toEqual(['/', '/b']);
  });
});

describe('checkCoverage', () => {
  const routes = script.collectAngularRoutes(FIXTURE);
  const full = ['/login', '/clubs', '/clubs/:id', '/clubs/:id/edit', '/', '/events', '/__probe'];

  it('passes when every route is owned and lists manifest-only extras', () => {
    const result = script.checkCoverage(routes, full, true);
    expect(result.gaps).toEqual([]);
    expect(result.manifestOnly).toEqual(['/events', '/__probe']);
  });

  it('reports a missing page, a redirect with an unowned target and a missing not-found', () => {
    const result = script.checkCoverage(routes, ['/login', '/clubs', '/clubs/:id', '/'], false);
    expect(result.gaps.map((g) => `${g.kind} ${g.path}`)).toEqual(['page /clubs/:id/edit', 'redirect /', 'wildcard /*']);
  });

  it('treats a differently named param as a gap', () => {
    const result = script.checkCoverage(routes, full.map((p) => p.replace(':id', ':clubId')), true);
    expect(result.gaps.map((g) => g.path)).toEqual(['/clubs/:id', '/clubs/:id/edit']);
  });
});

describe('readManifest', () => {
  it('reads the patterns from defineRoutes', () => {
    expect(script.readManifest(write('routes.ts', `export const manifest = defineRoutes(['/a', '/b/:id']);`))).toEqual(['/a', '/b/:id']);
  });
});

describe('CLI', () => {
  const run = (...args: string[]) => spawnSync(process.execPath, [scriptPath, ...args], { encoding: 'utf8' });

  it('exits 0 with full coverage of the real Angular routes', () => {
    const res = run();
    expect(res.status).toBe(0);
    expect(res.stdout).toMatch(/Covered (\d+)\/\1 Angular routes \(0 gaps\)/);
  });

  it('exits 1 and names the gap on an incomplete manifest', () => {
    const manifest = write('small-routes.ts', `export const m = defineRoutes(['/login']);`);
    const res = run('--angular', FIXTURE, '--manifest', manifest);
    expect(res.status).toBe(1);
    expect(res.stdout).toContain('GAP');
    expect(res.stdout).toContain('/clubs/:id/edit');
  });
});

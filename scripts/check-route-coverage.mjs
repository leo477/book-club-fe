/**
 * Route coverage gate for the strangler migration (R13): every Angular route must be owned by a Next page
 * listed in apps/web/src/strangler/routes.ts, and the wildcard must be backed by app/not-found.tsx.
 *
 * Usage: node scripts/check-route-coverage.mjs [--angular src/app/app.routes.ts] [--manifest apps/web/src/strangler/routes.ts] [--not-found apps/web/src/app/not-found.tsx] [--json]
 * Exit code 1 on any gap.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';

const parse = (file) => ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true);

const prop = (obj, name) =>
  obj.properties.find((p) => ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) && p.name.text === name);

const str = (node) => (node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) ? node.text : undefined);

const join = (base, segment) => {
  const parts = [...base.split('/'), ...segment.split('/')].filter(Boolean);
  return '/' + parts.join('/');
};

function findArray(sf, name) {
  let found;
  const visit = (n) => {
    if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === name && n.initializer && ts.isArrayLiteralExpression(n.initializer)) found = n.initializer;
    ts.forEachChild(n, visit);
  };
  visit(sf);
  if (!found) throw new Error(`${sf.fileName}: no array literal named ${name}`);
  return found;
}

/** `() => import('./x.routes').then(m => m.NAME)` -> { module, name } */
function lazyTarget(node) {
  let module;
  let name;
  const visit = (n) => {
    if (ts.isCallExpression(n) && n.expression.kind === ts.SyntaxKind.ImportKeyword) module = str(n.arguments[0]);
    if (ts.isPropertyAccessExpression(n) && ts.isIdentifier(n.expression) && ts.isIdentifier(n.name) && n.expression.text === 'm') name = n.name.text;
    ts.forEachChild(n, visit);
  };
  visit(node);
  if (!module || !name) throw new Error(`cannot resolve loadChildren: ${node.getText()}`);
  return { module, name };
}

function walk(array, file, base) {
  const out = [];
  for (const el of array.elements) {
    if (!ts.isObjectLiteralExpression(el)) throw new Error(`${file}: non-literal route entry`);
    const pathProp = prop(el, 'path');
    const segment = pathProp ? str(pathProp.initializer) : '';
    if (segment === undefined) throw new Error(`${file}: route path is not a string literal (${pathProp.initializer.getText()}); the coverage check cannot resolve it`);
    if (segment === '**') {
      out.push({ kind: 'wildcard', path: join(base, '*'), file });
      continue;
    }
    const path = join(base, segment);
    const redirect = str(prop(el, 'redirectTo')?.initializer);
    const children = prop(el, 'children')?.initializer;
    const lazy = prop(el, 'loadChildren');
    const hasChildren = Boolean(lazy) || (children !== undefined && ts.isArrayLiteralExpression(children));
    if (redirect !== undefined) {
      out.push({ kind: 'redirect', path, to: redirect.startsWith('/') ? redirect : join(base, redirect), file });
    } else if ((prop(el, 'component') || prop(el, 'loadComponent')) && !hasChildren) {
      // a component with children is a layout (e.g. the shell), not a page of its own
      out.push({ kind: 'page', path, file });
    }
    if (children && ts.isArrayLiteralExpression(children)) out.push(...walk(children, file, path));
    if (lazy) {
      const { module, name } = lazyTarget(lazy.initializer);
      out.push(...collectAngularRoutes(resolve(dirname(file), `${module}.ts`), name, path));
    }
  }
  return out;
}

/** Flattens a Routes array into `{ kind: 'page' | 'redirect' | 'wildcard', path, to? }`. */
export function collectAngularRoutes(file, arrayName = 'routes', base = '/') {
  return walk(findArray(parse(file), arrayName), file, base);
}

export function readManifest(file) {
  const patterns = [];
  const visit = (n) => {
    if (ts.isCallExpression(n) && ts.isIdentifier(n.expression) && n.expression.text === 'defineRoutes') {
      const arg = n.arguments[0];
      if (arg && ts.isArrayLiteralExpression(arg)) for (const e of arg.elements) if (str(e) !== undefined) patterns.push(str(e));
    }
    ts.forEachChild(n, visit);
  };
  visit(parse(file));
  if (!patterns.length) throw new Error(`${file}: no defineRoutes([...]) patterns found`);
  return patterns;
}

export function checkCoverage(angular, manifest, notFoundExists) {
  const owned = new Set(manifest);
  const rows = [];
  const seen = new Set();
  for (const r of angular) {
    const key = `${r.kind}:${r.path}`;
    if (seen.has(key)) continue;
    seen.add(key);
    if (r.kind === 'wildcard') {
      rows.push({ ...r, covered: notFoundExists, via: 'app/not-found.tsx', reason: notFoundExists ? '' : 'app/not-found.tsx is missing' });
    } else if (r.kind === 'redirect') {
      const reasons = [];
      if (!owned.has(r.path)) reasons.push(`source ${r.path} not in manifest`);
      if (!owned.has(r.to)) reasons.push(`target ${r.to} not in manifest`);
      rows.push({ ...r, covered: reasons.length === 0, via: 'manifest', reason: reasons.join('; ') });
    } else {
      const covered = owned.has(r.path);
      rows.push({ ...r, covered, via: 'manifest', reason: covered ? '' : `${r.path} not in manifest` });
    }
  }
  const angularPaths = new Set(angular.filter((r) => r.kind !== 'wildcard').map((r) => r.path));
  const manifestOnly = manifest.filter((p) => !angularPaths.has(p));
  return { rows, gaps: rows.filter((r) => !r.covered), manifestOnly };
}

export function formatReport({ rows, gaps, manifestOnly }) {
  const lines = ['Route coverage: Angular routes vs strangler manifest', ''];
  for (const r of rows) {
    const arrow = r.kind === 'redirect' ? ` -> ${r.to}` : '';
    lines.push(`${r.covered ? 'OK ' : 'GAP'}  ${r.kind.padEnd(8)} ${r.path}${arrow}${r.covered ? `  (${r.via})` : `  ${r.reason}`}`);
  }
  lines.push('', `Covered ${rows.length - gaps.length}/${rows.length} Angular routes (${gaps.length} gaps)`);
  if (manifestOnly.length) lines.push(`Manifest-only (no Angular route, informational): ${manifestOnly.join(', ')}`);
  return lines.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const opt = (name, fallback) => (args.includes(name) ? args[args.indexOf(name) + 1] : fallback);
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const angular = collectAngularRoutes(resolve(root, opt('--angular', 'src/app/app.routes.ts')));
  const manifest = readManifest(resolve(root, opt('--manifest', 'apps/web/src/strangler/routes.ts')));
  const result = checkCoverage(angular, manifest, existsSync(resolve(root, opt('--not-found', 'apps/web/src/app/not-found.tsx'))));
  console.log(args.includes('--json') ? JSON.stringify(result, null, 2) : formatReport(result));
  process.exitCode = result.gaps.length ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();

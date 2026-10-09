import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import ts from 'typescript';

export const SRC = resolve(__dirname, '..');

const ASSET = /\.(css|scss|json|svg|png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|md)$/i;

function isTypeOnlyImport(node: ts.ImportDeclaration): boolean {
  const clause = node.importClause;
  if (!clause) return false;
  if (clause.isTypeOnly) return true;
  // `import { type A, type B }` is erased entirely; a default or namespace binding or any value specifier keeps the edge
  const named = clause.namedBindings;
  return !clause.name && !!named && ts.isNamedImports(named) && named.elements.length > 0 && named.elements.every((e) => e.isTypeOnly);
}

export function staticSpecifiers(source: string): string[] {
  const sf = ts.createSourceFile('x.tsx', source, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX);
  const specs: string[] = [];
  for (const node of sf.statements) {
    if (ts.isImportDeclaration(node) && !isTypeOnlyImport(node) && ts.isStringLiteral(node.moduleSpecifier)) specs.push(node.moduleSpecifier.text);
    else if (ts.isExportDeclaration(node) && !node.isTypeOnly && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) specs.push(node.moduleSpecifier.text);
  }
  return specs;
}

export function resolveImport(from: string, spec: string, exists: (file: string) => boolean = existsSync): string | null {
  const base = spec.startsWith('@/') ? join(SRC, spec.slice(2)) : spec.startsWith('.') ? join(dirname(from), spec) : null;
  if (!base) return null;
  if (ASSET.test(spec)) return null;
  const stem = base.replace(/\.[cm]?jsx?$/, '');
  const found = [base, ...['.ts', '.tsx', '/index.ts', '/index.tsx'].flatMap((ext) => [base + ext, stem + ext])].find((c) => /\.tsx?$/.test(c) && exists(c));
  // a silently dropped edge would let a forbidden import hide behind an unresolvable specifier
  if (!found) throw new Error(`Cannot resolve "${spec}" imported from ${from}`);
  return found;
}

export function staticGraph(
  entry: string,
  read: (file: string) => string = (f) => readFileSync(f, 'utf8'),
  exists: (file: string) => boolean = existsSync,
): { files: Set<string>; packages: Set<string> } {
  const files = new Set<string>();
  const packages = new Set<string>();
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.pop() as string;
    if (files.has(file)) continue;
    files.add(file);
    for (const spec of staticSpecifiers(read(file))) {
      const next = resolveImport(file, spec, exists);
      if (next) queue.push(next);
      else if (!spec.startsWith('.') && !spec.startsWith('@/')) packages.add(spec);
    }
  }
  return { files, packages };
}

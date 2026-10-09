import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import ts from 'typescript';

export const SRC = resolve(__dirname, '../..');

export function staticSpecifiers(source: string): string[] {
  const sf = ts.createSourceFile('x.tsx', source, ts.ScriptTarget.Latest, false, ts.ScriptKind.TSX);
  const specs: string[] = [];
  for (const node of sf.statements) {
    if (ts.isImportDeclaration(node) && !node.importClause?.isTypeOnly && ts.isStringLiteral(node.moduleSpecifier)) specs.push(node.moduleSpecifier.text);
    else if (ts.isExportDeclaration(node) && !node.isTypeOnly && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) specs.push(node.moduleSpecifier.text);
  }
  return specs;
}

export function resolveImport(from: string, spec: string): string | null {
  const base = spec.startsWith('@/') ? join(SRC, spec.slice(2)) : spec.startsWith('.') ? join(dirname(from), spec) : null;
  if (!base) return null;
  return ['.ts', '.tsx', '/index.ts', '/index.tsx'].map((ext) => base + ext).find(existsSync) ?? null;
}

export function staticGraph(entry: string, read: (file: string) => string = (f) => readFileSync(f, 'utf8')): { files: Set<string>; packages: Set<string> } {
  const files = new Set<string>();
  const packages = new Set<string>();
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.pop() as string;
    if (files.has(file)) continue;
    files.add(file);
    for (const spec of staticSpecifiers(read(file))) {
      const next = resolveImport(file, spec);
      if (next) queue.push(next);
      else if (!spec.startsWith('.') && !spec.startsWith('@/')) packages.add(spec);
    }
  }
  return { files, packages };
}

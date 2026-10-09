import { describe, expect, it } from 'vitest';
import { SRC, resolveImport, staticGraph, staticSpecifiers } from './import-graph';

describe('static import walker', () => {
  it('reports double-quoted, single-quoted, multi-line and re-export specifiers', () => {
    const source = [
      'import a from "react-hook-form";',
      "import { b } from 'zod';",
      'import {\n  c,\n  d,\n} from "@hookform/resolvers";',
      'import "side-effect";',
      'export * from "./star";',
      "export { e } from './named';",
    ].join('\n');
    expect(staticSpecifiers(source)).toEqual(['react-hook-form', 'zod', '@hookform/resolvers', 'side-effect', './star', './named']);
  });

  it('flags a static double-quoted import of a forbidden module', () => {
    const specs = staticSpecifiers('import { useForm } from "react-hook-form";\nexport const x = 1;');
    expect(specs.filter((p) => p.startsWith('react-hook-form'))).toEqual(['react-hook-form']);
  });

  it('does not treat dynamic import() or type-only imports as static', () => {
    const source = [
      'const Lazy = dynamic(() => import("react-hook-form"));',
      "const m = await import('./edit-club');",
      'import type { T } from "react-hook-form";',
      'export type { U } from "./edit-club";',
    ].join('\n');
    expect(staticSpecifiers(source)).toEqual([]);
  });

  it('keeps inline-type imports and re-exports, exempting only top-level type forms', () => {
    expect(staticSpecifiers('import { type A, type B } from "react-hook-form";')).toEqual(['react-hook-form']);
    expect(staticSpecifiers('import { type A, b } from "react-hook-form";')).toEqual(['react-hook-form']);
    expect(staticSpecifiers('export { type A } from "x";')).toEqual(['x']);
    expect(staticSpecifiers('export * as ns from "x";')).toEqual(['x']);
    expect(staticSpecifiers('import type * as ns from "x"; export type * from "y";')).toEqual([]);
  });
});

describe('graph resolution', () => {
  const at = (p: string) => `${SRC}/${p}`;
  const fixture = (tree: Record<string, string>) => ({
    read: (f: string) => {
      if (!(f in tree)) throw new Error(`unexpected read ${f}`);
      return tree[f] as string;
    },
    exists: (f: string) => f in tree,
  });

  it('resolves @/ aliases, relative paths, index files and .js specifiers', () => {
    const { exists } = fixture({ [at('a/b.ts')]: '', [at('a/dir/index.tsx')]: '', [at('a/c.tsx')]: '' });
    expect(resolveImport(at('x/y.ts'), '@/a/b', exists)).toBe(at('a/b.ts'));
    expect(resolveImport(at('a/y.ts'), './dir', exists)).toBe(at('a/dir/index.tsx'));
    expect(resolveImport(at('a/y.ts'), './c.js', exists)).toBe(at('a/c.tsx'));
    expect(resolveImport(at('a/y.ts'), 'zod', exists)).toBeNull();
    expect(resolveImport(at('a/y.ts'), './styles.css', exists)).toBeNull();
    for (const spec of ['./a.svg?url', './a.svg?raw', './a.css#x', './n.mdx', './t.txt', './m.webmanifest', './f.woff', './i.ico', './p.webp', './p.avif', './p.jpg', './p.jpeg', './p.gif', './s.scss']) {
      expect(resolveImport(at('a/y.ts'), spec, exists), spec).toBeNull();
    }
    expect(resolveImport(at('a/y.ts'), './c?x', exists)).toBe(at('a/c.tsx'));
  });

  it('throws naming the importer and specifier when a local specifier does not resolve', () => {
    const { exists } = fixture({});
    expect(() => resolveImport(at('a/y.ts'), './missing', exists)).toThrow(`Cannot resolve "./missing" imported from ${at('a/y.ts')}`);
    expect(() => resolveImport(at('a/y.ts'), '@/nope', exists)).toThrow(/"@\/nope"/);
  });

  it('follows export * and export { x } from, collects packages, and terminates on cycles', () => {
    const tree = {
      [at('e.ts')]: 'import { a } from "@/a"; import "zod"; export * from "./star"; export { n } from "./named";',
      [at('a.ts')]: 'import { e } from "./e"; import "react-hook-form";',
      [at('star.ts')]: 'export const s = 1;',
      [at('named.tsx')]: 'import "./style.css"; export const n = 1;',
    };
    const { read, exists } = fixture(tree);
    const { files, packages } = staticGraph(at('e.ts'), read, exists);
    expect([...files].sort()).toEqual([at('a.ts'), at('e.ts'), at('named.tsx'), at('star.ts')]);
    expect([...packages].sort()).toEqual(['react-hook-form', 'zod']);
  });

  it('propagates an unresolved specifier from the walk', () => {
    const { read, exists } = fixture({ [at('e.ts')]: 'import "./gone";' });
    expect(() => staticGraph(at('e.ts'), read, exists)).toThrow(/gone/);
  });
});

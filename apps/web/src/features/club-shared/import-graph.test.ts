import { describe, expect, it } from 'vitest';
import { staticSpecifiers } from './import-graph';

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
});

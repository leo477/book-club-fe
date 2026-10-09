import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = resolve(__dirname, '../..');

function resolveImport(from: string, spec: string): string | null {
  const base = spec.startsWith('@/') ? join(SRC, spec.slice(2)) : spec.startsWith('.') ? join(dirname(from), spec) : null;
  if (!base) return null;
  return ['.ts', '.tsx', '/index.ts', '/index.tsx'].map((ext) => base + ext).find(existsSync) ?? null;
}

function reachable(entry: string): Set<string> {
  const seen = new Set<string>();
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.pop() as string;
    if (seen.has(file)) continue;
    seen.add(file);
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/^(?:import|export)\s(?:[^;]*?from\s+)?'([^']+)'/gm)) {
      const next = resolveImport(file, match[1] as string);
      if (next) queue.push(next);
    }
  }
  return seen;
}

describe('club page chunk boundary', () => {
  it('the member list does not pull in the manage screen or the organizer forms', () => {
    const files = [...reachable(join(SRC, 'features/club-detail/member-list.tsx'))].map((f) => f.slice(SRC.length));
    expect(files.filter((f) => f.includes('/features/club-manage/') || f.includes('/features/organizer/'))).toEqual([]);
    expect(files).toContain('/features/club-shared/use-member-actions.ts');
  });
});

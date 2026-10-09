import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = resolve(__dirname, '../..');

function resolveImport(from: string, spec: string): string | null {
  const base = spec.startsWith('@/') ? join(SRC, spec.slice(2)) : spec.startsWith('.') ? join(dirname(from), spec) : null;
  if (!base) return null;
  return ['.ts', '.tsx', '/index.ts', '/index.tsx'].map((ext) => base + ext).find(existsSync) ?? null;
}

function staticGraph(entry: string): { files: Set<string>; packages: Set<string> } {
  const files = new Set<string>();
  const packages = new Set<string>();
  const queue = [entry];
  while (queue.length > 0) {
    const file = queue.pop() as string;
    if (files.has(file)) continue;
    files.add(file);
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/^(?:import|export)\s(?:[^;]*?from\s+)?'([^']+)'/gm)) {
      const spec = match[1] as string;
      const next = resolveImport(file, spec);
      if (next) queue.push(next);
      else if (!spec.startsWith('.') && !spec.startsWith('@/')) packages.add(spec);
    }
  }
  return { files, packages };
}

describe('organizer lazy boundary', () => {
  it('the statically imported part of the lazy wrappers carries no form code', () => {
    const { files, packages } = staticGraph(join(SRC, 'features/organizer/lazy.tsx'));
    const names = [...files].map((f) => f.slice(SRC.length));
    expect(names).toContain('/features/club-manage/organizer-gate.tsx');
    expect(names.filter((f) => /\/(create-club|edit-club|create-event|edit-event|event-form)\.tsx?$/.test(f))).toEqual([]);
    expect([...packages].filter((p) => p.startsWith('react-hook-form') || p.startsWith('@hookform/'))).toEqual([]);
  });
});

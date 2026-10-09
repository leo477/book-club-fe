import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SRC, staticGraph } from './import-graph';

describe('organizer lazy boundary', () => {
  it('the statically imported part of the lazy wrappers carries no form code', () => {
    const { files, packages } = staticGraph(join(SRC, 'features/organizer/lazy.tsx'));
    const names = [...files].map((f) => f.slice(SRC.length));
    expect(names).toContain('/features/club-manage/organizer-gate.tsx');
    expect(names.filter((f) => /\/(create-club|edit-club|create-event|edit-event|event-form)\.tsx?$/.test(f))).toEqual([]);
    expect([...packages].filter((p) => p.startsWith('react-hook-form') || p.startsWith('@hookform/'))).toEqual([]);
  });
});

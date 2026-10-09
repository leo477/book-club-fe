import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SRC, staticGraph } from './import-graph';

describe('club page chunk boundary', () => {
  it('the member list does not pull in the manage screen or the organizer forms', () => {
    const files = [...staticGraph(join(SRC, 'features/club-detail/member-list.tsx')).files].map((f) => f.slice(SRC.length));
    expect(files.filter((f) => f.includes('/features/club-manage/') || f.includes('/features/organizer/'))).toEqual([]);
    expect(files).toContain('/features/club-shared/use-member-actions.ts');
  });
});

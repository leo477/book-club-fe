import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SRC, staticGraph } from '@/test-support/import-graph';

const names = (entry: string) => {
  const { files, packages } = staticGraph(join(SRC, entry));
  return { files: [...files].map((f) => f.slice(SRC.length)), packages: [...packages] };
};

const forms = (p: string) => p.startsWith('react-hook-form') || p.startsWith('@hookform/');

describe('quiz lazy boundary', () => {
  it('the statically imported part of the lazy wrappers carries no screen or form code', () => {
    const { files, packages } = names('features/quiz/lazy.tsx');
    expect(files).toContain('/features/club-manage/organizer-gate.tsx');
    expect(packages).toContain('react');
    expect(files.filter((f) => /\/features\/quiz\/(quiz-(create|edit|preview|session|editor)|leaderboard)\.tsx$/.test(f))).toEqual([]);
    expect(packages.filter(forms)).toEqual([]);
  });

  it.each(['quiz-list', 'quiz-take', 'quiz-leaderboard'])('%s does not pull in the editor or its form libraries', (screen) => {
    const { files, packages } = names(`features/quiz/${screen}.tsx`);
    expect(files.length).toBeGreaterThan(1);
    expect(files.filter((f) => f.endsWith('/features/quiz/quiz-editor.tsx') || f.endsWith('/features/organizer/lazy.tsx'))).toEqual([]);
    expect(packages.filter(forms)).toEqual([]);
  });

  it('the editor is the one quiz screen that brings the form libraries', () => {
    expect(names('features/quiz/quiz-editor.tsx').packages.some(forms)).toBe(true);
  });
});

import type { TestInfo } from '@playwright/test';

export function assertBaselineWritable(testInfo: TestInfo): void {
  const mode = testInfo.config.updateSnapshots;
  if (testInfo.project.name === 'next' && ['all', 'changed', 'missing'].includes(mode)) {
    throw new Error(`Refusing to write snapshots (updateSnapshots="${mode}") for the "next" project: baselines come from legacy.`);
  }
}

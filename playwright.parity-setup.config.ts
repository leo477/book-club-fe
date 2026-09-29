import { defineConfig } from '@playwright/test';
import { parityTargets } from './playwright.parity.config';

export default defineConfig({
  testDir: './e2e/parity',
  testMatch: ['member.setup.ts'],
  workers: 1,
  timeout: 180_000,
  reporter: [['list']],
  projects: [{ name: 'setup', use: { baseURL: parityTargets.legacy } }],
});

import { test } from '@playwright/test';
import globalSetup from '../global-setup';

test('seed member storage state for HAR journeys', async ({}, testInfo) => {
  if (!process.env['AUDIT_API_BASE_URL']) {
    throw new Error('Set AUDIT_API_BASE_URL explicitly (local backend, or a shared one together with ALLOW_PROD_SEED=1).');
  }
  await globalSetup(testInfo.config);
});

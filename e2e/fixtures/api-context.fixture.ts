import { test as base, type APIRequestContext } from '@playwright/test';
import { newApiContext } from './api-client';
import { apiContextFor, loadRunContext } from './seed-helper';

interface ApiFixtures {
  // Authenticated as the seeded member/organizer persona — token is checked
  // for staleness and refreshed automatically before the context is handed out.
  memberApi: APIRequestContext;
  organizerApi: APIRequestContext;
  // No Authorization header — for asserting 401s on protected endpoints.
  anonApi: APIRequestContext;
}

export const test = base.extend<ApiFixtures>({
  anonApi: async ({}, use) => {
    const ctx = await newApiContext();
    await use(ctx);
    await ctx.dispose();
  },
  memberApi: async ({}, use) => {
    const ctx = await apiContextFor('member');
    await use(ctx);
    await ctx.dispose();
  },
  organizerApi: async ({}, use) => {
    const ctx = await apiContextFor('organizer');
    await use(ctx);
    await ctx.dispose();
  },
});

export { loadRunContext };
export { expect } from '@playwright/test';

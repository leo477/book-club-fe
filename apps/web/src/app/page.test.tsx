import { beforeEach, describe, expect, it, vi } from 'vitest';
import RootPage from './page';

const redirect = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ redirect }));
beforeEach(() => redirect.mockReset());

describe('/ page', () => {
  it('redirects to /events', () => {
    RootPage();
    expect(redirect).toHaveBeenCalledWith('/events');
  });
});

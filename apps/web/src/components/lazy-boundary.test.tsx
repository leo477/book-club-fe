import { render, screen } from '@testing-library/react';
import { lazy, Suspense } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LazyBoundary } from './lazy-boundary';

vi.mock('@vercel/analytics', () => ({ track: vi.fn() }));

afterEach(() => vi.restoreAllMocks());

describe('LazyBoundary', () => {
  it('renders the inert fallback when the lazy chunk fails to load', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const Broken = lazy(() => Promise.reject(new Error('ChunkLoadError')));
    render(
      <LazyBoundary fallback={<span>inert</span>}>
        <Suspense fallback={<span>loading</span>}>
          <Broken />
        </Suspense>
      </LazyBoundary>,
    );
    expect(await screen.findByText('inert')).toBeInTheDocument();
  });

  it('renders children when nothing fails', () => {
    render(
      <LazyBoundary fallback={<span>inert</span>}>
        <span>island</span>
      </LazyBoundary>,
    );
    expect(screen.getByText('island')).toBeInTheDocument();
  });
});

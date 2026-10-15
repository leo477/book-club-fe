import { describe, expect, it } from 'vitest';
import StranglerProbe, { metadata } from './page';

describe('/__strangler-probe page', () => {
  it('is noindex,nofollow', () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('renders the probe marker', () => {
    expect(StranglerProbe().props['data-testid']).toBe('strangler-probe');
  });
});

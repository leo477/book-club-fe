import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { messages, renderWithProviders } from '@/test/harness';
import { GoogleButton } from './google-button';

afterEach(() => vi.unstubAllEnvs());

describe('GoogleButton', () => {
  it('redirects the whole page to the backend OAuth start with our origin', async () => {
    vi.stubEnv('NEXT_PUBLIC_OAUTH_BASE_URL', 'https://api.example.test/api/v1');
    const location = { href: 'http://localhost:3000/login', origin: 'http://localhost:3000' };
    vi.stubGlobal('location', location);
    renderWithProviders(<GoogleButton />);
    await userEvent.click(screen.getByRole('button', { name: messages.uk['AUTH.continue_with_google'] }));
    expect(location.href).toBe('https://api.example.test/api/v1/auth/oauth/google?origin=http%3A%2F%2Flocalhost%3A3000');
    vi.unstubAllGlobals();
  });
});

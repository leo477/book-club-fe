import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GeocodeSuggestion } from '@book-club/contracts';
import { resetGeocodeSession } from '@/lib/geocode-session';
import { API, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { AddressAutocomplete } from './address-autocomplete';

const toast = vi.hoisted(() => vi.fn());
vi.mock('@/lib/toast', () => ({ showToast: toast }));
vi.mock('@/lib/navigate', () => ({ hardNavigate: vi.fn(), replaceNavigate: vi.fn() }));

setupApiServer();
beforeEach(() => {
  toast.mockReset();
  resetGeocodeSession();
});

const kyiv: GeocodeSuggestion = { label: 'Київ, Україна', city: 'Київ', country: 'Україна', lat: 50.45, lng: 30.52 };
const lviv: GeocodeSuggestion = { label: 'Львів, Україна', city: 'Львів', country: 'Україна', lat: 49.84, lng: 24.03 };
const partial: GeocodeSuggestion = { label: 'Cafe Pushkin', city: null, country: null, lat: null, lng: null, place_id: 'pid1' };

function Harness({ onSelected }: { onSelected: (s: GeocodeSuggestion) => void }) {
  const [value, setValue] = useState('');
  return <AddressAutocomplete value={value} onChange={setValue} onSelected={onSelected} label="Місце" placeholder="Почніть вводити адресу…" inputProps={{ 'data-testid': 'address-input' }} />;
}

function mockAutocomplete(results: GeocodeSuggestion[] | number) {
  const calls: URL[] = [];
  server.use(
    http.get(`${API}/geocode/autocomplete`, ({ request }) => {
      calls.push(new URL(request.url));
      return typeof results === 'number' ? HttpResponse.json({ detail: 'x' }, { status: results }) : HttpResponse.json(results);
    }),
  );
  return calls;
}

const input = () => screen.getByTestId('address-input');
const option = (name: string) => screen.findByRole('option', { name }, { timeout: 3000 });

describe('AddressAutocomplete', () => {
  it('searches after the 300 ms debounce with the query, the locale, limit 5 and one session token', async () => {
    const calls = mockAutocomplete([kyiv, lviv]);
    const user = userEvent.setup();
    renderWithProviders(<Harness onSelected={vi.fn()} />);
    await user.type(input(), 'Ки');
    await option(kyiv.label);
    expect(calls).toHaveLength(1);
    const params = calls[0]?.searchParams;
    expect(params?.get('q')).toBe('Ки');
    expect(params?.get('lang')).toBe('uk');
    expect(params?.get('limit')).toBe('5');
    expect(params?.get('session_token')).toMatch(/^[0-9a-f-]{36}$/);
    expect(screen.getAllByRole('option')).toHaveLength(2);
  });

  it('does not search for a single character', async () => {
    const calls = mockAutocomplete([kyiv]);
    const user = userEvent.setup();
    renderWithProviders(<Harness onSelected={vi.fn()} />);
    await user.type(input(), 'К');
    await new Promise((r) => setTimeout(r, 450));
    expect(calls).toHaveLength(0);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('uses the English locale for the search when the page is English', async () => {
    const calls = mockAutocomplete([kyiv]);
    const user = userEvent.setup();
    renderWithProviders(<Harness onSelected={vi.fn()} />, 'en');
    await user.type(input(), 'Ky');
    await option(kyiv.label);
    expect(calls[0]?.searchParams.get('lang')).toBe('en');
  });

  it('writes the label into the field, emits a suggestion that has coordinates and starts a new session', async () => {
    const calls = mockAutocomplete([kyiv]);
    const onSelected = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<Harness onSelected={onSelected} />);
    await user.type(input(), 'Ки');
    await user.click(await option(kyiv.label));
    expect(input()).toHaveValue(kyiv.label);
    expect(onSelected).toHaveBeenCalledWith(kyiv);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    const first = calls[0]?.searchParams.get('session_token');
    await user.clear(input());
    await user.type(input(), 'Лв');
    await option(kyiv.label);
    expect(calls[1]?.searchParams.get('session_token')).not.toBe(first);
  });

  it('resolves a suggestion without coordinates through place details with the same session token', async () => {
    const calls = mockAutocomplete([partial]);
    const details: URL[] = [];
    server.use(
      http.get(`${API}/geocode/place-details`, ({ request }) => {
        details.push(new URL(request.url));
        return HttpResponse.json({ ...partial, city: 'Київ', lat: 50.4, lng: 30.5 });
      }),
    );
    const onSelected = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<Harness onSelected={onSelected} />);
    await user.type(input(), 'Caf');
    await user.click(await option('Cafe Pushkin'));
    await waitFor(() => expect(onSelected).toHaveBeenCalledWith(expect.objectContaining({ city: 'Київ', lat: 50.4, lng: 30.5 })));
    expect(details[0]?.searchParams.get('place_id')).toBe('pid1');
    expect(details[0]?.searchParams.get('session_token')).toBe(calls[0]?.searchParams.get('session_token'));
  });

  it('falls back to the original suggestion when place details fail', async () => {
    mockAutocomplete([partial]);
    server.use(http.get(`${API}/geocode/place-details`, () => HttpResponse.json({ detail: 'down' }, { status: 502 })));
    const onSelected = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<Harness onSelected={onSelected} />);
    await user.type(input(), 'Caf');
    await user.click(await option('Cafe Pushkin'));
    await waitFor(() => expect(onSelected).toHaveBeenCalledWith(partial));
  });

  it('shows no list and keeps typing usable when the search fails', async () => {
    const calls = mockAutocomplete(502);
    const user = userEvent.setup();
    renderWithProviders(<Harness onSelected={vi.fn()} />);
    await user.type(input(), 'Ки');
    await waitFor(() => expect(calls).toHaveLength(1), { timeout: 3000 });
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(input()).toHaveValue('Ки');
  });

  it('drops a place-details answer that arrives after the user typed again', async () => {
    mockAutocomplete([partial]);
    let release!: () => void;
    const gate = new Promise<void>((resolve) => (release = resolve));
    server.use(
      http.get(`${API}/geocode/place-details`, async () => {
        await gate;
        return HttpResponse.json({ ...partial, city: 'Київ', lat: 50.4, lng: 30.5 });
      }),
    );
    const onSelected = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<Harness onSelected={onSelected} />);
    await user.type(input(), 'Caf');
    await user.click(await option('Cafe Pushkin'));
    await user.type(input(), 'e');
    release();
    await new Promise((r) => setTimeout(r, 50));
    expect(onSelected).not.toHaveBeenCalled();
    expect(input()).toHaveValue('Cafe Pushkine');
  });
});

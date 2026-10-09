import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HttpResponse, http } from 'msw';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { BookSuggestion } from '@book-club/contracts';
import { API, messages, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { BookAutocomplete } from './book-autocomplete';

const toast = vi.hoisted(() => vi.fn());
vi.mock('@/lib/toast', () => ({ showToast: toast }));
const hard = vi.hoisted(() => vi.fn());
vi.mock('@/lib/navigate', () => ({ hardNavigate: hard, replaceNavigate: vi.fn() }));

setupApiServer();

const dune: BookSuggestion = { id: 'g1', title: 'Dune', authors: ['Frank Herbert'], thumbnail: 'https://books.example/dune.jpg', publishedDate: '1965-08-01' };
const emma: BookSuggestion = { id: 'g2', title: 'Emma', authors: ['Jane Austen', 'Editor'] };

function Harness({ onSelected, debounceMs = 5 }: { onSelected: (b: BookSuggestion) => void; debounceMs?: number }) {
  const [value, setValue] = useState('');
  return <BookAutocomplete value={value} onChange={setValue} onSelected={onSelected} label="Назва книги" debounceMs={debounceMs} />;
}

function mockSearch(result: BookSuggestion[] | number) {
  const calls: URL[] = [];
  server.use(
    http.get(`${API}/books/search`, ({ request }) => {
      calls.push(new URL(request.url));
      return typeof result === 'number' ? HttpResponse.json({ detail: 'x' }, { status: result }) : HttpResponse.json(result);
    }),
  );
  return calls;
}

const box = () => screen.getByRole('combobox', { name: 'Назва книги' });

describe('BookAutocomplete', () => {
  it('needs three characters, then searches for 5 books', async () => {
    const calls = mockSearch([dune, emma]);
    const user = userEvent.setup();
    renderWithProviders(<Harness onSelected={vi.fn()} />);
    await user.type(box(), 'Du');
    await new Promise((r) => setTimeout(r, 80));
    expect(calls).toHaveLength(0);
    await user.type(box(), 'n');
    await screen.findByRole('option', { name: /Dune/ });
    expect(calls[0]?.searchParams.get('q')).toBe('Dun');
    expect(calls[0]?.searchParams.get('limit')).toBe('5');
  });

  it('waits 600 ms by default', async () => {
    const calls = mockSearch([dune]);
    const user = userEvent.setup();
    renderWithProviders(<Harness onSelected={vi.fn()} debounceMs={600} />);
    await user.type(box(), 'Dun');
    await new Promise((r) => setTimeout(r, 450));
    expect(calls).toHaveLength(0);
    await screen.findByRole('option', { name: /Dune/ }, { timeout: 2000 });
    expect(calls).toHaveLength(1);
  });

  it('renders thumbnail or placeholder, authors and the year', async () => {
    mockSearch([dune, emma]);
    const user = userEvent.setup();
    renderWithProviders(<Harness onSelected={vi.fn()} />);
    await user.type(box(), 'Dun');
    const first = await screen.findByRole('option', { name: /Dune/ });
    expect(first).toHaveTextContent('Frank Herbert');
    expect(first).toHaveTextContent('1965');
    expect(first.querySelector('img')).toHaveAttribute('src', dune.thumbnail);
    const second = screen.getByRole('option', { name: /Emma/ });
    expect(second).toHaveTextContent('Jane Austen, Editor');
    expect(second.querySelector('img')).toBeNull();
    expect(second).toHaveTextContent('📚');
  });

  it('writes the title into the field and emits the book; a later edit searches again', async () => {
    const calls = mockSearch([dune]);
    const onSelected = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<Harness onSelected={onSelected} />);
    await user.type(box(), 'Dun');
    await user.click(await screen.findByRole('option', { name: /Dune/ }));
    expect(box()).toHaveValue('Dune');
    expect(onSelected).toHaveBeenCalledWith(dune);
    await new Promise((r) => setTimeout(r, 80));
    expect(calls).toHaveLength(1);
    await user.type(box(), ' II');
    await waitFor(() => expect(calls).toHaveLength(2));
    expect(calls[1]?.searchParams.get('q')).toBe('Dune II');
  });

  it('shows the localized error message without a toast or a login redirect when the search fails', async () => {
    mockSearch(401);
    const user = userEvent.setup();
    renderWithProviders(<Harness onSelected={vi.fn()} />);
    await user.type(box(), 'Dun');
    expect(await screen.findByText(messages.uk['BOOK_AUTOCOMPLETE.error'] ?? '')).toBeInTheDocument();
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(toast).not.toHaveBeenCalled();
    expect(hard).not.toHaveBeenCalled();
  });

  it('clears the error once a later search works', async () => {
    let fail = true;
    server.use(http.get(`${API}/books/search`, () => (fail ? HttpResponse.json({ detail: 'x' }, { status: 500 }) : HttpResponse.json([dune]))));
    const user = userEvent.setup();
    renderWithProviders(<Harness onSelected={vi.fn()} />);
    await user.type(box(), 'Dun');
    await screen.findByText(messages.uk['BOOK_AUTOCOMPLETE.error'] ?? '');
    fail = false;
    await user.type(box(), 'e');
    await screen.findByRole('option', { name: /Dune/ });
    expect(screen.queryByText(messages.uk['BOOK_AUTOCOMPLETE.error'] ?? '')).not.toBeInTheDocument();
  });
});

import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { mockSession } from '@/features/organizer/test-support';
import { API, clubJson, memberJson, pageOf, renderWithProviders, server, setupApiServer } from '@/test/harness';
import { OrganizerCard } from './sidebar';

setupApiServer();

const club = { id: 'c1', organizerId: 'owner' };

function setup(list: unknown[]) {
  const skips: string[] = [];
  mockSession({ id: 'u1' });
  server.use(
    http.get(`${API}/clubs/my`, () => HttpResponse.json([clubJson({ id: 'c1' })])),
    http.get(`${API}/clubs/c1/my-membership`, () => HttpResponse.json({ isMember: true, role: 'member', joinRequestStatus: 'none' })),
    http.get(`${API}/clubs/c1/members`, ({ request }) => {
      skips.push(new URL(request.url).searchParams.get('skip') ?? '');
      return pageOf(list, request);
    }),
  );
  renderWithProviders(<OrganizerCard club={club} />);
  return skips;
}

const filler = (count: number, from = 0) =>
  Array.from({ length: count }, (_, i) => memberJson({ userId: `m${from + i}`, displayName: `Member ${from + i}` }));
const owner = memberJson({ userId: 'owner', displayName: 'Olga Owner', role: 'organizer' });
const coOrganizer = memberJson({ userId: 'co', displayName: 'Co Organizer', role: 'organizer' });

describe('OrganizerCard', () => {
  it('fetches the next page when the organizer is not on the first one', async () => {
    const skips = setup([...filler(100), owner]);
    expect(await screen.findByText('Olga Owner')).toBeInTheDocument();
    expect(skips).toEqual(['0', '100']);
  });

  it('does not show a co-organizer from the first page as the organizer while more pages remain', async () => {
    const skips = setup([coOrganizer, ...filler(99), owner]);
    expect(await screen.findByText('Olga Owner')).toBeInTheDocument();
    expect(screen.queryByText('Co Organizer')).not.toBeInTheDocument();
    expect(skips).toEqual(['0', '100']);
  });

  it('falls back to an organizer-role member once every page is loaded without the owner', async () => {
    setup([coOrganizer, ...filler(5)]);
    expect(await screen.findByText('Co Organizer')).toBeInTheDocument();
  });

  it('stops after the last page when the organizer is absent', async () => {
    const skips = setup(filler(150));
    await waitFor(() => expect(skips).toEqual(['0', '100']));
    await new Promise((r) => setTimeout(r, 100));
    expect(skips).toEqual(['0', '100']);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('stops after three pages when the organizer is absent from a larger club', async () => {
    const skips = setup(filler(450));
    await waitFor(() => expect(skips).toEqual(['0', '100', '200']));
    await new Promise((r) => setTimeout(r, 100));
    expect(skips).toEqual(['0', '100', '200']);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });
});

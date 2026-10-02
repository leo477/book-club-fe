import { screen, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API, messages, renderWithProviders, server, setupApiServer } from '@/test/harness';
import EventMap from './event-map';

const maps = vi.hoisted(() => ({ fitBounds: vi.fn() }));
vi.mock('@vis.gl/react-google-maps', () => ({
  APIProvider: ({ apiKey, children }: { apiKey: string; children: ReactNode }) => <div data-testid="provider" data-key={apiKey}>{children}</div>,
  Map: ({ mapId, children }: { mapId: string; children: ReactNode }) => <div data-testid="map" data-map-id={mapId}>{children}</div>,
  AdvancedMarker: ({ position, title }: { position: { lat: number; lng: number }; title: string }) => <i data-testid="marker" data-title={title}>{`${position.lat},${position.lng}`}</i>,
  Polyline: ({ path }: { path: unknown[] }) => <b data-testid="polyline">{path.length}</b>,
  useMap: () => ({ fitBounds: maps.fitBounds }),
}));

setupApiServer();
beforeEach(() => maps.fitBounds.mockReset());

const t = (key: string) => messages.uk[key] ?? key;
const CENTER = { lat: 50.45, lng: 30.52 };
const props = { ...CENTER, address: 'Main st', afterMeetingVenue: null };

function mockKey(body: Record<string, unknown> | number = { mapsApiKey: 'KEY', mapsMapId: 'MID' }) {
  const hits = vi.fn();
  server.use(
    http.get(`${API}/config/maps-key`, () => {
      hits();
      return typeof body === 'number' ? new HttpResponse(null, { status: body }) : HttpResponse.json(body);
    }),
  );
  return hits;
}

describe('EventMap', () => {
  it('fetches the key only on mount, then renders the map, a marker and the maps link', async () => {
    const hits = mockKey();
    expect(hits).not.toHaveBeenCalled();
    renderWithProviders(<EventMap {...props} />);
    expect(await screen.findByTestId('map')).toHaveAttribute('data-map-id', 'MID');
    expect(screen.getByTestId('provider')).toHaveAttribute('data-key', 'KEY');
    expect(screen.getAllByTestId('marker')).toHaveLength(1);
    expect(screen.getByTestId('marker')).toHaveAttribute('data-title', 'Main st');
    expect(screen.getByRole('link', { name: t('EVENTS.open_in_maps') })).toHaveAttribute('href', 'https://www.google.com/maps?q=50.45,30.52');
    expect(hits).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('polyline')).not.toBeInTheDocument();
  });

  it('falls back to Google\'s demo map id when the backend has none', async () => {
    mockKey({ mapsApiKey: 'KEY', mapsMapId: '' });
    renderWithProviders(<EventMap {...props} />);
    expect(await screen.findByTestId('map')).toHaveAttribute('data-map-id', 'DEMO_MAP_ID');
  });

  it.each([[{ mapsApiKey: '', mapsMapId: '' }], [500]])('renders nothing without a usable key (%j)', async (body) => {
    const hits = mockKey(body);
    const { container } = renderWithProviders(<EventMap {...props} />);
    await waitFor(() => expect(hits).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 30));
    expect(container).toBeEmptyDOMElement();
  });

  it('draws the walking route to an after-meeting venue that has coordinates and fits the view', async () => {
    mockKey();
    const route = vi.fn(() => HttpResponse.json({ path: [CENTER, { lat: 50.46, lng: 30.53 }, { lat: 50.47, lng: 30.54 }] }));
    server.use(http.get(`${API}/routes/walking`, route));
    renderWithProviders(<EventMap {...props} afterMeetingVenue={{ name: 'Pub', address: 'Beer st', lat: 50.47, lng: 30.54 }} />);
    expect(await screen.findByTestId('polyline')).toHaveTextContent('3');
    expect(screen.getAllByTestId('marker')).toHaveLength(2);
    expect(route).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(maps.fitBounds).toHaveBeenCalledWith({ north: 50.47, south: 50.45, east: 30.54, west: 30.52 }, 60));
  });

  it('falls back to a straight line when the route has fewer than two points', async () => {
    mockKey();
    server.use(http.get(`${API}/routes/walking`, () => HttpResponse.json({ path: [] })));
    renderWithProviders(<EventMap {...props} afterMeetingVenue={{ name: 'Pub', address: 'Beer st', lat: 50.47, lng: 30.54 }} />);
    expect(await screen.findByTestId('polyline')).toHaveTextContent('2');
  });

  it('geocodes the venue address when it has no coordinates, resolving place details if needed', async () => {
    mockKey();
    const autocomplete = vi.fn(() => HttpResponse.json([{ label: 'Beer st', place_id: 'p1' }]));
    const details = vi.fn(() => HttpResponse.json({ label: 'Beer st', lat: 50.5, lng: 30.6 }));
    server.use(
      http.get(`${API}/geocode/autocomplete`, ({ request }) => {
        const q = new URL(request.url).searchParams;
        expect(q.get('q')).toBe('Beer st');
        expect(q.get('limit')).toBe('1');
        expect(q.get('lang')).toBe('uk');
        return autocomplete();
      }),
      http.get(`${API}/geocode/place-details`, details),
      http.get(`${API}/routes/walking`, () => HttpResponse.json({ path: [CENTER, { lat: 50.5, lng: 30.6 }] })),
    );
    renderWithProviders(<EventMap {...props} afterMeetingVenue={{ name: 'Pub', address: 'Beer st' }} />);
    await waitFor(() => expect(screen.getAllByTestId('marker')).toHaveLength(2));
    expect(screen.getAllByTestId('marker')[1]).toHaveTextContent('50.5,30.6');
    expect(autocomplete).toHaveBeenCalledTimes(1);
    expect(details).toHaveBeenCalledTimes(1);
  });

  it('keeps just the event marker when the venue address cannot be resolved', async () => {
    mockKey();
    const route = vi.fn();
    server.use(http.get(`${API}/geocode/autocomplete`, () => HttpResponse.json([])), http.get(`${API}/routes/walking`, route));
    renderWithProviders(<EventMap {...props} afterMeetingVenue={{ name: 'Pub', address: 'Nowhere' }} />);
    await screen.findByTestId('map');
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.getAllByTestId('marker')).toHaveLength(1);
    expect(route).not.toHaveBeenCalled();
    expect(maps.fitBounds).not.toHaveBeenCalled();
  });
});

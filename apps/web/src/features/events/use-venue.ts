'use client';

import { useQuery } from '@tanstack/react-query';
import type { AfterMeetingVenue } from '@book-club/contracts';
import { useLocale } from 'next-intl';
import { useState } from 'react';
import { api } from '@/lib/api';

export interface LatLng {
  lat: number;
  lng: number;
}

const noRefocus = { refetchOnWindowFocus: false, retry: false, staleTime: Infinity } as const;

/** The key and map id are fetched only when a map mounts; a failure or an empty key just means "no map". */
export function useMapsConfig() {
  return useQuery({
    queryKey: ['config', 'maps-key'],
    queryFn: async () => {
      const { mapsApiKey, mapsMapId } = await api.config.mapsKey({ suppressErrorToast: true });
      return mapsApiKey ? { apiKey: mapsApiKey, mapId: mapsMapId } : null;
    },
    ...noRefocus,
  });
}

const hasCoords = <T extends { lat?: number | null | undefined; lng?: number | null | undefined }>(v: T | null | undefined): v is T & LatLng => v?.lat != null && v.lng != null;

/** Coordinates of the after-meeting venue: its own, else the first geocoder suggestion for its address. */
export function useVenuePosition(venue: AfterMeetingVenue | null): LatLng | null {
  const locale = useLocale();
  const [sessionToken] = useState(() => crypto.randomUUID());
  const direct = hasCoords(venue) ? { lat: venue.lat, lng: venue.lng } : null;
  const address = venue?.address;
  const query = useQuery({
    queryKey: ['geocode', 'venue', address, locale],
    queryFn: async (): Promise<LatLng | null> => {
      const [first] = await api.geocode.autocomplete(address ?? '', sessionToken, locale, 1);
      if (!first) return null;
      const resolved = hasCoords(first) ? first : first.place_id ? await api.geocode.placeDetails(first.place_id, sessionToken, locale).catch(() => first) : first;
      return hasCoords(resolved) ? { lat: resolved.lat, lng: resolved.lng } : null;
    },
    enabled: !direct && !!address,
    ...noRefocus,
  });
  return direct ?? query.data ?? null;
}

/** Walking path between the two points; the backend returning fewer than two points falls back to a straight line. */
export function useWalkingRoute(origin: LatLng, dest: LatLng | null): LatLng[] | null {
  const query = useQuery({
    queryKey: ['route', 'walking', origin, dest],
    queryFn: async () => {
      const { path } = await api.geocode.walkingRoute(origin, dest as LatLng);
      return path.length > 1 ? path : [origin, dest as LatLng];
    },
    enabled: dest !== null,
    ...noRefocus,
  });
  return dest ? (query.data ?? null) : null;
}

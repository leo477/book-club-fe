'use client';

import type { AfterMeetingVenue } from '@book-club/contracts';
import { AdvancedMarker, APIProvider, Map, Polyline, useMap } from '@vis.gl/react-google-maps';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useMapsConfig, useVenuePosition, useWalkingRoute, type LatLng } from './use-venue';

// Google's documented placeholder id: advanced markers refuse to render on a map without one
const FALLBACK_MAP_ID = 'DEMO_MAP_ID';

function FitBounds({ points }: { points: readonly LatLng[] | null }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !points || points.length < 2) return;
    const lats = points.map((p) => p.lat);
    const lngs = points.map((p) => p.lng);
    map.fitBounds({ north: Math.max(...lats), south: Math.min(...lats), east: Math.max(...lngs), west: Math.min(...lngs) }, 60);
  }, [map, points]);
  return null;
}

interface Props {
  lat: number;
  lng: number;
  address: string | null;
  afterMeetingVenue: AfterMeetingVenue | null;
}

/** Loaded lazily by the event page; renders nothing until the Maps key arrives (and for good if there is none). */
export default function EventMap({ lat, lng, address, afterMeetingVenue }: Props) {
  const t = useTranslations('EVENTS');
  const config = useMapsConfig();
  const center: LatLng = { lat, lng };
  const venue = useVenuePosition(config.data ? afterMeetingVenue : null);
  const route = useWalkingRoute(center, venue);

  if (!config.data) return null;
  return (
    <div className="flex flex-col gap-3 mt-3">
      <APIProvider apiKey={config.data.apiKey} version="weekly">
        <Map
          defaultCenter={center}
          defaultZoom={15}
          mapId={config.data.mapId || FALLBACK_MAP_ID}
          clickableIcons={false}
          gestureHandling="cooperative"
          style={{ width: '100%', height: 300 }}
          className="rounded-xl overflow-hidden block"
        >
          <AdvancedMarker position={center} title={address ?? ''} />
          {venue && <AdvancedMarker position={venue} title={afterMeetingVenue?.name ?? ''} />}
          {route && <Polyline path={route} strokeColor="#4f46e5" strokeWeight={4} strokeOpacity={0.8} />}
          <FitBounds points={venue ? (route ?? [center, venue]) : null} />
        </Map>
      </APIProvider>
      <a
        href={`https://www.google.com/maps?q=${lat},${lng}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm text-accent-500 hover:underline self-start"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
        </svg>
        {t('open_in_maps')}
      </a>
    </div>
  );
}

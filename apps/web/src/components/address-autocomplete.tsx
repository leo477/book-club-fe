'use client';

import type { GeocodeSuggestion } from '@book-club/contracts';
import { useLocale } from 'next-intl';
import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { TypeaheadCombobox } from '@/components/typeahead-combobox';
import { api } from '@/lib/api';
import { geocodeSessionToken, resetGeocodeSession } from '@/lib/geocode-session';

const DEBOUNCE_MS = 300;
const MIN_LENGTH = 2;

interface Props {
  value: string;
  /** Typed text, and the chosen suggestion's label once one is picked. */
  onChange: (text: string) => void;
  /** The picked suggestion; one that came without coordinates is resolved through place details first (falling back to itself). */
  onSelected: (suggestion: GeocodeSuggestion) => void;
  label: string;
  placeholder?: string;
  invalid?: boolean;
  inputProps?: ComponentProps<typeof TypeaheadCombobox<GeocodeSuggestion>>['inputProps'];
}

export function AddressAutocomplete({ value, onChange, onSelected, label, placeholder, invalid, inputProps }: Props) {
  const lang = useLocale();
  const [resolving, setResolving] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const select = async (suggestion: GeocodeSuggestion) => {
    onChange(suggestion.label);
    if (suggestion.place_id && suggestion.lat == null) {
      setResolving(true);
      try {
        const resolved = await api.geocode.placeDetails(suggestion.place_id, geocodeSessionToken(), lang);
        resetGeocodeSession();
        if (mounted.current) onSelected(resolved);
      } catch {
        if (mounted.current) onSelected(suggestion);
      } finally {
        if (mounted.current) setResolving(false);
      }
      return;
    }
    resetGeocodeSession();
    onSelected(suggestion);
  };

  return (
    <TypeaheadCombobox<GeocodeSuggestion>
      value={value}
      onValueChange={onChange}
      onSelect={(suggestion) => void select(suggestion)}
      search={(query, signal) => api.geocode.autocomplete(query, geocodeSessionToken(), lang, 5, { signal })}
      getKey={(s) => s.place_id ?? s.label}
      renderItem={(s) => s.label}
      debounceMs={DEBOUNCE_MS}
      minLength={MIN_LENGTH}
      shortQuery="clear"
      dedupe
      label={label}
      busy={resolving}
      invalid={invalid ?? false}
      inputProps={{ ...(placeholder ? { placeholder } : {}), ...inputProps }}
    />
  );
}

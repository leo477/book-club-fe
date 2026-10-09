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
  /** Called for keystrokes only (not for the label written on select): the picked place no longer matches the text. */
  onTyped?: () => void;
  label: string;
  placeholder?: string;
  invalid?: boolean;
  inputProps?: ComponentProps<typeof TypeaheadCombobox<GeocodeSuggestion>>['inputProps'];
}

export function AddressAutocomplete({ value, onChange, onSelected, onTyped, label, placeholder, invalid, inputProps }: Props) {
  const lang = useLocale();
  const [resolving, setResolving] = useState(false);
  const mounted = useRef(true);
  const resolution = useRef<AbortController | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      resolution.current?.abort();
    };
  }, []);

  // typing while a place is being resolved supersedes it: its late answer must not overwrite what the user typed
  const type = (text: string) => {
    resolution.current?.abort();
    resolution.current = null;
    setResolving(false);
    onTyped?.();
    onChange(text);
  };

  const select = async (suggestion: GeocodeSuggestion) => {
    onChange(suggestion.label);
    if (suggestion.place_id && suggestion.lat == null) {
      resolution.current?.abort();
      const current = new AbortController();
      resolution.current = current;
      setResolving(true);
      let result = suggestion;
      try {
        result = await api.geocode.placeDetails(suggestion.place_id, geocodeSessionToken(), lang, { signal: current.signal });
        resetGeocodeSession();
      } catch {
        // falls back to the suggestion as picked
      }
      if (current.signal.aborted || !mounted.current) return;
      resolution.current = null;
      setResolving(false);
      onSelected(result);
      return;
    }
    resetGeocodeSession();
    onSelected(suggestion);
  };

  return (
    <TypeaheadCombobox<GeocodeSuggestion>
      value={value}
      onValueChange={type}
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

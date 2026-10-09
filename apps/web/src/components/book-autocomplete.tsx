'use client';

import type { BookSuggestion } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { TypeaheadCombobox } from '@/components/typeahead-combobox';
import { api } from '@/lib/api';
import { safeImageUrl } from '@/lib/safe-image-url';

const DEBOUNCE_MS = 600;
const MIN_LENGTH = 3;

interface Props {
  value: string;
  /** Typed text, and the chosen book's title once one is picked. */
  onChange: (text: string) => void;
  onSelected: (book: BookSuggestion) => void;
  label: string;
  placeholder?: string;
  /** Test seam: the 600 ms production debounce. */
  debounceMs?: number;
}

export function BookAutocomplete({ value, onChange, onSelected, label, placeholder, debounceMs = DEBOUNCE_MS }: Props) {
  const t = useTranslations('BOOK_AUTOCOMPLETE');
  const [failed, setFailed] = useState(false);

  return (
    <TypeaheadCombobox<BookSuggestion>
      value={value}
      onValueChange={onChange}
      onSelect={(book) => {
        setFailed(false);
        onChange(book.title);
        onSelected(book);
      }}
      search={(query, signal) => api.books.search(query, 5, { signal, suppressErrorToast: true, skipAuthRedirect: true })}
      getKey={(book) => book.id}
      renderItem={(book) => (
        <>
          {safeImageUrl(book.thumbnail ?? '') ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={safeImageUrl(book.thumbnail ?? '')} alt="" width={32} height={48} referrerPolicy="no-referrer" className="h-12 w-8 shrink-0 rounded object-cover shadow-sm" />
          ) : (
            <div aria-hidden="true" className="flex h-12 w-8 shrink-0 items-center justify-center rounded bg-muted text-lg">
              📚
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{book.title}</p>
            <p className="truncate text-xs text-muted-foreground">{book.authors.join(', ')}</p>
            {book.publishedDate ? <p className="text-xs text-muted-foreground opacity-70">{book.publishedDate.slice(0, 4)}</p> : null}
          </div>
        </>
      )}
      debounceMs={debounceMs}
      minLength={MIN_LENGTH}
      shortQuery="ignore"
      label={label}
      onFailedChange={setFailed}
      errorMessage={failed ? t('error') : null}
      inputProps={placeholder ? { placeholder } : {}}
    />
  );
}

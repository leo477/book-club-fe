import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of, shareReplay } from 'rxjs';

interface OpenLibraryResponse {
  docs: { cover_i?: number }[];
}

@Injectable({ providedIn: 'root' })
export class BookCoverService {
  private readonly http = inject(HttpClient);
  private readonly inflight = new Map<string, Observable<string | null>>();
  private readonly resolved = new Map<string, string | null>();

  fetchCover$(title: string): Observable<string | null> {
    const key = title.trim().toLowerCase();
    if (this.resolved.has(key)) {
      return of(this.resolved.get(key) ?? null);
    }
    const existing = this.inflight.get(key);
    if (existing) return existing;

    const params = `q=${encodeURIComponent(title)}&fields=cover_i&limit=1`;
    const request$ = this.http
      .get<OpenLibraryResponse>(`https://openlibrary.org/search.json?${params}`)
      .pipe(
        map(res => {
          const coverId = res.docs[0]?.cover_i;
          const url = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null;
          this.resolved.set(key, url);
          this.inflight.delete(key);
          return url;
        }),
        catchError(() => {
          this.inflight.delete(key);
          return of(null);
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
    this.inflight.set(key, request$);
    return request$;
  }
}

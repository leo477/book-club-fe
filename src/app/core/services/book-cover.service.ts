import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';

interface OpenLibraryResponse {
  docs: { cover_i?: number }[];
}

@Injectable({ providedIn: 'root' })
export class BookCoverService {
  private readonly http = inject(HttpClient);

  fetchCover(title: string): Observable<string | null> {
    const params = `q=${encodeURIComponent(title)}&fields=cover_i&limit=1`;
    return this.http
      .get<OpenLibraryResponse>(`https://openlibrary.org/search.json?${params}`)
      .pipe(
        map(res => {
          const coverId = res.docs[0]?.cover_i;
          return coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null;
        }),
        catchError(() => of(null)),
      );
  }
}

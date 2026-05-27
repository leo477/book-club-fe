import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BookSuggestion, BookDetails } from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class BookSearchService {
  private readonly http = inject(HttpClient);

  searchBooks(query: string, limit = 5): Observable<BookSuggestion[]> {
    return this.http.get<BookSuggestion[]>(
      `${environment.apiUrl}/books/search`,
      { params: { q: query, limit: limit.toString() } }
    );
  }

  getBookDetails(bookId: string): Observable<BookDetails> {
    return this.http.get<BookDetails>(`${environment.apiUrl}/books/details/${bookId}`);
  }
}

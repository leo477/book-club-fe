import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  computed,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../environments/environment';

interface StoreResult {
  name: string;
  url: string;
  found: boolean | null;
  product_url: string | null;
}

@Component({
  selector: 'app-book-stores',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule],
  template: `
    <section>
      <h3 class="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
        📚 {{ 'BOOK_STORES.title' | translate }}
      </h3>

      @if (bookTitle()) {
        @if (storesResource.isLoading()) {
          <div class="flex flex-wrap gap-2">
            @for (i of skeletons; track i) {
              <div class="h-9 w-28 rounded-xl bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
            }
          </div>
        } @else if (storesResource.error()) {
          <p class="text-sm text-gray-400 dark:text-gray-500">
            {{ 'BOOK_STORES.error' | translate }}
          </p>
        } @else if (stores().length > 0) {
          <div class="flex flex-wrap gap-2">
            @for (store of stores(); track store.name) {
              <a
                [href]="store.url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border transition-colors"
                [class]="store.found === true
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30'
                  : 'bg-gray-50 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'"
              >
                <span>{{ store.name }}</span>
                @if (store.found === true) {
                  <span class="text-xs rounded-full px-1.5 py-0.5 font-semibold bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200">
                    {{ 'BOOK_STORES.found' | translate }}
                  </span>
                } @else if (store.found === false) {
                  <span class="text-xs rounded-full px-1.5 py-0.5 font-semibold bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                    {{ 'BOOK_STORES.not_found' | translate }}
                  </span>
                }
              </a>
            }
          </div>
        }
      }
    </section>
  `,
})
export class BookStoresComponent {
  readonly bookTitle = input<string | null>(null);

  private readonly http = inject(HttpClient);

  readonly storesResource = rxResource<StoreResult[], string | null>({
    params: () => this.bookTitle(),
    stream: ({ params: title }) => {
      if (!title) return of([]);
      return this.http.get<StoreResult[]>(
        `${environment.apiUrl}/books/stores?title=${encodeURIComponent(title)}`,
      );
    },
  });

  readonly stores = computed(() => this.storesResource.value() ?? []);

  readonly skeletons = [1, 2, 3];
}

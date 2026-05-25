import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HlmButton } from '../../shared/spartan/button/src';

@Component({
  selector: 'app-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule, HlmButton],
  template: `
    <main class="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div class="text-center max-w-md">
        <p class="font-fantasy text-7xl font-bold text-[var(--color-primary-600)] mb-4" aria-hidden="true">404</p>
        <h1 class="font-display text-2xl font-semibold text-[var(--color-ink)] mb-3">
          {{ 'NOT_FOUND.title' | translate }}
        </h1>
        <p class="text-[var(--color-ink-muted)] mb-8">
          {{ 'NOT_FOUND.message' | translate }}
        </p>
        <a hlmBtn routerLink="/events">
          {{ 'NOT_FOUND.backHome' | translate }}
        </a>
      </div>
    </main>
  `,
})
export class NotFoundComponent {}

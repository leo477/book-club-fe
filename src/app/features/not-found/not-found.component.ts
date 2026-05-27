import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule],
  styles: [`
    @keyframes gentleFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-12px); }
    }
    .float-404 {
      animation: gentleFloat 4s ease-in-out infinite;
      display: inline-block;
    }
    @keyframes bookmarkBounce {
      0%, 100% { opacity: 0.04; transform: scaleX(1); }
      50% { opacity: 0.06; transform: scaleX(1.02); }
    }
    .shelf-bg {
      animation: bookmarkBounce 8s ease-in-out infinite;
    }
  `],
  template: `
    <main
      class="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden"
      style="background: linear-gradient(to bottom right, color-mix(in srgb, var(--color-primary-950, #3d1f00) 20%, transparent), var(--color-bg), color-mix(in srgb, var(--color-accent-950, #032b20) 10%, transparent))"
    >
      <!-- Decorative faint bookshelf pattern -->
      <div class="shelf-bg pointer-events-none select-none absolute inset-0 opacity-5"
           aria-hidden="true"
           style="
             background-image: repeating-linear-gradient(
               transparent 0px, transparent 48px,
               var(--color-sepia, rgba(139,90,43,0.25)) 48px, var(--color-sepia, rgba(139,90,43,0.25)) 50px
             ),
             repeating-linear-gradient(
               90deg,
               transparent 0px, transparent 14px,
               var(--color-sepia, rgba(139,90,43,0.25)) 14px, var(--color-sepia, rgba(139,90,43,0.25)) 16px
             );
             background-size: 16px 50px;
           ">
      </div>

      <div class="relative z-10 text-center max-w-lg">

        <!-- Decorative open book SVG -->
        <div class="flex justify-center mb-6 opacity-70" aria-hidden="true">
          <svg width="96" height="72" viewBox="0 0 96 72" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Left page -->
            <path d="M8 12 C8 12 12 8 24 8 C36 8 44 12 48 16 L48 64 C44 60 36 56 24 56 C12 56 8 60 8 60 Z"
                  fill="var(--color-surface-raised, #f5eed8)"
                  stroke="var(--color-primary-600, #b5720a)" stroke-width="1.5"/>
            <!-- Right page -->
            <path d="M88 12 C88 12 84 8 72 8 C60 8 52 12 48 16 L48 64 C52 60 60 56 72 56 C84 56 88 60 88 60 Z"
                  fill="var(--color-surface-raised, #f5eed8)"
                  stroke="var(--color-primary-600, #b5720a)" stroke-width="1.5"/>
            <!-- Spine -->
            <line x1="48" y1="16" x2="48" y2="64" stroke="var(--color-primary-700, #92400e)" stroke-width="2"/>
            <!-- Left page lines -->
            <line x1="18" y1="28" x2="42" y2="26" stroke="var(--color-ink-muted, #6b4c2a)" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
            <line x1="18" y1="35" x2="42" y2="33" stroke="var(--color-ink-muted, #6b4c2a)" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
            <line x1="18" y1="42" x2="38" y2="40" stroke="var(--color-ink-muted, #6b4c2a)" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
            <!-- Right page lines -->
            <line x1="78" y1="28" x2="54" y2="26" stroke="var(--color-ink-muted, #6b4c2a)" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
            <line x1="78" y1="35" x2="54" y2="33" stroke="var(--color-ink-muted, #6b4c2a)" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
            <line x1="78" y1="42" x2="58" y2="40" stroke="var(--color-ink-muted, #6b4c2a)" stroke-width="1" stroke-linecap="round" opacity="0.5"/>
          </svg>
        </div>

        <!-- 404 with float animation -->
        <p
          class="float-404 font-fantasy leading-none drop-shadow-lg text-[var(--color-primary-600)]"
          style="font-size: clamp(5rem, 20vw, 10rem)"
          aria-hidden="true"
        >404</p>

        <h1 class="heading-display text-2xl font-semibold text-[var(--color-ink)] mb-3 mt-2">
          {{ 'NOT_FOUND.title' | translate }}
        </h1>

        <p class="text-[var(--color-ink-muted)] mb-8">
          {{ 'NOT_FOUND.message' | translate }}
        </p>

        <a
          routerLink="/events"
          class="inline-flex items-center justify-center gap-2 bg-gradient-fantasy text-white rounded-full px-6 py-3 font-medium shadow-md hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:ring-offset-2"
        >
          {{ 'NOT_FOUND.backHome' | translate }}
        </a>
      </div>
    </main>
  `,
})
export class NotFoundComponent {}

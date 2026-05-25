import { Component, ChangeDetectionStrategy, signal, DestroyRef, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { HlmToasterImports } from './shared/spartan';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, ...HlmToasterImports, LoadingSpinnerComponent],
  templateUrl: './app.html',
})
export class App {
  readonly isNavigating = signal(false);

  constructor() {
    const router = inject(Router);
    const liveAnnouncer = inject(LiveAnnouncer);
    router.events.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(e => {
      if (e instanceof NavigationStart) this.isNavigating.set(true);
      if (e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError) {
        this.isNavigating.set(false);
        liveAnnouncer.clear();
      }
    });
  }
}

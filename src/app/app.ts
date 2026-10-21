import { Component, ChangeDetectionStrategy, signal, DestroyRef, inject, viewChild, effect } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { HlmToaster } from './shared/spartan/sonner/src';
import { ToastService } from './core/services/toast.service';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, HlmToaster, LoadingSpinnerComponent],
  templateUrl: './app.html',
})
export class App {
  readonly isNavigating = signal(false);
  // inside @defer: resolves once the toaster exists (its constructor has already cleared stale toasts)
  private readonly toaster = viewChild(HlmToaster);

  constructor() {
    const toast = inject(ToastService);
    effect(() => {
      if (this.toaster()) toast.markToasterReady();
    });
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

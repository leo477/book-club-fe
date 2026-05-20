import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  provideRouter,
} from '@angular/router';
import { Subject } from 'rxjs';
import { App } from './app';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
      ],
    })
      // Override LoadingSpinnerComponent with a no-op template to avoid
      // pulling in any rendering dependencies during unit tests.
      .overrideComponent(LoadingSpinnerComponent, {
        set: { template: '' },
      })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should contain a router outlet', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });

  it('isNavigating should start as false', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app.isNavigating()).toBeFalse();
  });

  describe('navigation spinner logic', () => {
    let events$: Subject<unknown>;
    let app: App;
    let fixture: ReturnType<typeof TestBed.createComponent<App>>;

    beforeEach(() => {
      events$ = new Subject<unknown>();

      // Replace Router.events with a controllable Subject BEFORE creating the component,
      // so the constructor subscription picks up our subject.
      const router = TestBed.inject(Router);
      Object.defineProperty(router, 'events', {
        get: () => events$,
        configurable: true,
      });

      fixture = TestBed.createComponent(App);
      app = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should set isNavigating to true on NavigationStart and show the spinner overlay', () => {
      events$.next(new NavigationStart(1, '/some-route'));
      fixture.detectChanges();

      expect(app.isNavigating()).toBeTrue();
      const overlay = (fixture.nativeElement as HTMLElement).querySelector('.fixed.inset-0');
      expect(overlay).not.toBeNull();
    });

    it('should set isNavigating to false on NavigationEnd and hide the spinner overlay', () => {
      events$.next(new NavigationStart(1, '/some-route'));
      fixture.detectChanges();
      expect(app.isNavigating()).toBeTrue();

      events$.next(new NavigationEnd(1, '/some-route', '/some-route'));
      fixture.detectChanges();

      expect(app.isNavigating()).toBeFalse();
      const overlay = (fixture.nativeElement as HTMLElement).querySelector('.fixed.inset-0');
      expect(overlay).toBeNull();
    });

    it('should set isNavigating to false on NavigationCancel', () => {
      events$.next(new NavigationStart(1, '/some-route'));
      fixture.detectChanges();
      expect(app.isNavigating()).toBeTrue();

      events$.next(new NavigationCancel(1, '/some-route', 'cancelled'));
      fixture.detectChanges();

      expect(app.isNavigating()).toBeFalse();
    });

    it('should set isNavigating to false on NavigationError', () => {
      events$.next(new NavigationStart(1, '/some-route'));
      fixture.detectChanges();
      expect(app.isNavigating()).toBeTrue();

      events$.next(new NavigationError(1, '/some-route', new Error('nav failed')));
      fixture.detectChanges();

      expect(app.isNavigating()).toBeFalse();
    });

    it('should not react to unrelated router events and leave isNavigating unchanged', () => {
      events$.next({ type: 99 });
      fixture.detectChanges();

      expect(app.isNavigating()).toBeFalse();
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Route, Router, Routes, UrlSegment, UrlTree } from '@angular/router';
import { stranglerHandoffGuard } from './strangler-handoff.guard';
import { routes as appRoutes } from '../../app.routes';
import { CLUBS_ROUTES } from '../../features/clubs/clubs.routes';
import { StranglerManifestService } from './strangler-manifest.service';

describe('stranglerHandoffGuard', () => {
  let enabled: boolean;
  let extractedUrl: UrlTree | undefined;
  let assign: ReturnType<typeof vi.fn>;

  // eslint-disable-next-line rxjs-x/finnish
  const run = () =>
    TestBed.runInInjectionContext(() => stranglerHandoffGuard({} as Route, [] as UrlSegment[], {} as never));

  beforeEach(() => {
    sessionStorage.clear();
    enabled = true;
    assign = vi.fn();
    vi.stubGlobal('location', { assign });
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: StranglerManifestService, useValue: { isEnabled: (p: string) => enabled && p === '/clubs' } },
      ],
    });
    const router = TestBed.inject(Router);
    extractedUrl = router.parseUrl('/clubs?q=a#top');
    vi.spyOn(router, 'currentNavigation').mockImplementation(
      () => (extractedUrl ? ({ extractedUrl } as never) : null),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('hands off enabled routes with query and fragment and returns a never-settling promise', () => {
    expect(run()).toBeInstanceOf(Promise);
    expect(assign).toHaveBeenCalledWith('/clubs?q=a#top');
  });

  it('stays in Angular when the route is not enabled', () => {
    enabled = false;
    expect(run()).toBe(true);
    expect(assign).not.toHaveBeenCalled();
  });

  it('stays in Angular when there is no current navigation', () => {
    extractedUrl = undefined;
    expect(run()).toBe(true);
    expect(assign).not.toHaveBeenCalled();
  });

  it('breaks loops: second handoff of the same path within 60s is allowed to stay', () => {
    expect(run()).toBeInstanceOf(Promise);
    expect(run()).toBe(true);
    expect(assign).toHaveBeenCalledTimes(1);
  });

  it('allows another handoff after the window elapses', () => {
    vi.useFakeTimers();
    try {
      expect(run()).toBeInstanceOf(Promise);
      vi.advanceTimersByTime(61_000);
      expect(run()).toBeInstanceOf(Promise);
      expect(assign).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('fails open when sessionStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied');
    });
    expect(run()).toBe(true);
    expect(assign).not.toHaveBeenCalled();
  });
});

describe('strangler guard wiring', () => {
  const guarded = (routes: Routes): string[] =>
    routes.filter((r) => r.canMatch?.includes(stranglerHandoffGuard)).map((r) => r.path ?? '');
  const walk = (routes: Routes): Routes => routes.flatMap((r) => [r, ...walk(r.children ?? [])]);

  it('is applied to exactly privacy, terms and the clubs list route', () => {
    expect(guarded(walk(appRoutes)).sort()).toEqual(['privacy', 'terms']);
    expect(guarded(CLUBS_ROUTES)).toEqual(['']);
  });
});

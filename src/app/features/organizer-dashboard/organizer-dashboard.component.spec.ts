import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OrganizerDashboardComponent } from './organizer-dashboard.component';
import { ClubService } from '../../core/services/club.service';
import { AuthService } from '../../core/auth/auth.service';
import { Club } from '../../core/models/club.model';

function makeClubService(ownedClubs: Club[] = []) {
  return {
    myOwnedClubs: signal(ownedClubs),
    loadPublicClubs: vi.fn().mockResolvedValue(undefined),
    loadMyClubs: vi.fn().mockResolvedValue(undefined),
  };
}

function makeAuthService() {
  return { currentUser: signal({ id: 'u1' }) };
}

describe('OrganizerDashboardComponent', () => {
  let clubSvc: ReturnType<typeof makeClubService>;
  let router: Router;

  async function setup(ownedClubs: Club[] = []) {
    clubSvc = makeClubService(ownedClubs);
    await TestBed.configureTestingModule({
      imports: [OrganizerDashboardComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: ClubService, useValue: clubSvc },
        { provide: AuthService, useValue: makeAuthService() },
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(OrganizerDashboardComponent);
    fixture.detectChanges();
    return { fixture };
  }

  it('loads public and my clubs on init', async () => {
    const { fixture } = await setup();
    await fixture.componentInstance.ngOnInit();
    expect(clubSvc.loadPublicClubs).toHaveBeenCalled();
    expect(clubSvc.loadMyClubs).toHaveBeenCalled();
    expect(fixture.componentInstance.isLoading()).toBe(false);
  });

  it('sets an error message when loading fails', async () => {
    const { fixture } = await setup();
    clubSvc.loadPublicClubs.mockRejectedValue(new Error('network error'));
    await fixture.componentInstance.ngOnInit();
    expect(fixture.componentInstance.error()).toBeTruthy();
    expect(fixture.componentInstance.isLoading()).toBe(false);
  });

  it('redirects to the manage page of the first owned club', async () => {
    const club = { id: 'club-1' } as Club;
    const { fixture } = await setup([club]);
    await fixture.whenStable();
    await fixture.whenStable();
    expect(router.navigate).toHaveBeenCalledWith(['/clubs', 'club-1', 'manage'], { replaceUrl: true });
    void fixture;
  });

  it('does not redirect when there are no owned clubs', async () => {
    const { fixture } = await setup([]);
    await fixture.whenStable();
    expect(router.navigate).not.toHaveBeenCalled();
    void fixture;
  });

  it('only redirects once even if the effect re-runs', async () => {
    const club = { id: 'club-1' } as Club;
    const { fixture } = await setup([club]);
    await fixture.whenStable();
    clubSvc.myOwnedClubs.set([club, { id: 'club-2' } as Club]);
    await fixture.whenStable();
    expect(router.navigate).toHaveBeenCalledTimes(1);
    void fixture;
  });
});

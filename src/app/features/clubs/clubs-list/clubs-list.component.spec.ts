import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ClubsListComponent } from './clubs-list.component';
import { ClubService } from '../../../core/services/club.service';
import { AuthService } from '../../../core/auth/auth.service';
import { SeoService } from '../../../core/services/seo.service';
import { Club } from '../../../core/models/club.model';

const mockClub: Club = {
  id: 'c1', name: 'Test Club', description: null, coverUrl: null,
  organizerId: 'u1', isPublic: true, memberCount: 5,
  createdAt: '2024-01-01', city: 'Kyiv', nextMeetingDate: null,
  address: null, lat: null, lng: null, theme: null, currentBook: null,
  memberPreviews: [], status: 'active', tags: [],
  meetingDurationMinutes: null, afterMeetingVenue: null,
};

function buildClubServiceMock() {
  return {
    loadPublicClubs: jasmine.createSpy().and.returnValue(Promise.resolve()),
    loadMyClubs: jasmine.createSpy().and.returnValue(Promise.resolve()),
    joinClub: jasmine.createSpy().and.returnValue(Promise.resolve()),
    clubs: jasmine.createSpy().and.returnValue([]),
    myClubs: jasmine.createSpy().and.returnValue([]),
    isLoading: jasmine.createSpy().and.returnValue(false),
    error: jasmine.createSpy().and.returnValue(null),
    filteredClubs: jasmine.createSpy().and.returnValue([]),
    myClubIds: jasmine.createSpy().and.returnValue(new Set()),
    myOwnedClubIds: jasmine.createSpy().and.returnValue(new Set()),
    availableCities: jasmine.createSpy().and.returnValue([]),
    searchQuery: jasmine.createSpy().and.returnValue(''),
    setSearchQuery: jasmine.createSpy(),
    setCityFilter: jasmine.createSpy(),
  };
}

describe('ClubsListComponent', () => {
  let fixture: ComponentFixture<ClubsListComponent>;
  let component: ClubsListComponent;
  let clubServiceMock: ReturnType<typeof buildClubServiceMock>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let seoSpy: jasmine.SpyObj<SeoService>;

  function setup(isAuthenticated = false) {
    clubServiceMock = buildClubServiceMock();
    authSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser: jasmine.createSpy().and.returnValue(null),
      isAuthenticated: jasmine.createSpy().and.returnValue(isAuthenticated),
      isOrganizer: jasmine.createSpy().and.returnValue(false),
      userRole: jasmine.createSpy().and.returnValue(null),
    });
    seoSpy = jasmine.createSpyObj('SeoService', ['setPageI18n', 'injectWebSiteJsonLd', 'setPage', 'injectJsonLd']);

    TestBed.configureTestingModule({
      imports: [ClubsListComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: ClubService, useValue: clubServiceMock },
        { provide: AuthService, useValue: authSpy },
        { provide: SeoService, useValue: seoSpy },
      ],
    });

    fixture = TestBed.createComponent(ClubsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe('initial state', () => {
    beforeEach(() => setup());

    it('creates component', () => {
      expect(component).toBeTruthy();
    });

    it('joiningClubId defaults to null', () => {
      expect(component.joiningClubId()).toBeNull();
    });
  });

  describe('ngOnInit', () => {
    it('calls loadPublicClubs on init', async () => {
      setup();
      await component.ngOnInit();
      expect(clubServiceMock.loadPublicClubs).toHaveBeenCalled();
    });

    it('calls setPageI18n for SEO on init', async () => {
      setup();
      await component.ngOnInit();
      expect(seoSpy.setPageI18n).toHaveBeenCalled();
    });

    it('calls loadMyClubs when authenticated', async () => {
      setup(true);
      await component.ngOnInit();
      expect(clubServiceMock.loadMyClubs).toHaveBeenCalled();
    });

    it('does not call loadMyClubs when not authenticated', async () => {
      setup(false);
      await component.ngOnInit();
      expect(clubServiceMock.loadMyClubs).not.toHaveBeenCalled();
    });
  });

  describe('onJoin', () => {
    beforeEach(() => setup(true));

    it('sets joiningClubId during join and clears after', async () => {
      let idDuringCall: unknown = null;
      clubServiceMock.joinClub.and.callFake(async (id: string) => {
        idDuringCall = component.joiningClubId();
        return id as unknown;
      });
      await component.onJoin(mockClub);
      expect(idDuringCall as string).toBe('c1');
      expect(component.joiningClubId()).toBeNull();
    });

    it('clears joiningClubId even when joinClub throws', async () => {
      clubServiceMock.joinClub.and.returnValue(Promise.reject(new Error('Network error')));
      await component.onJoin(mockClub);
      expect(component.joiningClubId()).toBeNull();
    });
  });
});

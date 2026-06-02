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
  meetingDurationMinutes: null, afterMeetingVenue: null, currentChampion: null,
};

function buildClubServiceMock() {
  return {
    loadPublicClubs: vi.fn().mockResolvedValue(undefined),
    loadMyClubs: vi.fn().mockResolvedValue(undefined),
    joinClub: vi.fn().mockResolvedValue(undefined),
    clubs: vi.fn().mockReturnValue([]),
    myClubs: vi.fn().mockReturnValue([]),
    isLoading: vi.fn().mockReturnValue(false),
    error: vi.fn().mockReturnValue(null),
    filteredClubs: vi.fn().mockReturnValue([]),
    myClubIds: vi.fn().mockReturnValue(new Set()),
    myOwnedClubIds: vi.fn().mockReturnValue(new Set()),
    availableCities: vi.fn().mockReturnValue([]),
    searchQuery: vi.fn().mockReturnValue(''),
    setSearchQuery: vi.fn(),
    setCityFilter: vi.fn(),
  };
}

describe('ClubsListComponent', () => {
  let fixture: ComponentFixture<ClubsListComponent>;
  let component: ClubsListComponent;
  let clubServiceMock: ReturnType<typeof buildClubServiceMock>;
  let authSpy: { currentUser: ReturnType<typeof vi.fn>; isAuthenticated: ReturnType<typeof vi.fn>; isOrganizer: ReturnType<typeof vi.fn>; userRole: ReturnType<typeof vi.fn> };
  let seoSpy: { setPageI18n: ReturnType<typeof vi.fn>; injectWebSiteJsonLd: ReturnType<typeof vi.fn>; setPage: ReturnType<typeof vi.fn>; injectJsonLd: ReturnType<typeof vi.fn> };

  function setup(isAuthenticated = false) {
    clubServiceMock = buildClubServiceMock();
    authSpy = {
      currentUser: vi.fn().mockReturnValue(null),
      isAuthenticated: vi.fn().mockReturnValue(isAuthenticated),
      isOrganizer: vi.fn().mockReturnValue(false),
      userRole: vi.fn().mockReturnValue(null),
    };
    seoSpy = { setPageI18n: vi.fn(), injectWebSiteJsonLd: vi.fn(), setPage: vi.fn(), injectJsonLd: vi.fn() };

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
      clubServiceMock.joinClub.mockImplementation(async (id: string) => {
        idDuringCall = component.joiningClubId();
        return id as unknown;
      });
      await component.onJoin(mockClub);
      expect(idDuringCall as string).toBe('c1');
      expect(component.joiningClubId()).toBeNull();
    });

    it('clears joiningClubId even when joinClub throws', async () => {
      clubServiceMock.joinClub.mockReturnValue(Promise.reject(new Error('Network error')));
      await component.onJoin(mockClub);
      expect(component.joiningClubId()).toBeNull();
    });
  });
});

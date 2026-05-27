import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ClubSidebarRightComponent } from './club-sidebar-right.component';
import { TranslateModule } from '@ngx-translate/core';
import { Club } from '../../../../core/models/club.model';

const mockClub: Club = {
  id: 'c1', name: 'Test Club', description: 'Desc', organizerId: 'u1',
  createdAt: '', coverUrl: null, isPublic: true, memberCount: 1,
  memberPreviews: [], city: 'Kyiv', nextMeetingDate: null, address: null, lat: null, lng: null,
  theme: null, currentBook: null, status: 'active', tags: [], meetingDurationMinutes: null,
  afterMeetingVenue: null, currentChampion: null,
} as Club;

describe('ClubSidebarRightComponent', () => {
  async function setup() {
    await TestBed.configureTestingModule({
      imports: [ClubSidebarRightComponent, TranslateModule.forRoot()],
      providers: [provideZonelessChangeDetection()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    const fixture = TestBed.createComponent(ClubSidebarRightComponent);
    fixture.componentRef.setInput('club', mockClub);
    return { fixture };
  }

  it('should create', async () => {
    const { fixture } = await setup();
    expect(fixture.componentInstance).toBeTruthy();
  });
});

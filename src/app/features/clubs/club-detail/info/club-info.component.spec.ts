import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ClubInfoComponent } from './club-info.component';
import { Club } from '../../../../core/models/club.model';

const mockClub: Club = {
  id: 'c1', name: 'Test Club', description: 'A great club', coverUrl: null,
  organizerId: 'u1', isPublic: true, memberCount: 10,
  createdAt: '2024-01-01', city: 'Kyiv', nextMeetingDate: null,
  address: null, lat: null, lng: null, theme: null, currentBook: null,
  memberPreviews: [], status: 'active', tags: [],
  meetingDurationMinutes: null, afterMeetingVenue: null,
};

describe('ClubInfoComponent', () => {
  let fixture: ComponentFixture<ClubInfoComponent>;
  let component: ClubInfoComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ClubInfoComponent, TranslateModule.forRoot()],
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(ClubInfoComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('club', mockClub);
    fixture.detectChanges();
  });

  it('creates component', () => {
    expect(component).toBeTruthy();
  });

  it('exposes club input', () => {
    expect(component.club().id).toBe('c1');
    expect(component.club().name).toBe('Test Club');
  });

  it('reflects club description', () => {
    expect(component.club().description).toBe('A great club');
  });
});

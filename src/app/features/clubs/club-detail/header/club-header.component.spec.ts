import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ClubHeaderComponent } from './club-header.component';
import { Club } from '../../../../core/models/club.model';

const mockClub: Club = {
  id: 'c1', name: 'Test Club', description: null, coverUrl: null,
  organizerId: 'u1', isPublic: true, memberCount: 10,
  createdAt: '2024-01-01', city: 'Kyiv', nextMeetingDate: null,
  address: null, lat: null, lng: null, theme: null, currentBook: null,
  memberPreviews: [], status: 'active', tags: [],
  meetingDurationMinutes: null, afterMeetingVenue: null, currentChampion: null,
};

describe('ClubHeaderComponent', () => {
  let fixture: ComponentFixture<ClubHeaderComponent>;
  let component: ClubHeaderComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ClubHeaderComponent, TranslateModule.forRoot()],
      providers: [provideZonelessChangeDetection()],
    });
    fixture = TestBed.createComponent(ClubHeaderComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('club', mockClub);
    fixture.componentRef.setInput('isMember', false);
    fixture.componentRef.setInput('isOwner', false);
    fixture.componentRef.setInput('isAuthenticated', false);
    fixture.componentRef.setInput('isActionLoading', false);
    fixture.detectChanges();
  });

  it('creates component', () => {
    expect(component).toBeTruthy();
  });

  it('exposes club input', () => {
    expect(component.club().id).toBe('c1');
    expect(component.club().name).toBe('Test Club');
  });

  it('isMember input is reflected', () => {
    expect(component.isMember()).toBe(false);
    fixture.componentRef.setInput('isMember', true);
    expect(component.isMember()).toBe(true);
  });

  it('isOwner input is reflected', () => {
    expect(component.isOwner()).toBe(false);
    fixture.componentRef.setInput('isOwner', true);
    expect(component.isOwner()).toBe(true);
  });

  it('isAuthenticated input is reflected', () => {
    expect(component.isAuthenticated()).toBe(false);
    fixture.componentRef.setInput('isAuthenticated', true);
    expect(component.isAuthenticated()).toBe(true);
  });

  it('isActionLoading input is reflected', () => {
    expect(component.isActionLoading()).toBe(false);
    fixture.componentRef.setInput('isActionLoading', true);
    expect(component.isActionLoading()).toBe(true);
  });

  it('leave output emits when triggered', () => {
    let emitted = false;
    component.leave.subscribe(() => { emitted = true; });
    component.leave.emit();
    expect(emitted).toBe(true);
  });
});

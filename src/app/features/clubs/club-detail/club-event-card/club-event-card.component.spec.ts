import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ClubEventCardComponent } from './club-event-card.component';
import { ClubEvent } from '../../../../core/models/event.model';

function makeEvent(overrides: Partial<ClubEvent> = {}): ClubEvent {
  return {
    id: 'e1', clubId: 'c1', clubName: 'Test Club', organizerId: 'u1',
    title: 'Test Event', description: null,
    date: '2025-06-01T10:00:00', city: 'Kyiv',
    address: null, lat: null, lng: null, status: 'scheduled',
    coverUrl: null, theme: null, tags: [],
    durationMinutes: null, afterMeetingVenue: null,
    attendeeCount: 5, isAttending: false, ...overrides,
  };
}

describe('ClubEventCardComponent', () => {
  let fixture: ComponentFixture<ClubEventCardComponent>;
  let component: ClubEventCardComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ClubEventCardComponent, TranslateModule.forRoot()],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });
    fixture = TestBed.createComponent(ClubEventCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('event', makeEvent());
    fixture.detectChanges();
  });

  it('creates component', () => {
    expect(component).toBeTruthy();
  });

  it('exposes event input', () => {
    expect(component.event().id).toBe('e1');
    expect(component.event().title).toBe('Test Event');
  });

  it('isAuthenticated defaults to false', () => {
    expect(component.isAuthenticated()).toBeFalse();
  });

  it('attending defaults to false', () => {
    expect(component.attending()).toBeFalse();
  });

  it('index defaults to 0', () => {
    expect(component.index()).toBe(0);
  });

  it('attend output emits when triggered', () => {
    let emitted = false;
    component.attend.subscribe(() => { emitted = true; });
    component.attend.emit();
    expect(emitted).toBeTrue();
  });

  it('cancelAttend output emits when triggered', () => {
    let emitted = false;
    component.cancelAttend.subscribe(() => { emitted = true; });
    component.cancelAttend.emit();
    expect(emitted).toBeTrue();
  });

  it('reflects isAuthenticated input', () => {
    fixture.componentRef.setInput('isAuthenticated', true);
    expect(component.isAuthenticated()).toBeTrue();
  });

  it('reflects attending input', () => {
    fixture.componentRef.setInput('attending', true);
    expect(component.attending()).toBeTrue();
  });

  it('reflects index input', () => {
    fixture.componentRef.setInput('index', 3);
    expect(component.index()).toBe(3);
  });
});

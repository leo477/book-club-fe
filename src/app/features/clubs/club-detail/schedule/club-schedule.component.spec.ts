import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ClubScheduleComponent } from './club-schedule.component';
import { Club } from '../../../../core/models/club.model';

const mockClub: Club = {
  id: 'c1', name: 'Test', description: null, coverUrl: null,
  organizerId: 'u1', isPublic: true, memberCount: 1, createdAt: '2024-01-01',
  city: 'Kyiv', nextMeetingDate: null, address: null, lat: null, lng: null,
  theme: null, currentBook: null, memberPreviews: [], status: 'active',
  tags: [], meetingDurationMinutes: null, afterMeetingVenue: null,
};

describe('ClubScheduleComponent', () => {
  let component: ClubScheduleComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ClubScheduleComponent, TranslateModule.forRoot()],
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(ClubScheduleComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('club', mockClub);
    fixture.componentRef.setInput('isOwner', true);
  });

  describe('submitReschedule', () => {
    it('does nothing when date is empty', () => {
      let emitted = false;
      component.reschedule.subscribe(() => (emitted = true));
      component.rescheduleDate.setValue('');
      component.submitReschedule();
      expect(emitted).toBeFalse();
    });

    it('emits date and resets form when date is set', () => {
      let emittedDate: string | undefined;
      component.reschedule.subscribe(d => (emittedDate = d));
      component.rescheduleDate.setValue('2025-06-01');
      component.submitReschedule();
      expect(emittedDate).toBe('2025-06-01');
      expect(component.rescheduleDate.value).toBe('');
    });
  });
});

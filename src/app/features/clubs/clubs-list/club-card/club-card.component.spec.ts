import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ClubCardComponent } from './club-card.component';
import { Club } from '../../../../core/models/club.model';

const mockClub: Club = {
  id: 'c1',
  name: 'Test Club',
  description: 'A test club',
  coverUrl: null,
  organizerId: 'u1',
  isPublic: true,
  memberCount: 5,
  createdAt: '2024-01-01',
  city: 'Kyiv',
  nextMeetingDate: null,
  address: null,
  lat: null,
  lng: null,
  theme: null,
  currentBook: null,
  memberPreviews: [],
  status: 'active',
  tags: [],
  meetingDurationMinutes: null,
  afterMeetingVenue: null,
};

describe('ClubCardComponent', () => {
  let component: ClubCardComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ClubCardComponent, TranslateModule.forRoot()],
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });
    const fixture = TestBed.createComponent(ClubCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('club', mockClub);
    fixture.componentRef.setInput('isMember', false);
  });

  describe('daysUntil', () => {
    it('returns positive days for a future date', () => {
      const future = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
      const days = (component as unknown as { daysUntil: (d: string) => number }).daysUntil(future);
      expect(days).toBeGreaterThan(0);
      expect(days).toBeLessThanOrEqual(6);
    });

    it('returns 1 for tomorrow', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const days = (component as unknown as { daysUntil: (d: string) => number }).daysUntil(tomorrow);
      expect(days).toBe(1);
    });

    it('returns negative days for a past date', () => {
      const past = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
      const days = (component as unknown as { daysUntil: (d: string) => number }).daysUntil(past);
      expect(days).toBeLessThan(0);
    });
  });
});

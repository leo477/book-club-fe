import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection, NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { EditEventComponent } from './edit-event.component';
import { EventService } from '../../../core/services/event.service';
import { QuizService } from '../../../core/services/quiz.service';
import { AuthService } from '../../../core/auth/auth.service';
import { makeClubEvent } from '../../../../testing/event-test.helpers';

describe('EditEventComponent', () => {
  let fixture: ComponentFixture<EditEventComponent>;
  let component: EditEventComponent;
  let eventServiceSpy: { eventById$: ReturnType<typeof vi.fn>; updateEvent: ReturnType<typeof vi.fn> };
  let quizServiceSpy: { getClubQuizzes: ReturnType<typeof vi.fn> };
  let authSpy: { currentUser: ReturnType<typeof vi.fn> };
  let navigateSpy: ReturnType<typeof vi.fn>;

  async function setup(event = makeClubEvent({ organizerId: 'u1' })) {
    eventServiceSpy = {
      eventById$: vi.fn().mockReturnValue(of(event)),
      updateEvent: vi.fn().mockResolvedValue(event),
    };
    quizServiceSpy = { getClubQuizzes: vi.fn().mockResolvedValue([]) };
    authSpy = { currentUser: vi.fn().mockReturnValue({ id: 'u1' }) };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [EditEventComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: EventService, useValue: eventServiceSpy },
        { provide: QuizService, useValue: quizServiceSpy },
        { provide: AuthService, useValue: authSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    navigateSpy = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(EditEventComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', event.id);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('patches the date control with local time components, not UTC', async () => {
    const utcDate = new Date('2025-06-01T10:00:00Z');
    await setup(makeClubEvent({ date: utcDate.toISOString() }));

    const pad = (n: number) => String(n).padStart(2, '0');
    const expected = `${utcDate.getFullYear()}-${pad(utcDate.getMonth() + 1)}-${pad(utcDate.getDate())}T${pad(utcDate.getHours())}:${pad(utcDate.getMinutes())}`;

    expect(component.form.controls.date.value).toBe(expected);
  });

  it('round-trips the patched date back to the original instant on submit', async () => {
    const original = makeClubEvent({ date: new Date('2025-06-01T10:00:00Z').toISOString() });
    await setup(original);

    await component.onSubmit();

    expect(eventServiceSpy.updateEvent).toHaveBeenCalledWith(
      original.id,
      expect.objectContaining({ date: original.date }),
    );
  });

  it('redirects away when the current user is not the organizer', async () => {
    await setup(makeClubEvent({ organizerId: 'someone-else' }));

    expect(navigateSpy).toHaveBeenCalledWith(['/events']);
  });
});

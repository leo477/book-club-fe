import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { EventDetailComponent } from './event-detail.component';
import { EventService } from '../../../core/services/event.service';
import { AuthService } from '../../../core/auth/auth.service';
import { ChatService } from '../../../core/services/chat.service';
import { environment } from '../../../../environments/environment';
import { makeApiEvent } from '../../../../testing/event-test.helpers';

describe('EventDetailComponent', () => {
  let fixture: ComponentFixture<EventDetailComponent>;
  let component: EventDetailComponent;
  let eventServiceSpy: jasmine.SpyObj<EventService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let chatServiceSpy: jasmine.SpyObj<ChatService>;
  let httpMock: HttpTestingController;

  const eventUrl = `${environment.apiUrl}/events/e1`;

  function setup(currentUser: { id: string } | null = null) {
    eventServiceSpy = jasmine.createSpyObj('EventService', [
      'attendEvent', 'cancelAttendance', 'cancelEvent',
    ]);
    eventServiceSpy.attendEvent.and.returnValue(Promise.resolve({ auto_joined: false }));
    eventServiceSpy.cancelAttendance.and.returnValue(Promise.resolve());
    eventServiceSpy.cancelEvent.and.returnValue(Promise.resolve());

    chatServiceSpy = jasmine.createSpyObj('ChatService', ['getEventRoom', 'createEventChatRoom', 'openAndFocusRoom']);
    chatServiceSpy.getEventRoom.and.returnValue(Promise.resolve(null));

    authSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser: jasmine.createSpy().and.returnValue(currentUser),
      isAuthenticated: jasmine.createSpy().and.returnValue(currentUser !== null),
    });

    TestBed.configureTestingModule({
      imports: [EventDetailComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: EventService, useValue: eventServiceSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: ChatService, useValue: chatServiceSpy },
      ],
    });

    fixture = TestBed.createComponent(EventDetailComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.componentRef.setInput('id', 'e1');
    fixture.detectChanges();
  }

  afterEach(() => {
    httpMock.verify();
  });

  describe('effect — load event on id change', () => {
    it('calls getEventById with the provided id', async () => {
      setup();
      httpMock.expectOne(eventUrl).flush(makeApiEvent());
      await fixture.whenStable();
      expect(component.event()?.id).toBe('e1');
    });

    it('sets event signal after successful load', async () => {
      setup();
      httpMock.expectOne(eventUrl).flush(makeApiEvent());
      await fixture.whenStable();
      expect(component.event()?.id).toBe('e1');
    });

    it('sets isLoading to false after load', async () => {
      setup();
      httpMock.expectOne(eventUrl).flush(makeApiEvent());
      await fixture.whenStable();
      expect(component.isLoading()).toBeFalse();
    });

    it('sets errorMessage when event is not found', async () => {
      setup(null);
      httpMock.expectOne(eventUrl).flush(
        { detail: 'Not Found' },
        { status: 404, statusText: 'Not Found' },
      );
      await fixture.whenStable();
      expect(component.errorMessage()).toBe('EVENT.LOAD_ERROR');
    });
  });

  describe('isOrganizer', () => {
    it('returns true when currentUser id matches organizerId', async () => {
      setup({ id: 'u1' });
      httpMock.expectOne(eventUrl).flush(makeApiEvent());
      await fixture.whenStable();
      expect(component.isOrganizer()).toBeTrue();
    });

    it('returns false when currentUser id does not match organizerId', async () => {
      setup({ id: 'other-user' });
      httpMock.expectOne(eventUrl).flush(makeApiEvent());
      await fixture.whenStable();
      expect(component.isOrganizer()).toBeFalse();
    });

    it('returns false when not authenticated', async () => {
      setup(null);
      httpMock.expectOne(eventUrl).flush(makeApiEvent());
      await fixture.whenStable();
      expect(component.isOrganizer()).toBeFalse();
    });
  });

  describe('onAttend', () => {
    it('calls attendEvent and reloads the resource', async () => {
      setup();
      httpMock.expectOne(eventUrl).flush(makeApiEvent());
      await fixture.whenStable();

      await component.onAttend();
      expect(eventServiceSpy.attendEvent).toHaveBeenCalledWith('e1');
      fixture.detectChanges();
      httpMock.expectOne(eventUrl).flush(makeApiEvent());
      await fixture.whenStable();
    });

    it('sets isActioning to false after completion', async () => {
      setup();
      httpMock.expectOne(eventUrl).flush(makeApiEvent());
      await fixture.whenStable();

      await component.onAttend();
      fixture.detectChanges();
      httpMock.expectOne(eventUrl).flush(makeApiEvent());
      expect(component.isActioning()).toBeFalse();
    });
  });

  describe('onCancelAttend', () => {
    it('calls cancelAttendance and reloads the resource', async () => {
      setup();
      httpMock.expectOne(eventUrl).flush(makeApiEvent());
      await fixture.whenStable();

      await component.onCancelAttend();
      expect(eventServiceSpy.cancelAttendance).toHaveBeenCalledWith('e1');
      fixture.detectChanges();
      httpMock.expectOne(eventUrl).flush(makeApiEvent());
      await fixture.whenStable();
    });

    it('sets isActioning to false after completion', async () => {
      setup();
      httpMock.expectOne(eventUrl).flush(makeApiEvent());
      await fixture.whenStable();

      await component.onCancelAttend();
      fixture.detectChanges();
      httpMock.expectOne(eventUrl).flush(makeApiEvent());
      expect(component.isActioning()).toBeFalse();
    });
  });

  describe('onCancelEvent', () => {
    it('does nothing when confirm returns false', async () => {
      setup({ id: 'u1' });
      httpMock.expectOne(eventUrl).flush(makeApiEvent());
      await fixture.whenStable();
      spyOn(window, 'confirm').and.returnValue(false);

      await component.onCancelEvent();

      expect(eventServiceSpy.cancelEvent).not.toHaveBeenCalled();
    });

    it('calls cancelEvent and reloads the resource when confirmed', async () => {
      setup({ id: 'u1' });
      httpMock.expectOne(eventUrl).flush(makeApiEvent());
      await fixture.whenStable();
      spyOn(window, 'confirm').and.returnValue(true);

      await component.onCancelEvent();
      expect(eventServiceSpy.cancelEvent).toHaveBeenCalledWith('e1');
      fixture.detectChanges();
      httpMock.expectOne(eventUrl).flush(makeApiEvent());
      await fixture.whenStable();
    });

    it('sets isActioning to false after confirmed cancel', async () => {
      setup({ id: 'u1' });
      httpMock.expectOne(eventUrl).flush(makeApiEvent());
      await fixture.whenStable();
      spyOn(window, 'confirm').and.returnValue(true);

      await component.onCancelEvent();
      fixture.detectChanges();
      httpMock.expectOne(eventUrl).flush(makeApiEvent());
      expect(component.isActioning()).toBeFalse();
    });
  });
});

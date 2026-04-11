import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { CreateClubComponent } from './create-club.component';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ClubService } from '../../../core/services/club.service';
import { AuthService } from '../../../core/auth/auth.service';

describe('CreateClubComponent', () => {
  let component: CreateClubComponent;
  let routerSpy: jasmine.SpyObj<Router>;
  let clubServiceSpy: jasmine.SpyObj<ClubService>;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    clubServiceSpy = jasmine.createSpyObj('ClubService', ['createClub']);
    authSpy = jasmine.createSpyObj('AuthService', [], { currentUser: jasmine.createSpy().and.returnValue(null) });
    TestBed.configureTestingModule({
      imports: [CreateClubComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: routerSpy },
        { provide: ClubService, useValue: clubServiceSpy },
        { provide: AuthService, useValue: authSpy },
      ]
    });
    const fixture = TestBed.createComponent(CreateClubComponent);
    component = fixture.componentInstance;
  });

  it('initial state: form invalid, showAfterMeeting false, isSubmitting false', () => {
    expect(component.form.valid).toBeFalse();
    expect(component.showAfterMeeting()).toBeFalse();
    expect(component.isSubmitting()).toBeFalse();
  });

  it('togglePublic toggles isPublic', () => {
    expect(component.form.controls.isPublic.value).toBeTrue();
    component.togglePublic();
    expect(component.form.controls.isPublic.value).toBeFalse();
    component.togglePublic();
    expect(component.form.controls.isPublic.value).toBeTrue();
  });

  it('toggleAfterMeeting toggles showAfterMeeting', () => {
    expect(component.showAfterMeeting()).toBeFalse();
    component.toggleAfterMeeting();
    expect(component.showAfterMeeting()).toBeTrue();
    component.toggleAfterMeeting();
    expect(component.showAfterMeeting()).toBeFalse();
  });

  it('cancel navigates to /clubs', () => {
    component.cancel();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/clubs']);
  });

  it('onSubmit with invalid form marks all as touched and does not call createClub', async () => {
    spyOn(component.form, 'markAllAsTouched');
    await component.onSubmit();
    expect(component.form.markAllAsTouched).toHaveBeenCalled();
    expect(clubServiceSpy.createClub).not.toHaveBeenCalled();
  });

  it('onSubmit with valid form calls createClub and navigates', async () => {
    component.form.controls.name.setValue('Test Club');
    component.form.controls.city.setValue('Kyiv');
    component.form.controls.isPublic.setValue(true);
    clubServiceSpy.createClub.and.returnValue(Promise.resolve({
      id: 'club-99',
      name: 'Test Club',
      description: null,
      coverUrl: null,
      organizerId: 'user-1',
      isPublic: true,
      memberCount: 1,
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
      afterMeetingVenue: null
    }));
    await component.onSubmit();
    expect(clubServiceSpy.createClub).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/clubs', 'club-99']);
  });

  it('onSubmit sets errorMessage if createClub throws', async () => {
    component.form.controls.name.setValue('Test Club');
    component.form.controls.city.setValue('Kyiv');
    component.form.controls.isPublic.setValue(true);
    clubServiceSpy.createClub.and.returnValue(Promise.reject(new Error('fail')));
    await component.onSubmit();
    expect(component.errorMessage()).toBe('fail');
    expect(component.isSubmitting()).toBeFalse();
  });
});
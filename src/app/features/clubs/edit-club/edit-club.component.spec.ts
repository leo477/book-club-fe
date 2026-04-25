import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { EditClubComponent } from './edit-club.component';
import { ClubService } from '../../../core/services/club.service';
import { ToastService } from '../../../core/services/toast.service';
import { Club } from '../../../core/models/club.model';

const mockClub: Club = {
  id: 'c1', name: 'Test Club', description: 'A great club', coverUrl: null,
  organizerId: 'u1', isPublic: true, memberCount: 5,
  createdAt: '2024-01-01', city: 'Kyiv', nextMeetingDate: null,
  address: null, lat: null, lng: null, theme: null, currentBook: null,
  memberPreviews: [], status: 'active', tags: [],
  meetingDurationMinutes: null, afterMeetingVenue: null,
};

describe('EditClubComponent', () => {
  let fixture: ComponentFixture<EditClubComponent>;
  let component: EditClubComponent;
  let clubServiceSpy: jasmine.SpyObj<ClubService>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let router: Router;

  beforeEach(() => {
    clubServiceSpy = jasmine.createSpyObj('ClubService', ['getClubById', 'updateClub']);
    clubServiceSpy.getClubById.and.returnValue(Promise.resolve(mockClub));
    const mockClubUpdated: Club = { ...mockClub, name: 'Updated Club' };
    clubServiceSpy.updateClub.and.returnValue(Promise.resolve(mockClubUpdated));

    toastSpy = jasmine.createSpyObj('ToastService', ['show']);

    TestBed.configureTestingModule({
      imports: [EditClubComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: ClubService, useValue: clubServiceSpy },
        { provide: ToastService, useValue: toastSpy },
      ],
    });

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(EditClubComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'c1');
    fixture.detectChanges();
  });

  describe('ngOnInit', () => {
    it('loads club and patches form values', async () => {
      await component.ngOnInit();
      expect(component.form.controls.name.value).toBe('Test Club');
      expect(component.form.controls.description.value).toBe('A great club');
      expect(component.form.controls.city.value).toBe('Kyiv');
    });

    it('sets isLoadingClub to false after load', async () => {
      await component.ngOnInit();
      expect(component.isLoadingClub()).toBeFalse();
    });

    it('sets errorMessage when club not found', async () => {
      clubServiceSpy.getClubById.and.returnValue(Promise.resolve(null));
      await component.ngOnInit();
      expect(component.errorMessage()).toBe('Club not found.');
      expect(component.isLoadingClub()).toBeFalse();
    });
  });

  describe('togglePublic', () => {
    it('toggles isPublic from true to false', async () => {
      await component.ngOnInit();
      expect(component.form.controls.isPublic.value).toBeTrue();
      component.togglePublic();
      expect(component.form.controls.isPublic.value).toBeFalse();
    });

    it('toggles isPublic back to true', async () => {
      await component.ngOnInit();
      component.togglePublic();
      component.togglePublic();
      expect(component.form.controls.isPublic.value).toBeTrue();
    });
  });

  describe('cancel', () => {
    it('navigates to club detail page', () => {
      component.cancel();
      expect(router.navigate).toHaveBeenCalledWith(['/clubs', 'c1']);
    });
  });

  describe('onSubmit', () => {
    beforeEach(async () => {
      await component.ngOnInit();
    });

    it('marks all touched and does not call updateClub when form is invalid', async () => {
      component.form.controls.name.setValue('');
      spyOn(component.form, 'markAllAsTouched');
      await component.onSubmit();
      expect(component.form.markAllAsTouched).toHaveBeenCalled();
      expect(clubServiceSpy.updateClub).not.toHaveBeenCalled();
    });

    it('calls updateClub with form values when form is valid', async () => {
      await component.onSubmit();
      expect(clubServiceSpy.updateClub).toHaveBeenCalledWith('c1', jasmine.objectContaining({
        name: 'Test Club',
      }));
    });

    it('shows toast and navigates on success', async () => {
      await component.onSubmit();
      expect(toastSpy.show).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/clubs', 'c1']);
    });

    it('sets errorMessage on updateClub failure', async () => {
      clubServiceSpy.updateClub.and.returnValue(Promise.reject(new Error('Server error')) as Promise<Club>);
      await component.onSubmit();
      expect(component.errorMessage()).toBe('Server error');
    });

    it('resets isSubmitting to false after completion', async () => {
      await component.onSubmit();
      expect(component.isSubmitting()).toBeFalse();
    });

    it('resets isSubmitting to false even on error', async () => {
      clubServiceSpy.updateClub.and.returnValue(Promise.reject(new Error('error')) as Promise<Club>);
      await component.onSubmit();
      expect(component.isSubmitting()).toBeFalse();
    });
  });
});

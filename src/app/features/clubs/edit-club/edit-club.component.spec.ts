import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { toast } from '@spartan-ng/brain/sonner';
import { EditClubComponent } from './edit-club.component';
import { ClubService } from '../../../core/services/club.service';
import { Club } from '../../../core/models/club.model';

const mockClub: Club = {
  id: 'c1', name: 'Test Club', description: 'A great club', coverUrl: null,
  organizerId: 'u1', isPublic: true, memberCount: 5,
  createdAt: '2024-01-01', city: 'Kyiv', nextMeetingDate: null,
  address: null, lat: null, lng: null, theme: null, currentBook: null,
  memberPreviews: [], status: 'active', tags: [],
  meetingDurationMinutes: null, afterMeetingVenue: null, currentChampion: null,
};

describe('EditClubComponent', () => {
  let fixture: ComponentFixture<EditClubComponent>;
  let component: EditClubComponent;
  let clubServiceSpy: { getClubById: ReturnType<typeof vi.fn>; updateClub: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(() => {
    const mockClubUpdated: Club = { ...mockClub, name: 'Updated Club' };
    clubServiceSpy = {
      getClubById: vi.fn().mockResolvedValue(mockClub),
      updateClub: vi.fn().mockResolvedValue(mockClubUpdated),
    };

    TestBed.configureTestingModule({
      imports: [EditClubComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: ClubService, useValue: clubServiceSpy },
      ],
    });

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

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
      expect(component.isLoadingClub()).toBe(false);
    });

    it('sets errorMessage when club not found', async () => {
      clubServiceSpy.getClubById.mockResolvedValue(null);
      await component.ngOnInit();
      expect(component.errorMessage()).toBe('Club not found.');
      expect(component.isLoadingClub()).toBe(false);
    });
  });

  describe('togglePublic', () => {
    it('toggles isPublic from true to false', async () => {
      await component.ngOnInit();
      expect(component.form.controls.isPublic.value).toBe(true);
      component.togglePublic();
      expect(component.form.controls.isPublic.value).toBe(false);
    });

    it('toggles isPublic back to true', async () => {
      await component.ngOnInit();
      component.togglePublic();
      component.togglePublic();
      expect(component.form.controls.isPublic.value).toBe(true);
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
      vi.spyOn(component.form, 'markAllAsTouched');
      await component.onSubmit();
      expect(component.form.markAllAsTouched).toHaveBeenCalled();
      expect(clubServiceSpy.updateClub).not.toHaveBeenCalled();
    });

    it('calls updateClub with form values when form is valid', async () => {
      await component.onSubmit();
      expect(clubServiceSpy.updateClub).toHaveBeenCalledWith('c1', expect.objectContaining({
        name: 'Test Club',
      }));
    });

    it('shows toast and navigates on success', async () => {
      vi.spyOn(toast, 'success').mockImplementation(() => '');
      await component.onSubmit();
      expect(toast.success).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/clubs', 'c1']);
    });

    it('sets errorMessage on updateClub failure', async () => {
      clubServiceSpy.updateClub.mockRejectedValue(new Error('Server error'));
      await component.onSubmit();
      expect(component.errorMessage()).toBe('Server error');
    });

    it('resets isSubmitting to false after completion', async () => {
      await component.onSubmit();
      expect(component.isSubmitting()).toBe(false);
    });

    it('resets isSubmitting to false even on error', async () => {
      clubServiceSpy.updateClub.mockRejectedValue(new Error('error'));
      await component.onSubmit();
      expect(component.isSubmitting()).toBe(false);
    });
  });
});

import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ClubCreateFormComponent } from './club-create-form.component';
import { ClubService } from '../../../core/services/club.service';
import { Club } from '../../../core/models/club.model';

describe('ClubCreateFormComponent', () => {
  let clubServiceSpy: { createClub: ReturnType<typeof vi.fn> };
  let router: Router;
  let component: ClubCreateFormComponent;

  beforeEach(async () => {
    clubServiceSpy = { createClub: vi.fn().mockResolvedValue({ id: 'club-1' } as Club) };
    await TestBed.configureTestingModule({
      imports: [ClubCreateFormComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: ClubService, useValue: clubServiceSpy },
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(ClubCreateFormComponent);
    component = fixture.componentInstance;
  });

  it('marks all fields touched and does not submit when the form is invalid', async () => {
    vi.spyOn(component.form, 'markAllAsTouched');
    await component.onSubmit();
    expect(component.form.markAllAsTouched).toHaveBeenCalled();
    expect(clubServiceSpy.createClub).not.toHaveBeenCalled();
  });

  it('creates the club, emits created, and navigates to the new club', async () => {
    const emitSpy = vi.fn();
    component.created.subscribe(emitSpy);
    component.form.setValue({ name: 'Readers United', description: 'A club', city: 'Kyiv', isPublic: true });

    await component.onSubmit();

    expect(clubServiceSpy.createClub).toHaveBeenCalledWith({
      name: 'Readers United', description: 'A club', isPublic: true, city: 'Kyiv',
    });
    expect(emitSpy).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/clubs', 'club-1']);
    expect(component.isSubmitting()).toBe(false);
  });

  it('sets errorMessage to the thrown error message on failure', async () => {
    clubServiceSpy.createClub.mockRejectedValue(new Error('City is required'));
    component.form.setValue({ name: 'Readers United', description: '', city: 'Kyiv', isPublic: true });

    await component.onSubmit();

    expect(component.errorMessage()).toBe('City is required');
    expect(component.isSubmitting()).toBe(false);
  });

  it('falls back to a generic error message when the thrown value is not an Error', async () => {
    clubServiceSpy.createClub.mockRejectedValue('not an error object');
    component.form.setValue({ name: 'Readers United', description: '', city: 'Kyiv', isPublic: true });

    await component.onSubmit();

    expect(component.errorMessage()).toBe('Failed to create club');
  });
});

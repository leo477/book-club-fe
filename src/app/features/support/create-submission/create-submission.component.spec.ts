import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CreateSubmissionComponent } from './create-submission.component';
import { SupportService } from '../../../core/services/support.service';
import { SeoService } from '../../../core/services/seo.service';

describe('CreateSubmissionComponent', () => {
  let supportSpy: { submit: ReturnType<typeof vi.fn> };
  let seoSpy: { setPageI18n: ReturnType<typeof vi.fn> };
  let router: Router;
  let component: CreateSubmissionComponent;

  beforeEach(async () => {
    supportSpy = { submit: vi.fn().mockResolvedValue(undefined) };
    seoSpy = { setPageI18n: vi.fn() };
    await TestBed.configureTestingModule({
      imports: [CreateSubmissionComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: SupportService, useValue: supportSpy },
        { provide: SeoService, useValue: seoSpy },
      ],
    }).compileComponents();
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const fixture = TestBed.createComponent(CreateSubmissionComponent);
    component = fixture.componentInstance;
  });

  it('sets the page title on construction', () => {
    expect(seoSpy.setPageI18n).toHaveBeenCalledWith('SUPPORT.create_title');
  });

  it('cancel navigates back to /support', () => {
    component.cancel();
    expect(router.navigate).toHaveBeenCalledWith(['/support']);
  });

  describe('onSubmit', () => {
    it('marks all fields touched and does not submit when the form is invalid', async () => {
      vi.spyOn(component.form, 'markAllAsTouched');
      await component.onSubmit();
      expect(component.form.markAllAsTouched).toHaveBeenCalled();
      expect(supportSpy.submit).not.toHaveBeenCalled();
    });

    it('submits trimmed values and navigates to /support on success', async () => {
      component.form.setValue({ type: 'complaint', title: '  Broken link  ', body: '  It does not work  ' });
      await component.onSubmit();
      expect(supportSpy.submit).toHaveBeenCalledWith({
        type: 'complaint', title: 'Broken link', body: 'It does not work',
      });
      expect(router.navigate).toHaveBeenCalledWith(['/support']);
      expect(component.isSubmitting()).toBe(false);
    });

    it('sets errorMessage on failure', async () => {
      supportSpy.submit.mockRejectedValue(new Error('Server exploded'));
      component.form.setValue({ type: 'suggestion', title: 'A good idea', body: 'Please consider this' });
      await component.onSubmit();
      expect(component.errorMessage()).toBe('Server exploded');
      expect(component.isSubmitting()).toBe(false);
    });

    it('falls back to a generic error message when the thrown value is not an Error', async () => {
      supportSpy.submit.mockRejectedValue('oops');
      component.form.setValue({ type: 'suggestion', title: 'A good idea', body: 'Please consider this' });
      await component.onSubmit();
      expect(component.errorMessage()).toBe('Failed to submit');
    });
  });
});

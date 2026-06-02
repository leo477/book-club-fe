import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormFieldComponent } from './form-field.component';
import { of } from 'rxjs';

describe('FormFieldComponent', () => {
  let translateSpy: { instant: ReturnType<typeof vi.fn>; onLangChange: unknown; currentLang: string };

  function setup(control: FormControl<string | null>) {
    translateSpy = {
      instant: vi.fn().mockImplementation((key: string) => key),
      onLangChange: of({ lang: 'uk' }),
      currentLang: 'uk',
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [FormFieldComponent, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    const fixture = TestBed.createComponent(FormFieldComponent);
    const component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Email');
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();
    return component;
  }

  it('hasError is false when control is valid', () => {
    const ctrl = new FormControl('test@test.com', [Validators.required, Validators.email]);
    const component = setup(ctrl);
    expect(component.hasError()).toBe(false);
  });

  it('hasError is false when control is invalid but not touched', () => {
    const ctrl = new FormControl('', [Validators.required]);
    const component = setup(ctrl);
    expect(component.hasError()).toBe(false);
  });

  it('hasError is true when control is invalid and touched', () => {
    const ctrl = new FormControl('', [Validators.required]);
    ctrl.markAsTouched();
    const component = setup(ctrl);
    expect(component.hasError()).toBe(true);
  });

  it('errorMessage returns empty string when no errors', () => {
    const ctrl = new FormControl('valid@email.com', [Validators.email]);
    const component = setup(ctrl);
    expect(component.errorMessage()).toBe('');
  });

  it('errorMessage returns required message', () => {
    const ctrl = new FormControl('', [Validators.required]);
    ctrl.markAsTouched();
    const component = setup(ctrl);
    expect(component.errorMessage()).toBe('FORM_ERRORS.required');
  });

  it('errorMessage returns email message', () => {
    const ctrl = new FormControl('not-email', [Validators.email]);
    ctrl.markAsTouched();
    const component = setup(ctrl);
    expect(component.errorMessage()).toBe('FORM_ERRORS.email');
  });

  it('errorMessage returns minlength message', () => {
    const ctrl = new FormControl('abc', [Validators.minLength(8)]);
    ctrl.markAsTouched();
    const component = setup(ctrl);
    expect(component.errorMessage()).toBe('FORM_ERRORS.minlength');
  });

  it('formControl computed returns the control', () => {
    const ctrl = new FormControl('test');
    const component = setup(ctrl);
    expect(component.formControl()).toBe(ctrl);
  });
});

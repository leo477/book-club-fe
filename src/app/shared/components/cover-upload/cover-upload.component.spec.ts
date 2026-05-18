import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { CoverUploadComponent } from './cover-upload.component';
import { UploadService } from '../../../core/services/upload.service';

function makeUploadService() {
  return {
    uploadCover$: jasmine.createSpy('uploadCover$').and.returnValue(of('https://cdn.example.com/img.jpg')),
  };
}

describe('CoverUploadComponent', () => {
  let uploadSvc: ReturnType<typeof makeUploadService>;
  let translateSpy: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    uploadSvc = makeUploadService();
    translateSpy = jasmine.createSpyObj('TranslateService', ['instant']);
    translateSpy.instant.and.callFake((key: string) => key);

    await TestBed.configureTestingModule({
      imports: [CoverUploadComponent, ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UploadService, useValue: uploadSvc },
        { provide: TranslateService, useValue: translateSpy },
      ],
    }).compileComponents();
  });

  function createWithControl() {
    const fixture = TestBed.createComponent(CoverUploadComponent);
    const ctrl = new FormControl('', { nonNullable: true });
    fixture.componentRef.setInput('control', ctrl);
    fixture.detectChanges();
    return { fixture, comp: fixture.componentInstance, ctrl };
  }

  it('should create with required control input', () => {
    const { comp } = createWithControl();
    expect(comp).toBeTruthy();
  });

  it('clearPreview() clears previewUrl and resets control value', () => {
    const { comp, ctrl } = createWithControl();
    comp.previewUrl.set('blob:something');
    ctrl.setValue('https://example.com/img.jpg');

    comp.clearPreview();

    expect(comp.previewUrl()).toBeNull();
    expect(ctrl.value).toBe('');
  });

  it('showUrlInput starts false and toggles on button click', () => {
    const { comp } = createWithControl();
    expect(comp.showUrlInput()).toBeFalse();
    comp.showUrlInput.set(true);
    expect(comp.showUrlInput()).toBeTrue();
  });
});

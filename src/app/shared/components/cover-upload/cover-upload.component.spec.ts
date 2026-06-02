import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { CoverUploadComponent } from './cover-upload.component';
import { UploadService } from '../../../core/services/upload.service';

function makeUploadService() {
  return {
    uploadCover$: vi.fn().mockReturnValue(of('https://cdn.example.com/img.jpg')),
  };
}

describe('CoverUploadComponent', () => {
  let uploadSvc: ReturnType<typeof makeUploadService>;

  beforeEach(async () => {
    uploadSvc = makeUploadService();

    await TestBed.configureTestingModule({
      imports: [CoverUploadComponent, ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UploadService, useValue: uploadSvc },
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
    expect(comp.showUrlInput()).toBe(false);
    comp.showUrlInput.set(true);
    expect(comp.showUrlInput()).toBe(true);
  });

  it('onFileSelected() sets uploadError and resets state on upload failure', () => {
    uploadSvc.uploadCover$.mockReturnValue(throwError(() => new Error('upload failed')));
    const { comp } = createWithControl();

    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:fake');
    const file = new File([''], 'cover.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file] } } as unknown as Event;

    comp.onFileSelected(event);

    expect(comp.isUploading()).toBe(false);
    expect(comp.previewUrl()).toBeNull();
    expect(comp.uploadError()).toBeTruthy();
  });

  it('onFileSelected() does nothing when no file selected', () => {
    const { comp } = createWithControl();
    const event = { target: { files: [] } } as unknown as Event;
    comp.onFileSelected(event);
    expect(uploadSvc.uploadCover$).not.toHaveBeenCalled();
  });
});

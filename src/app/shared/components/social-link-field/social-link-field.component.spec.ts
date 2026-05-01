import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { SocialLinkFieldComponent, SocialField } from './social-link-field.component';

const mockConfig: SocialField = {
  key: 'instagram',
  label: 'Instagram',
  labelClass: 'text-pink-500',
  placeholder: 'https://instagram.com/username',
  focusRingClass: 'focus:ring-pink-500',
};

describe('SocialLinkFieldComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialLinkFieldComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SocialLinkFieldComponent);
    fixture.componentRef.setInput('config', mockConfig);
    fixture.componentRef.setInput('form', new FormGroup({ instagram: new FormControl('') }));
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('accepts a FormGroup with a control for the config key', () => {
    const fixture = TestBed.createComponent(SocialLinkFieldComponent);
    const form = new FormGroup({ instagram: new FormControl('https://instagram.com/test') });
    fixture.componentRef.setInput('config', mockConfig);
    fixture.componentRef.setInput('form', form);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    expect(comp.form().get('instagram')).not.toBeNull();
    expect(comp.form().get('instagram')?.value).toBe('https://instagram.com/test');
  });

  it('reflects the config key provided via input', () => {
    const fixture = TestBed.createComponent(SocialLinkFieldComponent);
    fixture.componentRef.setInput('config', mockConfig);
    fixture.componentRef.setInput('form', new FormGroup({ instagram: new FormControl('') }));
    fixture.detectChanges();
    expect(fixture.componentInstance.config().key).toBe('instagram');
  });

  it('reflects updated config when input changes', () => {
    const fixture = TestBed.createComponent(SocialLinkFieldComponent);
    fixture.componentRef.setInput('config', mockConfig);
    // FormGroup must contain controls for all keys that config.key may reference
    const form = new FormGroup({ instagram: new FormControl(''), twitter: new FormControl('') });
    fixture.componentRef.setInput('form', form);
    fixture.detectChanges();

    const updatedConfig: SocialField = { ...mockConfig, key: 'twitter', label: 'Twitter' };
    fixture.componentRef.setInput('config', updatedConfig);
    fixture.detectChanges();

    expect(fixture.componentInstance.config().key).toBe('twitter');
    expect(fixture.componentInstance.config().label).toBe('Twitter');
  });
});

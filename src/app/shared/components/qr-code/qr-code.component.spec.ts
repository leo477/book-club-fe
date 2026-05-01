import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { QrCodeComponent } from './qr-code.component';

describe('QrCodeComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrCodeComponent],
      providers: [provideZonelessChangeDetection()],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(QrCodeComponent);
    fixture.componentRef.setInput('value', 'https://example.com');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders canvas element', () => {
    const fixture = TestBed.createComponent(QrCodeComponent);
    fixture.componentRef.setInput('value', 'https://example.com');
    fixture.detectChanges();
    const canvas = fixture.nativeElement.querySelector('canvas');
    expect(canvas).not.toBeNull();
  });

  it('size input defaults to 200', () => {
    const fixture = TestBed.createComponent(QrCodeComponent);
    fixture.componentRef.setInput('value', 'https://example.com');
    fixture.detectChanges();
    expect(fixture.componentInstance.size()).toBe(200);
  });

  it('accepts a custom size input', () => {
    const fixture = TestBed.createComponent(QrCodeComponent);
    fixture.componentRef.setInput('value', 'https://example.com');
    fixture.componentRef.setInput('size', 300);
    fixture.detectChanges();
    expect(fixture.componentInstance.size()).toBe(300);
  });
});

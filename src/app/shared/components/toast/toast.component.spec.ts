import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ToastComponent } from './toast.component';
import { ToastService, Toast } from '../../../core/services/toast.service';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let toastSpy: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    toastSpy = jasmine.createSpyObj('ToastService', ['remove'], {
      toasts: jasmine.createSpy().and.returnValue([]),
    });

    TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ToastService, useValue: toastSpy },
      ],
    });

    const fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
  });

  describe('toastClass', () => {
    it('returns success class for success type', () => {
      const toast: Toast = { id: '1', message: 'OK', type: 'success' };
      expect(component.toastClass(toast)).toContain('green');
    });

    it('returns error class for error type', () => {
      const toast: Toast = { id: '2', message: 'Fail', type: 'error' };
      expect(component.toastClass(toast)).toContain('red');
    });

    it('returns info class for info type', () => {
      const toast: Toast = { id: '3', message: 'Info', type: 'info' };
      expect(component.toastClass(toast)).toContain('blue');
    });
  });

  describe('toastIcon', () => {
    it('returns checkmark for success', () => {
      const toast: Toast = { id: '1', message: 'OK', type: 'success' };
      expect(component.toastIcon(toast)).toBe('✅');
    });

    it('returns X for error', () => {
      const toast: Toast = { id: '2', message: 'Fail', type: 'error' };
      expect(component.toastIcon(toast)).toBe('❌');
    });

    it('returns info icon for info', () => {
      const toast: Toast = { id: '3', message: 'Info', type: 'info' };
      expect(component.toastIcon(toast)).toBe('ℹ️');
    });
  });
});

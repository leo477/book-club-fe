import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), ToastService],
    });
    service = TestBed.inject(ToastService);
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('starts with empty toasts', () => {
    expect(service.toasts()).toEqual([]);
  });

  it('show() adds a toast', () => {
    service.show('Hello', 'success', 0);
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Hello');
    expect(service.toasts()[0].type).toBe('success');
  });

  it('show() adds error toast', () => {
    service.show('Error!', 'error', 0);
    expect(service.toasts()[0].type).toBe('error');
  });

  it('show() adds info toast', () => {
    service.show('Info', 'info', 0);
    expect(service.toasts()[0].type).toBe('info');
  });

  it('remove() removes a toast by id', () => {
    service.show('A', 'success', 0);
    service.show('B', 'info', 0);
    const id = service.toasts()[0].id;
    service.remove(id);
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('B');
  });

  it('show() auto-removes after duration', () => {
    service.show('Temp', 'success', 1000);
    expect(service.toasts().length).toBe(1);
    jasmine.clock().tick(1001);
    expect(service.toasts().length).toBe(0);
  });

  it('show() with duration=0 does not auto-remove', () => {
    service.show('Permanent', 'info', 0);
    jasmine.clock().tick(10000);
    expect(service.toasts().length).toBe(1);
  });

  it('show() uses default duration of 3000', () => {
    service.show('Default', 'success');
    jasmine.clock().tick(3001);
    expect(service.toasts().length).toBe(0);
  });

  it('remove() with unknown id does nothing', () => {
    service.show('A', 'success', 0);
    service.remove('nonexistent-id');
    expect(service.toasts().length).toBe(1);
  });

  it('multiple toasts can coexist', () => {
    service.show('A', 'success', 0);
    service.show('B', 'error', 0);
    service.show('C', 'info', 0);
    expect(service.toasts().length).toBe(3);
  });
});

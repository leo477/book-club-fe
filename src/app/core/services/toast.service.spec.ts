import { TestBed } from '@angular/core/testing';
import { describe, expect, it, vi } from 'vitest';

const sonnerToast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn(), info: vi.fn(), promise: vi.fn() }));
vi.mock('@spartan-ng/brain/sonner', () => ({ toast: sonnerToast }));

import { ToastService } from './toast.service';

const flush = () => new Promise(resolve => setTimeout(resolve));

describe('ToastService', () => {
  it('holds toasts raised before the toaster is mounted and replays them in order once it is', async () => {
    sonnerToast.error.mockClear();
    sonnerToast.info.mockClear();
    const service = TestBed.inject(ToastService);

    service.error('denied');
    service.info('later');
    await flush();
    expect(sonnerToast.error).not.toHaveBeenCalled();

    service.markToasterReady();
    await flush();
    expect(sonnerToast.error).toHaveBeenCalledWith('denied');
    expect(sonnerToast.info).toHaveBeenCalledWith('later');
  });

  it('shows toasts immediately after the toaster is ready', async () => {
    sonnerToast.success.mockClear();
    const service = TestBed.inject(ToastService);
    service.markToasterReady();

    service.success('saved');
    await flush();
    expect(sonnerToast.success).toHaveBeenCalledWith('saved');
  });
});

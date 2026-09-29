import { act, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { showToast } from '@/lib/toast';
import { ToasterHost } from './toaster-host';

describe('ToasterHost', () => {
  it('mounts nothing until the first toast, then shows it (and later ones) through sonner', async () => {
    const { container } = render(<ToasterHost theme="light" />);
    expect(container.querySelector('[data-sonner-toaster]')).toBeNull();

    act(() => showToast('error', 'First failure'));
    expect(await screen.findByText('First failure')).toBeInTheDocument();

    act(() => showToast('info', 'Second'));
    expect(await screen.findByText('Second')).toBeInTheDocument();
  });

  it('delivers a toast queued before the host mounted', async () => {
    showToast('error', 'Queued early');
    render(<ToasterHost theme="light" />);
    expect(await screen.findByText('Queued early')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Spinner } from './spinner';

describe('Spinner', () => {
  it('is a status region labelled Loading by default', () => {
    render(<Spinner />);
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();
  });

  it('accepts a custom label and class, and hides the icon from AT', () => {
    const { container } = render(<Spinner aria-label="Saving" className="text-primary" />);
    const status = screen.getByRole('status', { name: 'Saving' });
    expect(status).toHaveClass('text-primary', 'motion-safe:animate-spin');
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });
});

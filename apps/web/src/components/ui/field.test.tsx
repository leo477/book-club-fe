import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from './input';
import { Field, FieldControl, FieldDescription, FieldError, FieldLabel } from './field';

const form = (invalid: boolean, withDescription = true) => (
  <Field invalid={invalid}>
    <FieldLabel>Email</FieldLabel>
    <FieldControl>
      <Input />
    </FieldControl>
    {withDescription && <FieldDescription>We never share it</FieldDescription>}
    <FieldError>Required</FieldError>
  </Field>
);

describe('Field / FieldError', () => {
  it('links the label to the control', () => {
    render(form(false));
    expect(screen.getByLabelText('Email')).toBe(screen.getByRole('textbox'));
  });

  it('valid: no aria-invalid, no error in the DOM, only the description is referenced', () => {
    const { container } = render(form(false));
    const input = screen.getByRole('textbox');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).toHaveAttribute('aria-describedby', screen.getByText('We never share it').id);
    expect(screen.queryByText('Required')).not.toBeInTheDocument();
    expect(container.querySelector('[data-slot=field-error]')).toHaveAttribute('hidden');
  });

  it('invalid: sets aria-invalid and describes the control by description and alert error', () => {
    render(form(true));
    const input = screen.getByRole('textbox');
    const error = screen.getByRole('alert');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(error).toHaveTextContent('Required');
    expect(input.getAttribute('aria-describedby')?.split(' ')).toEqual([
      screen.getByText('We never share it').id,
      error.id,
    ]);
  });

  it('drops the error reference again once the field becomes valid', () => {
    const { rerender } = render(form(true, false));
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-describedby', screen.getByRole('alert').id);
    rerender(form(false, false));
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby');
  });

  it('shows a standalone error unconditionally and honours forceShow', () => {
    const { rerender } = render(<FieldError>Standalone</FieldError>);
    expect(screen.getByRole('alert')).toHaveTextContent('Standalone');
    rerender(
      <Field>
        <FieldError forceShow>Forced</FieldError>
      </Field>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Forced');
  });
});

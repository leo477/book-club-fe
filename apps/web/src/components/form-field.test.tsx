import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import userEvent from '@testing-library/user-event';
import { NextIntlClientProvider } from 'next-intl';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { messages } from '@/test/harness';
import { nest } from '@/i18n/locale';
import { FormField } from './form-field';
import { SocialLinkField } from './social-link-field';

const provider = (locale: 'uk' | 'en', ui: ReactNode) => (
  <NextIntlClientProvider locale={locale} messages={nest(messages[locale])}>
    {ui}
  </NextIntlClientProvider>
);

describe('FormField', () => {
  it('links label and input and stays free of error attributes while valid', () => {
    render(provider('en', <FormField label="Email" type="email" />));
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it.each([
    ['en', 'FORM_ERRORS.required', undefined, messages.en['FORM_ERRORS.required']],
    ['uk', 'FORM_ERRORS.email', undefined, messages.uk['FORM_ERRORS.email']],
    ['en', 'FORM_ERRORS.invalid', undefined, messages.en['FORM_ERRORS.invalid']],
  ] as const)('shows %s %s as an alert wired through aria-invalid and aria-describedby', (locale, key, values, text) => {
    render(provider(locale, <FormField label="Email" error={key} errorValues={values} />));
    const input = screen.getByLabelText('Email');
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent(text as string);
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input.getAttribute('aria-describedby')).toBe(alert.id);
  });

  it('fills the minlength message with the required length', () => {
    render(provider('en', <FormField label="Password" error="FORM_ERRORS.minlength" errorValues={{ requiredLength: 8 }} />));
    expect(screen.getByRole('alert')).toHaveTextContent('Minimum 8 characters required.');
  });

  it('forwards react-hook-form registration to the input', async () => {
    function Host() {
      const { register, watch } = useForm({ defaultValues: { name: 'x' } });
      return (
        <>
          <FormField label="Name" {...register('name')} />
          <output>{watch('name')}</output>
        </>
      );
    }
    render(provider('en', <Host />));
    await userEvent.type(screen.getByLabelText('Name'), 'yz');
    expect(screen.getByRole('status')).toHaveTextContent('xyz');
  });
});

describe('SocialLinkField', () => {
  const config = { key: 'github', label: 'GitHub', labelClass: 'text-gray-800', placeholder: 'username', focusRingClass: 'focus-visible:ring-gray-700' };

  it('renders a labelled, non-autocompleting text input with the placeholder', () => {
    render(<SocialLinkField config={config} />);
    const input = screen.getByLabelText('GitHub');
    expect(input).toHaveAttribute('placeholder', 'username');
    expect(input).toHaveAttribute('autocomplete', 'off');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('data-testid', 'social-github');
  });

  it('passes the form registration through', async () => {
    function Host() {
      const { register, watch } = useForm({ defaultValues: { github: '' } });
      return (
        <>
          <SocialLinkField config={config} {...register('github')} />
          <output>{watch('github')}</output>
        </>
      );
    }
    render(<Host />);
    await userEvent.type(screen.getByLabelText('GitHub'), 'ada');
    expect(screen.getByRole('status')).toHaveTextContent('ada');
  });
});

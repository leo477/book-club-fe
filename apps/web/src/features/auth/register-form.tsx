'use client';
'use no memo';

import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { registerForm, type RegisterForm } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { useForm, useWatch } from 'react-hook-form';
import { AppLink } from '@/components/app-link';
import { FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { sessionKey, useSession } from '@/features/clubs/use-session';
import { api } from '@/lib/api';
import { hardNavigate } from '@/lib/navigate';
import { cn } from '@/lib/utils';
import { AuthDivider } from './auth-divider';
import { authErrorMessage } from './auth-error';
import { AuthFrame } from './auth-frame';
import { GoogleButton } from './google-button';

// the welcome card stays readable for a moment before the hard navigation, standing in for Angular's book animation
export const WELCOME_MS = 1500;

type Strength = 'weak' | 'medium' | 'strong';

function passwordStrength(password: string): Strength | null {
  if (!password) return null;
  if (password.length < 8) return 'weak';
  const score = [/[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(password)).length;
  return score >= 2 ? 'strong' : score === 1 ? 'medium' : 'weak';
}

const ROLES = [
  { value: 'user', emoji: '📖', label: 'role_reader_label', desc: 'role_reader_desc', active: 'border-primary-400 ring-2 ring-primary-400/50', idle: 'border-white/20 hover:border-primary-300' },
  { value: 'organizer', emoji: '🎯', label: 'role_organizer_label', desc: 'role_organizer_desc', active: 'border-accent-400 ring-2 ring-accent-400/50', idle: 'border-white/20 hover:border-accent-300' },
] as const;

export function RegisterView() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    trigger,
    control,
    formState: { errors, touchedFields },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerForm),
    // only the role has a default: RHF adopts text already in the DOM for the others (typed before hydration)
    defaultValues: { role: 'user' },
    mode: 'onTouched',
  });
  const [role, password] = useWatch({ control, name: ['role', 'password'] });
  const strength = passwordStrength(password ?? '');

  const signUp = useMutation({
    // no variables: the typed password would otherwise sit in the mutation cache until it is collected
    mutationFn: async () => {
      const { displayName, email, password, role: chosen } = getValues();
      const result = await api.auth.registerSession({ displayName, email, password, role: chosen });
      // 202: the account exists but the backend issued no session until the e-mail is confirmed
      return { user: 'user' in result ? result.user : null, email, displayName };
    },
    onSuccess: ({ user: profile }) => {
      if (!profile) return;
      queryClient.setQueryData(sessionKey, profile);
    },
  });
  const failure = signUp.error;
  const welcomed = signUp.isSuccess && signUp.data.user !== null;

  // an effect so leaving the welcome card (unmount) cancels the redirect
  useEffect(() => {
    if (!welcomed) return;
    const timer = setTimeout(() => hardNavigate('/events'), WELCOME_MS);
    return () => clearTimeout(timer);
  }, [welcomed]);

  if (signUp.isSuccess) {
    const { user: profile, email, displayName } = signUp.data;
    return (
      <AuthFrame subtitle={t('AUTH.create_account_subtitle')}>
        <div data-testid="register-feedback" className="glass-card-strong light-island p-8 text-center">
          <div className="text-5xl mb-4">{profile ? '🎉' : '✉️'}</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{profile ? t('AUTH.account_created') : t('AUTH.check_email')}</h2>
          <p className="text-gray-600 text-sm">
            {profile ? (
              <>
                {t('AUTH.welcome_message')} <strong>{displayName}</strong>.
              </>
            ) : (
              <>
                {t('AUTH.confirmation_sent')} <strong>{email}</strong>. {t('AUTH.activate_account')}
              </>
            )}
          </p>
          <AppLink href="/login" className="mt-6 inline-block text-sm text-primary-700 hover:underline font-medium">
            {t('AUTH.back_to_login')}
          </AppLink>
        </div>
      </AuthFrame>
    );
  }

  return (
    <AuthFrame subtitle={t('AUTH.create_account_subtitle')}>
      <div className="glass-card-strong light-island p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('AUTH.create_account_h2')}</h2>
        <form onSubmit={handleSubmit(() => signUp.mutate())} className="space-y-4" noValidate>
          <fieldset className="border-0 p-0 m-0 flex flex-col gap-4">
            <legend className="sr-only">{t('AUTH.create_account_h2')}</legend>
            <FormField
              id="reg-display-name"
              label={t('AUTH.display_name')}
              type="text"
              placeholder="Ada Lovelace"
              autoComplete="username"
              error={errors.displayName?.message}
              errorValues={{ requiredLength: 2 }}
              {...register('displayName')}
            />
            <FormField
              id="reg-email"
              label={t('AUTH.email')}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              errorTestId="register-email-error"
              {...register('email')}
            />
            <FormField
              id="reg-password"
              label={t('AUTH.password')}
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.password?.message}
              errorValues={{ requiredLength: 8 }}
              {...register('password', { onChange: () => touchedFields.confirmPassword && void trigger('confirmPassword') })}
            />
            {strength && (
              <div className="flex items-center gap-2 -mt-2">
                <div className="flex gap-1 flex-1" aria-hidden="true">
                  <div className="h-1 flex-1 rounded-full transition-colors bg-red-400" />
                  <div className={cn('h-1 flex-1 rounded-full transition-colors', strength === 'weak' ? 'bg-gray-200' : 'bg-yellow-400')} />
                  <div className={cn('h-1 flex-1 rounded-full transition-colors', strength === 'strong' ? 'bg-green-500' : 'bg-gray-200')} />
                </div>
                <span className={cn('text-xs font-medium', strength === 'strong' ? 'text-green-700' : strength === 'medium' ? 'text-yellow-800' : 'text-red-700')}>
                  {t(`AUTH.password_${strength}`)}
                </span>
              </div>
            )}
            <FormField
              id="reg-confirm-password"
              label={t('AUTH.confirm_password')}
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <fieldset className="border-0 p-0 m-0">
              <legend className="text-sm font-medium text-gray-700 block mb-1.5">{t('AUTH.want_to')}</legend>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue('role', option.value, { shouldTouch: true })}
                    aria-pressed={role === option.value}
                    className={cn(
                      'glass-card-subtle p-4 text-left transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500',
                      role === option.value ? option.active : option.idle,
                    )}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div className="font-medium text-sm text-gray-900">{t(`AUTH.${option.label}`)}</div>
                    <div className="text-xs text-gray-500">{t(`AUTH.${option.desc}`)}</div>
                  </button>
                ))}
              </div>
              {errors.role && (
                <p role="alert" className="text-xs text-red-700 mt-0.5">
                  {t('AUTH.select_role_error')}
                </p>
              )}
            </fieldset>
            {failure && (
              <div data-testid="register-feedback" className="flex items-start gap-2 glass-card-subtle px-4 py-3 text-sm text-red-700" role="alert">
                <span className="mt-0.5 shrink-0">⚠️</span>
                <span>{authErrorMessage(failure, t)}</span>
              </div>
            )}
            <Button type="submit" disabled={signUp.isPending} className="mt-2 w-full bg-gradient-brand text-white border-0 hover:opacity-90 focus-visible:ring-primary-500">
              {signUp.isPending ? (
                <>
                  <Spinner aria-hidden="true" />
                  {t('AUTH.creating_account')}
                </>
              ) : (
                t('AUTH.create_account_h2')
              )}
            </Button>
          </fieldset>
        </form>
        <AuthDivider />
        <GoogleButton />
        <p className="mt-6 text-center text-sm text-gray-600">
          {t('AUTH.have_account')}{' '}
          <AppLink href="/login" className="text-primary-700 hover:underline font-medium">
            {t('AUTH.sign_in_h2')}
          </AppLink>
        </p>
      </div>
      {user && (
        <p className="mt-6 text-center text-sm">
          <AppLink href="/events" className="inline-flex items-center gap-1 text-white/60 hover:text-white/90 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 rounded">
            {t('NAV.back_home')}
          </AppLink>
        </p>
      )}
    </AuthFrame>
  );
}

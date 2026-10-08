'use client';
'use no memo';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { BackendHttpError } from '@book-club/api-client';
import { loginForm, type LoginForm } from '@book-club/contracts';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AppLink } from '@/components/app-link';
import { FormField } from '@/components/form-field';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { sessionKey, useSession } from '@/features/clubs/use-session';
import { api } from '@/lib/api';
import { takeFlash } from '@/lib/flash';
import { hardNavigate } from '@/lib/navigate';
import { showToast } from '@/lib/toast';
import { AuthDivider } from './auth-divider';
import { authErrorMessage } from './auth-error';
import { AuthFrame } from './auth-frame';
import { GoogleButton } from './google-button';

export function LoginView() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginForm), mode: 'onTouched' });

  // No defaultValues on purpose: RHF then adopts what is already in the DOM instead of wiping text typed before hydration.
  // Failed Google sign-ins arrive either as the callback page's one-shot flash or as the backend's own /login?oauth=failed
  // (a fixed enum that only selects this message; it never drives navigation).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromBackend = params.get('oauth') === 'failed';
    if (fromBackend) window.history.replaceState({}, '', '/login');
    if (takeFlash() === 'oauth_failed' || fromBackend) showToast('error', t('AUTH.oauth_failed'));
  }, [t]);

  const signIn = useMutation({
    mutationFn: async (values: LoginForm) => (await api.auth.loginSession(values)).user,
    onSuccess: (profile) => {
      queryClient.setQueryData(sessionKey, profile);
      hardNavigate('/events');
    },
  });
  // stays locked after success until the hard navigation lands, so a second click cannot post twice
  const busy = signIn.isPending || signIn.isSuccess;
  const failure = signIn.error;

  return (
    <AuthFrame subtitle={t('AUTH.welcome_back')}>
      <div className="glass-card-strong light-island p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">{t('AUTH.sign_in_h2')}</h2>
        <form onSubmit={handleSubmit((values) => signIn.mutate(values))} className="space-y-4" noValidate>
          <fieldset className="border-0 p-0 m-0 flex flex-col gap-4">
            <legend className="sr-only">{t('AUTH.sign_in_h2')}</legend>
            <FormField
              id="login-email"
              label={t('AUTH.email')}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <FormField
              id="login-password"
              label={t('AUTH.password')}
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              error={errors.password?.message}
              errorValues={{ requiredLength: 8 }}
              {...register('password')}
            />
          </fieldset>
          {failure && (
            <div data-testid="login-error" className="flex items-start gap-2 glass-card-subtle px-4 py-3 text-sm text-red-700" role="alert">
              <span className="mt-0.5 shrink-0">⚠️</span>
              <span>{failure instanceof BackendHttpError && failure.detail === 'Invalid credentials' ? t('AUTH.error_invalid_credentials') : authErrorMessage(failure, t)}</span>
            </div>
          )}
          <Button type="submit" disabled={busy} className="mt-2 w-full bg-gradient-brand text-white border-0 hover:opacity-90 focus-visible:ring-primary-500">
            {busy ? (
              <>
                <Spinner aria-label="Loading" />
                {t('AUTH.signing_in')}
              </>
            ) : (
              t('AUTH.submit_login')
            )}
          </Button>
        </form>
        <AuthDivider />
        <GoogleButton />
        <p className="mt-6 text-center text-sm text-gray-600">
          {t('AUTH.no_account')}{' '}
          <AppLink href="/register" className="text-primary-700 hover:underline font-medium">
            {t('AUTH.register_title')}
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

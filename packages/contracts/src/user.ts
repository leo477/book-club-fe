import { z } from 'zod';
import { tolerantEnum } from './tolerant';

const USER_ROLES = ['user', 'organizer', 'admin'] as const;
export const userRole = z.enum(USER_ROLES);
export type UserRole = z.infer<typeof userRole>;

export const userSocials = z.object({
  telegram: z.string().nullish(),
  instagram: z.string().nullish(),
  twitter: z.string().nullish(),
  linkedin: z.string().nullish(),
  github: z.string().nullish(),
  goodreads: z.string().nullish(),
});
export type UserSocials = z.infer<typeof userSocials>;

export const userProfile = z.object({
  id: z.string(),
  email: z.string(),
  displayName: z.string(),
  role: tolerantEnum(USER_ROLES, 'user'),
  avatarUrl: z.string().nullish(),
  createdAt: z.string(),
  socialsPublic: z.boolean(),
  socials: userSocials,
});
export type UserProfile = z.infer<typeof userProfile>;

export const userStats = z.object({
  clubsJoined: z.number(),
  quizzesTaken: z.number(),
  quizWins: z.number(),
  likesReceived: z.number(),
  booksRead: z.number(),
});
export type UserStats = z.infer<typeof userStats>;

export const authTokens = z.object({ accessToken: z.string(), refreshToken: z.string() });
export type AuthTokens = z.infer<typeof authTokens>;

export const authResponse = authTokens.extend({ user: userProfile });
export type AuthResponse = z.infer<typeof authResponse>;

export const wsTicket = z.object({ ticket: z.string() });
export type WsTicket = z.infer<typeof wsTicket>;

export const sessionStatus = z.object({ hasSession: z.boolean() });
export type SessionStatus = z.infer<typeof sessionStatus>;

export const loginRequest = z.object({ email: z.string(), password: z.string() });
export type LoginRequest = z.input<typeof loginRequest>;

export const registerRequest = z.object({
  email: z.string(),
  password: z.string(),
  displayName: z.string(),
  role: userRole.optional(),
});
export type RegisterRequest = z.input<typeof registerRequest>;

export const updateProfileRequest = z.object({ displayName: z.string().nullish() });
export type UpdateProfileRequest = z.input<typeof updateProfileRequest>;

export const updateRoleRequest = z.object({ role: z.enum(['user', 'organizer']) });
export type UpdateRoleRequest = z.input<typeof updateRoleRequest>;

export const updateSocialsRequest = userSocials;
export type UpdateSocialsRequest = z.input<typeof updateSocialsRequest>;

/** Letters, digits, spaces and . ' - _ only (2-50 chars): keeps markup characters out of chat, e-mail and OG output. */
export const DISPLAY_NAME_PATTERN = /^[\p{L}\p{N} .'\-_]{2,50}$/u;

/** Messages are i18n keys; the first failing rule (required, min, max, pattern) is the one shown. */
export const displayNameField = z
  .string()
  .trim()
  .min(1, 'PROFILE.display_name_required')
  .min(2, 'PROFILE.display_name_min')
  .max(50, 'SECURITY.invalid_display_name')
  .regex(DISPLAY_NAME_PATTERN, 'SECURITY.invalid_display_name');

export const displayNameForm = z.object({ displayName: displayNameField });
export type DisplayNameForm = z.input<typeof displayNameForm>;

/** Cookie-session responses: the body's token fields are dropped at parse time, so web callers can never reach them. */
export const sessionResponse = z.object({ user: userProfile });
export type SessionResponse = z.infer<typeof sessionResponse>;

/** Register answers 202 with this instead of a session when the backend wants the e-mail confirmed first. */
export const emailConfirmationRequired = z.object({ code: z.literal('EMAIL_CONFIRMATION_REQUIRED') });

export const registerResponse = z.union([sessionResponse, emailConfirmationRequired]);
export type RegisterResponse = z.infer<typeof registerResponse>;

const requiredText = z.string().min(1, 'FORM_ERRORS.required');
const emailField = requiredText.pipe(z.email('FORM_ERRORS.email'));
const passwordField = requiredText.min(8, 'FORM_ERRORS.minlength');

export const loginForm = z.object({ email: emailField, password: passwordField });
export type LoginForm = z.input<typeof loginForm>;

/** Same rules and message keys as the Angular register form; the display name is not trimmed, as there. */
export const registerForm = z
  .object({
    displayName: requiredText
      .min(2, 'FORM_ERRORS.minlength')
      .max(50, 'SECURITY.invalid_display_name')
      .regex(DISPLAY_NAME_PATTERN, 'SECURITY.invalid_display_name'),
    email: emailField,
    password: passwordField,
    confirmPassword: requiredText,
    role: updateRoleRequest.shape.role,
  })
  .refine((v) => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'AUTH.passwords_no_match' });
export type RegisterForm = z.input<typeof registerForm>;

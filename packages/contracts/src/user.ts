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

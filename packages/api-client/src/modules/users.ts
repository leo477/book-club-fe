import {
  userProfile,
  userStats,
  type UpdateProfileRequest,
  type UpdateRoleRequest,
  type UpdateSocialsRequest,
} from '@book-club/contracts';
import type { ApiClient } from '../client';

export const usersApi = (c: ApiClient) => ({
  me: () => c.get('/users/me', userProfile),
  stats: () => c.get('/users/me/stats', userStats),
  update: (body: UpdateProfileRequest) => c.patch('/users/me', userProfile, body),
  updateRole: (body: UpdateRoleRequest) => c.patch('/users/me/role', userProfile, body),
  updateSocials: (body: UpdateSocialsRequest) => c.patch('/users/me/socials', userProfile, body),
  updateSocialsVisibility: (socialsPublic: boolean) =>
    c.patch('/users/me/socials-visibility', userProfile, { socialsPublic }),
});

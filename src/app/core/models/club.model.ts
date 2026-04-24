import { UserSocials } from './user.model';

export type BanDuration = 1 | 3 | 5 | 'permanent';

export interface BanRecord {
  userId: string;
  clubId: string;
  bannedAt: string;
  duration: BanDuration;
  bannedBy: string;
}

export interface Club {
  id: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  organizerId: string;
  isPublic: boolean;
  memberCount: number;
  memberPreviews: string[];
  createdAt: string;
}

export interface ClubMember {
  clubId: string;
  userId: string;
  role: 'member' | 'organizer';
  joinedAt: string;
}

export interface ClubMemberDetail {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: 'member' | 'organizer';
  socials?: UserSocials;
  socialsPublic: boolean;
}

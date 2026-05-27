import { UserSocials } from './user.model';
import { AfterMeetingVenue } from './event.model';

export type BanDuration = 1 | 3 | 5 | 'permanent';
export type ClubStatus = 'active' | 'paused' | 'cancelled';

export interface CurrentBook {
  title: string;
  author: string;
  description: string;
}

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
  city: string;
  nextMeetingDate: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  theme: string | null;
  currentBook: CurrentBook | null;
  status: ClubStatus;
  tags: string[];
  meetingDurationMinutes: number | null;
  afterMeetingVenue: AfterMeetingVenue | null;
  cancelledAt?: string;
  currentChampion: { userId: string; displayName: string; eventTitle: string; eventDate: string } | null;
}

export interface MemberStatRow {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  count: number;
}

export interface ClubStats {
  topActive: MemberStatRow[];
  topWinners: MemberStatRow[];
  recentAttendance: { eventId: string; title: string; date: string; attendeeCount: number }[];
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

export type ClubStatus = 'active' | 'paused' | 'cancelled';

import { UserSocials } from './user.model';

export interface ClubBook {
  title: string;
  author: string;
  description: string; // 1–2 sentences in Ukrainian
}

export interface Club {
  id: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  organizerId: string;
  isPublic: boolean;
  memberCount: number;
  createdAt: string;
  city: string;
  nextMeetingDate: string | null; // ISO date string, null if no upcoming meeting
  address: string | null;
  lat: number | null;
  lng: number | null;
  theme: string | null;              // e.g. 'Класична література'
  currentBook: ClubBook | null;
  memberPreviews: string[];          // display names of first 4 members
  status: ClubStatus;
  cancelledAt?: string;
  meetingHistory?: ClubMeetingRecord[];
}

export interface ClubMeetingRecord {
  id: string;
  date: string;
  status: 'held' | 'cancelled' | 'rescheduled';
  notes?: string;
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

export interface ClubMeeting {
  id: string;
  clubId: string;
  title: string;
  date: string;        // ISO date
  attendees: string[]; // userIds who attended
}

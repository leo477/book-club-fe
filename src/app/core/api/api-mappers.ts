import { UserProfile, UserRole, UserSocials, UserStats } from '../models/user.model';
import { AfterMeetingVenue, BanDuration, BanRecord, Club, ClubBook, ClubMemberDetail, ClubStatus } from '../models/club.model';

// Raw API response shapes (snake_case from FastAPI)
export interface ApiUserProfile {
  id: string;
  email: string;
  role: UserRole;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
  socials?: ApiUserSocials | null;
  socials_public?: boolean;
}

export interface ApiUserSocials {
  telegram?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  linkedin?: string | null;
  github?: string | null;
  goodreads?: string | null;
}

export interface ApiUserStats {
  clubs_joined: number;
  clubs_organized: number;
  meetings_attended: number;
  quizzes_taken: number;
}

export interface ApiClub {
  id: string;
  name: string;
  description: string | null;
  cover_url: string | null;
  organizer_id: string;
  is_public: boolean;
  member_count: number;
  created_at: string;
  city: string | null;
  next_meeting_date: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  theme: string | null;
  current_book: string | null;
  member_previews: string[];
  status: ClubStatus;
  tags: string[];
  meeting_duration_minutes: number | null;
  after_meeting_venue: AfterMeetingVenue | null;
  cancelled_at?: string | null;
}

export interface ApiClubMember {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  role: 'organizer' | 'member';
  socials?: ApiUserSocials | null;
  socials_public?: boolean;
}

export interface ApiBanRecord {
  user_id: string;
  club_id: string;
  banned_at: string;
  duration: BanDuration;
  banned_by: string;
}

export function mapUserProfile(raw: ApiUserProfile): UserProfile {
  return {
    id: raw.id,
    role: raw.role,
    displayName: raw.display_name,
    avatarUrl: raw.avatar_url,
    createdAt: raw.created_at,
    socials: raw.socials ? mapSocials(raw.socials) : undefined,
    socialsPublic: raw.socials_public ?? false,
  };
}

export function mapUserStats(raw: ApiUserStats): UserStats {
  return {
    clubsJoined: raw.clubs_joined,
    quizzesTaken: raw.quizzes_taken,
    quizWins: 0,
    likesReceived: 0,
    booksRead: 0,
  };
}

export function mapClub(raw: ApiClub): Club {
  let currentBook: ClubBook | null = null;
  if (raw.current_book) {
    currentBook = { title: raw.current_book, author: '', description: '' };
  }

  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    coverUrl: raw.cover_url,
    organizerId: raw.organizer_id,
    isPublic: raw.is_public,
    memberCount: raw.member_count,
    createdAt: raw.created_at,
    city: raw.city ?? '',
    nextMeetingDate: raw.next_meeting_date,
    address: raw.address,
    lat: raw.lat,
    lng: raw.lng,
    theme: raw.theme,
    currentBook,
    memberPreviews: raw.member_previews,
    status: raw.status,
    tags: raw.tags,
    meetingDurationMinutes: raw.meeting_duration_minutes,
    afterMeetingVenue: raw.after_meeting_venue,
    cancelledAt: raw.cancelled_at ?? undefined,
  };
}

export function mapClubMember(raw: ApiClubMember): ClubMemberDetail {
  return {
    userId: raw.user_id,
    displayName: raw.display_name,
    avatarUrl: raw.avatar_url,
    role: raw.role,
    socials: raw.socials ? mapSocials(raw.socials) : undefined,
    socialsPublic: raw.socials_public ?? false,
  };
}

export function mapBanRecord(raw: ApiBanRecord): BanRecord {
  return {
    userId: raw.user_id,
    clubId: raw.club_id,
    bannedAt: raw.banned_at,
    duration: raw.duration,
    bannedBy: raw.banned_by,
  };
}

function mapSocials(raw: ApiUserSocials): UserSocials {
  return {
    telegram: raw.telegram ?? undefined,
    instagram: raw.instagram ?? undefined,
    twitter: raw.twitter ?? undefined,
    linkedin: raw.linkedin ?? undefined,
    github: raw.github ?? undefined,
    goodreads: raw.goodreads ?? undefined,
  };
}

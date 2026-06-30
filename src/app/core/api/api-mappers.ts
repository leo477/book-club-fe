import { UserProfile, UserRole, UserSocials, UserStats } from '../models/user.model';
import { BanDuration, BanRecord, Club, ClubMemberDetail, ClubStatus } from '../models/club.model';
import { AfterMeetingVenue, ClubEvent, EventStatus } from '../models/event.model';
import { Submission, SubmissionStatus, SubmissionType } from '../models/support.model';

// Raw API response shapes (camelCase from FastAPI)
export interface ApiUserProfile {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
  avatarUrl: string | null;
  createdAt: string;
  socials?: ApiUserSocials | null;
  socialsPublic?: boolean;
}

export type ApiUserSocials = { [K in keyof UserSocials]?: string | null };

export interface ApiUserStats {
  clubsJoined: number;
  quizzesTaken: number;
  quizWins: number;
  likesReceived: number;
  booksRead: number;
}

export interface ApiClub {
  id: string;
  name: string;
  description: string | null;
  coverUrl: string | null;
  organizerId: string;
  isPublic: boolean;
  memberCount: number;
  memberPreviews: string[];
  createdAt: string;
  city: string | null;
  nextMeetingDate: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  theme: string | null;
  currentBook: string | null;
  status: ClubStatus;
  tags: string[];
  meetingDurationMinutes: number | null;
  afterMeetingVenue: AfterMeetingVenue | null;
  cancelledAt?: string | null;
  current_champion?: {
    user_id: string;
    display_name: string;
    event_title: string;
    event_date: string;
  } | null;
}

export interface ApiClubMember {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  role: 'organizer' | 'member';
  socials?: ApiUserSocials | null;
  socialsPublic?: boolean;
}

export interface ApiBanRecord {
  userId: string;
  clubId: string;
  bannedAt: string;
  duration: BanDuration;
  bannedBy: string;
}

export interface ApiEvent {
  id: string;
  clubId: string;
  clubName: string;
  organizerId: string;
  title: string;
  description: string | null;
  date: string;
  city: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
  status: EventStatus;
  cancelledAt?: string | null;
  coverUrl?: string | null;
  theme: string | null;
  tags: string[];
  durationMinutes: number | null;
  afterMeetingVenue: AfterMeetingVenue | null;
  attendeeCount: number;
  isAttending: boolean;
  bookTitle?: string | null;
  quizId?: string | null;
  googleBookId?: string | null;
  hasWinner?: boolean;
  winnerId?: string | null;
  winnerName?: string | null;
}

export interface ApiSubmission {
  id: string;
  type: SubmissionType;
  title: string;
  body: string;
  status: SubmissionStatus;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

export function mapUserProfile(raw: ApiUserProfile): UserProfile {
  return {
    id: raw.id,
    role: raw.role,
    displayName: raw.displayName,
    avatarUrl: raw.avatarUrl,
    createdAt: raw.createdAt,
    socials: raw.socials ? mapSocials(raw.socials) : undefined,
    socialsPublic: raw.socialsPublic ?? false,
  };
}

export function mapUserStats(raw: ApiUserStats): UserStats {
  return {
    clubsJoined: raw.clubsJoined,
    quizzesTaken: raw.quizzesTaken,
    quizWins: raw.quizWins,
    likesReceived: raw.likesReceived,
    booksRead: raw.booksRead,
  };
}

export function mapClub(raw: ApiClub): Club {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    coverUrl: raw.coverUrl,
    organizerId: raw.organizerId,
    isPublic: raw.isPublic,
    memberCount: raw.memberCount,
    memberPreviews: raw.memberPreviews ?? [],
    createdAt: raw.createdAt,
    city: raw.city ?? '',
    nextMeetingDate: raw.nextMeetingDate,
    address: raw.address,
    lat: raw.lat,
    lng: raw.lng,
    theme: raw.theme,
    currentBook: raw.currentBook ? { title: raw.currentBook, author: '', description: '' } : null,
    status: raw.status,
    tags: raw.tags ?? [],
    meetingDurationMinutes: raw.meetingDurationMinutes,
    afterMeetingVenue: raw.afterMeetingVenue,
    cancelledAt: raw.cancelledAt ?? undefined,
    currentChampion: raw.current_champion
      ? {
          userId: raw.current_champion.user_id,
          displayName: raw.current_champion.display_name,
          eventTitle: raw.current_champion.event_title,
          eventDate: raw.current_champion.event_date,
        }
      : null,
  };
}

export function mapEvent(raw: ApiEvent): ClubEvent {
  return {
    id: raw.id,
    clubId: raw.clubId,
    clubName: raw.clubName,
    organizerId: raw.organizerId,
    title: raw.title,
    description: raw.description,
    date: raw.date,
    city: raw.city,
    address: raw.address,
    lat: raw.lat,
    lng: raw.lng,
    status: raw.status,
    cancelledAt: raw.cancelledAt ?? undefined,
    coverUrl: raw.coverUrl ?? null,
    theme: raw.theme,
    tags: raw.tags ?? [],
    durationMinutes: raw.durationMinutes,
    afterMeetingVenue: raw.afterMeetingVenue,
    attendeeCount: raw.attendeeCount,
    isAttending: raw.isAttending,
    bookTitle: raw.bookTitle ?? null,
    quizId: raw.quizId ?? null,
    googleBookId: raw.googleBookId ?? null,
    hasWinner: raw.hasWinner ?? false,
    winnerId: raw.winnerId ?? null,
    winnerName: raw.winnerName ?? null,
  };
}

export function mapClubMember(raw: ApiClubMember): ClubMemberDetail {
  return {
    userId: raw.userId,
    displayName: raw.displayName,
    avatarUrl: raw.avatarUrl,
    role: raw.role,
    socials: raw.socials ? mapSocials(raw.socials) : undefined,
    socialsPublic: raw.socialsPublic ?? false,
  };
}

export function mapBanRecord(raw: ApiBanRecord): BanRecord {
  return {
    userId: raw.userId,
    clubId: raw.clubId,
    bannedAt: raw.bannedAt,
    duration: raw.duration,
    bannedBy: raw.bannedBy,
  };
}

export function mapSubmission(raw: ApiSubmission): Submission {
  return {
    id: raw.id,
    type: raw.type,
    title: raw.title,
    body: raw.body,
    status: raw.status,
    authorId: raw.authorId,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
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

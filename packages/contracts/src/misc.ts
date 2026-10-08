import { z } from 'zod';

export const memberCandidate = z.object({
  userId: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().nullish(),
});
export type MemberCandidate = z.infer<typeof memberCandidate>;

export const randomizerSession = z.object({
  id: z.string(),
  clubId: z.string(),
  createdBy: z.string(),
  purpose: z.string(),
  candidates: z.array(memberCandidate),
  result: memberCandidate.nullable(),
  createdAt: z.string(),
});
export type RandomizerSession = z.infer<typeof randomizerSession>;

export const createRandomizerSessionRequest = z.object({
  purpose: z.string(),
  candidates: z.array(memberCandidate),
  result: memberCandidate.nullish(),
});
export type CreateRandomizerSessionRequest = z.input<typeof createRandomizerSessionRequest>;

export const submissionType = z.enum(['complaint', 'suggestion', 'comment']);
export type SubmissionType = z.infer<typeof submissionType>;

export const submissionStatus = z.enum(['open', 'pending', 'approved', 'rejected', 'in_progress', 'done']);
export type SubmissionStatus = z.infer<typeof submissionStatus>;

export const submission = z.object({
  id: z.string(),
  authorId: z.string().nullish(),
  type: submissionType,
  title: z.string(),
  body: z.string(),
  status: submissionStatus,
  createdAt: z.string(),
  updatedAt: z.string(),
  likeCount: z.number(),
  likedByMe: z.boolean(),
});
export type Submission = z.infer<typeof submission>;

export const createSubmissionRequest = z.object({
  type: submissionType,
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
});
export type CreateSubmissionRequest = z.input<typeof createSubmissionRequest>;

/** Form-side limits (tighter than the request schema); messages are i18n keys. */
export const createSubmissionForm = z.object({
  type: submissionType,
  title: z.string().min(1, 'SUPPORT.title_required').min(3, 'SUPPORT.title_min').max(120, 'SUPPORT.title_max'),
  body: z.string().min(1, 'SUPPORT.body_required').min(10, 'SUPPORT.body_min').max(2000, 'SUPPORT.body_max'),
});
export type CreateSubmissionForm = z.input<typeof createSubmissionForm>;

export const updateSubmissionStatusRequest = z.object({
  status: z.enum(['approved', 'rejected', 'in_progress', 'done']),
});
export type UpdateSubmissionStatusRequest = z.input<typeof updateSubmissionStatusRequest>;

export const chatRoom = z.object({
  id: z.string(),
  name: z.string(),
  eventId: z.string().nullish(),
});
export type ChatRoom = z.infer<typeof chatRoom>;

export const chatMessage = z.object({
  id: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  text: z.string(),
  timestamp: z.string(),
  isSystem: z.boolean().default(false),
});
export type ChatMessage = z.infer<typeof chatMessage>;

/** Backend returns this one snake_case. */
export const unreadCount = z.object({
  room_id: z.string(),
  unread_count: z.number(),
  last_read_message_id: z.string().nullish(),
});
export type UnreadCount = z.infer<typeof unreadCount>;

const presenceStatus = z.enum(['online', 'offline']);
export const chatWsServerMessage = z.discriminatedUnion('type', [
  z.object({ type: z.literal('message'), payload: chatMessage }),
  z.object({ type: z.literal('presence'), payload: z.object({ userId: z.string(), status: presenceStatus }) }),
  z.object({
    type: z.literal('presence_snapshot'),
    payload: z.array(z.object({ userId: z.string(), status: presenceStatus })),
  }),
  z.object({
    type: z.literal('error'),
    payload: z.object({ code: z.enum(['RATE_LIMITED', 'ROOM_BANNED']), message: z.string() }),
  }),
]);
export type ChatWsServerMessage = z.infer<typeof chatWsServerMessage>;

export const createChatRoomRequest = z.object({ name: z.string().min(3).max(40) });
export type CreateChatRoomRequest = z.input<typeof createChatRoomRequest>;

export const banFromRoomRequest = z.object({ user_id: z.string(), duration_seconds: z.number().int() });
export type BanFromRoomRequest = z.input<typeof banFromRoomRequest>;

export const geocodeSuggestion = z.object({
  label: z.string(),
  city: z.string().nullish(),
  country: z.string().nullish(),
  lat: z.number().nullish(),
  lng: z.number().nullish(),
  place_id: z.string().nullish(),
});
export type GeocodeSuggestion = z.infer<typeof geocodeSuggestion>;

export const routePoint = z.object({ lat: z.number(), lng: z.number() });
export const walkingRoute = z.object({ path: z.array(routePoint) });
export type WalkingRoute = z.infer<typeof walkingRoute>;

export const mapsKeyConfig = z.object({ mapsApiKey: z.string(), mapsMapId: z.string() });
export type MapsKeyConfig = z.infer<typeof mapsKeyConfig>;

export const uploadResult = z.object({ url: z.string() });
export type UploadResult = z.infer<typeof uploadResult>;

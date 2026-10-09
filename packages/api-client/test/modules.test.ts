import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import clubs from '../../contracts/test/fixtures/clubs.json';
import events from '../../contracts/test/fixtures/events.json';
import votes from '../../contracts/test/fixtures/book-vote.json';
import misc from '../../contracts/test/fixtures/misc.json';
import quizzes from '../../contracts/test/fixtures/quiz.json';
import users from '../../contracts/test/fixtures/users.json';
import { cookieTransport, createApi, createApiClient } from '../src';

const f = { ...users, ...clubs, ...events, ...votes, ...quizzes, ...misc };

const BASE = 'http://api.test/api/v1';
interface Seen {
  method: string;
  path: string;
  search: string;
  body: unknown;
}
let seen: Seen[] = [];
let reply: unknown;
const server = setupServer(
  http.all(`${BASE}/*`, async ({ request }) => {
    const url = new URL(request.url);
    const isJson = request.headers.get('content-type')?.includes('json');
    const text = await request.text();
    seen.push({
      method: request.method,
      path: url.pathname.replace('/api/v1', ''),
      search: url.search,
      body: isJson && text ? JSON.parse(text) : undefined,
    });
    return reply === undefined ? new HttpResponse(null, { status: 204 }) : HttpResponse.json(reply as never);
  }),
);
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => {
  seen = [];
});
afterAll(() => server.close());

const api = createApi(createApiClient({ baseUrl: BASE, transport: cookieTransport({ hasSession: () => true }) }));
type Api = typeof api;

interface Row {
  name: string;
  call: (a: Api) => Promise<unknown>;
  method: string;
  path: string;
  search?: string;
  body?: unknown;
  res?: unknown;
}

const rows: Row[] = [
  { name: 'auth.login', call: (a) => a.auth.login({ email: 'a@b.c', password: 'p' }), method: 'POST', path: '/auth/login', body: { email: 'a@b.c', password: 'p' }, res: f.authResponse },
  { name: 'auth.register', call: (a) => a.auth.register({ email: 'a@b.c', password: 'p', displayName: 'A' }), method: 'POST', path: '/auth/register', body: { email: 'a@b.c', password: 'p', displayName: 'A' }, res: f.authResponse },
  { name: 'auth.loginSession', call: (a) => a.auth.loginSession({ email: 'a@b.c', password: 'p' }), method: 'POST', path: '/auth/login', body: { email: 'a@b.c', password: 'p' }, res: f.authResponse },
  { name: 'auth.registerSession', call: (a) => a.auth.registerSession({ email: 'a@b.c', password: 'p', displayName: 'A', role: 'organizer' }), method: 'POST', path: '/auth/register', body: { email: 'a@b.c', password: 'p', displayName: 'A', role: 'organizer' }, res: f.authResponse },
  { name: 'auth.exchangeOAuthSession', call: (a) => a.auth.exchangeOAuthSession('c1'), method: 'POST', path: '/auth/oauth/exchange', body: { code: 'c1' }, res: f.authTokens },
  { name: 'auth.refresh', call: (a) => a.auth.refresh(), method: 'POST', path: '/auth/refresh', body: {}, res: f.authTokens },
  { name: 'auth.exchangeOAuthCode', call: (a) => a.auth.exchangeOAuthCode('c1'), method: 'POST', path: '/auth/oauth/exchange', body: { code: 'c1' }, res: f.authTokens },
  { name: 'auth.logout', call: (a) => a.auth.logout(), method: 'POST', path: '/auth/logout' },
  { name: 'auth.me', call: (a) => a.auth.me(), method: 'GET', path: '/auth/me', res: f.userProfile },
  { name: 'auth.sessionStatus', call: (a) => a.auth.sessionStatus(), method: 'GET', path: '/auth/session-status', res: f.sessionStatus },
  { name: 'auth.wsTicket', call: (a) => a.auth.wsTicket(), method: 'POST', path: '/auth/ws-ticket', body: {}, res: f.wsTicket },
  { name: 'users.me', call: (a) => a.users.me(), method: 'GET', path: '/users/me', res: f.userProfile },
  { name: 'users.stats', call: (a) => a.users.stats(), method: 'GET', path: '/users/me/stats', res: f.userStats },
  { name: 'users.update', call: (a) => a.users.update({ displayName: 'B' }), method: 'PATCH', path: '/users/me', body: { displayName: 'B' }, res: f.userProfile },
  { name: 'users.updateRole', call: (a) => a.users.updateRole({ role: 'organizer' }), method: 'PATCH', path: '/users/me/role', body: { role: 'organizer' }, res: f.userProfile },
  { name: 'users.updateSocials', call: (a) => a.users.updateSocials({ github: 'x' }), method: 'PATCH', path: '/users/me/socials', body: { github: 'x' }, res: f.userProfile },
  { name: 'users.updateSocialsVisibility', call: (a) => a.users.updateSocialsVisibility(true), method: 'PATCH', path: '/users/me/socials-visibility', body: { socialsPublic: true }, res: f.userProfile },
  { name: 'clubs.list', call: (a) => a.clubs.list(), method: 'GET', path: '/clubs', res: [f.club] },
  { name: 'clubs.mine', call: (a) => a.clubs.mine(), method: 'GET', path: '/clubs/my', res: [f.club] },
  { name: 'clubs.get', call: (a) => a.clubs.get('c1', { skipAuthRedirect: true }), method: 'GET', path: '/clubs/c1', res: f.club },
  { name: 'clubs.create', call: (a) => a.clubs.create({ name: 'N' }), method: 'POST', path: '/clubs', body: { name: 'N' }, res: f.club },
  { name: 'clubs.update', call: (a) => a.clubs.update('c1', { name: 'M' }), method: 'PATCH', path: '/clubs/c1', body: { name: 'M' }, res: f.club },
  { name: 'clubs.pause', call: (a) => a.clubs.pause('c1'), method: 'PATCH', path: '/clubs/c1/pause', body: {}, res: f.club },
  { name: 'clubs.cancel', call: (a) => a.clubs.cancel('c1'), method: 'PATCH', path: '/clubs/c1/cancel', body: {}, res: f.club },
  { name: 'clubs.reschedule', call: (a) => a.clubs.reschedule('c1', '2026-10-01T10:00:00Z'), method: 'PATCH', path: '/clubs/c1/reschedule', body: { newDate: '2026-10-01T10:00:00Z' }, res: f.club },
  { name: 'clubs.remove', call: (a) => a.clubs.remove('c1'), method: 'DELETE', path: '/clubs/c1' },
  { name: 'clubs.join', call: (a) => a.clubs.join('c1'), method: 'POST', path: '/clubs/c1/join', body: {}, res: f.joinClubResponse },
  { name: 'clubs.leave', call: (a) => a.clubs.leave('c1'), method: 'DELETE', path: '/clubs/c1/leave' },
  { name: 'clubs.myMembership', call: (a) => a.clubs.myMembership('c1'), method: 'GET', path: '/clubs/c1/my-membership', res: f.myMembership },
  { name: 'clubs.stats', call: (a) => a.clubs.stats('c1'), method: 'GET', path: '/clubs/c1/stats', res: f.clubStats },
  { name: 'clubs.createEvent', call: (a) => a.clubs.createEvent('c1', { title: 'T', date: '2026-10-01T10:00:00Z', city: 'Kyiv' }), method: 'POST', path: '/clubs/c1/events', body: { title: 'T', date: '2026-10-01T10:00:00Z', city: 'Kyiv' }, res: f.clubEvent },
  { name: 'members.list', call: (a) => a.members.list('c1', { skip: 5, limit: 10 }), method: 'GET', path: '/clubs/c1/members', search: '?skip=5&limit=10', res: [f.clubMember] },
  { name: 'members.remove', call: (a) => a.members.remove('c1', 'u1'), method: 'DELETE', path: '/clubs/c1/members/u1' },
  { name: 'members.ban', call: (a) => a.members.ban('c1', 'u1', 3), method: 'POST', path: '/clubs/c1/members/u1/ban', body: { duration: 3 }, res: f.banRecord },
  { name: 'members.unban', call: (a) => a.members.unban('c1', 'u1'), method: 'DELETE', path: '/clubs/c1/bans/u1' },
  { name: 'members.changeRole', call: (a) => a.members.changeRole('c1', 'u1', 'organizer'), method: 'PATCH', path: '/clubs/c1/members/u1/role', body: { role: 'organizer' }, res: f.clubMember },
  { name: 'members.bans', call: (a) => a.members.bans('c1'), method: 'GET', path: '/clubs/c1/bans', res: [f.banRecord] },
  { name: 'members.joinRequests', call: (a) => a.members.joinRequests('c1'), method: 'GET', path: '/clubs/c1/join-requests', res: [f.joinRequest] },
  { name: 'members.bans with a signal', call: (a) => a.members.bans('c1', { limit: 5 }, { signal: new AbortController().signal }), method: 'GET', path: '/clubs/c1/bans', search: '?limit=5', res: [f.banRecord] },
  { name: 'members.joinRequests with a signal', call: (a) => a.members.joinRequests('c1', {}, { signal: new AbortController().signal }), method: 'GET', path: '/clubs/c1/join-requests', res: [f.joinRequest] },
  { name: 'clubs.stats with a signal', call: (a) => a.clubs.stats('c1', { signal: new AbortController().signal }), method: 'GET', path: '/clubs/c1/stats', res: f.clubStats },
  { name: 'randomizer.history with a signal', call: (a) => a.randomizer.history('c1', {}, { signal: new AbortController().signal }), method: 'GET', path: '/clubs/c1/randomizer/history', res: [f.randomizerSession] },
  { name: 'members.approveJoinRequest', call: (a) => a.members.approveJoinRequest('c1', 'u1'), method: 'POST', path: '/clubs/c1/join-requests/u1/approve', body: {}, res: f.approveJoinRequestResponse },
  { name: 'members.rejectJoinRequest', call: (a) => a.members.rejectJoinRequest('c1', 'u1'), method: 'POST', path: '/clubs/c1/join-requests/u1/reject', body: {} },
  { name: 'events.mine', call: (a) => a.events.mine(), method: 'GET', path: '/events/my', res: [f.clubEvent] },
  { name: 'events.get', call: (a) => a.events.get('e1', { skipAuthRedirect: true }), method: 'GET', path: '/events/e1', res: f.clubEvent },
  { name: 'events.attend', call: (a) => a.events.attend('e1'), method: 'POST', path: '/events/e1/attend', body: {}, res: f.attendEventResponse },
  { name: 'events.cancelAttendance', call: (a) => a.events.cancelAttendance('e1'), method: 'DELETE', path: '/events/e1/attend' },
  { name: 'events.update', call: (a) => a.events.update('e1', { title: 'X', duration_minutes: 30 }), method: 'PATCH', path: '/events/e1', body: { title: 'X', duration_minutes: 30 }, res: f.clubEvent },
  { name: 'events.reschedule', call: (a) => a.events.reschedule('e1', { newDate: '2026-10-01T10:00:00Z' }), method: 'PATCH', path: '/events/e1/reschedule', body: { newDate: '2026-10-01T10:00:00Z' }, res: f.clubEvent },
  { name: 'events.cancel', call: (a) => a.events.cancel('e1'), method: 'PATCH', path: '/events/e1/cancel', body: {}, res: f.clubEvent },
  { name: 'events.setWinner', call: (a) => a.events.setWinner('e1', 'u1'), method: 'PATCH', path: '/events/e1/winner', body: { winner_id: 'u1' }, res: f.clubEvent },
  { name: 'events.list', call: (a) => a.events.list({ clubId: 'c1', city: 'Kyiv', skip: 0, limit: 20 }), method: 'GET', path: '/events', search: '?city=Kyiv&skip=0&limit=20&club_id=c1', res: [f.clubEvent] },
  { name: 'clubs.events', call: (a) => a.clubs.events('c1', true), method: 'GET', path: '/clubs/c1/events', search: '?include_past=true', res: [f.clubEvent] },
  { name: 'bookVote.currentRound', call: (a) => a.bookVote.currentRound('c1'), method: 'GET', path: '/clubs/c1/book-vote/round', res: null },
  { name: 'bookVote.createRound', call: (a) => a.bookVote.createRound('c1'), method: 'POST', path: '/clubs/c1/book-vote/rounds', body: {}, res: f.bookVoteRound },
  { name: 'bookVote.addOption', call: (a) => a.bookVote.addOption('c1', 'r1', { title: 'Dune' }), method: 'POST', path: '/clubs/c1/book-vote/rounds/r1/options', body: { title: 'Dune' }, res: f.bookVoteRound },
  { name: 'bookVote.removeOption', call: (a) => a.bookVote.removeOption('c1', 'o1'), method: 'DELETE', path: '/clubs/c1/book-vote/options/o1', res: f.bookVoteRound },
  { name: 'bookVote.vote', call: (a) => a.bookVote.vote('c1', 'o1'), method: 'POST', path: '/clubs/c1/book-vote/options/o1/vote', body: {}, res: f.bookVoteRound },
  { name: 'bookVote.unvote', call: (a) => a.bookVote.unvote('c1', 'o1'), method: 'DELETE', path: '/clubs/c1/book-vote/options/o1/vote', res: f.bookVoteRound },
  { name: 'bookVote.closeRound', call: (a) => a.bookVote.closeRound('c1', 'r1'), method: 'POST', path: '/clubs/c1/book-vote/rounds/r1/close', body: {}, res: f.bookVoteRound },
  { name: 'quiz.listForClub', call: (a) => a.quiz.listForClub('c1', { limit: 5 }), method: 'GET', path: '/clubs/c1/quizzes', search: '?limit=5', res: [f.quiz] },
  { name: 'quiz.create', call: (a) => a.quiz.create('c1', { title: 'T' }), method: 'POST', path: '/clubs/c1/quizzes', body: { title: 'T' }, res: f.quiz },
  { name: 'quiz.get', call: (a) => a.quiz.get('q1'), method: 'GET', path: '/quizzes/q1', res: f.quiz },
  { name: 'quiz.update', call: (a) => a.quiz.update('q1', { title: 'T2' }), method: 'PATCH', path: '/quizzes/q1', body: { title: 'T2' }, res: f.quiz },
  { name: 'quiz.setActive', call: (a) => a.quiz.setActive('q1', false), method: 'PATCH', path: '/quizzes/q1/active', body: { isActive: false }, res: f.quiz },
  { name: 'quiz.questions', call: (a) => a.quiz.questions('q1'), method: 'GET', path: '/quizzes/q1/questions', res: [f.questionOrganizer, f.questionParticipant] },
  { name: 'quiz.addQuestion', call: (a) => a.quiz.addQuestion('q1', { question: '?', options: ['a', 'b'], correctIndex: 0 }), method: 'POST', path: '/quizzes/q1/questions', body: { question: '?', options: ['a', 'b'], correctIndex: 0 }, res: f.questionOrganizer },
  { name: 'quiz.updateQuestion', call: (a) => a.quiz.updateQuestion('q1', 'qq1', { correctIndex: 1 }), method: 'PATCH', path: '/quizzes/q1/questions/qq1', body: { correctIndex: 1 }, res: f.questionOrganizer },
  { name: 'quiz.deleteQuestion', call: (a) => a.quiz.deleteQuestion('q1', 'qq1'), method: 'DELETE', path: '/quizzes/q1/questions/qq1' },
  { name: 'quiz.reorderQuestions', call: (a) => a.quiz.reorderQuestions('q1', ['b', 'a']), method: 'PUT', path: '/quizzes/q1/questions/order', body: { order: ['b', 'a'] } },
  { name: 'quiz.submitAttempt', call: (a) => a.quiz.submitAttempt('q1', [0, 1]), method: 'POST', path: '/quizzes/q1/attempts', body: { answers: [0, 1] }, res: f.quizAttempt },
  { name: 'quiz.createSession', call: (a) => a.quiz.createSession('q1'), method: 'POST', path: '/quizzes/q1/sessions', body: { eventId: null }, res: f.quizSession },
  { name: 'quiz.createSession with event', call: (a) => a.quiz.createSession('q1', 'e1'), method: 'POST', path: '/quizzes/q1/sessions', body: { eventId: 'e1' }, res: f.quizSession },
  { name: 'quiz.activeSession', call: (a) => a.quiz.activeSession('q1'), method: 'GET', path: '/quizzes/q1/sessions/active', res: f.quizSession },
  { name: 'quiz.leaderboard', call: (a) => a.quiz.leaderboard('q1', 's1'), method: 'GET', path: '/quizzes/q1/sessions/s1/leaderboard', res: f.quizLeaderboard },
  { name: 'quiz.closeSession', call: (a) => a.quiz.closeSession('q1', 's1'), method: 'PATCH', path: '/quizzes/q1/sessions/s1/close', body: {} },
  { name: 'randomizer.history', call: (a) => a.randomizer.history('c1'), method: 'GET', path: '/clubs/c1/randomizer/history', res: [f.randomizerSession] },
  { name: 'randomizer.createSession', call: (a) => a.randomizer.createSession('c1', { purpose: 'p', candidates: [] }), method: 'POST', path: '/clubs/c1/randomizer/sessions', body: { purpose: 'p', candidates: [] }, res: f.randomizerSession },
  { name: 'support.list', call: (a) => a.support.list({ type: 'complaint' }), method: 'GET', path: '/support', search: '?type=complaint', res: [f.submission] },
  { name: 'support.create', call: (a) => a.support.create({ type: 'comment', title: 't', body: 'b' }), method: 'POST', path: '/support', body: { type: 'comment', title: 't', body: 'b' }, res: f.submission },
  { name: 'support.updateStatus', call: (a) => a.support.updateStatus('s1', 'done'), method: 'PATCH', path: '/support/s1/status', body: { status: 'done' }, res: f.submission },
  { name: 'support.like', call: (a) => a.support.like('s1'), method: 'POST', path: '/support/s1/like', body: {}, res: f.submission },
  { name: 'support.unlike', call: (a) => a.support.unlike('s1'), method: 'DELETE', path: '/support/s1/like' },
  { name: 'chat.clubRooms', call: (a) => a.chat.clubRooms('c1'), method: 'GET', path: '/clubs/c1/chat/rooms', res: [f.chatRoom] },
  { name: 'chat.createClubRoom', call: (a) => a.chat.createClubRoom('c1', 'Room'), method: 'POST', path: '/clubs/c1/chat/rooms', body: { name: 'Room' }, res: f.chatRoom },
  { name: 'chat.eventRoom', call: (a) => a.chat.eventRoom('e1'), method: 'GET', path: '/events/e1/chat/room', res: f.chatRoom },
  { name: 'chat.createEventRoom', call: (a) => a.chat.createEventRoom('e1'), method: 'POST', path: '/events/e1/chat/room', body: {}, res: f.chatRoom },
  { name: 'chat.deleteRoom', call: (a) => a.chat.deleteRoom('r1'), method: 'DELETE', path: '/chat/rooms/r1' },
  { name: 'chat.messages', call: (a) => a.chat.messages('r1', { beforeId: 'm1', limit: 20 }), method: 'GET', path: '/chat/rooms/r1/messages', search: '?before_id=m1&limit=20', res: [f.chatMessage] },
  { name: 'chat.send', call: (a) => a.chat.send('r1', 'hi'), method: 'POST', path: '/chat/rooms/r1/messages', body: { text: 'hi' }, res: f.chatMessage },
  { name: 'chat.deleteMessage', call: (a) => a.chat.deleteMessage('r1', 'm1'), method: 'DELETE', path: '/chat/rooms/r1/messages/m1' },
  { name: 'chat.ban', call: (a) => a.chat.ban('r1', 'u1', 600), method: 'POST', path: '/chat/rooms/r1/ban', body: { user_id: 'u1', duration_seconds: 600 } },
  { name: 'chat.markRead', call: (a) => a.chat.markRead('r1', 'm1'), method: 'POST', path: '/chat/rooms/r1/read', body: { last_read_message_id: 'm1' } },
  { name: 'chat.unreadCount', call: (a) => a.chat.unreadCount('r1'), method: 'GET', path: '/chat/rooms/r1/unread-count', res: f.unreadCount },
  { name: 'books.search', call: (a) => a.books.search('dune'), method: 'GET', path: '/books/search', search: '?q=dune&limit=5', res: [f.bookSuggestion] },
  { name: 'books.search with call options', call: (a) => a.books.search('dune', 3, { suppressErrorToast: true, skipAuthRedirect: true, signal: new AbortController().signal }), method: 'GET', path: '/books/search', search: '?q=dune&limit=3', res: [f.bookSuggestion] },
  { name: 'books.details', call: (a) => a.books.details('gb1'), method: 'GET', path: '/books/details/gb1', res: f.bookSuggestion },
  { name: 'books.stores', call: (a) => a.books.stores('Dune'), method: 'GET', path: '/books/stores', search: '?title=Dune', res: [f.storeResult] },
  { name: 'geocode.autocomplete', call: (a) => a.geocode.autocomplete('kyiv', 'tok'), method: 'GET', path: '/geocode/autocomplete', search: '?q=kyiv&lang=uk&limit=5&session_token=tok', res: [f.geocodeSuggestion] },
  { name: 'geocode.placeDetails', call: (a) => a.geocode.placeDetails('p1', 'tok'), method: 'GET', path: '/geocode/place-details', search: '?place_id=p1&session_token=tok&lang=uk', res: f.geocodeSuggestion },
  { name: 'geocode.walkingRoute', call: (a) => a.geocode.walkingRoute({ lat: 1, lng: 2 }, { lat: 3, lng: 4 }), method: 'GET', path: '/routes/walking', search: '?origin_lat=1&origin_lng=2&dest_lat=3&dest_lng=4', res: f.walkingRoute },
  { name: 'upload.cover', call: (a) => a.upload.cover(new FormData()), method: 'POST', path: '/upload/cover', res: f.uploadResult },
  { name: 'config.mapsKey', call: (a) => a.config.mapsKey({ suppressErrorToast: true }), method: 'GET', path: '/config/maps-key', res: f.mapsKeyConfig },
];

describe('domain modules over MSW', () => {
  it.each(rows)('$name', async ({ call, method, path, search, body, res }) => {
    reply = res;
    await call(api);
    expect(seen).toHaveLength(1);
    expect(seen[0]).toMatchObject({ method, path, search: search ?? '' });
    expect(seen[0]?.body).toEqual(body);
  });

  it('rejects a response that violates the contract', async () => {
    reply = { ...(f.club as object), memberCount: 'many' };
    await expect(api.clubs.get('c1')).rejects.toThrow(/Invalid GET \/clubs\/c1/);
  });

  it('accepts the private club stub from clubs.get', async () => {
    reply = { id: 'c1', name: 'Secret', isPublic: false, memberCount: 4 };
    await expect(api.clubs.get('c1')).resolves.toEqual(reply);
  });

  it('parses the ban duration string from the backend into a number', async () => {
    reply = [f.banRecord];
    await expect(api.members.bans('c1')).resolves.toMatchObject([{ duration: 3 }]);
  });

  it('hands callers no token keys from the cookie-session auth calls', async () => {
    const tokens = { accessToken: 'jwt-access', refreshToken: 'jwt-refresh' };
    reply = tokens;
    await expect(api.auth.exchangeOAuthSession('c1')).resolves.toEqual({});
    reply = { ...tokens, user: f.userProfile };
    for (const result of [await api.auth.loginSession({ email: 'a@b.c', password: 'p' }), await api.auth.registerSession({ email: 'a@b.c', password: 'p', displayName: 'A' })]) {
      expect(Object.keys(result)).toEqual(['user']);
      expect(JSON.stringify(result)).not.toContain('jwt-');
    }
  });
});

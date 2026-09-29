import type { ApiClient } from './client';
import { authApi } from './modules/auth';
import { bookVoteApi } from './modules/book-vote';
import { clubsApi } from './modules/clubs';
import { eventsApi } from './modules/events';
import { membersApi } from './modules/members';
import { booksApi, chatApi, configApi, geocodeApi, randomizerApi, supportApi, uploadApi } from './modules/misc';
import { quizApi } from './modules/quiz';
import { usersApi } from './modules/users';

export function createApi(client: ApiClient) {
  return {
    auth: authApi(client),
    users: usersApi(client),
    clubs: clubsApi(client),
    members: membersApi(client),
    events: eventsApi(client),
    bookVote: bookVoteApi(client),
    quiz: quizApi(client),
    randomizer: randomizerApi(client),
    support: supportApi(client),
    chat: chatApi(client),
    books: booksApi(client),
    geocode: geocodeApi(client),
    upload: uploadApi(client),
    config: configApi(client),
  };
}

export type Api = ReturnType<typeof createApi>;

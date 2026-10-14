import { describe, expect, it, vi } from 'vitest';
import uk from '@book-club/i18n/uk.icu.json';
import { generateMetadata as clubDetail } from './clubs/[id]/page';
import { generateMetadata as clubEdit } from './clubs/[id]/edit/page';
import { generateMetadata as eventCreate } from './clubs/[id]/events/create/page';
import { generateMetadata as manage } from './clubs/[id]/manage/page';
import { generateMetadata as randomizer } from './clubs/[id]/randomizer/page';
import { generateMetadata as quizList } from './clubs/[id]/quizzes/page';
import { generateMetadata as quizCreate } from './clubs/[id]/quizzes/create/page';
import { generateMetadata as quizTake } from './clubs/[id]/quizzes/[quizId]/page';
import { generateMetadata as quizEdit } from './clubs/[id]/quizzes/[quizId]/edit/page';
import { generateMetadata as quizPreview } from './clubs/[id]/quizzes/[quizId]/preview/page';
import { generateMetadata as quizSession } from './clubs/[id]/quizzes/[quizId]/session/page';
import { generateMetadata as quizLeaderboard } from './clubs/[id]/quizzes/[quizId]/leaderboard/page';
import { generateMetadata as eventEdit } from './events/[id]/edit/page';

const messages = uk as Record<string, string>;
const getClub = vi.hoisted(() => vi.fn());
vi.mock('@/lib/server-api', () => ({ serverApi: () => ({ clubs: { get: getClub, events: vi.fn().mockResolvedValue([]) } }) }));
vi.mock('next-intl/server', () => ({
  getLocale: async () => 'uk',
  getTranslations: async (ns?: string) => (key: string) => messages[ns ? `${ns}.${key}` : key] ?? key,
}));

const ID = '3f2b8c1e-9a4d-4e7b-8c5f-1a2b3c4d5e6f';
type Meta = (props: { params: Promise<{ id: string; quizId: string }> }) => Promise<{ title?: unknown; robots?: unknown }>;

const single: [string, Meta][] = [
  ['/clubs/:id/edit', clubEdit as Meta],
  ['/clubs/:id/events/create', eventCreate as Meta],
  ['/clubs/:id/manage', manage as Meta],
  ['/clubs/:id/randomizer', randomizer as Meta],
  ['/clubs/:id/quizzes', quizList as Meta],
  ['/clubs/:id/quizzes/create', quizCreate as Meta],
  ['/events/:id/edit', eventEdit as Meta],
];
const withQuiz: [string, Meta][] = [
  ['/clubs/:id/quizzes/:quizId', quizTake as Meta],
  ['/clubs/:id/quizzes/:quizId/edit', quizEdit as Meta],
  ['/clubs/:id/quizzes/:quizId/preview', quizPreview as Meta],
  ['/clubs/:id/quizzes/:quizId/session', quizSession as Meta],
  ['/clubs/:id/quizzes/:quizId/leaderboard', quizLeaderboard as Meta],
];

describe('shell 404 titles', () => {
  it.each([...single, ...withQuiz])('%s uses TITLES.not_found for an id that is not a UUID', async (_name, meta) => {
    const result = await meta({ params: Promise.resolve({ id: 'not-uuid', quizId: ID }) });
    expect(result.title).toBe(messages['TITLES.not_found']);
    expect(result.robots).toEqual({ index: false, follow: false });
  });

  it.each(withQuiz)('%s uses TITLES.not_found for a quiz id that is not a UUID', async (_name, meta) => {
    expect((await meta({ params: Promise.resolve({ id: ID, quizId: 'nope' }) })).title).toBe(messages['TITLES.not_found']);
  });

  it.each([...single, ...withQuiz])('%s keeps its own title for valid ids', async (_name, meta) => {
    expect((await meta({ params: Promise.resolve({ id: ID, quizId: ID }) })).title).not.toBe(messages['TITLES.not_found']);
  });

  it('/clubs/:id uses TITLES.not_found for a bad or missing club, and rethrows other failures', async () => {
    const params = (id: string) => ({ params: Promise.resolve({ id }) });
    expect((await clubDetail(params('not-uuid'))).title).toBe(messages['TITLES.not_found']);
    getClub.mockRejectedValueOnce(Object.assign(new Error('nope'), { status: 404 }));
    expect((await clubDetail(params('3f2b8c1e-9a4d-4e7b-8c5f-1a2b3c4d5e70'))).title).toBe(messages['TITLES.not_found']);
    getClub.mockRejectedValueOnce(Object.assign(new Error('down'), { status: 503 }));
    await expect(clubDetail(params('3f2b8c1e-9a4d-4e7b-8c5f-1a2b3c4d5e71'))).rejects.toThrow('down');
  });
});

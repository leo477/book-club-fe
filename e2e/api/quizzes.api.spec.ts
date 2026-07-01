import { test, expect, loadRunContext } from '../fixtures/api-context.fixture';
import { addQuizQuestion, createQuiz } from '../fixtures/seed-helper';

test.describe('quizzes API — reads on the shared seeded quiz', () => {
  test('GET /clubs/{club_id}/quizzes — 200 list', async ({ memberApi }) => {
    const runContext = loadRunContext();
    const resp = await memberApi.get(`/clubs/${runContext.clubId}/quizzes`);
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.some((q: { id: string }) => q.id === runContext.quizId)).toBe(true);
  });

  test('GET /quizzes/{quiz_id} — 200', async ({ memberApi }) => {
    const runContext = loadRunContext();
    const resp = await memberApi.get(`/quizzes/${runContext.quizId}`);
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body).toHaveProperty('id', runContext.quizId);
  });

  test('GET /quizzes/{quiz_id}/questions — 200', async ({ organizerApi }) => {
    const runContext = loadRunContext();
    const resp = await organizerApi.get(`/quizzes/${runContext.quizId}/questions`);
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body.some((q: { id: string }) => q.id === runContext.questionId)).toBe(true);
  });
});

test.describe('quizzes API — role enforcement', () => {
  test('POST /clubs/{club_id}/quizzes — 403 for a member', async ({ memberApi }) => {
    const runContext = loadRunContext();
    const resp = await memberApi.post(`/clubs/${runContext.clubId}/quizzes`, { data: { title: 'Member Quiz' } });
    expect(resp.status()).toBe(403);
  });

  test('PATCH /quizzes/{quiz_id} — 403 for a member', async ({ memberApi }) => {
    const runContext = loadRunContext();
    const resp = await memberApi.patch(`/quizzes/${runContext.quizId}`, { data: { title: 'Hacked' } });
    expect(resp.status()).toBe(403);
  });

  test('PATCH /quizzes/{quiz_id}/active — 403 for a member', async ({ memberApi }) => {
    const runContext = loadRunContext();
    const resp = await memberApi.patch(`/quizzes/${runContext.quizId}/active`, { data: { isActive: true } });
    expect(resp.status()).toBe(403);
  });

  test('POST .../questions — 403 for a member', async ({ memberApi }) => {
    const runContext = loadRunContext();
    const resp = await memberApi.post(`/quizzes/${runContext.quizId}/questions`, {
      data: { question: 'Member question?', options: ['A', 'B'], correctIndex: 0 },
    });
    expect(resp.status()).toBe(403);
  });

  test('POST .../sessions — 403 for a member', async ({ memberApi }) => {
    const runContext = loadRunContext();
    const resp = await memberApi.post(`/quizzes/${runContext.quizId}/sessions`, { data: {} });
    expect(resp.status()).toBe(403);
  });
});

test.describe('quizzes API — full lifecycle on a throwaway quiz', () => {
  test('create quiz, add/edit/reorder/delete questions, activate, submit attempt, session + leaderboard + close', async ({
    organizerApi,
    memberApi,
  }) => {
    const runContext = loadRunContext();

    const quiz = await createQuiz(organizerApi, runContext.clubId, { title: `Lifecycle Quiz ${Date.now()}` });
    const q1 = await addQuizQuestion(organizerApi, quiz.id, {
      question: 'Q1?',
      options: ['A', 'B', 'C'],
      correctIndex: 0,
    });
    const q2 = await addQuizQuestion(organizerApi, quiz.id, {
      question: 'Q2?',
      options: ['A', 'B', 'C'],
      correctIndex: 1,
    });

    const editResp = await organizerApi.patch(`/quizzes/${quiz.id}/questions/${q1.id}`, {
      data: { question: 'Q1 edited?' },
    });
    expect(editResp.status()).toBe(200);

    const reorderResp = await organizerApi.put(`/quizzes/${quiz.id}/questions/order`, {
      data: { order: [String(q2.id), String(q1.id)] },
    });
    expect(reorderResp.status()).toBe(204);

    const activateResp = await organizerApi.patch(`/quizzes/${quiz.id}/active`, { data: { isActive: true } });
    expect(activateResp.status()).toBe(200);

    const attemptResp = await memberApi.post(`/quizzes/${quiz.id}/attempts`, { data: { answers: [1, 0] } });
    expect(attemptResp.status()).toBe(201);
    const attempt = await attemptResp.json();
    expect(attempt).toHaveProperty('score');

    const sessionResp = await organizerApi.post(`/quizzes/${quiz.id}/sessions`, { data: {} });
    expect(sessionResp.status()).toBe(201);
    const session = await sessionResp.json();

    const activeSessionResp = await memberApi.get(`/quizzes/${quiz.id}/sessions/active`);
    expect(activeSessionResp.status()).toBe(200);

    const leaderboardResp = await memberApi.get(`/quizzes/${quiz.id}/sessions/${session.id}/leaderboard`);
    expect(leaderboardResp.status()).toBe(200);
    const leaderboard = await leaderboardResp.json();
    expect(leaderboard).toHaveProperty('entries');

    const memberClose = await memberApi.patch(`/quizzes/${quiz.id}/sessions/${session.id}/close`);
    expect(memberClose.status()).toBe(403);

    const closeResp = await organizerApi.patch(`/quizzes/${quiz.id}/sessions/${session.id}/close`);
    expect(closeResp.status()).toBe(204);

    const deleteQuestionResp = await organizerApi.delete(`/quizzes/${quiz.id}/questions/${q2.id}`);
    expect(deleteQuestionResp.status()).toBe(204);
  });
});

# Bug Report — Book Club App Audit

**Date:** 2026-05-15
**URL:** https://book-club-l7xs8u371-dmytros-projects-ad22eb22.vercel.app/
**Test user:** test123@mail.com
**Club owner account:** terrtr

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 0 |
| Medium | 0 |
| Low | 5 |
| **Total** | **5** |

## LOW (5)

| # | Route | Type | Description |
|---|-------|------|-------------|
| 1 | `/clubs/:id/quizzes/:quizId` | ui-missing | Skipped: no quiz ID discovered (no quizzes in owned club) |
| 2 | `/clubs/:id/quizzes/:quizId/preview` | ui-missing | Skipped: no quiz ID |
| 3 | `/clubs/:id/quizzes/:quizId/edit` | ui-missing | Skipped: no quiz ID |
| 4 | `/clubs/:id/quizzes/:quizId/session` | ui-missing | Skipped: no quiz ID |
| 5 | `/clubs/:id/quizzes/:quizId/leaderboard` | ui-missing | Skipped: no quiz ID |

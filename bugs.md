# Bug Report — Book Club App Audit

**Date:** 2026-05-11
**URL:** https://book-club-l7xs8u371-dmytros-projects-ad22eb22.vercel.app/
**Test user:** test123@mail.com
**Club owner account:** terrtr

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 2 |
| Medium | 5 |
| Low | 6 |
| **Total** | **13** |

## HIGH (2)

| # | Route | Type | Description |
|---|-------|------|-------------|
| 1 | `/clubs/2affc525-02bb-4fc6-a2c3-99baad3c5773/events/create (functional)` | functional | Create event did not redirect to event detail after submit |
| | | | **Detail:** Submit button was disabled — address/city field may be required |
| 2 | `/events/6b51cbf4-cb77-4a16-a41f-e10648aa6055/edit (functional)` | functional | Title input not found on event edit page |

## MEDIUM (5)

| # | Route | Type | Description |
|---|-------|------|-------------|
| 1 | `/register (functional)` | functional | Registration succeeds but does not auto-redirect to app — user sees a success card and must manually go back to login, despite being authenticated |
| 2 | `/login (wrong-password)` | functional | Login with wrong password stayed on login page but showed no error message to user |
| 3 | `/logout (functional)` | functional | Logout button not found after opening avatar dropdown — data-testid="logout" not present or dropdown did not open |
| 4 | `/clubs/2affc525-02bb-4fc6-a2c3-99baad3c5773/quizzes/create (functional)` | functional | Publish button not found after adding a question in quiz create step 2 |
| 5 | `/quizzes/:id/edit (functional)` | functional | Skipped: no quiz ID available |

## LOW (6)

| # | Route | Type | Description |
|---|-------|------|-------------|
| 1 | `/clubs/:id/quizzes/:quizId` | ui-missing | Skipped: no quiz ID discovered (no quizzes in owned club) |
| 2 | `/clubs/:id/quizzes/:quizId/preview` | ui-missing | Skipped: no quiz ID |
| 3 | `/clubs/:id/quizzes/:quizId/edit` | ui-missing | Skipped: no quiz ID |
| 4 | `/clubs/:id/quizzes/:quizId/session` | ui-missing | Skipped: no quiz ID |
| 5 | `/clubs/:id/quizzes/:quizId/leaderboard` | ui-missing | Skipped: no quiz ID |
| 6 | `/quizzes/:id (toggle-active)` | functional | Skipped: no quiz ID available |

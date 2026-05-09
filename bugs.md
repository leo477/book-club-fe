# Bug Report — Book Club App Audit

**Date:** 2026-05-09
**URL:** https://book-club-ad4f6eoiq-dmytros-projects-ad22eb22.vercel.app/
**Test user:** test123@mail.com
**Club owner account:** terrtr

## Summary

| Severity | Count |
|----------|-------|
| Critical | 0 |
| High | 2 |
| Medium | 4 |
| Low | 1 |
| **Total** | **7** |

## HIGH (2)

| # | Route | Type | Description |
|---|-------|------|-------------|
| 1 | `/clubs/efc6aa3b-14e7-4a6e-ba2e-8a8e3eae5dc9/quizzes/7e0110f8-b393-4320-a279-24afc3dd81a8/session` | console-error | Failed to load resource: the server responded with a status of 404 () |
| 2 | `/clubs/efc6aa3b-14e7-4a6e-ba2e-8a8e3eae5dc9/quizzes/7e0110f8-b393-4320-a279-24afc3dd81a8/leaderboard` | console-error | Failed to load resource: the server responded with a status of 404 () |

## MEDIUM (4)

| # | Route | Type | Description |
|---|-------|------|-------------|
| 1 | `/events/:id` | ui-missing | Skipped: no event ID discovered (no events in API response) |
| 2 | `/clubs/efc6aa3b-14e7-4a6e-ba2e-8a8e3eae5dc9/quizzes/7e0110f8-b393-4320-a279-24afc3dd81a8/session` | nav-404 | HTTP 404 — https://book-club-be.onrender.com/api/v1/quizzes/7e0110f8-b393-4320-a279-24afc3dd81a8/sessions/active |
| 3 | `/clubs/efc6aa3b-14e7-4a6e-ba2e-8a8e3eae5dc9/quizzes/7e0110f8-b393-4320-a279-24afc3dd81a8/leaderboard` | nav-404 | HTTP 404 — https://book-club-be.onrender.com/api/v1/quizzes/7e0110f8-b393-4320-a279-24afc3dd81a8/sessions/active |
| 4 | `/clubs/efc6aa3b-14e7-4a6e-ba2e-8a8e3eae5dc9/randomizer` | ui-missing | Spin button not found on randomizer page |

## LOW (1)

| # | Route | Type | Description |
|---|-------|------|-------------|
| 1 | `theme-toggle` | ui-missing | Theme toggle button not found in header |

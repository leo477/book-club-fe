# Rollout payloads (SCRUM-115 clock)

Five cumulative Edge Config writes for the 10 % -> 100 % schedule. Tickets: SCRUM-187 (preconditions), SCRUM-188 to SCRUM-192 (waves 1 to 5). Rules, stop criteria and rollback are in `../OWNER-ROLLOUT-CHECKLIST.md`; this folder only holds the bodies.

| File | Ticket | Target date | Result |
| --- | --- | --- | --- |
| `wave-1.json` | SCRUM-188 | 2026-10-25 | public read routes (7) 50 %, rest 10 % |
| `wave-2.json` | SCRUM-189 | 2026-10-28 | public 100 %, profile/support/auth (6) 50 % |
| `wave-3.json` | SCRUM-190 | 2026-10-31 | profile/support/auth 100 %, organizer + quizzes (13) 50 % |
| `wave-4.json` | SCRUM-191 | 2026-11-03 | organizer + quizzes 100 %, `/chats` 50 %, `shell.chatWidget` 10 % |
| `wave-5.json` | SCRUM-192 | 2026-11-06 | `/chats` and `shell.chatWidget` 100 % |

Each file is the full body for `vercel edge-config update` (the item is replaced, so every route is listed). The `version` values 11 to 15 assume the item is at 10 now; before each write re-read the item and, if the version moved, set `version` to current + 1. Also confirm the previous wave's routes in the live item match the previous file (nobody changed a route by hand).

```sh
vercel edge-config items book-club-strangler --key strangler   # confirm version and routes
vercel edge-config update book-club-strangler --patch "$(cat docs/migration/rollout-payloads/wave-1.json)"
curl -s https://book-club-planer.vercel.app/strangler.json     # wait 1 to 5 s, version must match
```

Wait at least 72 h between writes and check the stop criteria first. Auth routes (`/login`, `/register`, `/auth/callback`) always carry the same value in one write. Roll a single route back by setting it to `{"target":"legacy","percent":0}` in a copy of the file; the global kill is `enabled:false`.

Log every write in the table at the bottom of `../OWNER-ROLLOUT-CHECKLIST.md`.

# R12 parity report: chat widget (shell) and `/chats`

Run 2026-10-12, branch `feat/SCRUM-44-web-chat`, agent: react-tester. Jira SCRUM-44, round R12. Surfaces: the floating chat widget in the shell (Edge Config flag `shell.chatWidget`), the `/chats` page, and the realtime WebSocket (`/chat/rooms/:id`).

## Method and limits (read first)

| Thing | Value |
| --- | --- |
| New files | `e2e/parity/r12-chat.spec.ts` (71 tests per target), `e2e/parity/r12/fixtures.ts` (REST + WebSocket mock), `e2e/parity/r12/edge-config-server.mjs` (local Edge Config stub). **The same spec runs on Angular and Next**; shared locators are roles, aria-labels (`Open chat`, `Close chat`, `Back`), the composer placeholder, `role=log`, `data-testid=logout` and uk/en text. What differs by design is branched on the project name and listed as D-N below. |
| REST mock | Every `/api/v1` call is fulfilled by `page.route`: `/auth/me`, `/auth/refresh`, `/auth/session-status`, `/auth/logout` (turns the viewer into a guest), `POST /auth/ws-ticket` (a new `ticket-N` per call, kept in `mock.tickets`), `/clubs/my` (optionally held N ms), `/clubs/:id/chat/rooms`, `/chat/rooms/:id/messages` (GET with `before_id` or `before` paging and `limit`; POST appends and echoes on the socket), `/unread-count`, `/read`. Everything else falls through to the R6 handler. **No real backend, account or credential was used.** |
| WebSocket mock | `page.routeWebSocket(/\/chat\/rooms\/[^/?]+$/)` (so Next's `NEXT_PUBLIC_WS_URL` host and Angular's `wss://book-club-be.onrender.com/api/v1` are both served; Next dev's HMR socket is left alone). It speaks the real protocol: waits for `{type:'auth', ticket}`, then sends `presence_snapshot`. Modes: `ok`, `refuse` (close 1011 before answering auth = a pre-auth failure), `kick` (answer auth, then close 1008). Helpers: `push` (message frame from another user), `frame` (any frame, e.g. `error`), `drop` (server closes every socket abruptly, code 1011). Bookkeeping per socket: room, url, ticket used, authed, closed, close code. |
| Enabling `shell.chatWidget` in dev | The flag is read from Edge Config (`readState(bucket, SHELL_FLAGS)` in `app/layout.tsx`) and falls to **off** when Edge Config is unreachable, which is what R5-R11 specs rely on (they never needed it). It **can be enabled in `next dev` without any app change**: `@vercel/edge-config` accepts an "external" connection string, so `e2e/parity/r12/edge-config-server.mjs` (port 9944) serves `/ecfg_parity/items` and `/item/strangler` with every manifest route at 100 % to Next and `shell.chatWidget` at 50 %, and the dev server is started with `EDGE_CONFIG='http://localhost:9944/ecfg_parity?token=t'`. The spec pins the `bc_bucket` cookie: **10 = flag on, 90 = flag off**, so one server covers both states. `PARITY_R12_FLAG=0` skips the Next tests that need the stub (for a server without it). |
| Next target | `node e2e/parity/r12/edge-config-server.mjs &` then `cd apps/web && BACKEND_ORIGIN=https://localhost:9922 NEXT_PUBLIC_OAUTH_BASE_URL=https://backend.example.test/api/v1 NEXT_PUBLIC_WS_URL=wss://book-club-be.onrender.com/api/v1 EDGE_CONFIG='http://localhost:9944/ecfg_parity?token=t' npx next dev -p 3100`. Dev, not a production build. **Environment trap found:** `packages/i18n/dist/*.icu.json` is a generated file and was stale (no `CHAT.open_unread` etc.), so the first run showed the raw key `CHAT.open_unread` as the FAB's accessible name; `npm run build` in `packages/i18n` regenerates it (dist is not tracked). |
| Angular target | deployed `https://book-club-planer.vercel.app` (reachable) with `PARITY_LEGACY_BYPASS_CSP=1`; its API calls and WebSocket are mocked. Its chat is the old widget. |
| Commands | `PARITY_NEXT_URL=http://localhost:3100 npx playwright test --config=playwright.parity.config.ts e2e/parity/r12-chat.spec.ts --project=next` and `PARITY_LEGACY_URL=https://book-club-planer.vercel.app PARITY_LEGACY_BYPASS_CSP=1 npx playwright test --config=playwright.parity.config.ts e2e/parity/r12-chat.spec.ts --project=legacy` |
| Offline / hidden | `context.setOffline` does not touch a mocked WebSocket, so the server side is dropped explicitly (`mock.drop()`) together with `setOffline(true/false)`. A hidden tab is `document.hidden`/`visibilityState` redefined plus a `visibilitychange` event; sleep and backoff use `page.clock` (`fastForward`). |
| Results (final runs) | **Next: 66 passed, 4 failed, 1 skipped** (71). The 4 failures are all the same finding: axe `scrollable-region-focusable` (serious) on the open widget, uk/en x light/dark, D-N-A below; the skipped test is the Angular-only L-1. **Angular: 65 passed, 0 failed, 6 skipped** (the 3 flag-off tests, 2 Next-only resume tests, 1 widget paging test that cannot work there). Axe on Angular is recorded, not a gate. |
| NOT run | Production `next build` + `next start`, any Vercel preview, Lighthouse/Speed Insights (P9), canary (P10), a real backend (real WS ticket single-use semantics, real 1008, real rate limit), a real mobile device or a real tab going to the background, screen-reader pass, keyboard-only journey of the widget beyond Escape, message delete/ban, room create/delete, event-room creation, the audio beep (not observable), notification toasts content for uk, a user with several clubs (room names prefixed with the club), unit tests (`apps/web/src/features/chat/*.test.tsx`: not re-run by this task). `e2e/ui/*` does not exist; this spec stands in. |

## P1 to P12

| # | Verdict | Evidence |
| --- | --- | --- |
| P1 URLs | PASS | `/chats` as a guest ends on `/login` without `returnUrl`, with zero chat calls, zero tickets and zero sockets (both). `/clubs` as a guest has no widget and no chat call (both). Flag off (Next): the R5 `ChatLink` is a link to `/chats`, and it still reaches a working page (the page is active without the flag). The FAB is hidden on `/clubs/:id` by design on Next (code), not exercised. |
| P2 Data / HAR | PASS with D-N1, D-N2, D-N6 | Wire shape is identical: `POST /auth/ws-ticket` once per connection attempt, first frame `{type:'auth', ticket}`, ticket never in the URL, socket path `wss://book-club-be.onrender.com/api/v1/chat/rooms/:id`, send is `POST /chat/rooms/:id/messages {text}` (the socket is receive-only), read is `POST /chat/rooms/:id/read {last_read_message_id}`. Deltas: Next fetches `/unread-count` for every room at load, Angular only on `/chats` (D-N1); the older-page query is `before_id` on Next and **`before` on Angular, which the backend does not know** (L-2); Angular does not refill the gap after a reconnect, Next re-reads the latest page (D-N6). |
| P3 States | PASS | Optimistic bubble and echo: exactly one bubble whether the echo arrives 700 ms later, never, or twice (same id); empty/whitespace text is not sent (both). Rooms request 500/503 on `/chats`: no crash and no socket on both, Next shows "Something went wrong" with a "Try again" button. No rooms: empty state, no socket, no ticket (both). Malformed frames: Next ignores all three (contract mismatch, unknown type, non-JSON) and renders the next good message; **Angular stops rendering later messages after a message frame whose payload breaks the contract** (D-N8, one of the three variants). |
| P4 Auth | PASS | Guest: nothing connects (see P1). Logout from the user menu closes every socket, clears the chat UI and removes the FAB; nothing reconnects in the next 1.5 s (both). |
| P5 i18n | PASS (mock) | FAB name, placeholder, close label in uk and en on both; Next also localizes the reconnect notice (uk "Перепідключення…"), the stopped/lost notices and the error-frame messages in `packages/i18n/overrides`; Angular has no such strings (D-N3, D-N4, D-N5). |
| P6 SEO | NOT RUN | Authenticated surface. |
| P7 A11y | PARTIAL: Next 8/12 clean, 4 serious | axe `wcag2a,wcag2aa,wcag22aa`, 3 views (open widget, widget room list, `/chats`) x uk/en x light/dark = 12 runs per target. **Next: widget room list and `/chats` clean in all 8 runs; open widget fails 4/4 with `scrollable-region-focusable` (serious, 1 node, the message list `.overflow-y-auto` with `role=log`)**: D-N-A. No `color-contrast` violation on Next. **Angular (recorded): `color-contrast` serious on `/chats` light (3 nodes) and dark (2), widget room list light (3), open widget light (1); none in dark for the widget views; no scrollable-region finding** (its list is clipped instead of scrollable, L-1). |
| P8 Visual | PARTIAL | `/chats` and the open widget at 375/768/1280 px x light/dark per target (12 screenshots per target in `playwright-report/parity/r12/`, not committed, not diffed): no horizontal page scroll, composer reachable on `/chats`, widget panel inside the viewport at every width (a 900-character unbroken word does not widen it). None of the screenshots was eyeballed or diffed (only the Angular overflow case, L-1, was looked at). |
| P9 Perf | NOT RUN | Needs a production build. The chat code is split: the widget, audio and WebSocket client load only for a signed-in viewer with the flag (or on `/chats`); with the flag off and no session, the bundle only has `ChatLink` (code reading). |
| P10 Analytics | NOT RUN | |
| P11 Errors | PASS (mock) | Console error / `pageerror` watch is empty on Next in: FAB open/close, room switch, all four error frames, malformed frames, XSS payloads, `/chats` journey, the 1.5 s delayed `/clubs/my` journey. |
| P12 E2E | PARTIAL | Same spec on both; green on Angular, green on Next apart from D-N-A. |

### Realtime behaviour (the R12 acceptance points)

| Check | Next | Angular |
| --- | --- | --- |
| Connects after load with a fresh ticket, auth frame, presence snapshot | yes, 1 socket, room of the first room | yes, same |
| Room switch | old socket closed, **1 open socket**, new socket with a new ticket, frames of the room left do not show | same |
| Offline then online (server side dropped) | "Reconnecting…" shown, reconnects right at `online`, new ticket, 1 open socket | reconnects on its own backoff, new ticket, 1 open socket; no notice |
| Reconnect refills what was missed | yes (re-reads the latest page) | **no**, the missed message stays missing (D-N6) |
| Tab asleep > 30 s then visible | reconnects with a new ticket and closes the stale socket | **keeps the same socket** (`1:ticket-1:open`) |
| Short hide (< 30 s), healthy socket | no new socket, no new ticket | not run |
| Drop while hidden then visible | immediate reconnect | not run |
| Ticket per reconnect | every socket authenticated with a distinct, mock-issued ticket (asserted after every scenario) | same in the scenarios run |
| Repeated pre-auth failures | gives up after exactly 6 sockets/6 tickets, notice "Live updates are off." + Retry; no more attempts for 120 s; Retry (with the mock healthy) opens a socket and clears the notice | **never gives up**: 42 sockets and 42 tickets over ~400 s of fake time, no notice, no Retry (D-N3) |
| 1008 after auth | one socket only, notice "The server ended this chat session. You may have lost access." + Retry, Retry reconnects | **reconnects at once, 6 sockets/6 tickets in 6 s**, no notice (D-N4) |
| Error frames `RATE_LIMITED`, `ROOM_BANNED`, `INVALID_MESSAGE`, unknown code | toast with the localized text each; the socket survives | nothing shown (D-N5); the socket survives |
| Leaving the chat | flag off + `/chats` then a client navigation to `/clubs`: **0 open sockets** | n/a (the widget stays mounted) |
| Logout | all sockets closed, no reconnect | same |
| 1.5 s delayed `/clubs/my` | no `Maximum update depth`, timer keeps ticking (page responsive), `/clubs/my` <= 3 calls, rooms <= 3, <= 2 sockets, widget works afterwards; same on `/chats` | same bounds hold |

## Defects and deltas

New defects on Next (proposed Jira Bugs under SCRUM-5, labels `R12` `react-migration`, **not created**):

| ID | Severity | Finding |
| --- | --- | --- |
| **D-N-A** | medium (a11y, WCAG 2.1.1 / axe serious) | **The widget's message list is a scrollable region that cannot be reached by keyboard.** `apps/web/src/features/chat/chat-message-list.tsx` renders `<div role="log" aria-live="polite" className="... overflow-y-auto">` with no `tabIndex={0}`; once the list overflows the 480 px panel a keyboard user cannot scroll history (and older-history paging triggers on scroll). Repro: `PARITY_NEXT_URL=http://localhost:3100 npx playwright test --config=playwright.parity.config.ts e2e/parity/r12-chat.spec.ts --project=next -g "axe widget "` (4 failures, `scrollable-region-focusable`). Not seen on `/chats` or the room list. Plan gate is "axe 0 serious". Suggested fix: `tabIndex={0}` (plus an accessible name) on the log when it scrolls. |

No other defect was found on Next: no console error, no duplicate request, no render loop, no leaked socket, in 71 journeys. **No non-test source in `apps/web`, `packages` or `src/` was modified.** (`packages/i18n` `npm run build` regenerated an untracked dist file only.)

Legacy (Angular) defects observed (not regressions; for the record, proposed Bugs only if Angular is to be fixed before the cutover):

| ID | Finding |
| --- | --- |
| L-1 | **With about 50 messages the widget panel clips the conversation**: the message list host is as tall as its content (4076 px in a 478 px panel), it never scrolls, the newest messages and the composer fall outside the panel, and older history cannot be paged from the widget. Pinned by an Angular-only test. The same list scrolls correctly on `/chats` and in the Next widget. |
| L-2 | Older-history requests use `?before=<id>`; the backend (`app/routers/chat.py`) takes `before_id`, so the real server ignores it and answers with the latest page again (the mock accepts both). Next sends `before_id`. |

Deliberate deltas (Next vs Angular), asserted per target in the spec:

| ID | Kind | Delta |
| --- | --- | --- |
| D-N1 | improvement | Server unread counts are read at load for every room, so the FAB badge, the "Open chat, N unread" accessible name and the sidebar are right on any page; Angular fetches `/unread-count` only on `/chats`, so its widget FAB never shows server counts (only live increments). Opening a room posts `/read` with the newest id and drops the badge by that room's count. |
| D-N2 | improvement | `Escape` closes the panel and returns focus to the FAB on Next; on Angular `Escape` does nothing (panel stays open). |
| D-N3 | improvement | Next stops after 6 consecutive pre-auth failures and shows "Live updates are off." with Retry; Angular retries forever and says nothing. |
| D-N4 | improvement | A close with 1008 after auth is terminal on Next (notice + Retry); Angular reconnects immediately (a banned or removed user keeps hitting the server). |
| D-N5 | improvement | Error frames (`RATE_LIMITED`, `ROOM_BANNED`, `INVALID_MESSAGE`, anything else) become localized toasts on Next; Angular ignores them. |
| D-N6 | improvement | After a reopen Next re-reads the latest page and merges it; Angular leaves a gap. A tab asleep > 30 s forces a reconnect on Next; Angular keeps a possibly dead socket. |
| D-N7 | info | Next presence dot is `role=img` named "Online"; Angular's is a decorative green dot. |
| D-N8 | improvement | Next ignores any frame that does not match the contract and keeps rendering; **Angular stopped rendering later messages after a message frame with a broken payload** (the other two bad-frame variants were ignored by both). Not narrowed further. |
| D-N9 | info | Flag-off Next shows a plain link to `/chats` (R5 `ChatLink`) with no network traffic; there is no Angular equivalent. |

## Tests added

- `e2e/parity/r12/fixtures.ts`: REST + WebSocket mock with ticket and socket bookkeeping, modes `ok`/`refuse`/`kick`, push/frame/drop helpers, held `/clubs/my`, forced failures per key.
- `e2e/parity/r12/edge-config-server.mjs`: local Edge Config stub (external connection string) used to turn `shell.chatWidget` on in `next dev`; per-viewer state by `bc_bucket`.
- `e2e/parity/r12-chat.spec.ts` (71 tests per target): guest guard (3); flag off (3, Next); widget: FAB/badge/open/close/read, Escape, send with delayed, absent and duplicate echo, empty text, live message and closed-widget badge, own frame, older paging in widget and on `/chats`, L-1; socket lifecycle: handshake and ticket, room switch, presence, offline/online and gap refill, 30 s sleep, short hide, drop while hidden, give-up + Retry, 1008 + Retry, 4 error frames, 3 malformed frames, duplicate frame, logout; XSS (message text, sender name, room name, 900-char word); `/chats`: journey with switch/send/live/badge, no rooms, rooms 500/503, scroll anchor after older paging; i18n uk/en; the 1.5 s delayed `/clubs/my` journey (widget and `/chats`); axe 3 views x uk/en x light/dark (12); `/chats` and the open widget at 3 widths x light/dark with screenshots (12).

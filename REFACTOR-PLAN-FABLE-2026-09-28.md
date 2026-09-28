# Refactor Plan — Fable 5 Analysis (2026-09-28)

Source: architectural analysis run via a claude-fable-5 agent against `src/app/**`.

## Phase 1 — High impact (1–4) — DONE, committed 2026-09-28
- Collapsed overlapping Playwright audit configs → `audit:full` only.
- Removed dead `/manage` route + duplicate `club-create-form`.
- Extracted `ChatAudioAlertService` and generic `TtlCache<T>` out of god services.
- Extracted `TypeaheadComboboxBase` for address/book autocomplete.
- Commits: "docs: archive stale audit/plan documents", "refactor: split god services, remove dead /manage route, dedupe combobox logic".

## Phase 2 — Medium impact (5–9) — IN PROGRESS

### Item 5 — Consistent resource()/rxResource() usage
- `club-detail.component.ts`, `event-detail.component.ts`, `edit-club.component.ts` still use raw `.subscribe()`/`firstValueFrom` for data fetching, unlike quiz/events which use `resource()`.
- Migrate these three components' primary data-fetch calls to `rxResource()` (HttpClient Observable loader), matching the pattern in `quiz-detail-base.component.ts` / `leaderboard-base.component.ts`.
- Preserve existing loading/error-state UI behavior exactly — this is a mechanical migration, not a UX change.

### Item 6 — Split oversized templates
- `club-manage.component.html` (406 lines) and `.ts` (260 lines): extract sub-components following the pattern already used in `club-detail/` (header/members/manage-panel/sidebar split).
- `chat-widget.component.html` (334 lines): split into message-list, composer, and header sub-components.
- `header.component.html` (328 lines): extract nav-links and mobile-sheet sections into sub-components if it can be done without behavior change.
- No behavior change — pure structural decomposition.

### Item 7 — Test coverage for event-countdown
- `event-countdown.component.ts` has real day/hour/minute/second diff logic inside an `effect()` + `setInterval`, with zero test coverage.
- Add a spec using fake timers: assert countdown text at various time deltas, and the zero/negative-diff edge case.

### Item 8 — Remove audit-evidence binaries from git
- `audit-evidence/*.png` and `audit-evidence/audit-prod-results.json` are tracked but are throwaway manual-audit output.
- `git rm -r --cached audit-evidence` and add `/audit-evidence/` to `.gitignore`.

### Item 9 — Archive mobile app plan
- Move `PLAN-MOBILE-APP-2026-07-15.md` to `docs/archive/` to match the existing convention (it's an untracked historical plan, not yet acted on — confirm with repo owner before archiving if still active).

## Execution model
3–5 rounds of `dev` (implement/fix) → `reviewer` (review) via the book-club-agents MCP server, orchestrated by Claude. Items 5 and 6 carry real behavior-change risk (async timing, template restructuring) so extra rounds are expected there. Commit after final approval, under the repo owner's git identity.

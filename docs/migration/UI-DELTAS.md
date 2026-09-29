# UI deltas: Spartan helm (Angular) vs shadcn/Radix (apps/web)

Reference: `src/app/shared/spartan` (read-only). Review surface: `/__ui` (dev only, 404 in production).

| Primitive | Delta | Why unavoidable / accepted |
|---|---|---|
| Button / Badge / Tabs / Sheet | Disabled and open/active states come from native `disabled` and Radix `data-state` instead of helm's `data-disabled` / `data-active`; class output is otherwise identical. | Different state hooks in Radix vs brain. |
| Button | Invalid ring uses `aria-invalid`, not `data-matches-spartan-invalid`. | brain form-state attribute has no React counterpart; `Field invalid` sets `aria-invalid` on the control. |
| Button / Icons | Icons are lucide-react SVGs sized via `[&_svg]` (size-4, size-3 for xs) rather than ng-icon; `has-data-[icon=...]` padding needs `data-icon` on the svg, `in-data-[slot=button-group]` rounding is omitted (no button-group yet). | ng-icon/ButtonGroup not ported. |
| Card | Card sub-parts are plain divs, not `[hlmCard]` directive hosts. | React has no attribute directives. |
| Field | Error/description ids are `useId`-based, not `hlm-field-error-N`; there is no form-library binding, so invalidity is an explicit `invalid` prop on `Field` (Angular derives it from control validators). Fieldset/legend/separator parts are not ported (unused). | No brain FieldA11yService; react-dev wires `invalid` from the chosen form state. |
| Sheet | Close button is a Radix `Close` wrapping the ghost `icon-sm` Button; label defaults to "Close" but is overridable via `closeLabel` (Angular hardcodes English). Focus trap/Escape/focus-return come from Radix Dialog (equal or better than brain). Overlay/animation classes identical; animation runtime is tw-animate-css vs Angular CDK. | Radix behaviour. |
| Sonner | Same package (sonner) and options: bottom-right, rich colors, duration 4000, 3 visible, Alt+T hotkey, popover tokens. Toaster `theme` follows the `theme` cookie value (`system` respected) whereas Angular passes the fixed default `light` prop and relies on token variables. Icons are lucide-react at size-4 (Angular: text-base = 16px, identical). | Theme wiring in Providers. |
| Spinner | Same classes/role/label; loader icon rendered as lucide `Loader2Icon` at `1em`. | ng-icon to SVG. |
| Tabs | Radix roving tabindex + automatic activation; brain default activation mode is also automatic. Manual activation not needed. | none |
| Separator | Radix uses `data-orientation`; `decorative` defaults to true (role=none) whereas brain renders role=separator by default. | Purely decorative in all current uses. |
| Tokens | Colors/radius come from `packages/config/tailwind-theme.css`, identical to Angular; light and dark are class-based (`.dark`). | none |
| Fonts/rendering | Inter (300-700), Playfair Display (400/600/700) and Cinzel (700/900) load via `next/font/google` (self-hosted, `display: swap`, CSS variables on `<html>` feeding `font-sans`/`font-display`/`font-fantasy`); Angular pulls the same families from Google Fonts CSS at runtime. Sub-pixel rendering and the swap moment can differ. | Font loading strategy. |
| Fonts / glyph gaps | Subsets are `latin` + `cyrillic` for Inter and Playfair Display; Cinzel only ships `latin` (Google has no Cyrillic for it), so Cyrillic in `font-fantasy` text (logo, page titles in uk) falls back to `serif`, exactly as in Angular. Latin-ext, Vietnamese and Greek glyphs are not loaded (Angular's unicode-range CSS would fetch them on demand); such characters fall back to system fonts. | next/font subsets are explicit; add `latin-ext` if a locale needs it. |

## Behavioural deltas found in the R5 review (apps/web, clubs list and shell)

| Area | Delta | Why |
|---|---|---|
| Join on the clubs list (HAR allowlist) | After a successful `POST /clubs/:id/join` Next invalidates `['clubs','my']`, so the browser issues one extra `GET /clubs/my` per successful join. Angular does not refetch after joining (`ClubService.joinClub` only drops its per-club cache). **Intentional; add the extra `GET /clubs/my` to the HAR allowlist.** Only the my-clubs key is invalidated: the public list is not refetched. | A pending request or direct join changes `/clubs/my`; the alternative is a stale "Join" button until the next visit. |
| Join toast | No delta: `clubs-list.component` `onJoin` swallows errors ("handled in service") and `joinClub` shows no success toast; 5xx/timeouts toast through the interceptor, same as Next's `onError`. | - |
| Join spinners | Per-club, derived from the mutation cache (`useMutationState`), so two concurrent joins each keep their own spinner. Angular has a single `joiningClubId`, so a second click replaces the first spinner there. | Strictly better; visible only with concurrent clicks. |
| Card actions / tablist while the session resolves | Cards render an invisible fixed-height (`h-8`) action row and the tablist a `h-12` placeholder until `useSession` settles, so a signed-in user never sees the guest "log in to join" CTA. Guests see the CTA only after the session-status probe returns, and their list shifts up by the placeholder height once resolved. | Correctness over a flash of the wrong CTA. |
| Logout failure | If `POST /auth/logout` fails the user stays on the page with an error toast (5xx/timeouts are toasted once by the api client; other failures by the header) and is **not** redirected. Angular clears local state and navigates anyway. Success clears the session hint and the query cache before `/login`. | httpOnly cookies cannot be cleared client-side, so pretending to be logged out would leave a live session. |
| User menu | Radix `DropdownMenu` (arrow keys, typeahead, focus return, outside click, Escape) replaces the hand-rolled menu; no helm counterpart exists, so classes come from the legacy header menu. The menu chunk loads after the session resolves; until then an inert avatar placeholder reserves the space. | Accessibility and first-load size. |
| Theme toggle | Icon and accessible name switch through the `dark` class in CSS (both icons and both labels are in the DOM), so a system-theme page never flips them after hydration. `aria-pressed` and `title` were dropped. | No post-hydration flip. |
| Mobile sheet | The trigger is a plain button (`aria-haspopup="dialog"`); the Radix Dialog content is fetched on idle, pointer-enter or focus. Focus returns to the trigger on close. | First-load size. |
| Toasts | `sonner` and the Toaster mount on the first toast (api errors, logout failure); toasts raised before that are queued and delivered on mount. | First-load size. |
| Images | Club covers/avatars have explicit `width`/`height` and `referrerPolicy="no-referrer"`; the first row (4 cards) loads eagerly with `fetchpriority=high`. | CLS and referrer leakage to arbitrary image hosts. |

## Deltas from the final react-reviewer review (apps/web)

| Area | Delta | Why |
|---|---|---|
| Light-mode contrast (P7, intentional visual delta) | Primary button background `--primary` in light mode is `hsl(31 90% 34%)` (was `37%`): `#fff9f0` on it is 4.97:1 (was 4.33, needs 4.5). The mobile sheet title uses `--color-primary-700` in light mode: 5.94:1 on the sheet surface `#f2eade` (was 3.27 with `primary-600`). Dark theme unchanged. Overrides live in `apps/web/src/app/globals.css` only; `packages/config` and Angular are untouched, so Angular keeps 4.33 / 3.27 and the light visual snapshots of buttons and the sheet title differ slightly (a few percent darker). Angular can adopt the same two values later. | Owner decision: fix in Next only (WCAG AA). |
| Card actions while the session resolves | The pending state now shows the (outline) view link to `/clubs/{id}`, identical for every session, plus an invisible slot where the CTA lands. The server HTML therefore has crawlable detail links; members' view link changes from outline to solid once the session resolves (style only, no CTA flash). | SEO for club detail pages. |
| Session probe | `session-status` has a 4 s timeout; a timeout or failure resolves to guest and is cached for only 2 s (success: 30 s), so a blip cannot hide a session for 30 s and guests never wait on a hung backend to see CTAs and the header login/register buttons. | Robustness. |
| Errors | `app/error.tsx` and `app/global-error.tsx` show a localized generic message (`ERRORS.unexpected`) and a retry button (`ERRORS.retry`, added to `packages/i18n/overrides`); no message or stack is rendered. Lazy islands (user menu, club tabs, mobile sheet, toaster) fall back to their inert/plain UI if their chunk fails. Angular has no equivalent boundary. | Version-skew and network resilience. |
| Analytics | Custom events carry `app: 'next'` and the `bucket` cohort; see `CANARY-METRICS.md`. | Canary comparison. |

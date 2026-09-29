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
| Fonts/rendering | Sub-pixel text rendering may differ between Angular and Next (font loading strategy). | Out of scope for `ui`. |

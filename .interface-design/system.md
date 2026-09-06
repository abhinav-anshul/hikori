# Hikori — Interface Design System

Seeded from DESIGN.md and the audit/fix passes already run in this repo. This file is for `interface-design`'s own consistency checks when building new dashboard screens — DESIGN.md stays the canonical, human-maintained source; update both when a decision changes.

## Direction and feel

Dense, crisp professional tool — not playful, not spacious. References: **Linear** (density, muted palette, hover states), **Vercel dashboard** (forms/tables/empty states), **Raycast** (command surfaces, keyboard-first). Heuristic: "would this fit in Linear's app?" — if not, simplify. Marketing pages (outside `/dashboard`) are out of scope for this skill; `interface-design` governs dashboards, admin panels, settings, data views only.

## Depth strategy

**Borders + background contrast, not shadows.** Elevation comes from `border-border` against surface-color steps, not `box-shadow`. Shadows only on floating elements (popovers, dialogs) via the shadcn defaults; `shadow-sm` rarely, on resting cards.

**Concentric radius.** Outer container radius > inner card radius. Dashboard shell: `rounded-xl`. Cards nested inside it: `rounded-lg`. Never the same step on parent and child.

**Focus ring**: `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50` — soft glow, no `ring-offset`. This is the actual shipped convention (not a hard ring+offset) — apply it to any new interactive primitive.

## Spacing

Base unit 4px. Allowed steps: `1, 2, 3, 4, 6, 8, 12, 16` (4/8/12/16/24/32/48/64px). Skip 5/7/9/10/11. Micro half-steps `1.5` and `2.5` (6px/10px) are allowed for tight text stacks and chip padding only.

- Card padding: `p-6`. Dense row (list item): `p-4`.
- Section rhythm: `space-y-6` / `space-y-8`.
- Icon-only action rows (no borders): `gap-2` minimum — tighter risks mis-clicks, especially next to a destructive action.

## Hierarchy decisions

Type scale (role → size/weight/line-height): Display 36px/600/1.1 (marketing only) · H1 24px/600/1.2 · H2 18px/600/1.3 · H3 16px/600/1.4 · Body 14px/400/1.5 · Body emphasis 14px/500 · Caption 12px/400/1.4 · Button label 14px/500.

**Two metrics side by side are never equal weight.** Primary metric: `text-2xl font-semibold`. Secondary metric next to it: `text-lg font-semibold` — a real step down, not a color-only difference.

**One accent, used sparingly.** Primary green (`--primary`, `#03D37E`, hue ≈156°) is for CTAs, focus rings, active/selected states only. Feature teal (`--feature`, `#025964`, hue ≈209°) is for at most one hero/feature surface per page — never a substitute for `--primary`.

## Key component patterns

- **Button (default)** — 36px h (`h-9`) · `px-2.5` · `gap-1.5` · `rounded-md` · 14px/500 · focus ring per above. This is the primary-CTA height too — there is no larger "primary action" size in active use.
- **Input** — 36px h (`h-9`) · `rounded-md` · `border-input` · fill `bg-input/20` light / `dark:bg-input/30` dark (never `bg-transparent` — inputs need a fill to read as "type here", not just a border).
- **Card (data surface)** — `rounded-lg` · `border border-border` · `bg-card` · `p-6` (or `p-4` for list rows) · no shadow.
- **Dashboard shell** — `rounded-xl` · `m-2` · `p-6` · `border border-border` · `bg-background`. Parent of every `rounded-lg` card (concentric radius).
- **Empty state** — icon 24px (`size-6`) `text-muted-foreground` · heading 16px/600 (`text-base font-semibold`) · subtext 12px muted · primary CTA if one applies to that surface.
- **Icon sizes** — `size-3` (12px, inline with `text-xs` meta/chevrons/checkmarks) · `size-4` (16px, default inline) · `size-5` (20px, primary actions/sidebar nav) · `size-6` (24px, empty-state illustrations). Never `size-3.5` or any step between these.
- **Sidebar nav item hover** — single cue only: background lift to `bg-sidebar-accent`. No border ring added on hover, no competing text-color override — that combination was tried and reverted for feeling noisy (see `app-sidebar.tsx`).

## Color

Neutral ramp intentionally carries a faint teal tint — `oklch(L 0.01 205)`, not pure achromatic `oklch(L 0 0)`. This ties every gray/border/muted-text token to the brand's teal/green family per a hue-holding color system, rather than generic Tailwind gray. Applies to `foreground`, `card`, `popover`, `secondary`, `muted`, `accent`, `border`, `input`, `sidebar` — light and dark.

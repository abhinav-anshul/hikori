# Design System

The source of truth for visual decisions. Read this before building or modifying any UI. If a value isn't here, ask before inventing one.

## Visual references

Match the density, restraint, and typographic care of:
- **Linear** (linear.app) — primary reference for layout density, muted palette, and hover states
- **Vercel dashboard** — for forms, tables, and empty states
- **Raycast** — for command surfaces and keyboard-first affordances

When in doubt, ask: "would this fit in Linear's app?" If the answer is no, simplify.

## Stack

- Tailwind v4 (CSS-first, `@theme` block in [globals.css](app/globals.css))
- shadcn/ui primitives in [components/ui/](components/ui/)
- `@base-ui/react` for unstyled primitives
- `lucide-react` for icons (16px default, 20px for primary actions)
- Inter via `next/font/google` as `--font-sans`

## Color tokens

All colors live as CSS variables in [globals.css](app/globals.css). **Never hardcode hex/rgb in components.** Always use the semantic token via Tailwind utility (`bg-background`, `text-muted-foreground`, `bg-primary`, `bg-feature`, etc.).

The palette is **neutral surfaces with green accents**. Surfaces (sidebar, page bg, cards, borders) are plain gray — no tint. The green only appears in: primary CTAs, the `feature` hero surface, selected sidebar items, focus rings, and charts.

**Brand colors (the only non-neutral values in the system):**

| Hex | Role | Token |
|---|---|---|
| `#03D37E` | Bright mint — primary CTAs, focus rings, positive accents, chart highlight | `--primary`, `--ring`, `--sidebar-primary` |
| `#025964` | Deep teal — hero "feature" surface, selected sidebar item text/icons | `--feature`, `--sidebar-accent-foreground` |
| `oklch(0.976 0.01 205)` | Sidebar background only (same faint teal tint as the rest of the neutral ramp) | `--sidebar` |
| `#FFFFFF` | Main page background, cards, popovers, the active sidebar item pill | `--background`, `--card`, `--popover`, `--sidebar-accent` |

These are not in Tailwind's stock palette and intentionally diverge from `emerald-500` / `teal-900` / `slate-50`. Use the tokens, never the hex.

Semantic tokens (use these, not raw colors):

| Token | Use for |
|---|---|
| `background` / `foreground` | Page surface and primary text |
| `card` / `card-foreground` | Raised surfaces, panels |
| `popover` / `popover-foreground` | Floating menus, dropdowns |
| `primary` / `primary-foreground` | Primary CTAs (mint green), focused emphasis |
| `secondary` / `secondary-foreground` | Secondary buttons, chips |
| `muted` / `muted-foreground` | De-emphasized text, placeholders, captions |
| `accent` / `accent-foreground` | Hover backgrounds, subtle highlights |
| `feature` / `feature-foreground` | Hero panels and brand-feature surfaces (deep forest teal). Use sparingly — at most one per page (e.g. a "total balance" / dashboard hero card). Not a substitute for `primary`. |
| `destructive` | Destructive actions, error states |
| `border` / `input` / `ring` | Dividers, input borders, focus rings |
| `sidebar*` | Sidebar surface and its nested tokens |

**Dark mode is mandatory.** Every component must be tested in both. The `.dark` class on `<html>` toggles the palette. Never write `dark:` overrides with hardcoded colors — change the token if the dark value is wrong.

**Don't use pure black/white or pure gray.** The palette intentionally tints near-black and near-white with a faint teal hue. If you need a neutral, use `muted` or `secondary` — they already carry the correct tint.

## Typography

Single family: **Inter** (`font-sans`). No serif, no display font.

| Role | Size | Weight | Line height | Tracking |
|---|---|---|---|---|
| Display (rare, marketing only) | `text-4xl` (36px) | 600 | 1.1 | -0.02em |
| H1 (page title) | `text-2xl` (24px) | 600 | 1.2 | -0.01em |
| H2 (section) | `text-lg` (18px) | 600 | 1.3 | normal |
| H3 (subsection) | `text-base` (16px) | 600 | 1.4 | normal |
| Body | `text-sm` (14px) | 400 | 1.5 | normal |
| Body emphasis | `text-sm` (14px) | 500 | 1.5 | normal |
| Caption / meta | `text-xs` (12px) | 400 | 1.4 | normal |
| Button label | `text-sm` (14px) | 500 | 1 | normal |

**Defaults:** body copy is `text-sm` (14px), not `text-base`. This is the Linear/Vercel density. Only marketing pages use 16px body.

Muted text uses `text-muted-foreground` — never apply opacity to achieve "muted."

**Two metrics side by side are never equal weight.** The one the user came for gets the larger step (`text-2xl`); a secondary metric next to it drops to `text-lg`, not a matching size. Hierarchy comes from weight and size together, not from color alone.

`antialiased` is set once on the root `<html>`/`<body>` (macOS renders text heavier without it) — never per component.

Headings get `text-balance`; body/description copy that wraps gets `text-pretty`. Skip both on long-form paragraphs.

## Spacing

Tailwind's default 4px scale. Use only: **1, 2, 3, 4, 6, 8, 12, 16** (i.e., 4/8/12/16/24/32/48/64 px). Skip 5, 7, 9, 10, 11. If you need an oddball value, ask first.

- Component internal padding: `p-3` or `p-4`
- Card padding: `p-6`
- Section vertical rhythm: `space-y-6` or `space-y-8`
- Inline gap (icon + label): `gap-2`
- Stacked form fields: `space-y-4`
- Icon-only action rows (row of buttons, no borders): `gap-2` minimum — tighter than that risks mis-clicks, especially where one action is destructive

**Micro spacing (half-steps):** `1.5` and `2.5` (6px / 10px) are allowed for tight text stacks and inline chips — `space-y-1.5` for a heading+caption pair, `gap-1.5` for icon+label in dense meta rows, `px-2.5` for pill/chip padding. Don't reach for other half-steps beyond these two.

## Radius

Driven by `--radius: 0.625rem` (10px). Use the semantic scale:

- `rounded-sm` — inputs, small chips
- `rounded-md` — buttons, default
- `rounded-lg` — cards, panels
- `rounded-xl` — modals, large surfaces
- `rounded-full` — avatars, pill badges only

Never mix arbitrary radii in the same component.

**Concentric radius.** A container's radius must exceed the radius of the cards nested inside it — same radius on parent and child is the most common thing that makes a layout feel off. The dashboard shell uses `rounded-xl`; the cards inside it stay at `rounded-lg`.

## Borders & elevation

- Default border: `border border-border` (1px, semantic token)
- Elevation comes from **border + background contrast**, not shadows. Avoid `shadow-lg` etc. except on floating elements (popovers, dialogs).
- Allowed shadows: `shadow-sm` (resting cards, rarely), default popover/dialog shadow from shadcn.
- Focus: always `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50` — a soft glow, no `ring-offset`. Never remove focus styles.

## Interaction states

Every interactive element must define all four:

1. **Default**
2. **Hover** — usually `hover:bg-accent` for ghost; brightness shift for filled
3. **Focus-visible** — ring (see above)
4. **Disabled** — `disabled:opacity-50 disabled:pointer-events-none`

Transitions: `transition-colors` (150ms default). No bouncy easings. No animations longer than 200ms except page transitions.

## Iconography

- `lucide-react` only
- 12px (`size-3`) inline with `text-xs` meta rows — timestamps, chevrons, inline checkmarks, chips
- 16px (`size-4`) inline with text
- 20px (`size-5`) for primary actions, sidebar nav
- 24px (`size-6`) for empty-state illustrations
- Never use `size-3.5` or other sizes between these steps — pick the nearest defined size
- Stroke width: default (2). Don't change it.
- Color: inherit (`currentColor`) — never set icon color independently of its container

## Layout

- Max content width: `max-w-6xl` for app pages, `max-w-2xl` for forms/reading
- Sidebar width: defined in [components/ui/sidebar.tsx](components/ui/sidebar.tsx) (`SIDEBAR_WIDTH`); don't override per-page
- Page gutter: `px-6` on mobile, `px-8` on `md:+`
- Min tap target: 36px (`h-9`, the default `Button` size) for everything, including primary CTAs. `h-10`/`size="lg"` exists for isolated cases (the sidebar profile trigger) but is not the primary-action convention

## Forms

- Labels above inputs, `text-sm font-medium`, `mb-2`
- Helper text below, `text-xs text-muted-foreground`, `mt-1.5`
- Error text replaces helper text, `text-xs text-destructive`
- Input height: `h-9` (matches shadcn default)
- Input fill: `bg-input/20` in light mode, `dark:bg-input/30` in dark — inputs sit slightly inset from their surroundings in both modes, never relying on the border alone to signal "type here"
- Group related fields in `space-y-4`; group sections in `space-y-8`

## Empty / loading / error states

Every list, table, or data surface needs all three. Don't ship a component that renders nothing when data is empty.

- **Empty:** icon (24px, `text-muted-foreground`), one-line heading, optional sub-text, primary CTA if applicable
- **Loading:** skeleton matching final layout, not spinners (spinners only for button-internal pending)
- **Error:** `text-destructive` heading, retry action

## What to avoid

- ❌ Hardcoded colors (`#fff`, `bg-zinc-900`, `text-gray-500`) — use tokens
- ❌ `dark:` utilities with hardcoded values — fix the token instead
- ❌ Arbitrary Tailwind values (`text-[15px]`, `p-[13px]`) — pick from the scale or extend the scale
- ❌ Multiple font weights in one component beyond {400, 500, 600}
- ❌ Drop shadows for depth — use borders
- ❌ Gradients, except for very deliberate hero/marketing surfaces (ask first)
- ❌ Emoji as UI iconography — use lucide
- ❌ `opacity-*` to mute text — use `text-muted-foreground`

## When making changes

1. Read this file.
2. Check [globals.css](app/globals.css) for the relevant token.
3. If the token is missing or wrong, change the **token** — not the component.
4. Verify both `.dark` and light mode before declaring done.
5. If a design need genuinely doesn't fit this system, flag it and propose a token addition rather than a one-off override.

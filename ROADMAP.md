# Roadmap

Snapshot of current state and what to build next, based on a full read of the codebase (2026-09-12).

## Current state

**Solid / production-ish:**
- Auth: password login + Google OAuth + signup (email confirmation) + password reset, all wired to real Supabase — [app/(login)/login/page.tsx](app/(login)/login/page.tsx), [app/(signup)/signup/page.tsx](app/(signup)/signup/page.tsx), [app/(login)/forgot-password/page.tsx](app/(login)/forgot-password/page.tsx), [app/(login)/reset-password/page.tsx](app/(login)/reset-password/page.tsx), [app/auth/callback/route.ts](app/auth/callback/route.ts), `proxy.ts`, `lib/supabase.ts`
- Link CRUD, archiving, tags (create/rename/recolor/delete), per-link sparklines — backed by real tables/RPCs, RLS enabled and correctly scoped on every table (`links`, `click_events`, `tags`, `link_tags`)
- Analytics pipeline (schema + `get_analytics` RPC, 5 iterations) — referrer, UTM, device, country, browser, OS, bot-flagging, uniques
- Redirect/resolve engine (`app/[slug]/page.tsx` → `resolve_and_track`) with rich click tracking + per-IP rate limiting (Upstash Redis), skips archived links
- Basic QR code generation (PNG, download) — [components/qr-code-dialog.tsx](components/qr-code-dialog.tsx)

**Mocked / stubbed (UI exists, no backend):**
- Custom domains — [app/(dashboard)/dashboard/domains/page.tsx](app/(dashboard)/dashboard/domains/page.tsx) uses `MOCK_DOMAINS`, no `domains` table. Worse than just fake data: the add-domain dialog ([components/domain-form-dialog.tsx:51-55](components/domain-form-dialog.tsx#L51-L55)) just closes on submit with no effect at all, "Verify" ([components/domain-row.tsx:96-99](components/domain-row.tsx#L96-L99)) is a 1.2s `setTimeout` no-op, "Delete" ([components/domain-row.tsx:101-103](components/domain-row.tsx#L101-L103)) is a bare `confirm()` wired to nothing
- Landing page shortener demo — [components/marketing/shortener-input.tsx:51](components/marketing/shortener-input.tsx#L51) fakes the result client-side
- Marketing overselling the above: [app/page.tsx](app/page.tsx) advertises "Custom domains" / "Bring your own domain" — a signed-up user hits the fully-fake feature immediately

**Missing entirely:**
- Settings page, billing/Stripe, team/workspace multi-tenancy, public API/API keys (`app/api/` doesn't exist), webhooks, outbound email/notifications, error tracking (no Sentry), product analytics (no PostHog/Amplitude), plan/usage limits
- Any test setup — no jest/vitest/playwright config, no `__tests__`, no `.test.` files anywhere in the repo
- Click-event retention sweep — `click_events_created_at_idx` (`supabase/migrations/0003_click_events.sql`) is commented as being for "global retention sweeps," but no cron/job actually does one

---

## 1. Quick wins

- [ ] **Rename/rotate `NEXT_PUBLIC_SUPABASE_SECRET_KEY`** — a secret-looking key sitting behind a `NEXT_PUBLIC_` prefix, which Next.js inlines into the client bundle for any var with that prefix. Currently unused in code, but it's a footgun for whoever wires it up the way every other `NEXT_PUBLIC_*` var here is used. Drop the prefix (and rotate the key, since it's already sat in a public-prefixed var).
- [ ] **Silent no-op on `updateLink`/`deleteLink`/`archiveLink`/`unarchiveLink`** — none of these ([app/(dashboard)/dashboard/links/action.ts](app/(dashboard)/dashboard/links/action.ts)) check affected-row count. If RLS blocks the write (stale id, race with another tab), Supabase returns no error and 0 rows changed, but the action still reports success — UI shows a success toast for a mutation that did nothing.
- [ ] **`getAnalytics()` swallows RPC errors into a silent empty state** — `lib/analytics-server.ts:39` logs and returns zeroed data on any `get_analytics` failure, so a real backend outage renders identically to "no clicks yet."
- [ ] **No pagination anywhere** — links list ([app/(dashboard)/dashboard/links/page.tsx:78-82](app/(dashboard)/dashboard/links/page.tsx#L78-L82)) and tags page fetch the full table with no `.limit()`/`.range()`. Fine at demo scale, breaks for any real account with a few thousand links.
- [ ] **Links list row isn't responsive** — [app/(dashboard)/dashboard/links/page.tsx:159](app/(dashboard)/dashboard/links/page.tsx#L159) packs favicon + URL + sparkline + click badge + 5 icon-buttons into one non-wrapping flex row with zero responsive breakpoints; overflows on mobile.
- [ ] **Dead code cleanup** — commented-out header block in [app/(dashboard)/layout.tsx:39-45](app/(dashboard)/layout.tsx#L39-L45), leftover `{/* <div>sdf</div> */}` placeholder in [components/app-sidebar.tsx:64-66](components/app-sidebar.tsx#L64-L66), stray double-space in `layout.tsx:37`.
- [ ] **Design-token nits** — `size-3.5` used in [components/manage-tags-dialog.tsx:206,214](components/manage-tags-dialog.tsx#L206), [components/tags-overview.tsx:37](components/tags-overview.tsx#L37), [components/tag-filter.tsx:100](components/tag-filter.tsx#L100), and a hardcoded (non-token) color in [components/domain-row.tsx:37](components/domain-row.tsx#L37) — both banned by DESIGN.md.
- [ ] **Confirm `0012_links_archived.sql` is actually pushed to remote** — flagged as not-yet-pushed when archiving landed; no Supabase CLI available in this environment to verify it's since gone out.

## 2. Minor features

- [ ] Multi-select tag filter — [components/tag-filter.tsx](components/tag-filter.tsx) only supports one tag at a time
- [ ] Link expiration (`expires_at` column + redirect-time check)
- [ ] Password-protected links
- [ ] Bulk link actions (multi-select delete/tag/archive) — actions currently only support single-id mutations
- [ ] Custom analytics date range + CSV export (currently 5 fixed presets, no export)
- [ ] QR code customization (color, logo, size, SVG export) — [components/qr-code-dialog.tsx](components/qr-code-dialog.tsx) is PNG-only, fixed size, black-on-white
- [ ] Rate limiting on mutation server actions (`createLink`, `createTag`, etc. have no per-user throttle — all auth-sensitive forms already covered)
- [ ] Wire the landing-page demo to the real backend instead of faking a slug client-side
- [ ] Click-event retention sweep (index already exists for it; the job doesn't)

## 3. Major features

- [ ] **Real custom domains** — `domains` table, DNS/TXT + CNAME verification, SSL, `domain_id` on `links`, replacing the fully-inert mock UI. Highest-visibility gap: the UI *and* the marketing site already promise this to signed-up users.
- [ ] **Team/workspace multi-tenancy** — everything today is keyed on a single `user_id`; no org/team/invite model. Sequence this *before* billing or API keys — retrofitting later touches nearly every table.
- [ ] **Settings + billing (Stripe)** — no settings route, no subscription/plan model, no billing deps in `package.json`
- [ ] **Usage caps / plan limits** — nothing throttles link count, click volume, or analytics history per account; only matters once there's a free/paid split, so pairs with billing
- [ ] **Public API + API keys** — no developer-facing REST surface (`app/api/` doesn't exist), only internal Supabase RPCs
- [ ] **Link-in-bio / conditional redirects** — every slug maps 1:1 to one URL today; no geo/device-based destination rules
- [ ] **Webhooks + notifications** — no email sending (Resend/SendGrid), no webhook delivery system
- [ ] **Baseline testing + observability** — zero test coverage (no jest/vitest/playwright) and no error tracking (no Sentry); worth landing before the app has paying users to lose

---

## Suggested sequencing

1. Remaining quick wins, security-first — the leaked-shaped env var is still a live gap, do this before anything user-facing
2. Custom domains — first major feature; UI and marketing already set the expectation, currently fully fake
3. Team/workspace multi-tenancy (before billing or API keys)
4. Billing, usage caps, API keys, webhooks
5. Testing + observability — ideally pulled earlier if any of the above ships to real users before this point

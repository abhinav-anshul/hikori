# Roadmap

Snapshot of current state and what to build next, based on a full read of the codebase (2026-09-12, updated 2026-10-06).

## Current state

**Solid / production-ish:**
- Auth: password login + Google OAuth + signup (email confirmation) + password reset, all wired to real Supabase — [app/(login)/login/page.tsx](app/(login)/login/page.tsx), [app/(signup)/signup/page.tsx](app/(signup)/signup/page.tsx), [app/(login)/forgot-password/page.tsx](app/(login)/forgot-password/page.tsx), [app/(login)/reset-password/page.tsx](app/(login)/reset-password/page.tsx), [app/auth/callback/route.ts](app/auth/callback/route.ts), `proxy.ts`, `lib/supabase.ts`
- Link CRUD, archiving, tags (create/rename/recolor/delete), per-link sparklines — backed by real tables/RPCs, RLS enabled and correctly scoped on every table (`links`, `click_events`, `tags`, `link_tags`)
- Analytics pipeline (schema + `get_analytics` RPC, 5 iterations) — referrer, UTM, device, country, browser, OS, bot-flagging, uniques
- Redirect/resolve engine (`app/[slug]/page.tsx` → `resolve_and_track`) with rich click tracking + per-IP rate limiting (Upstash Redis), skips archived links
- Basic QR code generation (PNG, download) — [components/qr-code-dialog.tsx](components/qr-code-dialog.tsx)

**In progress (code written, uncommitted, not yet verified end-to-end):**
- Custom domains (add/verify/delete) — `domains` table + `links.domain_id`, TXT-record ownership verification ([lib/domain-check.ts](lib/domain-check.ts)), Vercel SSL attach/detach ([lib/vercel.ts](lib/vercel.ts)), server actions ([app/(dashboard)/dashboard/domains/action.ts](app/(dashboard)/dashboard/domains/action.ts)), UI wired to real data ([app/(dashboard)/dashboard/domains/page.tsx](app/(dashboard)/dashboard/domains/page.tsx), [components/domain-row.tsx](components/domain-row.tsx), [components/domain-form-dialog.tsx](components/domain-form-dialog.tsx)). Remote schema confirmed to match the migration files via direct SQL inspection (2026-10-05) — columns, RLS policies, indexes, and `resolve_and_track` all checked. What's *not* confirmed: no browser walkthrough of add → DNS verify → Vercel attach → delete has been run (no authenticated session available in this environment), and `VERCEL_TOKEN` has only been confirmed non-empty, not live/working. Known gap on top of that: the redirect engine doesn't resolve by domain — see Minor features below. Don't treat this as shipped until it's been clicked through for real and committed.

**Mocked / stubbed (UI exists, no backend):**
- Landing page shortener demo — [components/marketing/shortener-input.tsx:51](components/marketing/shortener-input.tsx#L51) fakes the result client-side

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
- [ ] **Design-token nits** — `size-3.5` used in [components/manage-tags-dialog.tsx:206,214](components/manage-tags-dialog.tsx#L206), [components/tags-overview.tsx:37](components/tags-overview.tsx#L37), [components/tag-filter.tsx:100](components/tag-filter.tsx#L100), and a hardcoded (non-token) color in [components/domain-row.tsx:41](components/domain-row.tsx#L41) — both banned by DESIGN.md.
- [x] **Confirm `0012_links_archived.sql` is actually pushed to remote** — confirmed via `supabase migration list` (2026-10-05): the schema for both 0012 and 0013 was already live on the remote database (applied outside the CLI at some point), just not recorded in `supabase_migrations.schema_migrations`. Repaired the history with `supabase migration repair --status applied 0012 0013` so local and remote now agree.

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
- [ ] **Redirect engine doesn't resolve by domain** — `resolve_and_track` ([supabase/migrations/0012_links_archived.sql](supabase/migrations/0012_links_archived.sql)) still looks up by `slug` alone with no host/`domain_id` awareness, even though the unique indexes from migration 0013 now allow the same slug to exist once under the default host and again under a custom domain. [app/[slug]/page.tsx](app/[slug]/page.tsx) never reads the request host either. Harmless today if slugs are de-facto unique across hosts, but a real link-collision bug waiting to happen as soon as two hosts reuse a slug.

## 3. Major features

- [ ] **Real custom domains** — code complete and uncommitted: `domains` table + `domain_id` on `links`, TXT-record ownership verification, Vercel SSL attach/detach, server actions, dashboard UI (add/verify/delete) all wired to real data (2026-10-05). Remote schema confirmed to match via direct SQL inspection, but the actual add → verify → Vercel-attach → delete flow has not been run end-to-end in a browser, and the `VERCEL_TOKEN` credential hasn't been confirmed live. Not checking this off until that walkthrough happens and the changes are committed. Also still open: the domain-aware-redirect gap below.
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
2. Custom domains: code is wired and the schema is confirmed live, but needs a real browser walkthrough (add → verify → Vercel attach → delete) before trusting it — then commit, then close the domain-aware-redirect gap before it's load-bearing for more than one account
3. Team/workspace multi-tenancy (before billing or API keys)
4. Billing, usage caps, API keys, webhooks
5. Testing + observability — ideally pulled earlier if any of the above ships to real users before this point

# Roadmap

Snapshot of current state and what to build next, based on a full read of the codebase (2026-09-06).

## Current state

**Solid / production-ish:**
- Login (password-only) + session middleware (`proxy.ts`, `lib/supabase.ts`)
- Link CRUD, tags, per-link sparklines
- Analytics pipeline (schema + RPCs + UI) — referrer, UTM, device, country, bot-flagging
- Redirect/resolve engine with rich click tracking
- Basic QR code generation

**Mocked / stubbed (UI exists, no backend):**
- Custom domains — [app/(dashboard)/dashboard/domains/page.tsx](app/(dashboard)/dashboard/domains/page.tsx) uses `MOCK_DOMAINS`, no `domains` table, verify/delete are fake
- Signup — [app/(signup)/signup/page.tsx](app/(signup)/signup/page.tsx) is a "check back soon" placeholder
- Landing page shortener demo — [components/marketing/shortener-input.tsx:51](components/marketing/shortener-input.tsx#L51) fakes the result client-side

**Missing entirely:**
- Settings page, billing/Stripe, team/workspace multi-tenancy, public API/API keys, webhooks, email/notifications, OAuth, password reset, rate limiting on the public redirect endpoint

---

## 1. Quick wins

- [x] Fix hardcoded user name — [components/app-sidebar.tsx:98](components/app-sidebar.tsx#L98) now derives display name from the user's email prefix (no `profiles`/name field exists yet)
- [x] Rate-limit the redirect endpoint — [proxy.ts](proxy.ts) now blocks with 429 (30 req/min/IP, sliding window) via [lib/rate-limit.ts](lib/rate-limit.ts) + Upstash Redis, before `resolve_and_track` is ever called; fails open if Redis is unreachable
- [x] Surface browser/OS breakdown in analytics UI — added `top_browsers`/`top_os` to `get_analytics` RPC ([supabase/migrations/0011_get_analytics_v5.sql](supabase/migrations/0011_get_analytics_v5.sql), pushed to remote) and two new widgets on [app/(dashboard)/dashboard/analytics/page.tsx](app/(dashboard)/dashboard/analytics/page.tsx)
- [x] Tag management — added `updateTag`/`deleteTag` ([app/(dashboard)/dashboard/links/action.ts](app/(dashboard)/dashboard/links/action.ts)), a reusable [components/manage-tags-dialog.tsx](components/manage-tags-dialog.tsx) (rename/recolor/delete), plus a new [/dashboard/tags](app/(dashboard)/dashboard/tags/page.tsx) page listing tags with total clicks and a client-side search
- [ ] Multi-select tag filter — [components/tag-filter.tsx](components/tag-filter.tsx) only supports one tag at a time
- [x] Link archiving — added `archived` column + updated `resolve_and_track` ([supabase/migrations/0012_links_archived.sql](supabase/migrations/0012_links_archived.sql) — **not yet pushed to remote**, run `supabase db push`), `archiveLink`/`unarchiveLink` actions, an Active/Archived toggle ([components/link-status-filter.tsx](components/link-status-filter.tsx)), and an archive button in [components/link-row-actions.tsx](components/link-row-actions.tsx) alongside the existing hard-delete

## 2. Minor features

- [ ] Password reset flow (Supabase `resetPasswordForEmail` isn't used anywhere)
- [ ] OAuth login (Google/GitHub via Supabase `signInWithOAuth`)
- [ ] Finish signup flow (real form + `signUp()` call)
- [ ] Link expiration (`expires_at` column + redirect-time check)
- [ ] Password-protected links
- [ ] Bulk link actions (multi-select delete/tag/archive)
- [ ] Custom analytics date range + CSV export (currently 5 fixed presets, no export)
- [ ] QR code customization (color, logo, size, SVG export) — [components/qr-code-dialog.tsx](components/qr-code-dialog.tsx)
- [ ] Wire the landing-page demo to the real backend instead of faking a slug client-side

## 3. Major features

- [ ] **Real custom domains** — `domains` table, DNS/TXT verification, SSL, `domain_id` on `links`. Biggest gap relative to what the UI already promises.
- [ ] **Team/workspace multi-tenancy** — everything today is keyed on a single `user_id`; no org/team/invite model. Sequence this *before* billing or API keys — retrofitting later touches nearly every table.
- [ ] **Settings + billing (Stripe)** — no settings route, no subscription/plan model, no billing deps in `package.json`
- [ ] **Public API + API keys** — no developer-facing REST surface, only internal Supabase RPCs
- [ ] **Link-in-bio / conditional redirects** — every slug maps 1:1 to one URL today; no geo/device-based destination rules
- [ ] **Webhooks + notifications** — no email sending (Resend/SendGrid), no webhook delivery system

---

## Suggested sequencing

1. Quick wins, especially the rate-limit gap (real exposure, not cosmetic)
2. Custom domains (first major feature — UI already sets the expectation, currently fake)
3. Team/workspace multi-tenancy (before billing or API keys)
4. Billing, API keys, webhooks

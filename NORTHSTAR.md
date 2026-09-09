# North Star

**Goal: $1,000 in monthly recurring revenue (MRR).**

Everything else — features, polish, roadmap sequencing — is in service of this. If a piece of work doesn't move revenue toward $1k/mo (directly, or by removing a blocker to charging money), it's not a priority.

## What hikori is

A URL shortener with analytics, custom domains, and QR codes (see [README.md](README.md), [ROADMAP.md](ROADMAP.md)). Today it's a working product with no way to charge anyone — there's no billing, no plans, no way to convert a free user into revenue.

## The gap

Per [ROADMAP.md](ROADMAP.md), billing/Stripe and a settings page don't exist yet. **This is the single biggest blocker to the north star** — no matter how good the product is, $0 comes in until there's a plan and a way to pay for it.

## Path to $1k/mo

Revenue = paying customers × price. Rough scenarios:

| Price/mo | Customers needed |
|---|---|
| $9 | ~112 |
| $19 | ~53 |
| $29 | ~35 |
| $49 | ~21 |

Pick a price point once real usage/willingness-to-pay signal exists — don't over-index on this table, it's just to size the problem.

## What actually needs to be true

1. **Something worth paying for** — a free tier is capped hard enough (links, clicks, or analytics history) that real usage hits the ceiling. Custom domains and advanced analytics are natural paywalls — they're already the differentiated parts of the product.
2. **A way to pay** — Stripe billing + a settings/plans page. Doesn't need to be elaborate: one or two paid tiers, checkout, webhook to flip a `plan` field, done.
3. **A way for people to find it** — distribution matters as much as the product. No amount of roadmap work here fixes zero traffic.
4. **Retention** — MRR compounds only if paying users stick around. A shortener people bounce off of after one link won't get there.

## How to use this doc

- When triaging [ROADMAP.md](ROADMAP.md) items, ask: does this unblock charging money, retaining a payer, or acquiring one? If not, it can wait.
- Update the "Path to $1k/mo" numbers once there's real pricing/conversion data instead of guesses.
- If the strategy changes (different monetization model, pivot, etc.), edit this file — it should always reflect the current bet, not a historical one.

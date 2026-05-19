# Reproducing MenuLift from scratch

This doc is the operator's recipe to stand MenuLift up from a fresh clone. No secrets live in git — every secret comes from a third-party account you create + configure, and gets stored in Vercel's encrypted env. See [`.env.example`](./.env.example) for the full variable list with inline comments on where to mint each value.

## TL;DR

1. Clone the repo, `npm install`.
2. Create accounts on each service (Vercel, Resend, PostHog, Stripe, Supabase, Cloudflare R2, fal.ai, Anthropic, Clerk, Inngest, Meta, Google Ads — only the first six are required for a v1 user flow).
3. `vercel link --project menulift` from the repo root.
4. For each variable in `.env.example`, run `vercel env add <NAME> production` and paste the value. Or use `vercel env add` per-environment if you want a dev/preview/prod split.
5. `vercel env pull .env.local` — pulls the encrypted vars down to a local untracked file for `npm run dev`.
6. `vercel deploy --prod` (or just push to `main` — Vercel auto-deploys via the GitHub integration).

## What's required for the v1 user flow (lead capture + confirmation email)

The flow that's live on `menulift.vercel.app` today only requires:

| Var | Where to get | Used for |
|---|---|---|
| `RESEND_API_KEY` | resend.com → API keys | Confirmation email send |
| `SENDER_DOMAINS` | Your DNS-verified Resend domain | The `From:` address |
| `BUSINESS_NAME` + `BUSINESS_ADDRESS` | Operator config | CAN-SPAM footer |
| `NEXT_PUBLIC_APP_URL` | Vercel project URL | Email link-backs |
| `POSTHOG_PROJECT_API_KEY` + `NEXT_PUBLIC_POSTHOG_KEY` | posthog.com → Project settings | Server + client analytics |

Everything else (DB, Stripe, fal.ai, R2, Meta, Google Ads, Clerk) is wired in the codebase but not load-bearing until you build out the corresponding backend feature (intake → generation → delivery → payment → admin dashboard → ad campaigns).

## Domain verification (Resend)

The `SENDER_DOMAINS` value must point to a domain whose DNS records have been verified in Resend, otherwise sends fall back to Resend's shared sandbox (`onboarding@resend.dev`). To verify `menulift.app`:

1. Resend dashboard → Domains → Add domain → `menulift.app`.
2. Add the three DNS records Resend gives you (DKIM `TXT`, SPF `TXT`, MX) at your registrar.
3. Resend re-checks every few minutes; status flips to `verified` once DNS propagates.
4. After that, `hello@menulift.app` becomes the `From:` of every confirmation email.

Until verification lands, `app/api/self-serve/route.ts` automatically retries with the sandbox sender — emails still arrive, they just show "MenuLift <onboarding@resend.dev>" in the From.

## Stripe live vs. test

The Stripe key shipped in production is `sk_live_*` (real money). Use `sk_test_*` for development and any preview Vercel deploy. You can drive this with a per-environment split:

```bash
vercel env add STRIPE_SECRET_KEY development     # paste sk_test_*
vercel env add STRIPE_SECRET_KEY preview         # paste sk_test_*
vercel env add STRIPE_SECRET_KEY production      # paste sk_live_*
```

## Supabase / DATABASE_URL

`SUPABASE_ACCESS_TOKEN` is a Personal Access Token for the Supabase management API — it's how Zilla provisions new databases. It is **not** the same as `DATABASE_URL`, which is per-project. To wire a DB:

1. Supabase dashboard → New project (or pick an existing menulift project).
2. Project settings → Database → Connection string → "Transaction" pooler URL (port 6543).
3. `vercel env add DATABASE_URL production`, paste the pooler URL with the password substituted in.

The schema lives in `db/schema.ts` (Drizzle). Push with `drizzle-kit push` once `DATABASE_URL` is set.

## Rotating credentials

Treat anything that was pasted in a chat transcript, screenshot, or email as compromised — rotate it. Every provider supports one-click rotation:

- Resend: API keys → revoke + reissue
- PostHog: Project settings → API keys → rotate
- Stripe: Developers → API keys → roll
- Supabase: Account → Access tokens → revoke + reissue
- Anthropic: Settings → API keys → revoke
- Meta: Business settings → System users → reset access token

After rotation, `vercel env rm <NAME> production` and re-add with the new value.

## Re-running locally

```bash
git clone https://github.com/Zilla-HQ/menulift.git
cd menulift
npm install
vercel link --project menulift
vercel env pull .env.local
npm run dev
```

The dev server runs at `http://localhost:3000`. Confirmation email sends go through real Resend, real PostHog, etc. — keep this in mind so you don't paper-trail a thousand fake events while debugging. Either point `RESEND_API_KEY` at a separate test key or comment out the `sendConfirmationEmail` call while developing.

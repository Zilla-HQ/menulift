# Merchant Template

**Fork this repo to launch a new vertical-specific autonomous AI merchant on the Zilla platform.**

The template includes everything needed for a fully agent-run business that:

- **Cold-discovers** customers via Apify scrapers + property-data APIs
- **Generates** AI mockups / artifacts for those customers (fal.ai Kontext + Anthropic Claude)
- **Cold-emails** them with a personalized preview (Resend, CAN-SPAM compliant)
- **Auto-handles** replies (Claude classifies into 6 buckets — interested / price / style / decline / unsubscribe / complex — auto-replies the first four with promo-aware copy, flags complex for human, alerts the operator on hot leads)
- **Takes payment** (Stripe Checkout in live mode, with promo-code pre-application; optional BNPL via Klarna / Afterpay / Affirm / Cash App / Link — see [`lib/stripe-bnpl.ts`](./lib/stripe-bnpl.ts))
- **Fulfills** the order (per-item edits, QC retries, watermark, zip, delivery email)
- **Lets buyers customize post-purchase** via an HMAC-token-gated editor (no login required) — backend at `app/api/customize/[id]/route.ts`, customer-facing UI at `app/customize/[id]/page.tsx`
- **Re-enriches the no-email-yet backlog** via a manual-only Hunter+Apollo backfill cron
- **Runs paid acquisition on Meta** with a daily +20%/3-day budget scaler, CAC-based auto-pause, and a creative-fatigue alert — full playbook in [META_ADS.md](./META_ADS.md). **Includes a real case study in §5b** of META_ADS.md: Restay's first paid customer arrived 30 hours after launch at $30 CAC on a $79 product via the `v1_audit60s` ad creative — exact ad copy, audience, funnel timing, what worked, and what broke (silent-failure postmortem with all the platform fixes).
- **Defends the brand on Google Search** with a $2/day branded-defense campaign, programmatic launch script + budget scaler — engineer runbook in [GOOGLE_ADS.md](./GOOGLE_ADS.md), operator's guide in [GOOGLE_ADS_OPERATOR.md](./GOOGLE_ADS_OPERATOR.md)
- **Registers itself with Google Search Console + Bing Webmaster + IndexNow** on every deploy — adds the merchant as a property, verifies ownership, submits the sitemap, pings every URL for real-time indexation. Fully autonomous for `*.zilla.so` subdomain merchants, near-autonomous for apex-domain merchants. Auto-generated sitemap, robots.txt, OG images, JSON-LD per page. One command (`npm run seo:propagate`) pushes shared HQ creds to every merchant project. Full runbook in [SEO.md](./SEO.md), one-time platform setup in [ZILLA_HQ_SETUP.md](./ZILLA_HQ_SETUP.md).
- **Posts + auto-replies on X (Twitter)** from the merchant's brand account, using one Zilla-HQ X dev app shared across the portfolio (same pattern as Meta + GSC). `lib/x-poster.ts` posts tweets/threads via the v2 API; an Inngest cron polls for @mentions every 30 min, Claude Haiku evaluates each one against a per-merchant brand prompt, and we auto-reply within budget caps. Per-merchant operator UI at `/admin/x` — full runbook in [X.md](./X.md), one-time HQ setup in [ZILLA_HQ_SETUP_X.md](./ZILLA_HQ_SETUP_X.md).
- **Follows up automatically** — 3-touch cold-outbound sequence (day 2 nudge / day 5 friction-killer / day 10 break-up) with idempotent stage gating, thread-aware `In-Reply-To`, and the **trial-vs-promo** decision (free trial measurably outperformed `FIRST50` 50%-off promo at the cold-ask step on Sitebeat). Full runbook in [COLD_FOLLOWUP.md](./COLD_FOLLOWUP.md).
- **Recruits referral partners** via a parallel B2B-partner-outreach pipeline (`partners@<domain>` sender, separate templates, no auto-reply, founder-touch volume) — [PARTNERS.md](./PARTNERS.md).
- **Auto-finds and emails partner contacts** for the marketplace side (Yelp + email scraping for cold-emailing partners)
- **Compounds organic search** with the programmatic-SEO catalog pattern (~600 indexed URLs from ~10 lines per surface) and the Chrome extension + WordPress plugin + teardown content-marketing scaffolds — [DISTRIBUTION.md](./DISTRIBUTION.md).
- **Surfaces everything** in an admin dashboard with thread view + contacts directory + merged conversation view (inbound + outbound per lead) + readiness checklist
- **Runs an affiliate program** with a tiered commission ladder ($50 / $100 / $250 per sale), `/ref/:code` cookie attribution, and an embeddable customer-site footer widget that turns every shipped site into an organic acquisition surface — see [AFFILIATE.md](./AFFILIATE.md). Includes a paste-ready partner swipe file at `app/partners/kit/page.tsx`. (The PARTNERS.md program is the lifetime-30% partner track; AFFILIATE.md is the tiered per-sale track. Pick one per merchant or run both with different codes.)
- **Runs a sponsor / partner / press outreach loop** distinct from the main cold-outreach engine, with a separate sender domain (so a sponsor complaint can't poison the revenue-engine domain), a 3-touch cadence (day 7 / 14 / 21), and inbound-replies routed to a dedicated thread that bypasses the auto-classifier — see [SPONSORS.md](./SPONSORS.md)
- **Sends abandoned-checkout recovery emails** — one human-tone "what's blocking you?" email 4 hours after a customer reaches Stripe Checkout without paying. One per listing, ever. No promo code. Lifted from a real Sitebeat case (a lead reached checkout 9 times without paying) — see [ABANDONED_CHECKOUT.md](./ABANDONED_CHECKOUT.md)
- **Mails direct-mail postcards via Lob**, weekday afternoons, budget-capped per-run and per-day, with hero photo on the front and a CTA URL on the back — see [DIRECT_MAIL.md](./DIRECT_MAIL.md)
- **Runs Google Ads autonomy** — hourly metric sync, daily CAC-based pause/resume at 02:00 UTC, optional branded-defense budget scaler at 02:30 UTC. The CAC threshold + margin floor are configurable per merchant — see [GOOGLE_ADS.md](./GOOGLE_ADS.md) and [GOOGLE_ADS_LAUNCH_CHECKLIST.md](./GOOGLE_ADS_LAUNCH_CHECKLIST.md)
- **Generates programmatic SEO pages at scale** — N verticals × M cities. For a 19-vertical × 30-city merchant, that's 589 unique landing pages, each with JSON-LD `Service` schema and `areaServed`, all shipped in the sitemap — see [PROGRAMMATIC_SEO.md](./PROGRAMMATIC_SEO.md)
- **Ships an optional public agent persona** (the "spectacle layer") — `/live` (real-time counters), `/diary` (markdown journal), `/bench` (frontier-model leaderboard), `/llms.txt`, plus a customer permission flip at `/unmute/:token`, an operator curation queue at `/admin/thoughts`, and automated diary + weekly-recap tweets to a brand X account. Persona-voice guidance lives in [PERSONA.md](./PERSONA.md) (how to choose the agent's voice; what NOT to do; the Earl reference example; alternatives by vertical). Full runbook in [SPECTACLE.md](./SPECTACLE.md).
- **Lifts cold-email reply rates ~1.4×** with a hero-photo preview card rendered inline in the outreach body — see [`lib/cold-email-hero-card.ts`](./lib/cold-email-hero-card.ts). Originated in SiteGrid; works for any merchant whose preview has a single hero image.
- **Speaks each vertical's actual fear** in objection-handler + abandoned-checkout copy via a per-vertical concern catalog (`lib/vertical-concerns.ts`) — restaurants worry about reservations breaking, healthcare about patient portals, legal about referral partners, fitness about class signup flows. Wired into `inngest/functions/abandoned-checkout.ts` and the reply-handler objection templates.
- **Tracks first-click without downgrading already-engaged states** — `app/c/[id]/[kind]/[slug]/route.ts` is the server-side click redirector that logs `firstClickedAt` into `outreach_events` and then 302s to the destination. Replied / purchased / unsubscribed leads never get downgraded back to "clicked" when an old email link re-fires.
- **Sends a Monday operator digest** summarizing every channel from the past 7 days — revenue, funnel, paid channels with CAC, direct mail, sponsor outreach with open replies, top affiliates
- **Sweeps follow-ups across 4 touches** instead of 2 — day-3 promo, day-7 bump, day-14 close-out. Measured marginal conversion drops below 2% at touch 5+; the cadence stops at 4 to protect deliverability. (Pairs with the COLD_FOLLOWUP.md runbook's 3-touch base sequence.)
- **Documents the email-template + per-vertical-concern playbook** — different verticals fear different things (restaurants worry about reservations breaking, healthcare about patient portals, legal about referral partners). The right concern in the bullets makes follow-ups feel addressed — see [EMAILS.md](./EMAILS.md)
- **Documents the organic + UGC playbook** — TikTok cadence and creator outreach pattern — see [TIKTOK.md](./TIKTOK.md) and [UGC.md](./UGC.md)

You don't have to build any of this. You configure it for your vertical and ship.

> **The patterns above (affiliate, sponsor outreach, abandoned checkout, direct mail, spectacle, programmatic SEO, 4-touch follow-up, weekly digest, Google Ads autonomy, BNPL, hero-card cold emails, vertical-concern library, customer customize UI, partner swipe file, persona doc) are all ported from [Zilla-HQ/sitegrid](https://github.com/Zilla-HQ/sitegrid) — the first production merchant on the Zilla platform. See [SITEGRID_REFERENCE.md](./SITEGRID_REFERENCE.md) for the full provenance: what each capability is for, why SiteGrid built it the way it did, and the file pointers to the corresponding `lib/` / `inngest/functions/` / `app/` code in this repo.**

---

## Live examples — four merchants on this template

Four merchants are in production on the Zilla platform. Each runs on this template (or a precursor of it) plus a vertical-specific layer. Treat these as **reference designs**: the providers each one wires up, the env vars they add, the files they layer on top of the template's stubs, and the judgment calls that didn't generalize.

| Merchant | Vertical | Pricing | Repo | Live | Stack note |
|---|---|---|---|---|---|
| **RealScale** | Real-estate photo enhancement | $79 / $149 / $199 one-time per listing | [Zilla-HQ/realestate](https://github.com/Zilla-HQ/realestate) | [realscale.app](https://realscale.app) | Template default (Next.js + Inngest) |
| **SiteGrid** | DFY local-business websites | $199 one-time + optional $99/yr renewal | [Zilla-HQ/sitegrid](https://github.com/Zilla-HQ/sitegrid) | [sitegrid.xyz](https://sitegrid.xyz) | **Vite + React + Express + Neon** (pre-dates this template; file paths differ) |
| **Sitebeat** | Autonomous SEO monitoring | $29/mo or $290/yr (14-day trial on monthly only) | [Zilla-HQ/sitebeat](https://github.com/Zilla-HQ/sitebeat) | [sitebeat.tech](https://sitebeat.tech) | Template default — first subscription merchant |
| **Restay** | Airbnb listing optimization | $49–$129 one-time (Tune-Up + Photo Restyle, Standard / Rush tiers) | [Zilla-HQ/airbnb](https://github.com/Zilla-HQ/airbnb) | [restay.agency](https://restay.agency) | Template default — first platform-proxied-recipient merchant |

**Pick the reference build closest to your vertical and read its `## About` section for the full inventory** — every provider, env var, file path, and judgment call. Decision shortcuts:

- **Image-gen-heavy with paid fulfillment?** → [**RealScale**](https://github.com/Zilla-HQ/realestate#about-realscale-on-the-zilla-platform) — the most complete reference build: fal.ai + REimagineHome + GPT-4o-mini vision-QC + NAR-compliant watermarking + dual B2B/B2C funnels.
- **Horizontal local-business / DFY website merchant?** → [**SiteGrid**](https://github.com/Zilla-HQ/sitegrid#readme) — 19 verticals × 21 cities, Google Places autocomplete, 4-archetype copy dispatch. Pre-dates this template (Vite + Express stack) but contributed ~17 patterns back into the scaffold — see [SITEGRID_REFERENCE.md](./SITEGRID_REFERENCE.md) for the per-pattern provenance map.
- **Subscription SaaS with weekly customer-facing checks?** → [**Sitebeat**](https://github.com/Zilla-HQ/sitebeat#about-sitebeat-on-the-zilla-platform) — first subscription merchant: Stripe subscription Checkout with 14-day trial, weekly re-check cron, regression-only alerts, Chrome extension + WordPress plugin distribution.
- **Platform that hides contact info (Airbnb / Instagram / gig platforms / marketplaces)?** → [**Restay**](https://github.com/Zilla-HQ/airbnb#about-restay-on-the-zilla-platform) — first platform-proxied-recipient merchant: 6-step host-email enrichment, domain warm-up tier1-6 ramp scheduler, free public grader funnel, edit-only image policy for TOS-restricted platforms.

**Template defaults every merchant inherits** (the per-merchant sections below only call out what's *additive*): Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui · Postgres + Drizzle · Inngest · Clerk (admin only, email-allowlisted) · Stripe Checkout + webhooks · Resend (CAN-SPAM auto-wrapped, List-Unsubscribe headers, inbound webhook) · Twilio (TCPA-gated; only used post-engagement) · Cloudflare R2 · Anthropic Claude Haiku (cold-email drafting + 6-bucket reply triage) · OpenAI GPT-4o-mini (vision QC) · Apify (template ships with Zillow/Redfin/Realtor stubs) · PostHog · Sharp (watermark + image processing).

---

### RealScale — real-estate photo enhancement

The most complete reference build on this template. Six Inngest agents scrape new US listings (Apify on Zillow / Redfin / Realtor), auto-qualify them, generate AI before/afters via fal.ai, cold-email listing agents a personalized preview + Stripe checkout, and fulfill paid orders via REimagineHome — zero humans in the fulfillment loop.

- **Repo:** [Zilla-HQ/realestate](https://github.com/Zilla-HQ/realestate) · **Live:** [realscale.app](https://realscale.app) · **Pricing:** $79 Standard / $149 Premium / $199 Rush (one-time per listing)
- **Pipeline:** `Discovery → Qualification → Preview → Outreach → [Payment] → Fulfillment → Delivery` + 72h follow-up + auto-reply triage
- **Compliance:** CAN-SPAM auto-footer, TCPA SMS gate, NAR "Virtually Staged" stamp (non-bypassable in `fulfillment.ts`), Apify-only scraping (1 call/source/6h), complaint-rate kill-switch at 0.3% 24h

**Providers beyond template defaults:**
- **Image gen:** fal.ai Nano Banana Pro (~$0.01–0.05 per preview, 4 styles per Premium tier)
- **Paid fulfillment:** REimagineHome ($0.25–0.50 per high-res staged photo; swappable to Virtual Staging AI via `STAGING_PROVIDER`)
- **Optional:** Lob (direct mail), Mapbox (satellite tiles for renovation mockups), Meta Ads API (paid acquisition), Yelp (contractor matching), ATTOM / PropertyRadar (homeowner skiptracing for the B2C side), Apollo (skiptrace fallback)

**Key env vars (delta from template):** `APIFY_ZILLOW_ACTOR`, `APIFY_REDFIN_ACTOR`, `APIFY_REALTOR_ACTOR`, `FAL_API_KEY`, `FAL_PREVIEW_MODEL`, `REIMAGINEHOME_API_KEY`, `REIMAGINEHOME_BASE_URL`, `STAGING_PROVIDER`, `OPENAI_VISION_MODEL`, `PRICING_STANDARD_CENTS`, `PRICING_PREMIUM_CENTS`, `PRICING_RUSH_CENTS`, `FULFILLMENT_DAILY_BUDGET_CENTS`, `DAILY_SEND_CAP`, `PREVIEW_DAILY_CAP`

**What RealScale adds on top of the template:**
- **5-service catalog** (`lib/services.ts`): photo-staging, twilight-exterior, curb-appeal, pool-mockup, solar-mockup — with pricing, prompts, audience tag (agent vs. renovate)
- **City-keyed programmatic SEO:** `app/(marketing)/{curb-appeal,pool-cost,solar-payback,twilight-photos,virtual-staging}/[city]/page.tsx` — one folder per service × N cities
- **Two-funnel chooser:** `/agents` (B2B paid funnel) + `/renovate` (B2C homeowner free-mockup funnel)
- **Personalized preview pages** (`/l/[listingSlug]` + `personalized-checkout.tsx` with tier selector)
- **Free photo-score tool** (`app/(marketing)/tools/photo-score/page.tsx`) — no-signup lead magnet
- **NAR disclosure page** (`app/(marketing)/disclosure/page.tsx`) — compliance front-door
- **Vision QC gate** (`lib/vision.ts`) — GPT-4o-mini room classification + photo quality threshold before fulfillment runs
- **B2C "renovate" pipeline:** `lib/homeowner-discovery.ts` (ATTOM / PropertyRadar) + `lib/skiptrace.ts` (Apollo) + `lib/find-contractor-email.ts` (Yelp profile → email) + `match-contractors` Inngest function
- **Marketing components:** before/after comparator, recent-stages gallery, launch banner, Meta Pixel + Track-Purchase pixel
- **Admin endpoints:** abandoned-cart, Meta campaign activator, Meta setup with dynamic interest resolution, runtime promo creator, launch-blast, freebie-offer, apify/fal probes
- **Marketing drafts:** Reddit / HN / PH / Inman / HousingWire / RISMedia copy ready to ship (`marketing/drafts/`)

**Vertical-specific judgment calls:**
- **NAR "Virtually Staged" stamp is non-bypassable** — every staged photo gets the watermark before delivery. Compliance gate, not a config knob.
- **TCPA SMS gate:** SMS only after email reply OR Stripe Checkout initiation (not just a link click)
- **Apify-only scraping**, 1 call per source per 6h cron — never direct Zillow/Redfin/Realtor scraping (hiQ v. LinkedIn-friendly legal posture)
- **Photo economics:** fal.ai previews are cheap ($0.01–0.05); REimagineHome fulfillment is expensive ($0.25–0.50/photo). `FULFILLMENT_DAILY_BUDGET_CENTS` caps daily spend to keep margins predictable.

> **→ Full inventory:** [`## About RealScale`](https://github.com/Zilla-HQ/realestate#about-realscale-on-the-zilla-platform) in `Zilla-HQ/realestate` — every provider with its role, every env var, the complete capability-layer file map (12+ Inngest functions, both marketing surfaces, all admin pages, paid-acquisition endpoints, marketing drafts), every compliance gate, the end-to-end pipeline, and what RealScale contributes back to this template. Most of RealScale's add-ons are now mirrored into this template directly, so a new merchant fork starts with the full pattern, not just a stub.

---

### SiteGrid — done-for-you local-business websites (first production merchant)

The original production merchant on the Zilla platform and the source of most cross-vertical patterns now in the template. $199 done-for-you websites for local-service businesses, delivered in 24 hours from their Google Business Profile, across 19 verticals (dental / chiro / fitness / salons / law / CPA / trades / restaurants / retail / auto / pets / …). Currently pushing dental + fitness on Meta.

- **Repo:** [Zilla-HQ/sitegrid](https://github.com/Zilla-HQ/sitegrid) · **Live:** [sitegrid.xyz](https://sitegrid.xyz) · **Pricing:** $199 one-time + optional $99/yr hosting renewal · Founding code `FOUNDING10` (10% off)
- **Pipeline:** `Google Places sweep (21 cities × 19 categories) → Hunter + Apollo email backfill → Cold email (Resend, warmup 20→200/day, Claude-personalized, 4-touch follow-up, hero-photo preview card) → Inbound classifier (6 buckets) → Self-serve funnel (business-name autocomplete → preview → Stripe Checkout with BNPL + Meta Pixel + CAPI) → Meta + Google Ads autonomy → Lob direct mail → Programmatic SEO (~570 pages) → Affiliate /ref/:code → Spectacle layer narrated by Earl`

> **Stack divergence (important):** SiteGrid pre-dates this template's Next.js + Inngest stack and runs on **Vite + React (Wouter) + Express + Drizzle + Neon Postgres**, with **node-cron in dev + Vercel HTTP crons in prod**. Routes live in `server/routes.ts` (single ~4500-line file) and crons in `server/cron/*.ts` instead of distributed `app/**/route.ts` + `inngest/functions/`. Every pattern below was *reimplemented* for this template — the SiteGrid → template file map is in [SITEGRID_REFERENCE.md](./SITEGRID_REFERENCE.md).

**Providers beyond template defaults:**
- **Discovery:** Google Places API (autocomplete + place lookup, replaces the Apify property-data stubs)
- **Workflow runtime:** node-cron (dev) + Vercel HTTP crons (prod) instead of Inngest
- **Email enrichment:** Hunter.io + Apollo.io for email backfill on the no-email-yet backlog
- **Email fallback:** SendGrid (legacy fallback; Resend is primary)
- **Direct mail:** Lob (postcards with hero photo, weekday afternoons, daily-budget capped)
- **Paid ads:** Meta Marketing + CAPI + Google Ads Marketing API (both with budget autonomy + daily CAC pause/resume — two independent kill-switches on the same listing)
- **X (Twitter):** OAuth 2.0 with rotating refresh tokens — Earl persona at `@earlmadethis` posts diary entries + weekly recaps
- **Inbound email:** Svix-style webhook on Resend Inbound

**Key env vars (delta from template):** `GOOGLE_PLACES_API_KEY`, `RESEND_SEND_DOMAIN`, `RESEND_FROM_LOCAL`, `OUTREACH_WARMUP_STARTED`, `INBOUND_EMAIL_SECRET`, `UNSUB_SECRET`, `CRON_SECRET`, `META_ADS_ACCESS_TOKEN`, `META_AD_ACCOUNT_ID`, `EARL_TWITTER_HANDLE`, `EARL_TWITTER_TOKEN`, `EARL_TWITTER_REFRESH_TOKEN`, `EARL_TWITTER_CLIENT_ID`, `EARL_TWITTER_CLIENT_SECRET`, `TWITTER_ENABLED`, `AGENT_NAME`, `BENCH_OPERATOR_EMAIL`, `LIVE_REFRESH_SECS`

**What SiteGrid contributed to the template** (SiteGrid source path → template file; full map in [SITEGRID_REFERENCE.md](./SITEGRID_REFERENCE.md)):
- **Affiliate program** ($50/$100/$250 tiered commissions, 90-day cookie, paste-ready swipe file at `app/partners/kit/page.tsx`): `server/routes.ts` → `lib/affiliate.ts`, `app/ref/[code]/route.ts`, `app/api/admin/referrals/route.ts`
- **Sponsor / partner / press outreach** (separate sender domain, 3-touch cadence, no auto-reply): `server/cron/sponsor-*.ts` → `lib/sponsor-contacts.ts` + `inngest/functions/sponsor-{discover,send,follow-up}.ts`
- **Abandoned-checkout recovery** (one human-tone email 4h post-checkout, never repeats): `server/cron/abandoned-checkout.ts` → `inngest/functions/abandoned-checkout.ts`
- **Direct mail via Lob** (weekday postcards, daily-budget capped, hero photo on front): `server/cron/direct-mail.ts` + `server/services/lob.ts` → `lib/lob-postcards.ts` + `inngest/functions/direct-mail.ts`
- **Google Ads autonomy runtime** (hourly metric sync + daily CAC pause/resume): `server/cron/google-ads*.ts` → `lib/google-ads-client.ts` + `inngest/functions/google-ads-{sync,autonomy}.ts`
- **4-touch cold-email follow-up** (warmup ramp 20→200/day, Claude-personalized): `server/cron/follow-up.ts` → `inngest/functions/cold-followup.ts` + `lib/cold-followup.ts`
- **Cold-email hero card** (Google profile photo above email body, ~1.4× reply-rate lift): `server/services/resend.ts` → `lib/cold-email-hero-card.ts`
- **Weekly operator digest** (Monday revenue + funnel + paid channels + affiliates): `server/cron/weekly-digest.ts` → `inngest/functions/weekly-digest.ts`
- **Spectacle layer** (`/live`, `/diary`, `/bench`, `/universe`, `/llms.txt`, `/unmute/:token`, `/admin/thoughts`): `server/spectacle/*.ts` → `lib/spectacle.ts` + `app/{live,diary,bench,universe,llms.txt,unmute}/...` + `app/admin/thoughts/page.tsx`
- **Diary auto-tweet + weekly recap tweet** (Earl persona): `server/cron/{diary-publish-tweet,weekly-recap-tweet}.ts` → `inngest/functions/{diary-publish-tweet,spectacle-weekly-recap-tweet}.ts` + `lib/x-poster.ts`
- **Programmatic SEO N×M generator** (~570 pages, 19 verticals × 30 cities): `server/cron/generate-sites.ts` + `server/lib/seo-pages.ts` → `lib/programmatic-seo.ts`
- **Self-serve Google Places autocomplete → preview → checkout funnel:** `server/services/google-places.ts` + `server/services/self-serve.ts` → `app/api/self-serve/search/route.ts` + `app/preview/[slug]/page.tsx`
- **Customer-site footer widget** for organic attribution (every shipped site links back): `server/static.ts` → `app/widget/footer.js/route.ts`
- **Email blocklist + 6-bucket inbound classifier:** `server/lib/opt-out.ts` + `server/services/inbound-email.ts` → `lib/email-blocklist.ts` + reply-handler pipeline
- **Stripe BNPL chooser** (Klarna / Afterpay / Affirm / Cash App / Link toggle): `server/routes.ts:/api/checkout` → `lib/stripe-bnpl.ts`
- **Per-vertical concern catalog** (4-archetype copy: dining / experience / service / retail): `server/lib/vertical-copy.ts` → `lib/vertical-concerns.ts`
- **Token-gated customize UI** (HMAC token, no login, returnable days later from any device): `server/lib/customize-token.ts` → `lib/customize-token.ts` + `app/customize/[id]/page.tsx`
- **Server-side click redirector** with engaged-state guard: SiteGrid checkout flow + Stripe webhook idempotency → `app/c/[id]/[kind]/[slug]/route.ts`
- **Persona voice doc** (Earl: small-town American craftsman, Mr. Rogers warmth, 12–18-word sentences, no emoji unless customer used one first): `server/spectacle/persona.ts` → [PERSONA.md](./PERSONA.md)

**Vertical-specific judgment calls:**
- **4-archetype copy dispatch** (dining / experience / service / retail) instead of 19 vertical-specific templates — reduces copy burden, falls back to "service"
- **19 verticals × 21 cities** discovery sweep with operator-tunable category list in `server/cron/discover.ts:DEFAULT_VERTICALS` + `LOCATIONS`
- **No TikTok automation in code** — operator playbooks live in `docs/TIKTOK_CONTENT_PLAN.md` + `docs/UGC_CREATOR_BRIEF.md` instead (the template promotes these to runbook form in [TIKTOK.md](./TIKTOK.md) + [UGC.md](./UGC.md))
- **Two ad-autonomy stacks** (Meta + Google) that can each independently pause the same listing — defense against single-channel cost overrun
- **Direct-mail Lob caps:** 20 pieces/run + $50/day default, weekday afternoons only (Lob same-business-day cutoff)

> **→ Full inventory:** [SiteGrid's README](https://github.com/Zilla-HQ/sitegrid#readme) in `Zilla-HQ/sitegrid` — offer + pricing, 19 verticals × 21 cities, Vite+Express stack divergence, full provider stack, every env var, the complete capability-layer file map (every cron + service + route group on the Express side), Earl persona voice notes, and the **17-pattern contributions-to-template table** showing where each SiteGrid pattern lives in this scaffold. Provenance map also at [**SITEGRID_REFERENCE.md**](./SITEGRID_REFERENCE.md).

---

### Sitebeat — autonomous SEO monitoring (first subscription merchant)

The first subscription merchant on the template. A $29/mo / $290/yr SEO-monitoring SaaS with one hook: *"you only hear from us when something breaks."* A free 13-check Cheerio-based audit on URL submit is the lead magnet; weekly Monday re-crawls diff against the prior audit and only alert on regressions. The source of the 3-touch follow-up + email-blocklist + 14-day-trial-vs-promo data + 7-catalog programmatic SEO + Chrome / WordPress distribution patterns now in the template.

- **Repo:** [Zilla-HQ/sitebeat](https://github.com/Zilla-HQ/sitebeat) · **Live:** [sitebeat.tech](https://sitebeat.tech) · **Pricing:** $29/mo or $290/yr (17% annual discount) · 14-day free trial on **monthly only** — annual takes commitment up-front
- **Pipeline:** `Public free-audit hook → Cheerio 13-check audit → Email report → 3-touch follow-up → Stripe Checkout with 14-day trial → Weekly Monday re-audit cron → Regression-only alert`

**Providers beyond template defaults:**
- **SEO check engine:** **Cheerio** (server-side HTML parsing) + custom checks — HTTPS, meta description, heading structure, page speed (TTFB), sitemap.xml, robots.txt, canonical, mobile viewport, language attr, alt-text coverage, Open Graph tags, broken internal links, JSON-LD. No Lighthouse, no headless browser — pure HTML parse + a few HEAD requests.
- **Discovery:** Apify Yelp scraper (different vertical list than RealScale's property actors) — see `app/api/cron/discover/route.ts:DEFAULT_YELP_TERMS`
- **Distribution surfaces:** Chrome MV3 extension (`extension/`) + WordPress plugin (`wordpress-plugin/sitebeat/`) — both submit to the same `/api/audit` pipeline
- **X (Twitter):** Same OAuth 2.0 + rotating-refresh-token pattern as SiteGrid (`lib/x-poster.ts` + `lib/x-oauth.ts`) — `@Sitebeatapp`
- **Optional:** Meta Pixel + Conversions API for cold-outreach attribution

**Key env vars (delta from template):** `DISCOVERY_SEED_URLS` (CSV of curated Apify-actor + directory-URL pairs per vertical — Eater "best restaurants", Bob Vila "best HVAC contractors", etc.). Most other vars are inherited template defaults; Sitebeat is the leanest config.

**What Sitebeat contributed to the template:**
- **3-touch cold follow-up sequence** (DAY2 nudge / DAY5 friction-killer / DAY10 break-up; idempotent stage gating; thread-aware `In-Reply-To`): `lib/cold-followup.ts` + `lib/cold-followup-templates.ts` + `inngest/functions/cold-followup-sweep.ts`
- **14-day free trial vs. FIRST50 50%-off promo** (free trial measurably outperformed; revenue-by-ref tracking in `app/admin/affiliates`): `app/api/checkout/route.ts:trial_period_days`
- **Partner outreach pipeline** (B2B; separate sender; no auto-reply; founder-touch volume): `lib/partner-outreach.ts` + `lib/partner-pitch-template.ts` + `lib/partner-import.ts` + `app/admin/partner-outreach`
- **Email blocklist + validator** (STOP / unsubscribe / remove keyword detection, CAN-SPAM): `lib/email-domain-blocklist.ts` + `lib/validate-email.ts`
- **Conversation thread view** (Resend inbound grouped by reply chain): `lib/conversations.ts` + `app/admin/conversations`
- **Custom UTM → revenue affiliate plumbing** (no Rewardful dependency; `audits.utmSource` + `subscriptions.ref` columns): `app/admin/affiliates/page.tsx`
- **7-catalog programmatic SEO surface** (~600 indexed URLs from ~10 lines per surface): `lib/{tools,competitors,industries,platforms,glossary,audiences,blog}-catalog.ts`
- **Chrome MV3 extension** (one-click audit on active tab): `extension/`
- **WordPress plugin** (WP admin → `/api/audit`): `wordpress-plugin/sitebeat/`
- **Subscription welcome / weekly audit / regression alert Inngest functions:** `inngest/functions/{subscription-welcome,weekly-audit,audit,audit-report-email,regression-alert}.ts`
- **X auto-poster with the rotating-refresh-token gotcha** — calling `/oauth2/token` from a diagnostic script bricks the production token; full writeup in [X.md](./X.md): `lib/x-poster.ts` + `lib/x-oauth.ts` + `inngest/functions/x-mentions-poll.ts`

**Vertical-specific judgment calls:**
- **ICP pivot story:** first 92-email batch hit 0% on restaurants/salons. Pivoted to 30+ higher-margin SMB verticals (marketing agencies, accountants, legal, health private practices, real estate, premium trades, 1:1 service pros). Now documented as the [ICP_FRAMEWORK.md](./ICP_FRAMEWORK.md) 4-filter test (pricing tolerance / marketing self-determination / pain visibility / channel fit).
- **"Regression-only" positioning** vs. competitor "always-on dashboards" — matches DIY SMB owners who hate SaaS dashboards. Email-first; no customer portal in v1.
- **Stateless weekly audit:** each Monday re-audit just diffs against the most recent prior row — no "last known good" state machine. Pure threshold (score drop ≥5 pts OR any check pass → warn/fail).
- **Email as primary interface:** subscribe / billing-portal / unsubscribe are all one-click from email links. No login.
- **Discovery via curated directory seeds**, not generic Yelp categories — `DISCOVERY_SEED_URLS` env is the per-vertical launch lever.
- **Annual plan has no trial** — higher commitment signal; monthly captures card up-front via 14-day trial.

> **→ Full inventory:** [`## About Sitebeat`](https://github.com/Zilla-HQ/sitebeat#about-sitebeat-on-the-zilla-platform) in `Zilla-HQ/sitebeat` — the 13-check Cheerio audit engine (every check listed + cost + threshold), full provider stack, Sitebeat-unique env vars, the **12-pattern contributions-to-template table**, ICP pivot story, and the email-as-primary-interface design decisions.

---

### Restay — Airbnb listing optimization (first platform-proxied merchant)

The reference for cold-outbound merchants where the recipient is **platform-proxied** — Airbnb hides host email; same shape as Instagram creators, gig-platform workers, ticket-marketplace sellers. Inngest agents scrape Airbnb listings (Apify), score them "obviously not optimized," generate AI before/after photos (fal.ai Flux Kontext **edit-only** — declutter / relight / sky-replace, never additive, Airbnb TOS-safe) + rewritten copy + a 30-day pricing recommendation, multi-step enrichment to find the host's email, send a personalized preview, and fulfill end-to-end. Positioned as *"less than a month of Guesty"* — the $79 one-time price is the strategic choice that lets paid CAC pencil (subscription competitors like PriceLabs / Wheelhouse / Beyond can't run Meta with $20/mo unit economics).

- **Repo:** [Zilla-HQ/airbnb](https://github.com/Zilla-HQ/airbnb) · **Live:** [restay.agency](https://restay.agency)
- **Pricing:** **Listing Tune-Up** — $79 Standard / $129 Rush (copy + 10 edited photos + pricing report). **Photo Restyle** — $49 Standard / $89 Rush (photos only). All one-time, not subscription.
- **Pipeline:** `Apify discovery (cached 2,288 listings → ~weeks of outreach per scrape) → Qualification → Preview (fal.ai Flux Kontext edit-only + Claude copy rewrite + Airbtics pricing) → Multi-step host-email enrichment → Cold outreach (warmed sender) → 72h follow-up → Reply-handler triage → Stripe Checkout → Fulfillment (zip + watermarked photos + pricing report) → /delivery/<orderId>`

**Providers beyond template defaults:**
- **Image gen:** fal.ai Flux Kontext in **edit-only mode** — strict TOS posture (never generates furniture, never removes structural elements)
- **Discovery:** Apify Airbnb actors ×3 (`tri_angle/airbnb-scraper` for detail, `voyager/airbnb-search-scraper` for comp pricing, `apify/airbnb-reviews-scraper` for review signal)
- **Email enrichment:** Hunter.io (domain → email match), Apollo.io (multi-listing managers), Claude `web_search` for plausible-business hosts, county STR permit registries (Nashville / Austin / NYC / SF), Airbnb "contact host" form fallback (rate-limited, trackable)
- **Pricing data:** Airbtics (third-party Airbnb pricing API for the 30-day recommendation)
- **Ad attribution:** Meta CAPI + Google Ads gtag + Reddit Pixel (paid + organic surfaces)

**Key env vars (delta from template):** `APIFY_AIRBNB_ACTOR`, `APIFY_AIRBNB_SEARCH_ACTOR`, `APIFY_AIRBNB_REVIEWS_ACTOR`, `HUNTER_API_KEY`, `APOLLO_API_KEY`, `AIRBTICS_API_KEY`, `AIRBNB_DISCOVERY_CITIES`, `AIRBNB_DISCOVERY_LIMIT`, `NEXT_PUBLIC_GOOGLE_ADS_ID`, `NEXT_PUBLIC_META_PIXEL_ID`, `NEXT_PUBLIC_REDDIT_PIXEL_ID`, `REPLIES_EMAIL`

**What Restay adds on top of the template:**
- **Multi-step host-email enrichment** (`lib/host-enrich.ts`) — 6 attempts in order, first hit wins: (1) regex listing description for personal site / Instagram / business name, (2) Hunter.io domain match, (3) Apollo for multi-listing managers, (4) Claude `web_search` for plausible-business hosts, (5) county STR permit registries, (6) Airbnb "contact host" form fallback. Realistic match rates: 25–40% single-property, 60–80% multi-listing. Full runbook in [ENRICHMENT.md](./ENRICHMENT.md).
- **Free public listing grader** (`/grade`, `lib/grader.ts`, `app/api/grade/route.ts`) — Claude-vision-scored 0–100 across copy / photos / signals + 3 named fixes, <5s, ~$0.005/call, no signup. The SEO surface, the lead magnet, and the Meta retargeting pool in one route.
- **25 programmatic city pages on the grader pattern** (`/grade/[city]`, `/host/[city]`) — Nashville, Austin, Miami, NYC, Scottsdale, …
- **Domain warm-up ramp scheduler** (`scripts/send-tier{1..6}-batch.ts`) — non-negotiable when the sending subdomain is <14 days old. Hard ramp: 25 → 50 → 100 → 200 → 500 → 1000/day. Tier-1 = 10 personal relationship drafts; tier-2..6 = template batches with idempotency keys. Documented in [RESTAY.md#domain-warm-up-ramp](./RESTAY.md).
- **Apify result caching pattern** (`lib/apify.ts`) — preserve actor run IDs in scripts so one discovery run feeds 2–4 weeks of outreach at the daily cap without re-burning credits. 2,288 cached scrapes feeding weeks of outreach.
- **Edit-only photo policy** (`lib/services.ts`, `/disclosure` page) — declutter / relight / color / sky / HDR only. Never additive (no virtual furniture, no structural removal). Originals retained + footer disclosure. The template pattern for any TOS-restricted platform (Instagram, marketplaces).
- **FLASH-style time-limited promo banner** (`components/marketing/flash-banner.tsx` + `/api/flash-status`) — SSR'd on first paint to avoid CLS, dismissible cookie. `FLASH50` with a 2-day expiry window in production.
- **Affiliate program** (`/partners`, `app/api/partners/apply`) — 30% of $79 = $23.70 per converted referral, paid weekly via Stripe. Outcompetes subscription competitors' affiliate economics (PriceLabs 10%, Hospitable 25%, Wheelhouse 50%/mo spread).
- **Founder `/manifesto` page** — long-form vision for warm-lead conversion + organic backlinks from operator's personal social
- **Host + Manager landing pages** (`/host`, `/host/[city]`, `/manager`) — segmented messaging for self-serve hosts vs. property managers
- **Operator playbook docs** — `docs/growth-plan.md` (strategy) + `docs/MANUAL_CHECKLIST.md` (operator-only work) + `docs/outreach/{affiliate-tier1,affiliate-tier2,podcast-sponsors}.md` + `docs/creative/reel-scripts.md`. Templated into this repo at `docs/operator-playbook-template.md` + `docs/outreach/*` + `docs/creative/*`.
- **State CCPA/CPA opt-out at discovery layer** (`lib/state-optout.ts`) — US-only outreach in v1; excludes EU/Canada until GDPR/CASL framework added

**Vertical-specific judgment calls:**
- **Why $79 one-time, not subscription:** $20/mo competitor unit economics make paid CAC brutal. $79 one-time lets $20–25 Meta CAC actually pencil, and lets affiliates be paid 30% instantly instead of waiting on month-long spreads.
- **Edit-only photo policy is the Airbnb TOS gate.** fal.ai Flux Kontext in strict mode + the `/disclosure` page document the posture publicly.
- **Domain warm-up is non-negotiable** when the sending subdomain is <14 days old. 14-day silent ramp before tier-1 outreach.
- **Hunter free tier (50 lookups/mo)** is enough because the match-rate physics already filter — 60–80% on multi-listing hosts, much lower on single-property. Single-property fallbacks (web search + registries + form) cover the gap.
- **No SMS in v1** — Twilio's A2P 10DLC registration takes ~4 weeks; not worth the lead time vs. email-first.
- **Discovery cron is US-ZIP-scoped** (`AIRBNB_DISCOVERY_CITIES`) — CCPA/CPA is the bar; EU/Canada come later.

> **→ Full inventory:** [`## About Restay`](https://github.com/Zilla-HQ/airbnb#about-restay-on-the-zilla-platform) in `Zilla-HQ/airbnb` — every provider with its role, all env vars, the 6-step host-email enrichment pipeline detail, domain warm-up tier1-6 ramp scheduler, full Inngest workflow suite, edit-only photo policy details, and vertical-specific judgment calls. Reusable patterns are documented in [RESTAY.md](./RESTAY.md) and [ENRICHMENT.md](./ENRICHMENT.md).

---

## Where to start (the four guides + the operator prompt)

Before diving into code, every merchant fork gets stood up by working through these four guides in order. Don't skip ahead — each one assumes the previous is done.

| # | Guide | Audience | Why |
|---|---|---|---|
| 1 | [**SETUP.md**](./SETUP.md) | Engineer | 30-min path from `git clone` to live merchant. Includes the **`vercel env pull`** flow that injects every Zilla-platform secret (Meta token, R2 keys, etc.) without copy-paste. |
| 2 | [**SEO.md**](./SEO.md) + [**ZILLA_HQ_SETUP.md**](./ZILLA_HQ_SETUP.md) | Engineer + operator | Sitemap, GSC, Bing, IndexNow, OG images. Fully autonomous for `*.zilla.so` subdomains, near-autonomous for apex. **Every merchant needs SEO; not every merchant runs paid ads — start here before the ad docs.** |
| 3 | [**META_ADS.md**](./META_ADS.md) + [**ZILLA_HQ_SETUP_META.md**](./ZILLA_HQ_SETUP_META.md) | Engineer + operator | Meta campaign runbook (per-merchant) + the Zilla parent BP setup the platform inherits. The parent BP is provisioned once for the whole portfolio — see ZILLA_HQ_SETUP_META.md for the one-time setup and the §8 autonomous flow that mints Page + IG + ad account + Pixel for every new sub-co. |
| 4 | [**MERCHANT.md**](./MERCHANT.md) | Engineer | Catalog of every config knob, organized by category, with Required / Optional / Don't-touch tags. The "real work" of customizing for your vertical. |

**Plus, for sub-co operators:** [**SUB_CO_META_ONBOARDING_PROMPT.md**](./SUB_CO_META_ONBOARDING_PROMPT.md) — the paste-into-Claude prompt a founder uses to walk through their sub-company's Day-0 Meta setup conversationally. It hardcodes the Zilla parent BP context (so Claude won't try to create a new one), asks the operator one diagnostic question at a time, then steps through child-asset creation → Vercel env wiring → Pixel/CAPI verification → AEM → first campaign launch. Operators paste this prompt and follow Claude's responses; engineers don't need to read it line-by-line unless they're customizing it.

**SiteGrid-derived capability docs:** [AFFILIATE.md](./AFFILIATE.md) · [SPONSORS.md](./SPONSORS.md) · [ABANDONED_CHECKOUT.md](./ABANDONED_CHECKOUT.md) · [DIRECT_MAIL.md](./DIRECT_MAIL.md) · [SPECTACLE.md](./SPECTACLE.md) · [PERSONA.md](./PERSONA.md) · [PROGRAMMATIC_SEO.md](./PROGRAMMATIC_SEO.md) · [GOOGLE_ADS_LAUNCH_CHECKLIST.md](./GOOGLE_ADS_LAUNCH_CHECKLIST.md) · [EMAILS.md](./EMAILS.md) · [TIKTOK.md](./TIKTOK.md) · [UGC.md](./UGC.md) — all anchored in [**SITEGRID_REFERENCE.md**](./SITEGRID_REFERENCE.md).

**Launch-day playbooks:** [LAUNCH.md](./LAUNCH.md) (Show HN / Product Hunt / Reddit launch-day playbook) · [REDDIT_ADS.md](./REDDIT_ADS.md) (Reddit Ads runbook) · [AD_CREATIVES.md](./AD_CREATIVES.md) (`/og-ad` auto-generated 1080×1080 + 1080×1920 creatives) · [ICP_FRAMEWORK.md](./ICP_FRAMEWORK.md) (picking and pivoting cold-outreach ICPs).

These four guides + the operator prompt are for the team building Zilla itself and for engineers + operators of merchant-template forks. Founders who sign up at zilla.so once the autonomous orchestrator (`inngest/functions/sub-company-onboard.ts`) ships will read **none of them** — the platform will handle everything.

---

## Platform architecture (read this if you're building Zilla itself)

This README and everything else at the root describes **one merchant** — what gets forked per vertical.

The [`architecture/`](./architecture) subfolder is the **Zilla platform** spec — the layer underneath every merchant instance. If you're working on:

- Stripe Connect Express + application fees
- Parent Business Portfolio / Business Center / MCC (the level above each merchant's child ad account)
- The ad-credit ledger that pre-funds Meta/Google/TikTok spend
- The AI-agent rate-limit middleware
- Compliance / MTL posture / chargeback flow
- Day-0 platform bootstrap or per-sub-company onboarding automation

…that's all in `architecture/`. Start at [**architecture/README.md**](./architecture/README.md), then [**architecture/ARCHITECTURE.md**](./architecture/ARCHITECTURE.md) for the 10-minute system overview.

**Cross-references between the two layers:**

- [SUB_CO_META_ONBOARDING_PROMPT.md](./SUB_CO_META_ONBOARDING_PROMPT.md) (operator paste-into-Claude prompt — the live conversational entry point) → [META_ADS.md](./META_ADS.md) (merchant-side runbook the prompt directs Claude to follow at the campaign-launch step) + [ZILLA_HQ_SETUP_META.md](./ZILLA_HQ_SETUP_META.md) (parent BP one-time setup + autonomous sub-co minting flow) ↔ [architecture/docs/01-ad-network-setup.md](./architecture/docs/01-ad-network-setup.md) (parent-side provisioning) + [architecture/docs/01a-meta-sub-company-replication.md](./architecture/docs/01a-meta-sub-company-replication.md) (the exact Polsia replication procedure — engineer + operator split)
- [GOOGLE_ADS.md](./GOOGLE_ADS.md) ↔ [architecture/docs/01-ad-network-setup.md](./architecture/docs/01-ad-network-setup.md)
- [SETUP.md](./SETUP.md) / [ZILLA_HQ_SETUP.md](./ZILLA_HQ_SETUP.md) / [ZILLA_HQ_SETUP_META.md](./ZILLA_HQ_SETUP_META.md) (merchant-side setup) ↔ [architecture/checklists/new-sub-company.md](./architecture/checklists/new-sub-company.md) (platform-side automation)
- Stripe Checkout (in this repo) ↔ [architecture/docs/02-payments-and-ledger.md](./architecture/docs/02-payments-and-ledger.md) (the Stripe Connect application_fee layer that wraps it)

---

## Two paths to merchant #2

### A. Use this as a GitHub Template (recommended)

1. Click **"Use this template"** on the repo page
2. Create your new merchant repo (`Zilla-HQ/<your-merchant>`)
3. Follow [**SETUP.md**](./SETUP.md) for a 30-minute walkthrough from blank Vercel project to live cold-outreach
4. Customize via [**MERCHANT.md**](./MERCHANT.md) — the full catalog of every place you need to edit, organized by category, with Required / Optional / Don't-touch tags

### B. Clone manually
```bash
git clone https://github.com/Zilla-HQ/merchant-template.git my-merchant
cd my-merchant
rm -rf .git && git init
# … then follow SETUP.md
```

---

## What's in the box

### Platform code (don't edit — it's merchant-agnostic)

- **Inngest workflow runtime** (`inngest/functions/`) — durable cron + event triggers, step retries, fan-out, idempotency, concurrency caps
- **CAN-SPAM compliance** (`lib/resend.ts:sendComplianceEmail`) — every send auto-injects physical-address footer + one-click unsubscribe + List-Unsubscribe headers. **No bypass.**
- **State consumer-privacy gate** (`lib/state-optout.ts`) — CCPA/CPA-aware opt-out check before any cold-residential send. Hard-coded never-email TLDs (.gov/.edu/.mil/.int) + system-mailbox prefixes + the platform's blacklist + an optional state DNC provider hook.
- **TCPA gate** (`lib/twilio.ts`) — SMS only after explicit consent. Hard-coded.
- **Reply triage** (`inngest/functions/reply-handler.ts`) — Claude classifies inbound emails into 6 buckets (interested / price / style / decline / unsubscribe / complex). Subject + body weighted equally. Regex fast-path covers ~30% of obvious cases without an LLM call. Auto-replies the first four with class-aware intent + optional promo-code injection. Flags complex for human review and pages the operator with full context for hot ("interested") leads.
- **Operator alerts** (`lib/operator-alerts.ts`) — `[Heat: 🔥] X replied` emails to your inbox with the inbound + draft auto-reply preview inline. Triaging via inbox > tailing logs.
- **Outreach observability** (`outreach_events` table + `/admin/outreach`) — every send (cold + transactional) is logged with opened-at, clicked-at, replied-at via Resend webhook.
- **Email tracking with engaged-state guard** (`/api/track/open/:id` + `/api/track/click/:id` + the server-side click redirector at `app/c/[id]/[kind]/[slug]/route.ts`) — pixel + redirector. Already-engaged leads (replied / purchased / unsubscribed) never get downgraded back to "opened" or "clicked" when an old email link re-fires.
- **Plain-text-first HTML for LLM-drafted bodies** — `sendComplianceEmail({ plainTextOnly: true })` renders text-first HTML instead of MJML for auto-replies. Spam filters favor email that looks human-typed; measurable 10-15% deliverability lift over MJML for AI prose.
- **Cold-email hero card** (`lib/cold-email-hero-card.ts`) — inline hero-photo preview card for outreach bodies. ~1.4× reply-rate lift in SiteGrid's data. Works for any merchant whose preview has a single dominant image.
- **Per-vertical concern library** (`lib/vertical-concerns.ts`) — `getVerticalConcern("restaurant")` → `"reservations breaking"`. Wired into the abandoned-checkout body + objection-handler reply templates so different verticals hear their actual fears named back to them.
- **Conversation thread view** (`/admin/outreach/<id>`) — merges cold sends + follow-ups + inbound replies + auto-replies per listing.
- **Contacts directory** (`/admin/contacts`) — every realtor/customer reached out to with sent/opened/clicked/replied roll-ups.
- **Agent-thoughts curation queue** (`/admin/thoughts`) — operator UI to publish / unpublish / delete entries from the spectacle layer's `agent_thoughts` table.
- **Readiness checklist** (`/admin`) — probes every env var + admin flag the autonomous loop touches.
- **Admin auth** — Clerk with email-domain allowlist (`ADMIN_EMAIL_DOMAINS`).
- **Stripe Checkout + webhook** — live-mode payment + signed event verification + **promo-code pre-application** (resolve `"FOUNDING10"` → `promo_xxx` automatically; no manual customer typing).
- **Stripe BNPL chooser** (`lib/stripe-bnpl.ts`) — Klarna / Afterpay / Affirm / Cash App / Link payment-method-type chooser for Stripe Checkout sessions. Toggle per-merchant.
- **Post-purchase customize editor** (`lib/customize-token.ts` + `app/api/customize/[id]/route.ts` + `app/customize/[id]/page.tsx`) — HMAC-SHA256 token-gated edit endpoint with a customer-facing UI. Customer comes back days later from any device with the link in their fulfillment email. No session/login.
- **Partner swipe-file page** (`app/partners/kit/page.tsx`) — copy-paste affiliate kit (email templates, social copy, banner assets) for partners to drop into their own channels.
- **Dual-auth helper** (`lib/admin-auth.ts`) — admin endpoints accept Clerk JWT **or** `x-admin-secret` header == `CRON_SECRET`. Lets cron jobs invoke admin actions without user context.
- **R2 (S3-compatible) storage** — renders + delivery zips.
- **Discovery cron + manual trigger** — `discoveryFn` runs every 6h; one-click "Run discovery now" on `/admin`.
- **Cold homeowner pipeline** — `lib/homeowner-discovery` (ATTOM / PropertyRadar) + `lib/skiptrace` (Apollo / Hunter) + `lib/state-optout` + `homeowner-discovery` cron.
- **Marketplace side** — `lib/yelp` (search) + `lib/find-contractor-email` (auto-discover partner email via Yelp profile / Google search) + `match-contractors` agent that auto-emails partners with referral terms.
- **Meta paid acquisition stack** — Pixel + Conversions API + Marketing API integrations (`lib/meta-capi.ts`, `lib/meta-ads.ts`), plus four Inngest crons (one hourly, three daily):
  - `meta-ads-sync` — hourly insights snapshot
  - `meta-ads-autonomy` — daily Purchase-CAC pause/resume
  - `meta-ads-lead-scaler` — daily budget +20% every 3 days, auto-pause on Lead-CAC breach, hard-cap at config max
  - `meta-ads-fatigue-check` — daily creative fatigue alert (frequency > 2.5)
  - 6 helper scripts in `scripts/meta-*.ts` for one-shot campaign launch, video upload, ad creation, snapshot, CAPI verification, and scaler smoke-test. **See [META_ADS.md](./META_ADS.md) for the full runbook** including all the gotchas (System User scopes, asset Manage-level assignments, app Live mode, advantage_audience flag, chunked video upload).
- **Google Ads stack** — gtag conversion tracking + Marketing API client + branded-defense launch script + budget scaler:
  - `components/marketing/ad-pixels.tsx` auto-injects `gtag.js` when `NEXT_PUBLIC_GOOGLE_ADS_ID` is set
  - `lib/google-ads.ts` — REST client around `googleads.googleapis.com/v20/...`
  - `scripts/google-ads-mint-refresh-token.ts` — one-shot OAuth flow to mint a long-lived refresh token (no npm deps)
  - `scripts/google-ads-smoke-test.ts` — credential validator that confirms developer token + refresh token + MCC auth path
  - `scripts/google-ads-launch-branded.ts` — programmatic branded-defense Search campaign launch (campaign + ad group + RSA + sitelinks + callouts + conversion action in one mutate)
  - `inngest/functions/google-ads-budget-scaler.ts` — daily stateless budget scaler with CAC-based auto-pause
  - `inngest/functions/google-ads-sync.ts` — hourly metrics sync to admin dashboard
  - **See [GOOGLE_ADS.md](./GOOGLE_ADS.md) (engineer) and [GOOGLE_ADS_OPERATOR.md](./GOOGLE_ADS_OPERATOR.md) (sub-company operator) for the full setup.** Includes Manager Account (MCC) creation, Developer Token application (Test → Basic, ~1 business day), Cloud project + OAuth client, refresh token minting, per-merchant ad account linking, and all the gotchas (API version v20, Test access doesn't work on real accounts, Performance Max trap, etc.).
- **Email enrichment backfill** (`inngest/functions/backfill-emails.ts`) — manual-only event-triggered cron that re-enriches listings missing `agentEmail` via Hunter+Apollo. Per-run cap keeps quota predictable. **Without this, 40-60% of cold leads never get outreach.**
- **Per-vertical copy library** (`lib/vertical-copy.ts`) — `getVerticalFeature("restaurant")` → `"online reservations"`. Wired into `draftOutreachEmail` for vertical-specific social proof. 30-50% reply-rate lift documented vs. generic copy.

### Merchant-specific stubs (replace with your own)

- **`lib/services.ts`** — service catalog (2 stub services). The single biggest customization file.
- **`lib/samples.ts`** — sample image references (placeholder URLs until you generate real ones).
- **`scripts/generate-service-samples.mjs`** — sample-regen script you'll run once after defining your services.
- **`app/(marketing)/page.tsx`** — homepage two-funnel chooser (placeholder copy).
- **`app/(marketing)/audience-a/page.tsx`** — paid funnel (placeholder hero, stats, pricing).
- **`app/(marketing)/audience-b/page.tsx`** — free + referral funnel (placeholder hero, partner framing).
- **`components/marketing/faq.tsx`** — FAQ items (placeholder Q/A).
- **`app/(marketing)/disclosure/page.tsx`** — vertical-specific disclosure (placeholder).
- **`lib/falai.ts` + `lib/claude.ts`** — generation prompts (real-estate-flavored copy by default; rewrite per merchant).
- **`inngest/functions/outreach.ts:buildHomeownerEmail`** — homeowner cold-email copy.
- **`inngest/functions/discovery.ts`** — which Apify actors run (Zillow / Redfin / Realtor by default).
- **`lib/apify.ts`** — actor IDs + normalizers per source.
- **`lib/yelp.ts:SERVICE_CATEGORY`** — partner-directory categories per service.

[**MERCHANT.md**](./MERCHANT.md) catalogs **every single touchpoint** with Required / Optional / Don't-touch tags.

---

## Operator templates (in `docs/`)

Restay's operator playbook ships as template files. Copy the ones that fit your merchant, fill in the merchant-specific bits, and they're ready to send/post.

| File | What it is |
|---|---|
| `docs/operator-playbook-template.md` | Manual checklist — the work only the operator can do (account UI setup, content recording, branded Google Ads, Reddit organic, podcast inquiries). Restay calls this `MANUAL_CHECKLIST.md`. |
| `docs/growth-plan-template.md` | Strategic frame — competitor edges, unpaid plays ranked, paid plays ranked, 30/60/90 sequencing, success metrics. Refresh quarterly. |
| `docs/outreach/affiliate-tier1-template.md` | 10 personalized cold-email drafts to the highest-leverage industry voices in your space (podcasters, course creators, OG bloggers). |
| `docs/outreach/affiliate-tier2-template.md` | Bulk-but-personal template for 50 mid-tier coaches / creators in your space. |
| `docs/outreach/podcast-sponsors-template.md` | 3 podcast sponsor inquiries with budget anchors. |
| `docs/creative/reel-scripts-template.md` | 5 UGC vertical-reel scripts (15–25s, 1080×1920) for Meta + Instagram. Rotate every ~2 weeks for fatigue. |
| `docs/google-ads-design-doc-template.md` | Per-merchant Google Ads launch notes template. |

---

## Quick stats

- ~16,000 lines of platform code
- 18+ Inngest functions: discovery, qualification, preview, outreach, follow-up, reply triage, fulfillment, mailer, contractor matching, homeowner discovery, self-serve ingest, meta-ads-sync, meta-ads-autonomy, meta-ads-lead-scaler, meta-ads-fatigue-check, backfill-emails, google-ads-sync, google-ads-budget-scaler, abandoned-checkout, direct-mail, weekly-digest, sponsor-{discover,send,follow-up}, diary-publish-tweet, spectacle-weekly-recap-tweet, followup-extended
- 13+ admin pages (dashboard, listings, outreach + thread, contacts, leads, orders, postcards, campaigns, thoughts, settings, sign-in/up)
- 11 third-party API integrations (Apify, fal.ai, Anthropic, Resend, Stripe, Clerk, R2, PostHog, Meta Marketing+CAPI, Google Ads, Lob, Hunter, Apollo) + several env-flagged optional ones
- 6 standalone scripts in `scripts/` for Meta campaign operations, plus Google Ads refresh-token + launch + smoke-test scripts
- Drizzle schema with the core tables (listings, previews, outreach_events, orders, messages, admin_settings, agent_costs, contractor_leads, contractor_intros, campaigns) **plus** SiteGrid-derived tables (email_blocklist, conversions, referrals, outbound_contacts, outbound_contact_messages, direct_mail_events, agent_thoughts, bench_runs, outbound_tweets)
- TypeScript strict, typecheck-clean

---

## License

Private. See LICENSE if added.

## Next steps

1. Read [**SETUP.md**](./SETUP.md) — the 30-minute setup walkthrough
2. Read [**MERCHANT.md**](./MERCHANT.md) — the customization catalog
3. Read [**SEO.md**](./SEO.md) — sitemap, Google Search Console, Bing Webmaster, IndexNow, OG images, and the **autonomous bootstrap** that registers each `*.zilla.so` subdomain merchant without operator clicks. Pair with [**ZILLA_HQ_SETUP.md**](./ZILLA_HQ_SETUP.md) for the one-time platform-team provisioning that makes the autonomous flow possible. **Every merchant needs SEO; not every merchant runs paid ads — start here before the ads docs.**
4. Read [**META_ADS.md**](./META_ADS.md) — the Meta paid-acquisition runbook (Pixel + CAPI + Marketing API setup, campaign launch, auto-scaler, all the gotchas). Pair with [**ZILLA_HQ_SETUP_META.md**](./ZILLA_HQ_SETUP_META.md) for the one-time parent BP setup that lets the platform mint Page + IG + ad account + Pixel for every new sub-co automatically. **For sub-co operators**, the conversational entry point is [**SUB_CO_META_ONBOARDING_PROMPT.md**](./SUB_CO_META_ONBOARDING_PROMPT.md) — paste into Claude and follow the diagnostic-then-walkthrough flow; it cites both META_ADS.md and ZILLA_HQ_SETUP_META.md inline.
5. Read [**GOOGLE_ADS.md**](./GOOGLE_ADS.md) — the Google Ads engineer runbook (Manager Account, Developer Token, OAuth, programmatic launch). Pair with [**GOOGLE_ADS_OPERATOR.md**](./GOOGLE_ADS_OPERATOR.md) for the sub-company operator's manual UI walkthrough.
6. Read [**X.md**](./X.md) — X (Twitter) auto-poster + Claude-evaluated mentions auto-reply. **Read the rotating-refresh-token gotcha at the top first** — calling `/oauth2/token` from a diagnostic script bricks the production token. Pair with [**ZILLA_HQ_SETUP_X.md**](./ZILLA_HQ_SETUP_X.md) for the one-time HQ X-dev-app setup.
7. Read [**COLD_FOLLOWUP.md**](./COLD_FOLLOWUP.md) — the 3-touch cold-outbound follow-up sequence (DAY2 / DAY5 / DAY10) + the trial-vs-promo decision at the cold-ask step.
8. Read [**PARTNERS.md**](./PARTNERS.md) — the parallel B2B partner-recruitment outreach pipeline (separate sender, no auto-reply, founder-touch volume).
9. Read [**DISTRIBUTION.md**](./DISTRIBUTION.md) — Chrome MV3 extension, WordPress plugin, and teardown content-marketing scaffolds (compounding organic surfaces).
10. Read [**RESTAY.md**](./RESTAY.md) — the Restay-reference patterns (domain warm-up ramp, Apify caching, free public grader funnel, FLASH-style promo banner, founder-essay /manifesto page, edit-only image policy for TOS-restricted platforms, affiliate-program economics)
11. Read [**ENRICHMENT.md**](./ENRICHMENT.md) — when your merchant's recipients are platform-proxied (Airbnb hosts, Instagram creators, gig-platform workers): the 5-step enrichment pipeline (regex → domain match → registry cross-ref → reverse-image → form fallback)
12. Read [**ICP_FRAMEWORK.md**](./ICP_FRAMEWORK.md) — picking and pivoting cold-outreach ICPs. The 4-filter test (pricing tolerance / marketing self-determination / pain visibility / channel fit) + the 30-vertical list Sitebeat pivoted into after the first 92-email batch hit 0%.
13. Read [**REDDIT_ADS.md**](./REDDIT_ADS.md) — Reddit Ads runbook. Pair with [META_ADS.md](./META_ADS.md). Different audience targeting model (communities vs. interests); 3–5× conversion rate on the right subreddit but higher CPL.
14. Read [**AD_CREATIVES.md**](./AD_CREATIVES.md) — `/og-ad` Edge route for auto-generated 1080×1080 + 1080×1920 ad creatives. Right-click → save → upload to Meta / Reddit / TikTok. Distinct from `/api/og` share cards.
15. Read [**LAUNCH.md**](./LAUNCH.md) — Show HN / Product Hunt / Reddit launch-day playbook. Stagger order, submit-time tactics, and the 3 questions every Show HN body should include.
16. Read [**PERSONA.md**](./PERSONA.md) — how to choose the agent's voice for the spectacle layer; what NOT to do; the Earl reference example; alternatives by vertical.
17. Read [**SITEGRID_REFERENCE.md**](./SITEGRID_REFERENCE.md) — provenance map for every SiteGrid-derived pattern in this template (affiliate, sponsor outreach, abandoned checkout, direct mail, spectacle, programmatic SEO, BNPL, hero card, vertical concerns, etc.), with the corresponding file paths in this repo.
18. Browse [**CAPABILITIES.md**](./CAPABILITIES.md) — the master cross-reference of every platform pattern with file paths in this template + the live reference merchants ([SiteGrid](https://github.com/Zilla-HQ/sitegrid), [Restay](https://github.com/Zilla-HQ/airbnb), [Sitebeat](https://github.com/Zilla-HQ/sitebeat), [RealScale](https://github.com/Zilla-HQ/realestate)), so you know "does the template handle X?" at a glance
19. Use the GitHub "Use this template" button to fork
20. Ship merchant #2

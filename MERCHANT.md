# Merchant template — fork-and-config checklist

This repo is the **Zilla-HQ merchant template** — the fork-base for new vertical-specific autonomous AI merchants. Three production merchants run on it today: **Restay** ([restay.agency](https://restay.agency) — Airbnb listing optimization, [`Zilla-HQ/airbnb`](https://github.com/Zilla-HQ/airbnb)), **Sitebeat** ([sitebeat.tech](https://sitebeat.tech) — autonomous SEO monitoring, [`Zilla-HQ/sitebeat`](https://github.com/Zilla-HQ/sitebeat)), and **Relist** (real-estate photo enhancement, [`Zilla-HQ/realestate`](https://github.com/Zilla-HQ/realestate)). Forking this template is the cheapest path to merchant #4 while we're still discovering what's actually shared. This doc is the full catalog of **every place** that needs to change, organized by category. Work top-to-bottom and the new merchant ships.

> **Don't touch** = platform code that should be merchant-agnostic. If you find yourself editing it, that's a signal to lift the change up to a config or a future `@zilla/platform` package — not bury it in the fork.

> **Reference patterns from each merchant:** [RESTAY.md](./RESTAY.md) (cold-outbound-heavy, platform-proxied recipients, free public grader, warm-up ramp, FLASH-style promos, edit-only image policy), [SEO.md](./SEO.md) (Sitebeat's programmatic-SEO catalog pattern), [DISTRIBUTION.md](./DISTRIBUTION.md) (Sitebeat's extension + plugin + teardown content engine), and [ENRICHMENT.md](./ENRICHMENT.md) (Restay's 5-step pipeline for platform-proxied recipients).

---

## 0. Pre-fork: clone + rename

- Fork the repo on GitHub (`Zilla-HQ/merchant-template` → `Zilla-HQ/<merchant-slug>`) — use the "Use this template" button.
- New Vercel project pointed at the fork.
- New domain (e.g. `<merchant>.app` or subdomain of a parent zone). Add via Vercel; auto-DNS will offer to provision DKIM/SPF for a Resend subdomain.
- New Supabase project (database isolation is the strongest compliance posture; do **not** reuse another merchant's DB).
- New Stripe account or new Stripe Connect sub-account.
- New Clerk app.
- New R2 bucket (or namespace within an existing bucket).
- New Inngest app (or shared with a tenant tag).
- New PostHog project.

Cost of all of the above: ~30 min and ~$0 in monthly platform fees until volume spikes.

---

## 1. Brand + identity (sweep first — cheapest blast radius)

These are pure string swaps. Do them before anything functional.

### Required
- [ ] **`lib/resend.ts:8`** — default `BUSINESS_NAME = "Realscale"` → new merchant name.
- [ ] **`lib/lob.ts:7`** — same default.
- [ ] **Vercel env: `BUSINESS_NAME`, `BUSINESS_ADDRESS`** — real legal name + physical mailing address (CAN-SPAM hard requirement, no bypass).
- [ ] **Vercel env: `SENDER_DOMAINS`** + admin settings `senderDomains` JSONB column — should match the new verified Resend subdomain (e.g. `mail.<merchant>.app`).
- [ ] **Vercel env: `REPLIES_EMAIL`** — public-facing reply address for the new domain.
- [ ] **`app/(marketing)/page.tsx`** — homepage chooser (currently "I sell homes / I own a home"). Change copy + funnel CTAs to fit new audiences.
- [ ] **`app/layout.tsx` + `app/(marketing)/layout.tsx`** — `<title>`, `<meta>`, header brand mark.
- [ ] **`app/admin/layout.tsx:20`** — admin sidebar brand text ("Realscale").
- [ ] **`app/admin/sign-in/...page.tsx` + `sign-up/...page.tsx`** — sign-in copy.
- [ ] **`components/marketing/footer.tsx`** — footer brand + links.
- [ ] **`README.md`** — top-level description.

### Optional
- [ ] Favicon, OG image, social cards (`app/icon.*`, `app/opengraph-image.*` if present).
- [ ] Brand colors in `tailwind.config.ts` if the new merchant has its own palette.

---

## 2. Service catalog — the heart of the merchant

This is where merchant identity actually lives. Everything else flows from here.

### Required
- [ ] **`lib/services.ts`** — replace the 5 services (photo-staging, twilight-exterior, curb-appeal, pool-mockup, solar-mockup) with the new merchant's. Each service needs:
  - `id` / `name` / `shortDescription` / `longDescription`
  - `basePriceCents` / `rushPriceCents`
  - `category` (free-form vertical tag)
  - `audience` (`agents`, `renovate`, or `both` — these names are real-estate-specific; rename the `Audience` type in `lib/services.ts:14` to your two funnels, e.g. `seller / buyer`, `lender / borrower`)
  - `imageSource` (`listing_photo` | `satellite_tile` | `exterior_facade`) — drives which preview branch fires; rename if the merchant operates on a different artifact (PDFs, audio, HTML) and add the corresponding branch in `inngest/functions/preview.ts`
  - `promptTemplate` — fal.ai Kontext prompt the preview agent runs against the source artifact
  - `ctaPrimary` / `emailSubjectTemplate`
  - `icon` (lucide-react name)

- [ ] **`lib/samples.ts`** — replace the 5 sample IDs + captions + audiences. Regenerate the actual before/after images via:
- [ ] **`scripts/generate-service-samples.mjs`** — replace the 5 SAMPLES with new source URLs + prompts. Run `node --env-file=.env.production scripts/generate-service-samples.mjs` to upload to R2.

### Don't touch
- `lib/services.ts` lookup helpers (`getService`, `servicesForAudience`, `DEFAULT_SERVICE_ID`).
- `lib/samples.ts:getSampleBeforeAfters` / `getSampleForService` filtering logic.

---

## 3. Page copy — the marketing funnel

Two parallel funnels today: `/agents` (paid) and `/renovate` (free + referral). Rename routes to match the new merchant's funnels.

### Required
- [ ] **`app/(marketing)/agents/page.tsx`** — rename folder to e.g. `app/(marketing)/<funnel-1>/`. Update:
  - Hero headline + subhead
  - The `STATS` array (4 stats with figures + sources, currently real-estate research) — replace with vertical-relevant proof points
  - Pricing card copy ($89 / $138 / $149)
  - The `<SelfServeForm fixedServiceId="…">` default service
- [ ] **`app/(marketing)/renovate/page.tsx`** — rename to `app/(marketing)/<funnel-2>/`. Update:
  - Hero, the address-vs-URL form choice, "How it works" steps
  - The free + referral framing if monetization differs
- [ ] **`app/(marketing)/services/page.tsx`** + `services/[serviceId]/page.tsx`** — copy, FAQ ref. Probably re-usable as-is once `lib/services.ts` is swapped.
- [ ] **`app/(marketing)/l/[listingSlug]/page.tsx`** — the personalized preview page. The "Like it? Get matched" contractor section is renovate-specific; gate on `service.audience === "renovate"` is already in code, but the language ("contractors") may need a new vertical noun.
- [ ] **`components/marketing/faq.tsx`** — `AGENT_ITEMS` + `HOMEOWNER_ITEMS` arrays. Replace with the new merchant's FAQs. The `Audience` type rename in §2 ripples to here.
- [ ] **`app/(marketing)/disclosure/page.tsx`** — currently NAR virtual-staging disclosure. Replace with whichever vertical disclosure the new merchant needs (FINRA suitability, HIPAA, SEC, FTC affiliate, or just delete if none).
- [ ] **`app/(marketing)/privacy/page.tsx`** + **`app/(marketing)/terms/page.tsx`** — sub-processor list mentions Anthropic, fal.ai, OpenAI. Add/remove based on which APIs the new merchant uses.

### Don't touch
- `app/(marketing)/checkout/`, `delivery/[orderId]/`, `unsubscribe/` — payment + delivery + opt-out shell are platform-level.

---

## 4. Discovery sources — where leads come from

Realscale scrapes Zillow / Redfin / Realtor for realtors and ATTOM / PropertyRadar for homeowners. Replace with the new vertical's equivalents.

### Required
- [ ] **`lib/apify.ts`** — `fetchZillow`, `fetchRedfin`, `fetchRealtor` and their normalizers. Replace with the new vertical's source actors. The `ScrapedListing` type is generic enough to keep (`address`, `agentName`, `agentEmail`, `agentPhone`, `photos`, `price`, `dom`) — rename `agentEmail`/`agentName`/`agentPhone` if the new merchant's primary contact isn't an "agent" (it's just the recipient of the cold email).
- [ ] **`inngest/functions/discovery.ts`** — the cron itself rarely changes; what changes is `PRICE_MIN_CENTS` (line 9) and which `fetch*` functions get called.
- [ ] **`inngest/functions/self-serve-ingest.ts`** — `pickActor` + `normalize*` per source. Same model as discovery.
- [ ] **`lib/homeowner-discovery.ts`** — ATTOM + PropertyRadar are real-estate-specific. If the new merchant has a B2C cold side, swap to whichever data provider serves that vertical (e.g. ZoomInfo for B2B, Apollo for SaaS contacts, Hunter for domain-based lookups). If no B2C side, delete the file + the cron.
- [ ] **`inngest/functions/homeowner-discovery.ts`** — adjust or delete based on the above.

### Don't touch
- `runApifySync` helper in `self-serve-ingest.ts` — generic Apify REST wrapper.
- The `listings/qualified` event flow — that's the platform contract.

---

## 5. Generation prompts — the actual agent skill

### Required
- [ ] **`lib/falai.ts`** — `generateStagedPreview` builds a real-estate-specific staging prompt. Either generalize it (pass the full prompt from `services.ts`) or rewrite per-merchant.
- [ ] **`lib/claude.ts:draftOutreachEmail`** — system prompt is real-estate copywriter. Replace.
- [ ] **`lib/claude.ts:fallbackBody`** + `buildMjml` — fallback email + MJML template reference photos + checkout. Generalize image references; the `bodyMjml` template is reusable.
- [ ] **`inngest/functions/outreach.ts:buildHomeownerEmail`** — currently "your home with a pool" copy. Rewrite for the new vertical's homeowner-equivalent audience.
- [ ] **`lib/claude.ts:classifyReply`** — reply classifier categories (`price_question`, `style_question`, `decline`, `unsubscribe`, `complex`). Probably reusable across merchants; revisit only if the inbound copy is dramatically different.

### Don't touch
- `lib/claude.ts:callClaude` (generic Anthropic wrapper).

---

## 6. Compliance gates — keep most of these

### Required (per merchant)
- [ ] **`lib/watermark.ts`** — currently stamps "Virtually Staged" per NAR. If the new vertical has a different mandatory disclosure (FTC affiliate stamp, FINRA disclaimer, HIPAA marker), replace the string. If none, remove the watermark step from `inngest/functions/fulfillment.ts`.
- [ ] **`app/(marketing)/disclosure/page.tsx`** — same as §3.

### Don't touch
- **`lib/resend.ts:sendComplianceEmail`** — CAN-SPAM footer + List-Unsubscribe headers. Universal; **do not add a bypass**.
- **`lib/state-optout.ts:checkOptOut`** — CCPA/CPA hard-coded protections. Universal.
- **TCPA gate in `lib/twilio.ts`** — universal SMS-only-after-consent.
- The blacklist in `admin_settings.email_blacklist`.

---

## 7. Marketplace / partner side (only if applicable)

Realscale has a contractor-referral marketplace on the `/renovate` side. If the new merchant has a partner/referral side:

### If the merchant has a marketplace side
- [ ] **`lib/yelp.ts`** — `SERVICE_CATEGORY` map + `searchBusinesses` is Yelp-specific. Replace with whatever directory serves the new vertical (e.g. AdvisorChecker for advisors, Avvo for lawyers, Zocdoc for healthcare).
- [ ] **`lib/find-contractor-email.ts`** — generic enough (Yelp profile → website → scrape → fallback Apify Google search). Update the `SKIP_DOMAINS` list if the new directory uses different aggregators.
- [ ] **`inngest/functions/match-contractors.ts`** — the agent itself; copy + referral terms ($150) are merchant-specific.
- [ ] **`db/schema.ts:contractorLeads` / `contractorIntros`** — column names use "contractor" terminology. Rename if it'd confuse maintainers; otherwise leave (they're partner-of-record records).
- [ ] **`app/admin/leads/page.tsx`** — admin view of matches.

### If the merchant has no marketplace side
- [ ] Delete `lib/yelp.ts`, `lib/find-contractor-email.ts`, `inngest/functions/match-contractors.ts`, `app/admin/leads/page.tsx`, the `lead/captured` event in `inngest/client.ts`, and the `ContractorLeadForm` component.

---

## 8. Pricing + scoring

### Required
- [ ] **`db/settings.ts:DEFAULT_STYLE_PRESETS`** — currently 4 interior-design styles. Replace with merchant-relevant presets or remove.
- [ ] **Vercel env: `PRICING_STANDARD_CENTS`, `PRICING_PREMIUM_CENTS`, `PRICING_RUSH_CENTS`** — defaults baked into admin settings on first init.
- [ ] **`lib/scoring.ts`** — qualification thresholds (`maxPhotoScore`, `minAgentValueScore`, `minPriceCents`). Replace with the new merchant's qualification criteria.
- [ ] **Vercel env: `CONTRACTOR_REFERRAL_FEE_USD`** — defaults to $150; update if the new partner economics differ.

### Don't touch
- The `outreach_events` daily-send-cap and complaint-rate kill-switch logic.

---

## 9. Admin dashboard — mostly reusable

The admin shell, contacts directory, outreach thread view, readiness checklist, and Stripe order tracking are platform-level. The labels need a sweep.

### Required
- [ ] **`app/admin/layout.tsx`** — sidebar nav labels. "Listings" / "Outreach" / "Postcards" / "Campaigns" / "Leads" — rename "Listings" if the merchant's primary entity isn't a listing (it's a "client" / "case" / "deal").
- [ ] **`components/admin/readiness-checklist.tsx`** — line items reference NAR, Lob postcards, Twilio, Resend, etc. Remove the items that don't apply; add new ones for any new APIs.

### Don't touch
- Admin auth gate (`middleware.ts`, `app/admin/actions.ts`, `app/admin/campaigns/actions.ts`) — just update the `ADMIN_EMAIL_DOMAINS` default if the new operator's email domain differs.
- `/admin/outreach`, `/admin/contacts`, `/admin/orders` — generic.

---

## 10. DB schema — rename a few columns, leave the rest

`db/schema.ts` is mostly platform; a few columns leak vertical assumptions.

### Probably rename (per merchant)
- `listings.agentEmail` → `primaryContactEmail`
- `listings.agentName` → `primaryContactName`
- `listings.agentPhone` → `primaryContactPhone`
- `listings.brokerage` → `primaryContactCompany` (or drop)
- `listings.mlsId` → drop or rename to `externalId`
- `listings.photos` → `attachments` if the merchant works on something other than photos
- `listings.floorplanRecommendations` / `floorplanSourceUrl` → drop unless analogous
- The `listing_source` enum — rename values to match new sources

### Don't touch
- `outreach_events`, `messages`, `orders`, `previews`, `admin_settings`, `agent_costs`, `contractor_*` tables. They are merchant-agnostic — **especially `outreach_events`**, which is the universal "any cold or transactional send" log.

> **Migration approach**: write the rename as a SQL migration in `db/migrations/` AND update `db/schema.ts`. Run via `drizzle-kit push` (or directly via psql for one-offs). Update every reference in code in the same PR.

---

## 11. Inngest event schema — keep, extend if needed

`inngest/client.ts` defines the event schema. The current events (`listings/ingested`, `listings/qualified`, `preview/ready`, `outreach/sent`, `orders/paid`, `orders/fulfilled`, `inbound/email`, `self-serve/submitted`, `lead/captured`, `discovery/manual`, `meta-ads/sync`, `meta-ads/autonomy`) are merchant-agnostic.

### Required
- [ ] No edits, unless the new merchant introduces a new event type. If it does, add it to `inngest/client.ts` and register the new function in `app/api/inngest/route.ts`.

---

## 11b. Meta Ads — Pixel, CAPI, and ad-platform autonomy

The template ships an end-to-end Meta integration so any new merchant can run paid acquisition without writing platform code. Three pieces:

1. **Browser Pixel** — wire `NEXT_PUBLIC_META_PIXEL_ID` into your marketing layout. The Pixel fires automatic PageView and any client events you want to track manually.
2. **Conversions API (CAPI)** — `lib/meta-capi.ts` mirrors Pixel events server-side. Already wired:
   - `InitiateCheckout` from `app/api/checkout/route.ts` (full match: IP, UA, _fbp, _fbc, hashed email).
   - `Purchase` from `app/api/stripe/webhook/route.ts` (hashed email + externalId — webhook context has no buyer cookies).
   - Event IDs match the convention `checkout-${orderId}` / `order-${orderId}` so server + client events dedup.
   - To fire `ViewContent` on the public listing page, call `sendCapiEvent({eventName:"ViewContent", ...})` from a Server Component / Route Handler that runs on listing view.
3. **Marketing API + autonomy** — `lib/meta-ads.ts` plus two Inngest jobs:
   - `meta-ads-sync` (hourly): pulls 30-day insights for every campaign on the configured ad account into the `campaigns` table.
   - `meta-ads-autonomy` (daily 1am UTC): pauses Meta campaigns where `CAC > META_TARGET_CAC_USD` once `spend > META_MIN_SPEND_USD`, resumes paused-but-profitable ones with ≥3 conversions.

### Required
- [ ] Set `NEXT_PUBLIC_META_PIXEL_ID` and add the Pixel snippet to your marketing layout (the merchant template does not ship a default snippet — it depends on which marketing framework / consent banner you wire it through).
- [ ] Generate a system-user token with `ads_management` + `ads_read` scopes on the Meta app, set as `META_ADS_ACCESS_TOKEN`.
- [ ] Generate a Conversions API token under Events Manager → Settings, set as `META_CONVERSIONS_API_TOKEN`.
- [ ] Set `META_AD_ACCOUNT_ID` (numeric, no `act_` prefix).
- [ ] Tune `META_TARGET_CAC_USD`, `META_PURCHASE_VALUE_USD`, `META_MIN_SPEND_USD` for the merchant's unit economics. Default thresholds (75 / 199 / 50) match a $199 product with a 50% margin floor.

### Optional
- [ ] Add a `/admin/campaigns` view that reads from the `campaigns` table to show CTR / CPC / CAC / quality rankings per Meta campaign. The `metadata` jsonb column carries the full insights blob from `getCampaignInsights`.
- [ ] Set `META_TEST_EVENT_CODE` while validating in Events Manager → Test Events; remove for production.

### Don't touch
- The autonomy thresholds in `inngest/functions/meta-ads-autonomy.ts` — they're env-driven for a reason. Tune via env, not by editing the file.
- The `meta_campaign_id` unique constraint on the `campaigns` table — the sync job depends on it for idempotent upserts.

---

## 11c. Google Ads — branded defense + Search expansion path

The template ships a parallel integration for Google Ads. Three pieces:

1. **Global site tag (`gtag.js`)** — `components/marketing/ad-pixels.tsx` auto-injects when `NEXT_PUBLIC_GOOGLE_ADS_ID` is set. URL-based conversion tracking (matching `/delivery/`) works without additional code.
2. **Marketing API client** — `lib/google-ads.ts` wraps `googleads.googleapis.com/v20/...`. Auth is OAuth2 refresh-token + developer token + login-customer-id (MCC) header.
3. **Branded campaign launch + autonomy** — `scripts/google-ads-launch-branded.ts` for one-shot programmatic creation; `inngest/functions/google-ads-budget-scaler.ts` for daily budget scaling within configured floor/ceiling values; `inngest/functions/google-ads-sync.ts` for hourly metrics sync.

> ⚠️ **Basic Access pending** as of 2026-05-06. Google Ads API requires per-MCC application approval (~1 business day for Basic). Until approved, the launch script returns `DEVELOPER_TOKEN_NOT_APPROVED` against real ad accounts. The manual UI flow (see `GOOGLE_ADS_OPERATOR.md`) works fine in the meantime. Once Basic Access lands, future merchants get programmatic launch with no further Google approvals needed.

### Zilla HQ one-time setup (already done — only redo if rebuilding from scratch)

This is the parent-org setup. Only one engineer ever does it. See `GOOGLE_ADS.md` §2.

- Create Manager Account (MCC) named `Zilla HQ` at https://ads.google.com/home/tools/manager-accounts/
- Apply for Developer Token at API Center → Test access auto-granted, then upgrade to Basic Access (1 business day)
- Create Google Cloud project, enable Google Ads API, create OAuth Client (Desktop app)
- Mint refresh token via `scripts/google-ads-mint-refresh-token.ts`
- Set up the canonical credentials in 1Password / Vault: `GOOGLE_ADS_LOGIN_CUSTOMER_ID`, `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_REFRESH_TOKEN`. **All future merchants reuse these unchanged.**

### Per-merchant setup

#### Required
- [ ] **Create new ad account in MCC** — Zilla HQ MCC → Accounts → + → New account. Name it for the merchant brand. Country = US, Currency = USD.
- [ ] **Note the new ad account's Customer ID** — 10 digits, no dashes. Set as `GOOGLE_ADS_CUSTOMER_ID`.
- [ ] **Set the 5 reused env vars** from Zilla HQ vault: `GOOGLE_ADS_LOGIN_CUSTOMER_ID`, `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_CLIENT_ID`, `GOOGLE_ADS_CLIENT_SECRET`, `GOOGLE_ADS_REFRESH_TOKEN`.
- [ ] **Create a Purchase conversion action** in the new ad account. Tools → Conversions → New → Source: Website → Goal: Purchase → URL pattern matches `/delivery/` → "Set up manually using code" → copy the `AW-XXXXXXXXXX` portion → set as `NEXT_PUBLIC_GOOGLE_ADS_ID` in Vercel env (Production + Preview).
- [ ] **Run smoke test** — `npx tsx scripts/google-ads-smoke-test.ts` should print "✓ All credentials valid" once Basic Access is approved.
- [ ] **Launch branded-defense campaign** — pre-Basic: follow `GOOGLE_ADS_OPERATOR.md` for ~30 min UI walk-through. Post-Basic: `npx tsx scripts/google-ads-launch-branded.ts`.

#### Optional
- [ ] **Set `GOOGLE_ADS_BRANDED_*` env vars** for autonomy: `GOOGLE_ADS_BRANDED_CAMPAIGN_ID`, `GOOGLE_ADS_BRANDED_LAUNCH_DATE`, `GOOGLE_ADS_BRANDED_INITIAL_BUDGET_CENTS`, `GOOGLE_ADS_BRANDED_MAX_BUDGET_CENTS`, `CRON_GOOGLE_BUDGET_SCALER_ENABLED=true`.
- [ ] **Add `/admin/google-ads` panel** — read-only insights from the synced metrics table. Same pattern as the existing Meta Ads panel.

#### Don't touch
- `lib/google-ads.ts` — generic REST client. Per-merchant config goes via env vars, not code edits.
- The `login-customer-id` header in API calls — must always be the Zilla HQ MCC ID (`GOOGLE_ADS_LOGIN_CUSTOMER_ID`), not the merchant's ad account ID. Don't conflate the two.
- The OAuth refresh token — shared across all Zilla HQ merchants. Rotating it requires updating env vars in every merchant's Vercel project.

---

## 11d. SEO — sitemap, GSC, Bing, IndexNow (autonomous bootstrap)

**See [SEO.md](./SEO.md) for the full runbook**, [ZILLA_HQ_SETUP.md](./ZILLA_HQ_SETUP.md) for the one-time platform-team setup. This section is just the merchant-template-specific touchpoints.

The template ships a fully autonomous bootstrap for `*.zilla.so` merchants — once HQ-level credentials are provisioned (one-time), every new merchant fork registers itself with Google Search Console + Bing Webmaster + IndexNow without any operator action.

### Code shipped (don't touch — it's merchant-agnostic)
- `app/sitemap.ts`, `app/robots.ts`, `app/api/og/route.tsx`
- `lib/seo/google-search-console.ts` — GSC API client (refresh-token OAuth)
- `lib/seo/bing-webmaster.ts` — Bing Webmaster API client
- `lib/seo/indexnow.ts` — IndexNow client
- `lib/seo/bootstrap.ts` — orchestrator (idempotent, returns per-step results)
- `inngest/functions/seo-bootstrap.ts` — daily cron + manual `seo/bootstrap` event
- `app/api/admin/trigger?target=seo-bootstrap` — operator manual trigger
- `app/admin/seo/page.tsx` + `components/admin/seo-bootstrap-panel.tsx` — readiness UI + one-click run
- `scripts/generate-indexnow-key.mjs` — per-merchant IndexNow key
- `scripts/indexnow-ping.mjs` — manual IndexNow re-ping
- `scripts/generate-bing-auth-file.mjs` — fallback for non-autonomous Bing verification
- `scripts/zilla-mint-gsc-refresh-token.mjs` — one-time HQ OAuth flow

### Required (per merchant)
- [ ] **Run `node scripts/generate-indexnow-key.mjs` once.** Commit the new `public/<key>.txt` and set `NEXT_PUBLIC_INDEXNOW_KEY` in Vercel env.
- [ ] **Set `NEXT_PUBLIC_APP_URL`** to the merchant's URL.
- [ ] **Paste the four shared HQ env vars** from the platform vault into Vercel:
  - `ZILLA_GSC_OAUTH_CLIENT_ID`
  - `ZILLA_GSC_OAUTH_CLIENT_SECRET`
  - `ZILLA_GSC_OAUTH_REFRESH_TOKEN`
  - `ZILLA_BING_WEBMASTER_API_KEY`
- [ ] Deploy. The Inngest cron will fire the bootstrap at the next 04:00 UTC, or hit `/admin/seo` → "Run SEO bootstrap" to fire immediately.

### Optional
- [ ] **For apex-domain merchants** (sitebeat.tech, realscale.app — not `*.zilla.so`): mint a per-merchant `GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN` against the apex's verified GSC property to enable autonomous bootstrap there too. Or just run the manual flow in [SEO.md §2](./SEO.md#2-operator-runbook-15-minutes-per-merchant) once.
- [ ] **Tune `app/api/og/route.tsx` brand colors** (BG_FROM, BG_TO, ACCENT) per merchant palette.

### Don't touch
- The `lib/seo/*` clients — generic API wrappers. Per-merchant config goes via env vars.
- The cron schedule on `seoBootstrapFn` — daily is the right cadence; more often is wasted API calls.
- The dimensions of the OG image (1200×630). That's what every social platform expects.

### Subdomain merchants (`xyz.zilla.so`) — the autonomous path

[SEO.md §1](./SEO.md#1-architecture-decision-subdomain-vs-apex-domain) and [SEO.md §9](./SEO.md#9-going-fully-autonomous-no-operator-clicks) cover the architecture. Short version: the platform team verifies `zilla.so` once via DNS TXT in GSC + Bing, mints OAuth credentials, and stores everything in the platform vault. Every subsequent merchant inherits ownership and bootstraps itself.

---

## 11e. X (Twitter) — autonomous post + auto-reply (one HQ X dev app)

**See [X.md](./X.md) for the full runbook**, [ZILLA_HQ_SETUP_X.md](./ZILLA_HQ_SETUP_X.md) for the one-time HQ provisioning. This section is just the merchant-template-specific touchpoints.

The template ships a fully autonomous X integration: every merchant fork can post tweets/threads + auto-reply to @mentions from its own brand account. The architecture mirrors Meta Ads + GSC — **one HQ X dev app**, per-merchant brand-account OAuth tokens, autonomous from there.

### Code shipped (don't touch — it's merchant-agnostic)
- `lib/x-oauth.ts` — OAuth 2.0 PKCE flow
- `lib/x-poster.ts` — tweet/thread sender + mentions fetcher (manages refresh tokens)
- `lib/x-mentions-handler.ts` — Claude-driven mention evaluator + auto-reply writer
- `inngest/functions/x-mentions-poll.ts` — `*/30 * * * *` cron + `x-mentions/poll` event
- `app/api/auth/x/start` + `/callback` — OAuth round-trip
- `app/api/admin/post-tweet` — admin-gated send endpoint
- `app/admin/x/page.tsx` + `components/admin/tweet-composer.tsx` — operator UI

### Required (per merchant)
- [ ] **Create the brand X account** (e.g. `@Sitebeatapp`, `@Restayapp`). Real account, not a stub.
- [ ] **Paste `X_CLIENT_ID` + `X_CLIENT_SECRET`** from the platform vault into Vercel (HQ-shared, not per-merchant).
- [ ] **Set per-merchant brand prompt** in Vercel env: `X_BRAND_NAME`, `X_BRAND_HANDLE`, `X_BRAND_ABOUT` (multi-line system-prompt fragment — see [X.md §2.2](./X.md#22-set-per-merchant-brand-prompt)).
- [ ] **Add the merchant's callback URI** to the X dev app's allowed callbacks at developer.x.com: `https://<app-url>/api/auth/x/callback`
- [ ] **Authorize the brand account** by visiting `/api/auth/x/start` while logged into X as the brand (one-time per merchant).
- [ ] Confirm `/admin/x` shows "✓ Refresh token saved".

### Optional
- [ ] **Tune `X_MENTIONS_MAX_REPLIES_PER_RUN`** (default 5) — per-run cap that bounds Anthropic + X-API spend.
- [ ] **Switch `ANTHROPIC_MODEL`** if a different Claude tier feels right for the brand's reply quality bar.

### Don't touch
- The Inngest cron schedule on `xMentionsPollFn` — 30 min is the right balance between responsiveness and cost.
- The duplicate-skip logic against own tweets — prevents reply loops if the brand account tweets at itself.
- The `x_mentions_since_id` watermark advancement — each run only processes tweets newer than the prior run's max ID.

### When NOT to enable per merchant
If the merchant has no plausible X audience (B2B-only, internal tooling, very local non-tech business), skip the §11e checklist entirely. The cron will run but always find 0 mentions — harmless but wasted compute.

---

## 11f. Cold-outbound follow-up sequence — see COLD_FOLLOWUP.md

The template ships a 3-touch sequence by default — `inngest/functions/cold-followup-sweep.ts` + `lib/cold-followup.ts` + `lib/cold-followup-templates.ts`. Originally ported from the Sitebeat merchant where multi-touch follow-up out-converted single-touch by 2.4× over 60 days.

### Required
- [ ] **Decide trial vs promo at DAY5** — for recurring-subscription merchants, free trial usually outperforms promo at the cold-ask. Sitebeat measured `trial_period_days: 14` outperforming `FIRST50` 50%-off promo. Wire whichever:
  - **Trial**: add `subscription_data.trial_period_days: 14` to `/api/checkout` for the monthly plan only (NOT annual — confuses pricing math).
  - **Promo**: keep `ensureSharedPromoCode()` + the FIRST50 mention in the DAY5 template body.
- [ ] **Edit DAY2 / DAY5 / DAY10 copy** in `lib/cold-followup-templates.ts` for your merchant's voice.
- [ ] **Verify outbound-logging tags** — `audit_report` (or your merchant's first-touch tag) and `audit_followup_dayN` are the stage idempotency keys. Don't rename.

### Optional
- [ ] **Disable individual stages** by env-gating the `sendFollowupEmail` calls (e.g. `FOLLOWUP_DAY5_ENABLED=false`).
- [ ] **Tune the day windows** in `stageForDays()`. Don't extend past 30 days — sender reputation.

### Don't touch
- The 30-day upper bound (`stageForDays` returns null past 30 days).
- The "no active subscription + no inbound reply" skip gates.
- The `FOLLOWUP_TAG` values (`audit_followup_day2/5/10`) — they're the idempotency contract.
- The `idempotencyKey` shape `${FOLLOWUP_TAG[stage]}_${siteId}`.

---

## 11g. Partner outreach — B2B recruitment pipeline (see PARTNERS.md)

Parallel to customer cold outreach. Recruits agencies / consultants / affiliates with a different copy + cadence + sender (`partners@<domain>`). Use it to bootstrap a referral / affiliate program.

### Required (only if your merchant has a referral / affiliate side)
- [ ] **Edit `lib/partner-pitch-template.ts`** — rewrite initial + followup copy for your merchant's offer (Sitebeat default: 30%-lifetime-commission Rewardful pitch).
- [ ] **Add `partners@<your-domain>` as a sending address** — auto-handled by Resend's domain verification.
- [ ] **Add `partners@` inbound** — forward to your operator inbox or wire to the Resend inbound webhook so reply detection (`recordPartnerReply`) fires.
- [ ] **Run a 5–10 prospect manual batch first** before scaling — partner outreach is founder-touch volume, not 100/day.

### Optional
- [ ] **Schedule a daily followup cron** that finds `status=sent, last_sent_at < NOW() - 5 days` and calls `sendPartnerEmail({ variant: "followup" })`.
- [ ] **Auto-discovery from existing audit data** — `app/api/partner-discover/route.ts` filters your `sites` table by agency keywords. Edit the keyword whitelist for your vertical's partner profile.

### Don't touch
- The `idempotencyKey` shape `partner_outreach_${id}_${sendCount + 1}`.
- The status transition rule — `queued → sent` only on initial; followups don't touch status. A replied partner must never be bumped back to `sent`.
- The `partners@` from-user. Customer auto-replies need to come from `replies@`.

---

## 11h. Email blocklist — Fortune-500 + system local-parts

Hard-blocked at the Resend chokepoint AND at discovery time. ~80 corporate domains + `noreply`/`postmaster`/`abuse` local parts.

### Required
- [ ] **Audit `lib/email-domain-blocklist.ts:BLOCKED_DOMAINS`** — review the hardcoded list, add merchant-specific additions if needed (e.g. if you sell to indie devs, you might add LinkedIn corporate but allow `gmail.com` — Gmail isn't on the list; only corporate domains are).
- [ ] **Don't loosen `BLOCKED_LOCAL_PARTS`** — these never convert.

### Optional
- [ ] **MX-record validation at discovery** — `lib/validate-email.ts:hasMxRecord()`. 4s timeout + in-memory cache. Drops emails at non-deliverable domains before they hit Resend.

### Don't touch
- The subdomain-walking match logic in `emailBlockReason()` — `contact@store.amazon.com` must still match `amazon.com`.

---

## 11i. Distribution scaffolds — Chrome extension + WordPress plugin + teardown content

Three lightweight surfaces that compound organic discovery without adding operator headcount. See [DISTRIBUTION.md](./DISTRIBUTION.md).

### Optional (ship after the core funnel works)
- [ ] **Chrome MV3 extension** — re-skin `extension/` for your merchant's hook (popup posts to your public API). Publish at $5 one-time fee on the Chrome Web Store.
- [ ] **WordPress plugin** — re-skin `wordpress-plugin/<merchant>/`, submit to wordpress.org (1–2 week first review).
- [ ] **Teardown content** — re-skin `scripts/teardown.mjs` with a domain list relevant to your vertical, publish on X / LinkedIn / blog.

### Don't touch
- The Manifest V3 version in `extension/manifest.json` — V2 is unaccepted by Chrome since 2024.

---

## 12. Sample data + seeds — wipe before launch

- [ ] **DB**: `truncate listings, previews, outreach_events, messages, orders, contractor_leads, contractor_intros cascade;` to clear Realscale's data.
- [ ] **R2**: keep `samples/services/*` only for the services the new merchant offers (overwrite via the regenerated samples script). Delete legacy keys.
- [ ] **`scripts/seed-listing.ts`** — replace seed data with a new-merchant-relevant test row.
- [ ] **`scripts/check-state.mjs`, `demo-outreach.mjs`, `force-push-preview.mjs`, `repro-qualification.mjs`** — debug scripts that may reference vertical-specific test data. Update or delete.

---

## 13. Required env vars — full list per merchant

Copy `.env.example` to your local + Vercel. The full list (current as of 2026-04-27):

**Universal — every merchant needs these**
- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `BUSINESS_NAME`, `BUSINESS_ADDRESS`, `SUPPORT_EMAIL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_*_URL`
- `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`, `RESEND_INBOUND_WEBHOOK_SECRET`, `SENDER_DOMAINS`, `SENDER_FROM_NAME`, `REPLIES_EMAIL`
- `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY`
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`
- `ADMIN_EMAIL`, `ADMIN_EMAIL_DOMAINS`
- `ANTHROPIC_API_KEY` (email drafting + reply triage)
- `POSTHOG_PROJECT_API_KEY`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST`
- `DAILY_SEND_CAP`, `PREVIEW_DAILY_CAP`, `FULFILLMENT_DAILY_BUDGET_CENTS`

**Per-merchant (depending on what's in the catalog)**
- `FAL_API_KEY` (image generation — drop if merchant generates text/PDF/audio instead)
- `NEXT_PUBLIC_MAPBOX_TOKEN` (only if any service uses satellite tiles)
- `APIFY_TOKEN` + `APIFY_*_ACTOR` (only if scraping)
- `ATTOM_API_KEY` / `PROPERTYRADAR_API_KEY` (real-estate property data — drop)
- `APOLLO_API_KEY` / `HUNTER_API_KEY` (skiptracing — keep if cold B2C)
- `YELP_API_KEY` (only if Yelp is the partner directory)
- `LOB_API_KEY` (only if direct mail is part of outreach)
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` (only if SMS — needs A2P 10DLC + EIN)
- `HOMEOWNER_DISCOVERY_ZIPS` / `HOMEOWNER_DISCOVERY_LIMIT` (only if homeowner-style cold cron)
- `CONTRACTOR_REFERRAL_FEE_USD` (only if marketplace side)

**Meta — paid acquisition (only if running Facebook/Instagram ads)**
- `NEXT_PUBLIC_META_PIXEL_ID` — browser Pixel
- `META_CONVERSIONS_API_TOKEN` — server-side CAPI dispatch
- `META_ADS_ACCESS_TOKEN` — system-user token for Marketing API (ads_management + ads_read)
- `META_AD_ACCOUNT_ID` — numeric, no `act_` prefix
- `META_TARGET_CAC_USD` / `META_PURCHASE_VALUE_USD` / `META_MIN_SPEND_USD` — autonomy thresholds
- `META_TEST_EVENT_CODE` — optional, only while validating in Events Manager
- `META_API_VERSION` — pin to a specific Graph API version (default `v19.0`)

**Google — paid acquisition (every merchant: branded defense at minimum)**

*Reused across all Zilla HQ merchants — copy from a sibling merchant or the Zilla HQ vault*
- `GOOGLE_ADS_LOGIN_CUSTOMER_ID` — Zilla HQ MCC Customer ID (`3797064633`). 10 digits, no dashes. Sent as `login-customer-id` header on every API call.
- `GOOGLE_ADS_DEVELOPER_TOKEN` — single token issued to the Zilla HQ MCC by Google. Reused across all merchants.
- `GOOGLE_ADS_CLIENT_ID` / `GOOGLE_ADS_CLIENT_SECRET` — single OAuth client (Desktop app) registered in the `zilla-hq` Cloud project.
- `GOOGLE_ADS_REFRESH_TOKEN` — long-lived (no expiry). Mint via `scripts/google-ads-mint-refresh-token.ts`. Reused unchanged across merchants.

*Per-merchant*
- `GOOGLE_ADS_CUSTOMER_ID` — the merchant's individual ad account Customer ID. 10 digits, no dashes. Found in top-right of the merchant's ad account dashboard.
- `NEXT_PUBLIC_GOOGLE_ADS_ID` — `AW-XXXXXXXXXX` from the merchant's gtag conversion action. Used by `components/marketing/ad-pixels.tsx` to inject `gtag.js`.
- `NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL` — optional; the slash-suffix portion of the conversion ID for value tracking via `lib/google-ads-conversion.ts`. Skip unless upgrading from URL-based to event-level conversion tracking.

*Autonomy (set after launching)*
- `GOOGLE_ADS_BRANDED_CAMPAIGN_ID` — set after `scripts/google-ads-launch-branded.ts` prints it (or copy from the manual launch's URL).
- `GOOGLE_ADS_BRANDED_LAUNCH_DATE` — `YYYY-MM-DD` of the campaign launch; used by the stateless budget scaler.
- `GOOGLE_ADS_BRANDED_INITIAL_BUDGET_CENTS` (default 200 = $2/day) / `GOOGLE_ADS_BRANDED_MAX_BUDGET_CENTS` (default 1000 = $10/day cap)
- `CRON_GOOGLE_BUDGET_SCALER_ENABLED=true`
- `GOOGLE_ADS_API_VERSION` — pin to a specific REST version (default `v20`)

**X (Twitter) — autonomous brand-account post + auto-reply**

*Reused across all Zilla HQ merchants — copy from the Zilla HQ vault*
- `X_CLIENT_ID` / `X_CLIENT_SECRET` — single Zilla HQ X dev app's OAuth 2.0 confidential-client credentials. Reused unchanged across merchants. See [ZILLA_HQ_SETUP_X.md](./ZILLA_HQ_SETUP_X.md).

*Per-merchant*
- `X_BRAND_NAME` — display name for the system prompt (e.g. `Sitebeat`).
- `X_BRAND_HANDLE` — @handle without the `@` (e.g. `Sitebeatapp`).
- `X_BRAND_ABOUT` — multi-line description of the brand + reply rules. Pasted directly into the auto-reply system prompt. Without it, a generic SMB fallback is used.
- `X_MENTIONS_MAX_REPLIES_PER_RUN` — optional, default `5`. Per-run cap that bounds Anthropic + X-API spend.

**SEO — Google Search Console + Bing Webmaster + IndexNow**

(Already documented in §11d — listing here just so the §13 catalog is complete.)
- HQ-shared: `ZILLA_GSC_OAUTH_CLIENT_ID`, `ZILLA_GSC_OAUTH_CLIENT_SECRET`, `ZILLA_GSC_OAUTH_REFRESH_TOKEN`, `ZILLA_BING_WEBMASTER_API_KEY`
- Per-merchant: `NEXT_PUBLIC_INDEXNOW_KEY`, optional `NEXT_PUBLIC_GOOGLE_VERIFICATION`, `NEXT_PUBLIC_BING_VERIFICATION_TOKEN`, `GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN`

---

## 14. Deploy + verify — the 10-minute final pass

After all the above:

- [ ] `npx tsc --noEmit` passes locally
- [ ] `vercel deploy --prod` succeeds
- [ ] `/admin` sign-in works for the operator
- [ ] `/admin` readiness checklist shows green (all required env vars detected)
- [ ] Hit `/api/admin/trigger?target=realtor` (rename the param if the new merchant uses different funnel terminology) → Inngest dashboard shows the discovery run, listings appear in `/admin/listings`
- [ ] Trigger one self-serve flow end-to-end: paste an input on the site → preview generates → `/l/<slug>` renders → checkout works in Stripe live
- [ ] Send one test outreach email to your own address → confirm verified domain, footer correct, unsubscribe link works
- [ ] Inbound webhook: reply to the test email → confirm `/admin/outreach/<id>` shows the inbound + auto-classification
- [ ] Stripe webhook: complete a test purchase → orders/paid fires → fulfillment runs → delivery email + zip arrive

If all 8 verifications pass, the merchant is live.

---

## 15. What to lift up (when you do this twice and it hurts)

After 2-3 forks, the duplicated edits will form a clear pattern. The natural next refactor is to extract this list of changes into:

- A `merchant.config.ts` at the repo root (services, prompts, audiences, scoring, sources, copy keys)
- A `@zilla/platform` package with everything in §6, §9, §10 (don't-touch), §11
- Per-merchant apps that import `@zilla/platform` and ship only their config + page copy

That's option **#2 (monorepo with platform package)** from the templatization options. Don't do it preemptively — let real duplication tell you which abstractions are worth the cost.

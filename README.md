# MenuLift

**AI menu photo enhancement for restaurants.** Autonomous Zilla merchant — fork of [`merchant-template`](https://github.com/Zilla-HQ/merchant-template).

## Positioning

Restaurants live or die on their menu photos across Google Business Profile, DoorDash, and Uber Eats. Most independent operators have phone-shot or 5-year-old photos. The standard solution — hiring a food photographer — runs $500–$2,000 per shoot, takes weeks, and rarely gets repeated.

**MenuLift's wedge:** we don't replace photos — we *enhance* what the restaurant already has with AI. Sharper, brighter, better lit, more appetizing. The real dish, made to look like it should.

- $40–$90/mo per location
- Under 24h turnaround on starter batches
- Channel-formatted exports (Google / DoorDash / Uber Eats)
- Free menu audit on entry — paid enhancement is the upsell

The "enhance, don't fabricate" framing is also a compliance moat: Google, DoorDash, and Uber Eats all have policies against fabricated/AI-generated food photography that misrepresents what's served. Enhancement of real photos doesn't trip those policies.

## Discovery

The autonomous agent scans for qualifying restaurants:

- Google Business Profile listings with missing menu item photos
- DoorDash / Uber Eats merchant pages with weak photo coverage (text-only items)
- Local independent restaurants (filters out chains that already have national photography budgets)

Cold outreach goes via Resend, CAN-SPAM compliant, with a personalized preview (one of the restaurant's own dishes enhanced) attached.

## Funnels

| Route | Audience | Model |
|---|---|---|
| `/audience-a` | Restaurant owners / managers | Paid: $40–$90/mo subscription |
| `/audience-b` | Marketplace operators, multi-location ops | Free audit → paid enhancement upsell |

## Architecture

See [MERCHANT.md](./MERCHANT.md) for the full fork-and-config catalog inherited from the template, and the upstream [`merchant-template` README](https://github.com/Zilla-HQ/merchant-template) for what the platform does out of the box (Inngest workflow runtime, CAN-SPAM compliance, reply triage, Stripe Checkout, Meta + Google Ads autonomy, SEO bootstrap, X auto-reply).

What's been customized for MenuLift:

- `lib/services.ts` — 4 menu-enhancement services replacing the real-estate catalog
- `app/(marketing)/page.tsx`, `audience-a/page.tsx`, `audience-b/page.tsx` — restaurant-flavored hero, stats, pricing
- `components/marketing/faq.tsx` — menu-photography FAQ
- `lib/resend.ts`, `lib/lob.ts`, `app/layout.tsx`, `app/admin/layout.tsx`, `components/marketing/footer.tsx` — brand strings

What still needs configuring (per [MERCHANT.md](./MERCHANT.md)):

- [ ] **Discovery sources** — `lib/apify.ts` + `inngest/functions/discovery.ts` still target Zillow/Redfin/Realtor. Swap for Google Places + DoorDash/UberEats actors (or build a Playwright scraper for delivery-app menu coverage).
- [ ] **Generation pipeline** — `lib/falai.ts` prompt is real-estate-flavored; should be generalized to read directly from `services.promptTemplate` for the per-dish enhancement prompt.
- [ ] **Vercel project + env vars** — see §13 of [MERCHANT.md](./MERCHANT.md).
- [ ] **Samples** — regenerate `lib/samples.ts` + `scripts/generate-service-samples.mjs` with real menu-photo before/afters once R2 is connected.
- [ ] **Domain** — `menulift.app` or `menulift.zilla.so` subdomain.

## License

Private.

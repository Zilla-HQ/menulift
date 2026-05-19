# MenuLift

**AI menu photo enhancement for restaurants.** Autonomous Zilla merchant — fork of [`merchant-template`](https://github.com/Zilla-HQ/merchant-template).

## Positioning

Restaurants leave money on the table for every menu item without a photo. Items with photos convert at up to 30% higher than text-only listings on Google, DoorDash, and Uber Eats — and most independent operators have zero photos for half their menu. The standard solution (hire a food photographer) costs $500–$2,000 per shoot, takes weeks, and never repeats often enough to keep up with menu changes.

**What customers actually want:** more orders. **MenuLift delivers:** a photo for every menu item — *created from scratch* for the dishes that don't have one, and *enhanced* for the dishes that do. Built from the restaurant's actual recipe, ingredients, and plating direction so the photo represents what the kitchen serves.

- $29 / $79 / $149 one-time per menu shoot (no subscription)
- Under 24h turnaround on missing-photo sprints, under 48h on full menus
- Channel-formatted exports (Google / DoorDash / Uber Eats)
- Free menu audit on entry — full menu shoot is the upsell

The "represent the actual dish" framing (recipe-driven generation, no stock photography, no embellishments not on the plate) keeps the service aligned with Google Business Profile, DoorDash, and Uber Eats content policies that prohibit misleading food imagery. The platforms care about misrepresentation, not about the production method.

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

- `lib/services.ts` — 5 menu services replacing the real-estate catalog: **Full Menu Shoot** ($79, lead), **Starter Menu Shoot** ($29), **Photo Enhance Pass** ($19), **Hero Shot Refresh** ($9), **Free Menu Audit** ($0 lead-gen). All one-time per shoot.
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

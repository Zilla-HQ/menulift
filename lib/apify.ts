import { ApifyClient } from "apify-client";
import { env } from "@/lib/env";

const token = env("APIFY_TOKEN");

const client = token ? new ApifyClient({ token }) : null;

export interface ScrapedListing {
  source: "zillow" | "redfin" | "realtor";
  sourceId: string;
  mlsId?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number; // cents
  dom?: number;
  listingType?:
    | "single_family"
    | "condo"
    | "townhouse"
    | "multi_family"
    | "land"
    | "other";
  photos: string[];
  agentName?: string;
  agentEmail?: string;
  agentPhone?: string;
  brokerage?: string;
}

async function runActor(actorId: string, input: unknown): Promise<unknown[]> {
  if (!client) {
    // eslint-disable-next-line no-console
    console.warn(`APIFY_TOKEN not set — skipping actor ${actorId}`);
    return [];
  }
  const run = await client.actor(actorId).call(input, { waitSecs: 600 });
  const { items } = await client.dataset(run.defaultDatasetId).listItems({ clean: true });
  return items;
}

// =============================================================
// Apify result caching helpers
// =============================================================
//
// Pattern (lifted from Restay):
//   Apify actors cost real money per run. For verticals where the
//   underlying dataset is stable for days or weeks (e.g. Airbnb
//   listings in a city don't churn fast), don't re-run the actor on
//   every cron — re-use the dataset from a recent successful run.
//
//   Two ways to do this:
//
//   1) **Operator-curated** (Restay's tier1-6 outreach scripts):
//      Run the actor once, save the dataset ID into a script, and
//      use `getDatasetItems(datasetId)` from a batch sender. One
//      scrape feeds 2–4 weeks of outreach at the daily cap.
//
//   2) **Auto-cached cron** (use `runActorCached`):
//      Check the actor's recent runs and reuse the dataset from the
//      most recent SUCCEEDED run if it's within `ttlHours`. Falls
//      back to a fresh run otherwise.
//
// Use #1 for high-stakes outreach batches where you want to know
// exactly what data went out the door. Use #2 for routine refresh
// crons where freshness is approximate.

/**
 * Fetch items from a known Apify dataset by ID. Pair with
 * `latestActorRunDatasetId` or with a hardcoded dataset ID preserved
 * in an outreach script.
 */
export async function getDatasetItems(datasetId: string): Promise<unknown[]> {
  if (!client) {
    // eslint-disable-next-line no-console
    console.warn(`APIFY_TOKEN not set — skipping dataset ${datasetId}`);
    return [];
  }
  const { items } = await client.dataset(datasetId).listItems({ clean: true });
  return items;
}

/**
 * Get the most recent SUCCEEDED run's dataset ID for an actor, optionally
 * within an age window. Returns null if no qualifying run exists.
 *
 *   const ds = await latestActorRunDatasetId(ZILLOW_ACTOR, { maxAgeHours: 168 });
 *   if (ds) return getDatasetItems(ds);
 *   // else fall through to fresh run
 */
export async function latestActorRunDatasetId(
  actorId: string,
  opts: { maxAgeHours?: number } = {},
): Promise<string | null> {
  if (!client) return null;
  const runs = await client.actor(actorId).runs().list({ limit: 5, desc: true });
  for (const run of runs.items) {
    if (run.status !== "SUCCEEDED") continue;
    if (opts.maxAgeHours != null) {
      const ageMs = Date.now() - new Date(run.finishedAt ?? run.startedAt).getTime();
      if (ageMs > opts.maxAgeHours * 3600_000) continue;
    }
    return run.defaultDatasetId;
  }
  return null;
}

/**
 * Run an actor with implicit caching: reuse the dataset from the most
 * recent SUCCEEDED run if it's within `ttlHours`, otherwise run fresh.
 * Drop-in replacement for `runActor` when you want cache-on-recent.
 */
export async function runActorCached(
  actorId: string,
  input: unknown,
  opts: { ttlHours: number } = { ttlHours: 6 },
): Promise<unknown[]> {
  const cached = await latestActorRunDatasetId(actorId, { maxAgeHours: opts.ttlHours });
  if (cached) {
    // eslint-disable-next-line no-console
    console.log(`[apify] cache hit on ${actorId} → dataset ${cached}`);
    return getDatasetItems(cached);
  }
  return runActor(actorId, input);
}

/**
 * Fetch listings from Zillow.
 *
 * Why this is two-stage: Apify's Zillow SEARCH actors (maxcopell/zillow-
 * scraper et al) are anti-bot-blocked by Zillow as of 2026 and fail with
 * "Actor run did not succeed." But the maxcopell/zillow-detail-scraper
 * (single-URL) works fine. So we discover Zillow listing URLs via Google
 * search (apify/google-search-scraper, which has no Zillow contact), then
 * scrape each detail URL through the working detail actor.
 *
 * Inputs:
 *   APIFY_ZILLOW_SEARCH_QUERIES: comma-sep Google queries
 *     Default targets several Sun-Belt metros where pool/solar/staging
 *     services correlate well with our merchant offering.
 */
export async function fetchZillow(priceMinCents: number): Promise<ScrapedListing[]> {
  const queries = (
    process.env.APIFY_ZILLOW_SEARCH_QUERIES ??
    [
      "site:zillow.com/homedetails/ Phoenix AZ",
      "site:zillow.com/homedetails/ Scottsdale AZ",
      "site:zillow.com/homedetails/ Atlanta GA",
      "site:zillow.com/homedetails/ Dallas TX",
      "site:zillow.com/homedetails/ Tampa FL",
    ].join(",")
  )
    .split(",")
    .map((q) => q.trim())
    .filter(Boolean);

  // Stage 1: Google search → Zillow listing URLs
  const urls: string[] = [];
  for (const query of queries) {
    const items = (await runActor("apify/google-search-scraper", {
      queries: query,
      maxPagesPerQuery: 1,
      resultsPerPage: 10,
      countryCode: "us",
      languageCode: "en",
    })) as Array<{ organicResults?: Array<{ url?: string }> }>;
    for (const it of items) {
      for (const r of it.organicResults ?? []) {
        if (r.url && r.url.includes("/homedetails/")) urls.push(r.url);
      }
    }
  }
  // Dedupe
  const uniq = [...new Set(urls)].slice(0, 50);

  // Stage 2: detail-scrape each URL (the actor that actually works)
  const detailActor = process.env.APIFY_ZILLOW_DETAIL_ACTOR ?? "maxcopell/zillow-detail-scraper";
  const items = await runActor(detailActor, {
    startUrls: uniq.map((url) => ({ url })),
  });

  return items.flatMap((raw) => normalizeZillow(raw, priceMinCents));
}

export async function fetchRedfin(priceMinCents: number): Promise<ScrapedListing[]> {
  const actor = process.env.APIFY_REDFIN_ACTOR ?? "tugkan/redfin-scraper";
  const items = await runActor(actor, { maxItems: 200 });
  return items.flatMap((raw) => normalizeRedfin(raw, priceMinCents));
}

export async function fetchRealtor(priceMinCents: number): Promise<ScrapedListing[]> {
  const actor = process.env.APIFY_REALTOR_ACTOR ?? "epctex/realtor-scraper";
  const items = await runActor(actor, { maxItems: 200 });
  return items.flatMap((raw) => normalizeRealtor(raw, priceMinCents));
}

// ===== Normalizers (best-effort; actor payload shapes vary) =====

function normalizeZillow(raw: unknown, priceMinCents: number): ScrapedListing[] {
  const r = raw as Record<string, unknown>;
  const priceDollars = Number(r.price ?? r.unformattedPrice ?? 0);
  const priceCents = Math.round(priceDollars * 100);
  if (!priceDollars || priceCents < priceMinCents) return [];

  // detail-scraper returns address as an object {streetAddress, city, state, zipcode, ...}
  const addrObj =
    typeof r.address === "object" && r.address !== null
      ? (r.address as Record<string, unknown>)
      : {};
  const address = String(r.streetAddress ?? addrObj.streetAddress ?? "");
  const city = String(r.city ?? addrObj.city ?? "");
  const state = String(r.state ?? addrObj.state ?? "");
  const zip = String(r.zipcode ?? addrObj.zipcode ?? r.zip ?? "");
  const sourceId = String(r.zpid ?? r.id ?? address);
  if (!address || !sourceId) return [];

  // detail-scraper photo shape: originalPhotos[].mixedSources.jpeg[] with widths.
  type MixedSrc = { url?: string; width?: number };
  type PhotoEntry = {
    url?: string;
    mixedSources?: { jpeg?: MixedSrc[]; webp?: MixedSrc[] };
  };
  const pickFromMixed = (arr: PhotoEntry[]) =>
    arr
      .map((p) => {
        if (p.url) return p.url;
        const sources = p.mixedSources?.jpeg ?? p.mixedSources?.webp ?? [];
        const sorted = [...sources].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
        return sorted[0]?.url ?? "";
      })
      .filter(Boolean);

  let photos: string[] = [];
  if (Array.isArray(r.originalPhotos)) photos = pickFromMixed(r.originalPhotos as PhotoEntry[]);
  if (photos.length === 0 && Array.isArray(r.responsivePhotos))
    photos = pickFromMixed(r.responsivePhotos as PhotoEntry[]);
  if (photos.length === 0 && Array.isArray(r.photos))
    photos = (r.photos as { url?: string }[]).map((p) => p.url ?? "").filter(Boolean);
  if (photos.length === 0 && Array.isArray(r.imgSrc)) photos = r.imgSrc as string[];
  if (photos.length === 0 && r.hdpData) photos = extractZillowPhotosFromHdp(r.hdpData);

  const agent = (r.listing_sub_type ?? r.attributionInfo ?? {}) as Record<string, unknown>;

  return [
    {
      source: "zillow",
      sourceId,
      mlsId: (r.mlsid as string | undefined) ?? undefined,
      address,
      city,
      state,
      zip,
      price: priceCents,
      dom: typeof r.daysOnZillow === "number" ? r.daysOnZillow : undefined,
      photos,
      agentName: (agent.agentName as string | undefined) ?? undefined,
      agentEmail: (agent.agentEmail as string | undefined) ?? undefined,
      agentPhone: (agent.agentPhoneNumber as string | undefined) ?? undefined,
      brokerage: (agent.brokerName as string | undefined) ?? undefined,
    },
  ];
}

function extractZillowPhotosFromHdp(hdp: unknown): string[] {
  const h = hdp as Record<string, unknown>;
  const homeInfo = h.homeInfo as Record<string, unknown> | undefined;
  const photos = homeInfo?.photos;
  if (Array.isArray(photos)) return photos as string[];
  return [];
}

function normalizeRedfin(raw: unknown, priceMinCents: number): ScrapedListing[] {
  const r = raw as Record<string, unknown>;
  const priceDollars = Number(r.price ?? 0);
  const priceCents = Math.round(priceDollars * 100);
  if (priceCents < priceMinCents) return [];

  const out: ScrapedListing[] = [
    {
      source: "redfin",
      sourceId: String(r.propertyId ?? r.mlsId ?? r.url ?? ""),
      mlsId: (r.mlsId as string | undefined) ?? undefined,
      address: String(r.streetLine ?? r.address ?? ""),
      city: String(r.city ?? ""),
      state: String(r.stateCode ?? ""),
      zip: String(r.zip ?? ""),
      price: priceCents,
      dom: typeof r.daysOnMarket === "number" ? r.daysOnMarket : undefined,
      photos: Array.isArray(r.photos) ? (r.photos as string[]) : [],
      agentName: (r.agentName as string | undefined) ?? undefined,
      agentEmail: (r.agentEmail as string | undefined) ?? undefined,
      agentPhone: (r.agentPhone as string | undefined) ?? undefined,
      brokerage: (r.brokerage as string | undefined) ?? undefined,
    },
  ];
  return out.filter((l) => l.address && l.sourceId);
}

function normalizeRealtor(raw: unknown, priceMinCents: number): ScrapedListing[] {
  const r = raw as Record<string, unknown>;
  const priceDollars = Number(r.list_price ?? r.price ?? 0);
  const priceCents = Math.round(priceDollars * 100);
  if (priceCents < priceMinCents) return [];
  const location = (r.location ?? {}) as Record<string, unknown>;
  const address = (location.address ?? {}) as Record<string, unknown>;
  const agent = (r.advertisers ?? [])?.[0 as unknown as keyof typeof r.advertisers] as
    | Record<string, unknown>
    | undefined;
  const out: ScrapedListing[] = [
    {
      source: "realtor",
      sourceId: String(r.property_id ?? r.listing_id ?? ""),
      mlsId: (r.mls_id as string | undefined) ?? undefined,
      address: String(address.line ?? ""),
      city: String(address.city ?? ""),
      state: String(address.state_code ?? ""),
      zip: String(address.postal_code ?? ""),
      price: priceCents,
      dom: typeof r.days_on_market === "number" ? r.days_on_market : undefined,
      photos: Array.isArray(r.photos)
        ? (r.photos as { href?: string }[]).map((p) => p.href ?? "").filter(Boolean)
        : [],
      agentName: (agent?.name as string | undefined) ?? undefined,
      agentEmail: (agent?.email as string | undefined) ?? undefined,
      agentPhone: (agent?.phone as string | undefined) ?? undefined,
      brokerage: (agent?.office_name as string | undefined) ?? undefined,
    },
  ];
  return out.filter((l) => l.address && l.sourceId);
}

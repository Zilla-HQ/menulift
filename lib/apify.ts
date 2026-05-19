import { ApifyClient } from "apify-client";
import { env } from "@/lib/env";

const token = env("APIFY_TOKEN");

const client = token ? new ApifyClient({ token }) : null;

export interface ScrapedListing {
  source: "google_places" | "doordash" | "ubereats";
  sourceId: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number; // average entree price in cents (rough signal)
  dom?: number; // days since last menu refresh (when available)
  listingType?:
    | "fast_casual"
    | "fine_dining"
    | "cafe"
    | "bar"
    | "ghost_kitchen"
    | "other";
  photos: string[];
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  restaurantName?: string;
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
// Pattern:
//   Apify actors cost real money per run. For verticals where the
//   underlying dataset is stable for days or weeks (e.g. restaurant
//   menus in a city don't churn fast), don't re-run the actor on
//   every cron — re-use the dataset from a recent successful run.
//
//   Two ways to do this:
//
//   1) **Operator-curated**: Run the actor once, save the dataset ID
//      into a script, and use `getDatasetItems(datasetId)` from a
//      batch sender. One scrape feeds 2–4 weeks of outreach.
//
//   2) **Auto-cached cron** (use `runActorCached`): Check the actor's
//      recent runs and reuse the dataset from the most recent
//      SUCCEEDED run if it's within `ttlHours`. Falls back to a fresh
//      run otherwise.

export async function getDatasetItems(datasetId: string): Promise<unknown[]> {
  if (!client) {
    // eslint-disable-next-line no-console
    console.warn(`APIFY_TOKEN not set — skipping dataset ${datasetId}`);
    return [];
  }
  const { items } = await client.dataset(datasetId).listItems({ clean: true });
  return items;
}

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
 * Fetch restaurants from Google Places via Apify.
 */
export async function fetchGooglePlaces(priceMinCents: number): Promise<ScrapedListing[]> {
  const queries = (
    process.env.APIFY_GOOGLE_PLACES_QUERIES ??
    [
      "restaurants Phoenix AZ",
      "restaurants Scottsdale AZ",
      "restaurants Atlanta GA",
      "restaurants Dallas TX",
      "restaurants Tampa FL",
    ].join(",")
  )
    .split(",")
    .map((q) => q.trim())
    .filter(Boolean);

  const actor = process.env.APIFY_GOOGLE_PLACES_ACTOR ?? "compass/crawler-google-places";
  const items = await runActor(actor, {
    searchStringsArray: queries,
    maxCrawledPlacesPerSearch: 50,
    language: "en",
  });

  return items.flatMap((raw) => normalizeGooglePlaces(raw, priceMinCents));
}

export async function fetchDoordash(priceMinCents: number): Promise<ScrapedListing[]> {
  const actor = process.env.APIFY_DOORDASH_ACTOR ?? "epctex/doordash-scraper";
  const items = await runActor(actor, { maxItems: 200 });
  return items.flatMap((raw) => normalizeDoordash(raw, priceMinCents));
}

export async function fetchUberEats(priceMinCents: number): Promise<ScrapedListing[]> {
  const actor = process.env.APIFY_UBEREATS_ACTOR ?? "epctex/ubereats-scraper";
  const items = await runActor(actor, { maxItems: 200 });
  return items.flatMap((raw) => normalizeUberEats(raw, priceMinCents));
}

// ===== Normalizers (best-effort; actor payload shapes vary) =====

function normalizeGooglePlaces(raw: unknown, priceMinCents: number): ScrapedListing[] {
  const r = raw as Record<string, unknown>;
  // Google Places returns priceLevel 1-4; map roughly to avg entree cents.
  const priceLevel = Number(r.priceLevel ?? r.price_level ?? 2);
  const priceCents = priceLevel * 1500 * 100; // $15/lvl rough avg
  if (priceCents < priceMinCents) return [];

  const placeId = String(r.placeId ?? r.place_id ?? r.id ?? "");
  const address = String(r.address ?? r.formattedAddress ?? "");
  if (!placeId || !address) return [];

  const photos: string[] = Array.isArray(r.imageUrls)
    ? (r.imageUrls as string[])
    : Array.isArray(r.photos)
      ? (r.photos as { url?: string }[]).map((p) => p.url ?? "").filter(Boolean)
      : [];

  return [
    {
      source: "google_places",
      sourceId: placeId,
      address,
      city: String(r.city ?? ""),
      state: String(r.state ?? ""),
      zip: String(r.postalCode ?? r.zip ?? ""),
      price: priceCents,
      photos,
      contactName: (r.ownerName as string | undefined) ?? undefined,
      contactEmail: (r.email as string | undefined) ?? undefined,
      contactPhone: (r.phone as string | undefined) ?? undefined,
      restaurantName: (r.title as string | undefined) ?? (r.name as string | undefined),
    },
  ];
}

function normalizeDoordash(raw: unknown, priceMinCents: number): ScrapedListing[] {
  const r = raw as Record<string, unknown>;
  const priceDollars = Number(r.avgPrice ?? r.price ?? 20);
  const priceCents = Math.round(priceDollars * 100);
  if (priceCents < priceMinCents) return [];

  const out: ScrapedListing[] = [
    {
      source: "doordash",
      sourceId: String(r.storeId ?? r.id ?? r.url ?? ""),
      address: String(r.address ?? ""),
      city: String(r.city ?? ""),
      state: String(r.state ?? ""),
      zip: String(r.zip ?? ""),
      price: priceCents,
      photos: Array.isArray(r.photos) ? (r.photos as string[]) : [],
      contactName: (r.contactName as string | undefined) ?? undefined,
      contactEmail: (r.contactEmail as string | undefined) ?? undefined,
      contactPhone: (r.phone as string | undefined) ?? undefined,
      restaurantName: (r.storeName as string | undefined) ?? (r.name as string | undefined),
    },
  ];
  return out.filter((l) => l.address && l.sourceId);
}

function normalizeUberEats(raw: unknown, priceMinCents: number): ScrapedListing[] {
  const r = raw as Record<string, unknown>;
  const priceDollars = Number(r.avgPrice ?? r.price ?? 20);
  const priceCents = Math.round(priceDollars * 100);
  if (priceCents < priceMinCents) return [];
  const out: ScrapedListing[] = [
    {
      source: "ubereats",
      sourceId: String(r.uuid ?? r.id ?? ""),
      address: String(r.address ?? ""),
      city: String(r.city ?? ""),
      state: String(r.state ?? ""),
      zip: String(r.zip ?? ""),
      price: priceCents,
      photos: Array.isArray(r.photos)
        ? (r.photos as { href?: string }[]).map((p) => (typeof p === "string" ? p : (p.href ?? ""))).filter(Boolean)
        : [],
      contactName: (r.contactName as string | undefined) ?? undefined,
      contactEmail: (r.email as string | undefined) ?? undefined,
      contactPhone: (r.phone as string | undefined) ?? undefined,
      restaurantName: (r.title as string | undefined) ?? (r.name as string | undefined),
    },
  ];
  return out.filter((l) => l.address && l.sourceId);
}

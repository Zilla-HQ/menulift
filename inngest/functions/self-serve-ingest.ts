import { inngest } from "@/inngest/client";
import { db, listings } from "@/db";
import { eq } from "drizzle-orm";
import { slugify } from "@/lib/utils";
import { trackEvent } from "@/lib/posthog";
import { env } from "@/lib/env";
import { DEFAULT_SERVICE_ID, getService } from "@/lib/services";

const token = env("APIFY_TOKEN");

type MenuSource = "google_places" | "doordash" | "ubereats";

/**
 * Run an Apify actor synchronously and get items back, all via plain HTTP.
 * Sidesteps the apify-client SDK's dynamic `require('proxy-agent')` which
 * webpack can't resolve in the Vercel bundle.
 */
async function runApifySync(actorId: string, input: unknown): Promise<unknown[]> {
  if (!token) throw new Error("APIFY_TOKEN not set");
  const id = actorId.replace("/", "~");
  const url = `https://api.apify.com/v2/acts/${id}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}&timeout=240`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Apify ${actorId} HTTP ${res.status}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as unknown[];
}

/**
 * Self-serve: run an Apify scrape for one specific restaurant menu URL,
 * backfill the stub row with real data, then emit listings/qualified so
 * the existing preview pipeline takes over.
 */
export const selfServeIngestFn = inngest.createFunction(
  {
    id: "self-serve-ingest",
    name: "Self-serve ingest (one URL → scrape → emit qualified)",
    retries: 2,
    concurrency: { limit: 4 },
  },
  { event: "self-serve/submitted" },
  async ({ event, step, logger }) => {
    const { listingId, url, source, serviceId: rawServiceId } = event.data;
    const requested = rawServiceId ? getService(rawServiceId) : undefined;
    const service = requested ?? getService(DEFAULT_SERVICE_ID)!;

    if (!token) {
      logger.error("APIFY_TOKEN not set — self-serve ingest cannot run");
      return { skipped: true, reason: "no Apify token" };
    }

    const result = await step.run("apify-single-url", async () => {
      const actorId = pickActor(source);
      const input = buildInput(source, url);
      try {
        const items = await runApifySync(actorId, input);
        if (!items[0]) {
          return { ok: false, reason: "no items in dataset", actorId };
        }
        return {
          ok: true,
          normalized: normalize(source, items[0] as Record<string, unknown>),
          actorId,
        };
      } catch (err) {
        const msg = (err as Error)?.message ?? String(err);
        return { ok: false, reason: `exception: ${msg.slice(0, 200)}`, actorId };
      }
    });

    if (!result.ok || !("normalized" in result)) {
      await step.run("mark-scrape-failed", async () => {
        const reason = `self-serve scrape failed: ${"reason" in result ? result.reason : "unknown"}`;
        await db
          .update(listings)
          .set({ qualificationReason: reason.slice(0, 250), qualified: false })
          .where(eq(listings.id, listingId));
      });
      return { failed: true, ...result };
    }
    const normalized = result.normalized;

    const updated = await step.run("update-listing", async () => {
      const baseSlug = slugify(`${normalized.address} ${normalized.zip}`);
      const slug = baseSlug ? `${baseSlug}-${listingId.slice(0, 6)}` : undefined;
      const [row] = await db
        .update(listings)
        .set({
          address: normalized.address || "Unknown address",
          city: normalized.city ?? "",
          state: normalized.state ?? "",
          zip: normalized.zip ?? "",
          price: normalized.price ?? 0,
          dom: normalized.dom ?? null,
          photos: normalized.photos,
          // Legacy DB columns reused for restaurant contact + name.
          agentName: normalized.contactName ?? null,
          agentEmail: normalized.contactEmail ?? null,
          agentPhone: normalized.contactPhone ?? null,
          brokerage: normalized.restaurantName ?? null,
          ...(slug ? { slug } : {}),
        })
        .where(eq(listings.id, listingId))
        .returning();
      return row;
    });

    // For services that operate on existing menu photos (food re-shoots,
    // styling), we need at least one source photo. For services that
    // generate from text-only menus (text → dish render), the menu name
    // is enough.
    const needsSourcePhotos = service.imageSource !== "satellite_tile";
    if (needsSourcePhotos && (!updated.photos || updated.photos.length === 0)) {
      await step.run("mark-nophotos", async () => {
        await db
          .update(listings)
          .set({ qualificationReason: "self-serve: menu had no photos", qualified: false })
          .where(eq(listings.id, listingId));
      });
      return { failed: true, reason: "no photos in scrape" };
    }

    await step.sendEvent("emit-qualified", {
      name: "listings/qualified",
      data: { listingId, serviceId: service.id },
    });

    await trackEvent({
      distinctId: listingId,
      event: "self_serve_scraped",
      properties: {
        source,
        photo_count: updated.photos.length,
        price_cents: updated.price,
      },
    });

    return { listingId, slug: updated.slug, photos: updated.photos.length };
  },
);

function pickActor(source: MenuSource): string {
  switch (source) {
    case "google_places":
      return process.env.APIFY_GOOGLE_PLACES_DETAIL_ACTOR ?? "compass/crawler-google-places";
    case "doordash":
      return process.env.APIFY_DOORDASH_DETAIL_ACTOR ?? "epctex/doordash-scraper";
    case "ubereats":
      return process.env.APIFY_UBEREATS_DETAIL_ACTOR ?? "epctex/ubereats-scraper";
  }
}

function buildInput(source: MenuSource, url: string): unknown {
  switch (source) {
    case "google_places":
      return { startUrls: [{ url }], maxCrawledPlacesPerSearch: 1 };
    case "doordash":
      return { startUrls: [{ url }], maxItems: 1 };
    case "ubereats":
      return { startUrls: [url], maxItems: 1 };
  }
}

interface Normalized {
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  price?: number;
  dom?: number;
  photos: string[];
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  restaurantName?: string;
}

function normalize(
  source: MenuSource,
  raw: Record<string, unknown>,
): Normalized {
  switch (source) {
    case "google_places":
      return normalizeGooglePlaces(raw);
    case "doordash":
      return normalizeDoordash(raw);
    case "ubereats":
      return normalizeUberEats(raw);
  }
}

function normalizeGooglePlaces(r: Record<string, unknown>): Normalized {
  const priceLevel = Number(r.priceLevel ?? r.price_level ?? 2);
  const priceCents = priceLevel * 1500 * 100;
  const photos: string[] = Array.isArray(r.imageUrls)
    ? (r.imageUrls as string[])
    : Array.isArray(r.photos)
      ? (r.photos as { url?: string }[]).map((p) => p.url ?? "").filter(Boolean)
      : [];
  return {
    address: String(r.address ?? r.formattedAddress ?? "").trim(),
    city: String(r.city ?? "").trim(),
    state: String(r.state ?? "").trim(),
    zip: String(r.postalCode ?? r.zip ?? "").trim(),
    price: priceCents || undefined,
    photos,
    contactName: r.ownerName as string | undefined,
    contactEmail: r.email as string | undefined,
    contactPhone: r.phone as string | undefined,
    restaurantName: (r.title as string | undefined) ?? (r.name as string | undefined),
  };
}

function normalizeDoordash(r: Record<string, unknown>): Normalized {
  return {
    address: String(r.address ?? "").trim(),
    city: String(r.city ?? "").trim(),
    state: String(r.state ?? "").trim(),
    zip: String(r.zip ?? "").trim(),
    price: Math.round(Number(r.avgPrice ?? r.price ?? 0) * 100) || undefined,
    photos: Array.isArray(r.photos) ? (r.photos as string[]) : [],
    contactName: r.contactName as string | undefined,
    contactEmail: r.contactEmail as string | undefined,
    contactPhone: r.phone as string | undefined,
    restaurantName: (r.storeName as string | undefined) ?? (r.name as string | undefined),
  };
}

function normalizeUberEats(r: Record<string, unknown>): Normalized {
  return {
    address: String(r.address ?? "").trim(),
    city: String(r.city ?? "").trim(),
    state: String(r.state ?? "").trim(),
    zip: String(r.zip ?? "").trim(),
    price: Math.round(Number(r.avgPrice ?? r.price ?? 0) * 100) || undefined,
    photos: Array.isArray(r.photos)
      ? (r.photos as ({ href?: string } | string)[]).map((p) => (typeof p === "string" ? p : (p.href ?? ""))).filter(Boolean)
      : [],
    contactName: r.contactName as string | undefined,
    contactEmail: r.email as string | undefined,
    contactPhone: r.phone as string | undefined,
    restaurantName: (r.title as string | undefined) ?? (r.name as string | undefined),
  };
}

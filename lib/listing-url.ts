/**
 * Parse a user-submitted restaurant menu URL and detect its source.
 * Returns null if the URL doesn't look like a supported menu page.
 */
export type ListingSource = "google_places" | "doordash" | "ubereats";

export interface ParsedListingUrl {
  source: ListingSource;
  sourceId: string; // place_id / doordash store_id / ubereats store uuid
  canonicalUrl: string;
}

export function parseListingUrl(raw: string): ParsedListingUrl | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  const host = url.hostname.toLowerCase().replace(/^www\./, "");

  if (host.endsWith("google.com") || host.endsWith("maps.google.com") || host.endsWith("goo.gl")) {
    // Google Maps share / Place URLs: extract place_id or cid
    const placeId =
      url.searchParams.get("place_id") ??
      url.pathname.match(/\/place\/[^/]+\/([A-Za-z0-9_-]+)/)?.[1] ??
      url.pathname.match(/\/maps\/place\/([^/]+)/)?.[1];
    if (placeId) return { source: "google_places", sourceId: placeId, canonicalUrl: url.toString() };
  }

  if (host.endsWith("doordash.com")) {
    // /store/<slug>/<storeId>/
    const m = url.pathname.match(/\/store\/[^/]+\/(\d+)/) ?? url.pathname.match(/\/(\d+)/);
    if (m) return { source: "doordash", sourceId: m[1], canonicalUrl: url.toString() };
  }

  if (host.endsWith("ubereats.com")) {
    // /store/<slug>/<uuid>
    const m = url.pathname.match(/\/store\/[^/]+\/([A-Za-z0-9_-]+)/) ?? url.pathname.match(/\/([A-Za-z0-9_-]{16,})/);
    if (m) return { source: "ubereats", sourceId: m[1], canonicalUrl: url.toString() };
  }

  return null;
}
